class LevelId {
  constructor(a, b = 0, c = 0) {
    this.a = String(a);
    this.b = Number(b);
    this.c = Number(c);
  }
  get key() {
    if (this.c !== 0) return `${this.a},${this.b},${this.c}`;
    if (this.b !== 0) return `${this.a},${this.b}`;
    return this.a;
  }
  toString() { return this.key; }
  static from(input) {
    if (input instanceof LevelId) return input;
    if (input instanceof Level)   return input.levelId;
    const p = String(input).split(',');
    return new LevelId(p[0], p[1] ?? 0, p[2] ?? 0);
  }
}
class Edge {
  constructor(target, spawn = null) {
    this.target = target;
    this.spawn  = spawn;
  }
  resolveSpawn() {
    return this.spawn ?? this.target.spawn ?? null;
  }
}
class Level {
  constructor({
    levelId,
    levelName = '',
    spawn     = null,
    landmarks = {},
    exit      = [],
    enter     = [],
    onEnter   = null,
    onExit    = null,
    onMove    = null,
    meta      = {},
  }) {
    this.levelId   = LevelId.from(levelId);
    this.levelName = levelName;
    this.spawn     = spawn;
    this.landmarks = landmarks;
    this.exit      = exit;
    this.enter     = enter;
    this.players   = [];
    this.onEnter   = onEnter;
    this.onExit    = onExit;
    this.onMove    = onMove;
    this.meta      = meta;
  }
  get key() { return this.levelId.key; }
  getExitEdge(target) {
    const key = LevelId.from(target).key;
    return this.exit.find(e => e.target.key === key) ?? null;
  }
  exitsTo(target) {
    return this.getExitEdge(target) !== null;
  }
  _fireExit(player, toLevel) {
    this.onExit?.(player, toLevel);
    this.onMove?.(player, this, toLevel);
  }
  _fireEnter(player, fromLevel) {
    this.onEnter?.(player, fromLevel);
    this.onMove?.(player, fromLevel, this);
  }
  toString() {
    return `Level(${this.key}${this.levelName ? ` "${this.levelName}"` : ''})`;
  }
}
class Levels {
  constructor() {
    this._store = {};
    return new Proxy(this, {
      get(t, prop) {
        if (prop in t) return t[prop];
        return t._store[prop] ?? undefined;
      },
      set(t, prop, value) {
        if (prop === '_store') { t._store = value; return true; }
        t._store[prop] = value;
        return true;
      }
    });
  }
  add(level) {
    this._store[level.key] = level;
    return this;
  }
  remove(id) {
    delete this._store[LevelId.from(id).key];
    return this;
  }
  all()      { return Object.values(this._store); }
  keys()     { return Object.keys(this._store); }
  has(id)    { return LevelId.from(id).key in this._store; }
}
class Player {
  constructor({ id, dbId, name, level = null, meta = {} }) {
    this.id    = id;
    this.dbId  = dbId;
    this.name  = name;
    this.level = level;
    this.meta  = meta;
  }
  toString() { return `Player(${this.name})`; }
}
class Players {
  constructor() {
    this._store = {};
    this.byDb   = {};
    return new Proxy(this, {
      get(t, prop) {
        if (prop in t) return t[prop];
        return t._store[prop] ?? undefined;
      },
      set(t, prop, value) {
        if (prop === '_store' || prop === 'byDb') { t[prop] = value; return true; }
        t._store[prop] = value;
        return true;
      }
    });
  }
  add(player) {
    this._store[player.id]  = player;
    this.byDb[player.dbId]  = player;
    return this;
  }
  remove(id) {
    const player = this._store[id];
    if (!player) return this;
    delete this._store[id];
    delete this.byDb[player.dbId];
    return this;
  }
  all()        { return Object.values(this._store); }
  has(id)      { return id in this._store; }
  hasDb(dbId)  { return dbId in this.byDb; }
}
// ── NULL level (singleton, always exists) ──────────────────────────────────
const NULL_LEVEL = new Level({
  levelId: 'NULL',
  levelName: 'NULL',
  spawn: null,
});

class _Backroom {
  constructor() {
    this.Levels  = new Levels();
    this.Players = new Players();
    this.meta    = {};

    // Register NULL immediately
    this.Levels.add(NULL_LEVEL);
  }

  // ── Public callbacks ─────────────────────────────────────────────────────
  onPlayerJoin(playerId, levelId) {
    const player = new Player({ id: playerId, dbId: playerId, name: playerId });
    const toLevel = this.Levels[LevelId.from(levelId).key];
    if (!toLevel) { console.log(`onPlayerJoin: unknown level "${levelId}"`); return false; }
  
    player.level = NULL_LEVEL;
    NULL_LEVEL.players.push(player);
    this.Players.add(player);
  
    return this.move(player, toLevel);
  }
  
  onPlayerLeave(playerId) {
    const player = this.Players[playerId];
    if (!player) { console.log(`onPlayerLeave: unknown player "${playerId}"`); return false; }
  
    const fromLevel = player.level;
    const ok = this.move(player, NULL_LEVEL);
    if (ok) {
      this.Players.remove(playerId);
      player.level = null;
      NULL_LEVEL.players = NULL_LEVEL.players.filter(p => p.id !== playerId);
    }
    return ok;
  }

  // ── Internal: NULL-aware edge resolution ─────────────────────────────────
  _getEdge(fromLevel, toLevel) {
    // NULL is a universal source/sink — no explicit Edge needed
    if (fromLevel.key === NULL_LEVEL.key) return new Edge(toLevel);
    if (toLevel.key   === NULL_LEVEL.key) return new Edge(toLevel);
    return fromLevel.getExitEdge(toLevel.key);
  }

  // ── Join: place a brand-new player into a level from NULL ─────────────────
  join(player, target, spawnOverride = null) {
    const toLevel = target instanceof Level
      ? target
      : this.Levels[LevelId.from(target).key];
    if (!toLevel) {
      console.log(`Backroom.join: unknown target "${target}"`);
      return false;
    }

    // Start the player in NULL
    player.level = NULL_LEVEL;
    NULL_LEVEL.players.push(player);
    this.Players.add(player);

    // Move NULL → toLevel
    const ok = this.move(player, toLevel, spawnOverride);
    if (ok) this.onPlayerJoin?.(player, toLevel);
    return ok;
  }

  // ── Leave: remove a player from their level into NULL ────────────────────
  leave(player, spawnOverride = null) {
    const fromLevel = player.level;
    if (!fromLevel || fromLevel.key === NULL_LEVEL.key) {
      console.log(`Backroom.leave: player "${player}" is not in a real level`);
      return false;
    }

    const ok = this.move(player, NULL_LEVEL, spawnOverride);
    if (ok) {
      this.onPlayerLeave?.(player, fromLevel);
      this.Players.remove(player.id);
      player.level = null;
      NULL_LEVEL.players = NULL_LEVEL.players.filter(p => p.id !== player.id);
    }
    return ok;
  }

  // ── Move: unchanged except uses _getEdge for NULL awareness ──────────────
  move(player, target, spawnOverride = null) {
    const toLevel = target instanceof Level
      ? target
      : this.Levels[LevelId.from(target).key];
    if (!toLevel) {
      console.log(`Backroom.move: unknown target "${target}"`);
      return false;
    }

    const fromLevel = player.level;

    if (fromLevel !== null) {
      const edge = this._getEdge(fromLevel, toLevel);
      if (!edge) {
        console.log(`Backroom.move: no exit from "${fromLevel.key}" to "${toLevel.key}"`);
        return false;
      }
      const spawn = spawnOverride ?? edge.resolveSpawn();
      if (spawn) api.setPosition(player.id, ...spawn);
      fromLevel._fireExit(player, toLevel);
      fromLevel.players = fromLevel.players.filter(p => p.id !== player.id);
    } else {
      const spawn = spawnOverride ?? toLevel.spawn ?? null;
      if (spawn) api.setPosition(player.id, ...spawn);
    }

    player.level = toLevel;
    toLevel.players.push(player);
    toLevel._fireEnter(player, fromLevel);
    return true;
  }
}
globalThis.Backroom  = new _Backroom();
globalThis.BR = globalThis.Backroom
globalThis.LevelId = LevelId;
globalThis.Edge    = Edge;
globalThis.Level   = Level;
globalThis.Player  = Player;

"Code Block 5 Manually Loaded"
