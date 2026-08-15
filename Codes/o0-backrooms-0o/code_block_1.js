//handles any ratelimiter issues, with custom data
World.RT={}
// ── Non-Euclidean teleport ───────────────────────────────────
/**
 * Teleport a player by a displacement vector, with optional
 * facing-dot-product and area guards.
 * @param {string}   playerId
 * @param {number[]} disp     — [dx, dy, dz] added to current position
 * @param {number[]} [vec]    — facing vector to dot-product against
 * @param {number}   [vAllow] — signed-square dot threshold
 * @param {Array}    [area]   — [[min], [max]] rect the player must be inside
 */
World.nonEuclTp = (playerId, disp, vec, vAllow, area) => {
  if (vec) {
    const facing = api.getPlayerFacingInfo(playerId).dir;
    const dot    = facing.reduce((sum, v, i) => sum + v * vec[i], 0);
    if (dot ** 2 * Math.sign(dot) < vAllow) return;
  }
  if (area && !api.isInsideRect(api.getPosition(playerId), area[0], area[1], true)) return;

  const pos  = api.getPosition(playerId).slice();
  const velc = api.getVelocity(playerId) || [0, 0, 0];
  pos[0] += disp[0]; pos[1] += disp[1]; pos[2] += disp[2];
  api.setPosition(playerId, pos[0], pos[1], pos[2]);
  api.applyImpulse(playerId, ...velc);
};

// ── Utility helpers ──────────────────────────────────────────

/** Decode percent-encoded unicode escapes and surrogate pairs in a string. */
World.unicodeToChar = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/%[A-Fa-f0-9]{4}/g, m => String.fromCharCode(parseInt(m.slice(1), 16)))
    .replace(/([\uD800-\uDBFF])([\uDC00-\uDFFF])/g, (_, hi, lo) => {
      const n = 65536 + ((hi.charCodeAt(0) - 0xD800) << 10) + (lo.charCodeAt(0) - 0xDC00);
      return String.fromCodePoint(n);
    });
};

/** Return a random integer in [min, max] inclusive. */
World.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// ── DM state ─────────────────────────────────────────────────
World.lastDmMap = new Map();   // playerId → last DM partner playerId

// ── Chest text reader ────────────────────────────────────────
/**
 * Concatenate all page text stored in a chest's items.
 * If verifyAuthors is true, returns null if any item has an unknown author.
 */
World.Chest = (coords, verifyAuthors = false) => {
  const item = api.getStandardChestItemSlot(coords,0);
  if (verifyAuthors) {
    const author = item?.attributes?.customAttributes?.author;
    if (author && !World.coderList.includes(author)) return null;
  }
  return item?.attributes?.customAttributes?.pages.join('').replace(/\n/g, '');
};

// ── Player commands ──────────────────────────────────────────
// Two maps keep admin and public commands cleanly separated.
// Each entry is a function(playerId, parts, send, name).

/** Admin-only command handlers (coderList required). */
const adminCommands = {

  kick(playerId, parts) {
    api.kickPlayer(api.getPlayerId(parts[1]), 'An Admin kicked You');
  },

  kickall() {
    api.getPlayerIds().forEach(id => {
      const nm = api.getEntityName(id);
      if (!World.coderList.includes(nm) && !World.adminList.includes(nm))
        api.kickPlayer(id, 'An Admin kicked All Players');
    });
  },

  permban(playerId, parts, send) {
    const target   = parts[1];
    const targetId = api.getPlayerId(target);
    // Coders who are not also admins get launched before the kick.
    if (World.coderList.includes(target) && !World.adminList.includes(target))
      api.setVelocity(targetId, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    api.kickPlayer(targetId, 'An Admin PermBanned You');
    send(playerId, 'Permban Worked', { color: 'red' });
  },

  tp(playerId, parts) {
    const sub = parts[1]?.toLowerCase();
    if (sub === 'to')   api.setPosition(playerId, api.getPosition(api.getPlayerId(parts[2])));
    if (sub === 'here') api.setPosition(api.getPlayerId(parts[2]), api.getPosition(playerId));
    if (sub === 'pos' && parts[2] && parts[3] && parts[4])
      api.setPosition(playerId, [Number(parts[2]), Number(parts[3]), Number(parts[4])]);
  },

  accept(playerId, parts, send, name) {
    if (World.Stolen === 0) return;
    World.Stolen    = 2;
    World.StolenStr = '';
    console.log('Accepted appeal from', name);
  },

  deny(playerId, parts, send, name) {
    if (World.Stolen === 0) return;
    World.StolenStr = 'Your World Appeal has been DENIED';
    World.Stolen    = 1;
    console.log('Denied appeal from', name);
  },
};

/** Public command handlers (available to all players). */
const publicCommands = {

  msg(playerId, parts, send) {
    const targetName = parts[1]?.replace('@', '');
    const targetId   = api.getPlayerId(targetName);
    const message    = parts.slice(2).join(' ');
    const name       = api.getEntityName(playerId);
    const dm = [
      { str: `${name} [DM]: `, style: { color: 'Cyan'   } },
      { str: message,          style: { color: 'Yellow' } }
    ];
    send(targetId, dm);
    send(playerId, dm);
    if (parts[1]?.startsWith('@')) {
      api.playSound(targetId, 'headshot_04', 1, 0.25);
      send(targetId, [{ str: `You have been sent a DM from: ${name}`, style: { color: 'Yellow' } }]);
      api.playSound(playerId, 'headshot_04', 1, 0.25);
      send(playerId,  [{ str: `You have sent a DM to: ${targetName}`, style: { color: 'Yellow' } }]);
    }
    World.lastDmMap.set(targetId, playerId);
    World.lastDmMap.set(playerId,  targetId);
  },

  reply(playerId, parts, send) {
    const last = World.lastDmMap.get(playerId);
    const name = api.getEntityName(playerId);
    if (!last)             return send(playerId, 'No one to reply to.',     { color: 'red'    });
    const msg = parts.slice(1).join(' ');
    if (!msg)              return send(playerId, 'Usage: /reply <message>', { color: 'yellow' });
    const dm = [
      { str: `${name} [DM Reply]: `, style: { color: 'Cyan'   } },
      { str: msg,                    style: { color: 'Yellow' } }
    ];
    send(last, dm);
    send(playerId, dm);
    World.lastDmMap.set(last,     playerId);
    World.lastDmMap.set(playerId, last);
    api.playSound(last, 'headshot_04', 1, 0.25);
  },

  r(...args) { publicCommands.reply(...args); },   // alias

  info(playerId, parts, send) {
    send(playerId, [
      { str: 'Hello, here are some useful commands: ',                                            style: { color: 'LightCyan' } },
      { str: '/owner, /levels: sub|normal|negative|enigmatic, /entity, /lobbydate, /objective',  style: { color: 'Yellow'    } }
    ]);
  },

  help(...args) { publicCommands.info(...args); },   // alias

  owner(playerId, parts, send) {
    send(playerId, [
      { str: 'the ',              style: { color: 'LightCyan' } },
      { str: 'owner ',            style: { color: 'Yellow'    } },
      { str: 'of this lobby is ', style: { color: 'LightCyan' } },
      { str: '__0o0o0o0o0__ ',    style: { color: 'Yellow'    } },
      { str: 'and his alt ',      style: { color: 'LightCyan' } },
      { str: 'not_ash',           style: { color: 'Yellow'    } }
    ]);
  },

  lobbydate(playerId, parts, send) {
    send(playerId, [
      { str: 'this ',    style: { color: 'LightCyan' } },
      { str: 'lobby',    style: { color: 'Yellow'    } },
      { str: ' was made in ',                                      style: { color: 'LightCyan' } },
      { str: 'Friday the 22nd of September 2023 (22-9-23)',        style: { color: 'Yellow'    } }
    ]);
  },

  objective(playerId, parts, send) {
    const pos          = api.getPosition(playerId);
    const hasEquipment = [46, 47, 48, 49].every(slot => api.getItemSlot(playerId, slot) != null);
    const atSpawn      = api.isInsideRect(pos, [-92, 140, -23], [35, 162, 90], false);
    if (!hasEquipment) {
      send(playerId, 'Get equipment from the equipment room at spawn (also available at the end of tutorial).', { color: 'yellow' });
    } else if (atSpawn) {
      send(playerId, 'Follow the gold trail at spawn then do the tutorial, or skip to lv 0. You can also warp to tutorial or lv 0.', { color: 'yellow' });
    } else {
      send(playerId, 'Escape the backrooms and have fun finding all the levels!', { color: 'yellow' });
    }
  },

  'levels'(playerId, parts, send) {
    const LEVEL_MSGS = {
      ':sub':       'lvl 3.1,\nlvl. 5.3,\nlvl !-!.\nlvl 6.1.',
      ':normal':    'lvl 0,\nlvl 1,\nlvl 2,\u2026\nlvl 9223372036854775807.',
      ':negative':  'lvl -1,\nlvl -2,\nlvl -9223372036854775807,\nlvl -319',
      ':enigmatic': 'lvl Fun,\nlvl the end,\u2026\nlvl u cheated.'
    };
    const msg = LEVEL_MSGS[parts[1]?.toLowerCase()];
    if (msg) send(playerId, msg, { color: 'yellow' });
  },

  entity(playerId, parts, send) {
    send(playerId,
      'To become an entity you need to beat the game. You can become a bacteria, smiler, etc. Ask the owner.',
      { color: 'red' }
    );
  },

  raw(playerId, parts) {
    const name = api.getEntityName(playerId);
    const text = World.unicodeToChar(parts.slice(1).join(' '));
    api.getPlayerIds().forEach(pid => {
      api.sendMessage(pid, [
        { str: `${name} : `, style: { color: 'LightCyan' } },
        { str: text,          style: { color: 'White'     } }
      ]);
    });
  },
};

/**
 * Main command dispatcher.
 * Checks admin map first (coderList gate), then public map.
 */
World.Call.playerCommand = (playerId, text) => {
  const parts = text.trim().split(/\s+/);
  const cmd   = parts[0]?.toLowerCase();
  const name  = api.getEntityName(playerId);
  const send  = api.sendMessage.bind(api);
  if (World.coderList.includes(name) && adminCommands[cmd]){
    adminCommands[cmd](playerId, parts, send, name);
    return true
  }
  if (publicCommands[cmd]){
    publicCommands[cmd](playerId, parts, send, name)
    return true
  }
};

World.bps=new Proxy(Object.create(null),{has:(e,t)=>api.playerIsInGame(t),get:(e,t)=>e[t]||=new Proxy(Object.create(null),{has:(e,o)=>o in e||(Object.assign(e,JSON.parse(api.getMoonstoneChestItemSlot(t,961*o.charCodeAt(0)+31*o.charCodeAt(o.length>>1)+o.charCodeAt(o.length-1)&31)?.attributes?.customDescription??"{}")),o in e),get:(e,o)=>(o in e||Object.assign(e,JSON.parse(api.getMoonstoneChestItemSlot(t,961*o.charCodeAt(0)+31*o.charCodeAt(o.length>>1)+o.charCodeAt(o.length-1)&31)?.attributes?.customDescription??"{}")),e[o]),set(e,o,s){let n=typeof s;if(null!==s&&!["string","number","boolean","undefined"].includes(n))throw TypeError("Unexpected value type: "+n+" (expected string, number, boolean, or undefined)");let r=961*o.charCodeAt(0)+31*o.charCodeAt(o.length>>1)+o.charCodeAt(o.length-1)&31,i=JSON.parse(api.getMoonstoneChestItemSlot(t,r)?.attributes?.customDescription??"{}");i[o]=s,Object.assign(e,i),api.setMoonstoneChestItemSlot(t,r,"Ice",1,{customDescription:JSON.stringify(i)})},deleteProperty(e,o){let s=961*o.charCodeAt(0)+31*o.charCodeAt(o.length>>1)+o.charCodeAt(o.length-1)&31,n=JSON.parse(api.getMoonstoneChestItemSlot(t,s)?.attributes?.customDescription??"{}");delete n[o],Object.assign(e,n),delete e[o],api.setMoonstoneChestItemSlot(t,s,"Ice",1,{customDescription:JSON.stringify(n)})},setPrototypeOf(){},preventExtensions(){},defineProperty(){},ownKeys:e=>(Object.assign(e,...api.getMoonstoneChestItems(t).map(e=>e?.attributes?.customDescription).filter(e=>e).map(e=>JSON.parse(e))),Reflect.ownKeys(e))}),set(){},setPrototypeOf(){},preventExtensions(){},defineProperty(){},ownKeys:()=>api.getPlayerIds()});

"Code Block 1 Manually Loaded"
