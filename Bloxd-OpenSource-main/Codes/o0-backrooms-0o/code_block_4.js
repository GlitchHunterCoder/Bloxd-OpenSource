

// ── Generator constructor shortcuts ─────────────────────────
globalThis.GeneratorFunction = function* () {}.constructor;
globalThis.Generator         = function* () {}().constructor;

// ── Try helper ───────────────────────────────────────────────
/** Call fn with ctx and args, swallowing nothing — errors propagate normally. */
const Try = (fn, ctx = null, ...args) => fn.apply(ctx, args);

// ── TaskScheduler ────────────────────────────────────────────
/**
 * Cooperative micro-task scheduler.
 * Each task is a generator; one step is advanced per tick() call.
 * Tasks are stored in a flat array with O(1) removal via swap-and-pop.
 */
class TaskScheduler {
  constructor() {
    this.tasks       = [];
    this.tasksById   = {};
    this.currentTask = null;
    this.nextId      = 1;
    this.cursor      = 0;
    this.tickCount   = 0;
  }

  /** Normalise any value into a generator. */
  init(task, ...params) {
    if (task && typeof task.next === 'function') return task;
    if (task instanceof GeneratorFunction)       return task(...params);
    if (typeof task === 'function')              return (function* () { return task(...params); })();
    return (function* () { return task; })();
  }

  /** Run a generator to completion across multiple ticks, yielding between steps. */
  *run(fn, ...params) {
    const gen    = this.init(fn, ...params);
    let   result = gen.next();
    while (!result.done) { yield; result = gen.next(); }
    return result.value;
  }

  /** Add a generator task; returns its numeric id. */
  add(gen) {
    const task = { id: this.nextId++, gen, index: this.tasks.length };
    this.tasks.push(task);
    this.tasksById[task.id] = task;
    return task.id;
  }

  /** Remove a task by id. */
  delById(id) {
    const task = this.tasksById[id];
    if (task) this._removeTask(task);
  }

  /** O(1) removal via swap-and-pop. */
  _removeTask(task) {
    const last = this.tasks.pop();
    if (last !== task) { this.tasks[task.index] = last; last.index = task.index; }
    delete this.tasksById[task.id];
    if (this.cursor >= this.tasks.length) this.cursor = 0;
    if (this.currentTask === task)        this.currentTask = null;
  }

  /** Advance one task by one step. */
  tick() {
    if (!this.tasks.length) return;
    if (this.cursor >= this.tasks.length) this.cursor = 0;
    const task       = this.tasks[this.cursor];
    this.currentTask = task;
    let res;
    try { res = task.gen.next(); }
    catch (e) { this._removeTask(task); ErrMsg(e); return; }
    if (res.done) this._removeTask(task);
    else          this.cursor = (task.index + 1) % this.tasks.length;
    this.currentTask = null;
    this.tickCount++;
  }
}

// Public TS façade.
globalThis.TS = (() => {
  const gen = new TaskScheduler();
  return {
    gen,
    init(task, ...params)  { return gen.init(task, ...params); },
    add(task, ...params)   { return gen.add(this.init(task, ...params)); },
    del(id)                { gen.delById(id); },
    *run(fn, ...params)    { return yield* gen.run(fn, ...params); },
    iters()                { return gen.tickCount; },
    id()                   { return gen.currentTask?.id ?? null; },
    stats()                { return { count: gen.tasks.length, current: this.id(), nextId: gen.nextId }; },
    tick()                 { Try(gen.tick, gen); }
  };
})();

// ── PackageManager ───────────────────────────────────────────
/**
 * Lightweight package registry.
 * PM.add(name, data, alias?) — registers data and exports it globally.
 * PM.delete(name)            — removes from registry and global scope.
 * Supports override hooks that intercept named functions on TS/TaskScheduler.
 */
class PackageManager {
  constructor() {
    this.packs         = Object.create(null);
    this.overrideIndex = Object.create(null);
    this.flattenMap    = Object.create(null);
    this._wrapBuiltins();
  }

  localAdd(name, data)    { this.packs[name] = data; }
  localDelete(name)       { delete this.packs[name]; }

  _activateOverrides(name) {
    const data = this.packs[name];
    if (!data?.override) return;
    const keys = Object.keys(data.override);
    data._ovKeys = keys;
    keys.forEach(k => { this.overrideIndex[k] = data.override[k]; });
  }

  _deactivateOverrides(name) {
    this.packs[name]?._ovKeys?.forEach(k => delete this.overrideIndex[k]);
  }

  run(name)         { return this.packs[name]; }
  getOverride(name) { return this.overrideIndex[name]; }

  /** Wrap every function on target so overrides can intercept calls. */
  _wrap(target, prefix, getInstance) {
    for (const k of Object.getOwnPropertyNames(target)) {
      const orig = target[k];
      if (typeof orig !== 'function') continue;
      const path = `${prefix}.${k}`;
      target[k] = (...args) => {
        const fn  = this.overrideIndex[path];
        const ctx = getInstance ? getInstance() : target;
        return fn ? fn(orig.bind(ctx), ...args) : orig.apply(ctx, args);
      };
    }
  }

  _wrapBuiltins() {
    this._wrap(TS, 'TS');
    this._wrap(TaskScheduler.prototype, 'TaskScheduler', () => TS.gen);
  }

  globalAdd(name, alias) {
    const pkg = this.packs[name];
    if (!pkg) throw new Error(`Package "${name}" not found`);

    if (alias === 'globalThis') {
      const keys = Object.keys(pkg);
      if (keys.includes('globalThis')) throw new Error('Cannot export a key named "globalThis"');
      keys.forEach(k => { globalThis[k] = pkg[k]; });
      this.flattenMap[name] = keys;
    } else if (alias && globalThis[alias] && typeof globalThis[alias] === 'object') {
      const keys = Object.keys(pkg);
      keys.forEach(k => { globalThis[alias][k] = pkg[k]; });
      this.flattenMap[name] = { target: alias, keys };
    } else {
      globalThis[alias ?? name] = pkg;
    }
    this._activateOverrides(name);
    return pkg;
  }

  globalDelete(name) {
    if (name === 'globalThis') throw new Error('Cannot delete globalThis itself');
    this._deactivateOverrides(name);
    const flat = this.flattenMap[name];
    if (flat?.target) {
      flat.keys.forEach(k => delete globalThis[flat.target][k]);
    } else {
      flat?.forEach(k => delete globalThis[k]);
      delete globalThis[name];
    }
    delete this.flattenMap[name];
  }
}

globalThis.PM = (() => {
  const mod = new PackageManager();
  return {
    mod,
    add(name, data, alias)  { mod.localAdd(name, data); return mod.globalAdd(name, alias); },
    run(name)               { return mod.run(name); },
    delete(name)            { mod.globalDelete(name); mod.localDelete(name); },
    override(name)          { return mod.getOverride(name); },
    localAdd(name, data)    { mod.localAdd(name, data); },
    globalAdd(name, alias)  { return mod.globalAdd(name, alias); },
    localDelete(name)       { mod.localDelete(name); },
    globalDelete(name)      { mod.globalDelete(name); }
  };
})();

// ── AsyncFuncs ───────────────────────────────────────────────
// Generator-based async primitives built on TS.
// Exported directly onto globalThis so chest code can call sleep(), setTimeout() etc.

PM.add('AsyncFuncs', {
  /** Yield for at least `ms` milliseconds. */
  sleep(ms) {
    return (function* () {
      const start = Date.now();
      while (Date.now() - start < ms) yield;
    })();
  },
  setTimeout(fn, delay, ...params) {
    const { sleep } = PM.run('AsyncFuncs');
    return TS.add((function* () {
      yield* sleep(delay);
      yield* TS.run(fn, ...params);
    })());
  },
  setInterval(fn, delay, ...params) {
    const { sleep } = PM.run('AsyncFuncs');
    return TS.add((function* () {
      while (true) {
        yield* sleep(delay);
        yield* TS.run(fn, ...params);
      }
    })());
  },
  clearTimeout(id)  { TS.del(id); },
  clearInterval(id) { TS.del(id); },
  await(fn, ...params) { return TS.run(fn, ...params); }
}, 'globalThis');

// ── CtrlSystem ───────────────────────────────────────────────
// Fine-grained control over how the task scheduler advances between
// ticks — can keep the same task running or jump to the next tick.

PM.add('CtrlSystem', (() => {
  let _perm = 0, _temp = 0;
  const setCtrl = (bits, perm) => { if (perm) _perm = bits; else _temp = bits; };
  const consume = () => { const b = _temp || _perm; _temp = 0; return b; };
  return {
    norm(perm = false) { setCtrl(0, perm); },
    keep(perm = false) { setCtrl(1, perm); },
    jump(perm = false) { setCtrl(2, perm); },
    cont(perm = false) { setCtrl(3, perm); },
    ctrl(sameTask, sameTick, perm = false) {
      setCtrl((sameTick ? 2 : 0) | (sameTask ? 1 : 0), perm);
    },
    override: {
      'TS.tick'(orig) {
        const g = TS.gen;
        if (!g.tasks.length) return;
        let ctrl = 0;
        do {
          if ((ctrl & 1) && g.currentTask) {
            const t = g.tasksById[g.currentTask.id];
            if (!t) return;
            let res;
            try { res = t.gen.next(); }
            catch (e) { g._removeTask(t); ctrl = consume(); continue; }
            ctrl = consume();
            if (res.done) g._removeTask(t);
          } else {
            orig();
            ctrl = consume();
          }
        } while ((ctrl & 2) && g.tasks.length);
      }
    }
  };
})(), 'TS');

// ── vvt ──────────────────────────────────────────────────────
// Public timer/tick API.  setTimeout/setInterval/clear* are thin
// wrappers over AsyncFuncs (which itself uses TS), so there is one
// scheduler underneath.  addTickFn/removeTickFn survive for any
// code that registers per-tick callbacks directly.

World.vvt = {
  /** @type {Map<string, Function>} Named per-tick callbacks. */
  tickFunctions: new Map(),

  /** Register a named function to be called every tick. */
  addTickFn(key, fn) {
    if (typeof fn === 'function') this.tickFunctions.set(key, fn);
  },
  removeTickFn(key) { this.tickFunctions.delete(key); },

  // Delegate scheduling to AsyncFuncs / TS.
  setTimeout(key, fn, ms)   { return setTimeout(fn, ms);  /* AsyncFuncs global */ },
  clearTimeout(key)         { clearTimeout(key);           },
  setInterval(key, fn, ms)  { return setInterval(fn, ms); },
  clearInterval(key)        { clearInterval(key);          },

  /** Advance all named tick functions. */
  tick() {
    this.tickFunctions.forEach(fn => fn());
  }
};

// ── Store ────────────────────────────────────────────────────
// Persists arbitrary key/value pairs as JSON in a chest item's
// customDescription field.  Works with both standard and moonstone
// chests; pass a coords array for moonstone, a playerId for standard.

globalThis.Store = {
  /**
   * Determine which chest API pair to use.
   * @param  {Array|string} target — coords array → moonstone, string → standard
   * @returns {{ getter: string, setter: string, isObj: boolean }}
   */
  _api(target) {
    const isObj = Array.isArray(target);
    return {
      isObj,
      getter: isObj ? 'getMoonstoneChestItemSlot' : 'getStandardChestItemSlot',
      setter: isObj ? 'setMoonstoneChestItemSlot' : 'setStandardChestItemSlot',
    };
  },

  /** Read the raw JSON blob from slot 0 of the target chest. */
  _read(target) {
    const { getter } = this._api(target);
    const raw = api[getter](target, 0)?.attributes?.customDescription;
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  },

  /** Write a data object back to slot 0 of the target chest. */
  _write(target, data) {
    const { setter, isObj } = this._api(target);
    const attrs  = { customDisplayName: 'SaveData', customDescription: JSON.stringify(data) };
    const extra  = isObj ? [attrs] : [api.getPlayerIds()[0], attrs];
    api[setter](target, 0, 'Grass Block', 1, ...extra);
  },

  /** Set a single key on the target's stored data. */
  set(target, key, value) {
    const data  = this._read(target);
    data[key]   = value;
    this._write(target, data);
  },

  /** Get a single key from the target's stored data. */
  get(target, key) {
    return this._read(target)[key];
  },

  /** Erase all stored data for a target. */
  reset(target) {
    const { setter, isObj } = this._api(target);
    const attrs  = { customDisplayName: 'SaveData', customDescription: undefined };
    const extra  = isObj ? [attrs] : [api.getPlayerIds()[0], attrs];
    api[setter](target, 0, 'Grass Block', 1, ...extra);
  }
};

// ── allItems ─────────────────────────────────────────────────
// Iterates every craftable item id by trying to register an edit
// recipe; when the api throws, we've reached the end of the item list.

class AllItemsGiver {
  constructor() {
    this.ply = {};   // playerId → current item id counter
  }

  *_giveAll(playerId) {
    this.ply[playerId] = 2;
    while (true) {
      try {
        const id = '' + this.ply[playerId];
        api.editItemCraftingRecipes(playerId, id, [
          { requires: [{ items: ['Dirt'], amt: 1 }], produces: 1, station: 'Potion Table' }
        ]);
        this.ply[playerId]++;
      } catch {
        api.sendMessage(playerId, 'All Items Given, Ending Code');
        return;
      }
      yield;
    }
  }

  /** Start the give-all generator for a player. */
  give(playerId) { TS.add(this._giveAll(playerId)); }
}

globalThis.allItems = new AllItemsGiver();

"Code Block 4 Manually Loaded"

