


World.Permissions = new class {

  // ── Perm definitions ─────────────────────────────────────
  // Plain functions, take playerId + args, call api directly.

  PERMS = {
    'mode.creative':  (playerId, bool) => api.setClientOption(playerId, 'creative', bool),
    'build.global':   (playerId, bool) => api.setClientOption(playerId, 'canChange', bool),
    'build.region':   (playerId, bool, region) => bool
      ? api.setCanChangeBlockRect(playerId, ...region)
      : api.setCantChangeBlockRect(playerId, ...region),
  }

  // ── Role classes ──────────────────────────────────────────
  // Each class declares which perms it has as properties.
  // Inheritance stacks naturally — Coder extends Admin, etc.
  // apply() is inherited and walks the perm keys on the instance.

  ROLES = (() => {
    const PERMS = this.PERMS

    class Role {
      constructor(playerId) { this.playerId = playerId }
      apply() {
        for (const key of Object.keys(this)) {
          if (key === 'playerId') continue
          PERMS[key]?.(this.playerId, this[key])
        }
      }
    }

    class Player extends Role {
      'mode.creative' = false
      'build.global'  = false
    }

    class Admin extends Player {
      'mode.creative' = false  // admins don't get creative by default
    }

    class Coder extends Admin {
      'mode.creative' = true
      'build.global'  = true
    }

    class Entity extends Player {}

    return { Role, Player, Admin, Coder, Entity }
  })()

  // ── Player → role assignments ─────────────────────────────
  // Values are role classes (not instances), applied on demand.

  PLAYERS = {
    ChaosCheeseMannE200:  this.ROLES.Coder,
    not_ash:              this.ROLES.Coder,
    GlitchHunter:         this.ROLES.Coder,
    __0o0o0o0o0__:        this.ROLES.Coder,
    Mango_AltAlt:         this.ROLES.Coder,
    Gamer12K_YT:          this.ROLES.Coder,
    _Antagoniste_:        this.ROLES.Coder,
    the_EliteOne:         this.ROLES.Coder,
    PAR4D0X_C4M3_B4CK:   this.ROLES.Coder,
    WiT_Lava:             this.ROLES.Coder,
    Bluemosquito:         this.ROLES.Coder,
    Error_6969:           this.ROLES.Coder,

    Unchango:             this.ROLES.Admin,
    _Antagoniste_:        this.ROLES.Entity,  // overrides Coder if needed
  }

  // ── API ───────────────────────────────────────────────────

  /** Get the Role class for a player name. Defaults to Player. */
  getRole(name) {
    return this.PLAYERS[name] ?? this.ROLES.Player
  }

  /** Instantiate and apply perms for a live player. */
  apply(playerId) {
    const name     = api.getEntityName(playerId)
    const RoleClass = this.getRole(name)
    new RoleClass(playerId).apply()
  }

  /** Check role via instanceof — instantiate once and test. */
  isRole(name, RoleClass) {
    return new (this.getRole(name))(null) instanceof RoleClass
  }

  /** Check a single perm value for a player. */
  hasPerm(name, permKey) {
    const instance = new (this.getRole(name))(null)
    return instance[permKey] ?? false
  }
}

// ── Player lists ─────────────────────────────────────────────
// coderList  : full server-code access + all admin powers
// adminList  : moderation powers (kick, ban, tp)
// entityList : players designated as in-world entities

World.coderList  = ['ChaosCheeseMannE200','not_ash','GlitchHunter','__0o0o0o0o0__','Mango_AltAlt','Gamer12K_YT','_Antagoniste_','the_EliteOne','PAR4D0X_C4M3_B4CK','WiT_Lava','Bluemosquito','Error_6969'];
World.adminList  = ['__0o0o0o0o0__','Unchango','GlitchHunter','not_ash','Bluemosquito','Gamer12K_YT','_Antagoniste_','the_EliteOne','PAR4D0X_C4M3_B4CK'];
World.entityList = ['_Antagoniste_','not_ash'];
//World.buildList = ["Error_6969"] //why?
World.playerCall = {
  /*"Error_6969":{
    onPlayerJoin:(playerId)=>{
      api.setClientOption(playerId, "canChange", false)
      api.setCanChangeBlockRect(playerId,[-700,-360,300],[-300,240,700])
    }
  },*/
  "GlitchHunter":{
    last:[0,0,0],
    onPlayerJoin:(playerId)=>{
      //this.last = [0,0,0]
    },
    tick:()=>{
       //console.log(Reflect.ownKeys(this))
    }
  }
}


// ── Permission helpers ───────────────────────────────────────

/** Set creative mode for all connected players based on coderList membership. */
World.updatePlayerPermissions = () => {
  api.getPlayerIds().forEach(id => {
    api.setClientOption(id, 'creative', World.coderList.includes(api.getEntityName(id)));
  });
};

// ── Stolen-world detection ───────────────────────────────────
// A glass block at [0,0,0] encodes world status:
//   White Glass → clean (0)
//   Gray  Glass → stolen, appeal pending (1)
//   Black Glass → appeal accepted (2)
//   Unloaded    → block not ready (-1)

/** Map a block name at [0,0,0] to a numeric stolen-status code. */
World.getStolenStatus = (block) => {
  const map = { 'Gray Glass': 1, 'Black Glass': 2, 'Unloaded': -1 };
  return map[block] ?? 0;
};

/** Returns true if non-coder players should be kicked right now. */
World.shouldEnforceKick = (status, lobbyName) =>
  lobbyName !== 'o0-backrooms-0o' && status !== 2 && status !== -1;

/** Kick every player not on coderList with a given reason string. */
World.kickNonCoders = (reason) => {
  api.getPlayerIds().forEach(id => {
    if (!World.coderList.includes(api.getEntityName(id))) api.kickPlayer(id, reason);
  });
};

/**
 * Central world integrity check — runs every tick.
 * Updates permissions, reads stolen status, kicks if necessary.
 */
World.Check = (callback) => {
  World.updatePlayerPermissions();
  const status = World.getStolenStatus(api.getBlock([0, 0, 0]));
  World.Stolen = status;
  if (World.shouldEnforceKick(status, api.getLobbyName())) {
    const msg = 'This Code has Been Stolen, Please Appeal at o0-backrooms-0o, for a chance to get your world back';
    World.kickNonCoders(msg);
    World.StolenStr = msg;
    World.Stolen    = 1;
  }

  if(callback=="tick"){
    const STOLEN_BLOCKS = { 0: 'White Glass', 1: 'Gray Glass', 2: 'Black Glass' };
    const statusBlock   = STOLEN_BLOCKS[World.Stolen];
    if (statusBlock) api.setBlock([0, 0, 0], statusBlock);
  }
};

World.Stolen    = 0;
World.StolenStr = undefined;

// ── Join / Leave ─────────────────────────────────────────────

World.Call.onPlayerJoin = (playerId) => {
  //BR.onPlayerJoin(playerId, "0,1")
  api.setClientOption(playerId,"chatChannels",[{channelName:"Global",elementContent:[{icon:"globe",style:{color:"white"}},{str:"Global",style:{color:"lightblue"}}],elementBgColor:"#2671d7"},{channelName:"Tribe",elementContent:[{icon:"shield"},{str:"Tribe",style:{color:"lime"}}],elementBgColor:"#2eeb82"},{channelName:"Private",elementContent:[{icon:"user-unlock",style:{color:"white"}},{str:"Direct",style:{color:"Yellow"}}],elementBgColor:'Gold'}])
  World.playerCall[api.getEntityName(playerId)]?.onPlayerJoin(playerId)
  World._broadcastAdminWelcome(playerId);
  World.Check();
  World._sendWelcomeMessage(playerId);
  World._applyLegendaryAttachment(playerId);
};

World.Call.onPlayerLeave = (playerId) => {
  //BR.onPlayerLeave(playerId)
  // Clear per-player transient state.
  //if (globalThis.player_Minus319 === playerId) globalThis.player_Minus319 = null;
  //replace with proper system
  delete World.effectList[playerId];
  World.lastDmMap.delete(playerId);
};

/** Announce when an admin joins. */
World._broadcastAdminWelcome = (playerId) => {
  const name = api.getEntityName(playerId);
  if (World.adminList.includes(name)) {
    api.broadcastMessage([
      { str: 'the legend himself has joined! ', style: { color: 'Yellow' } },
      { str: name,                              style: { color: 'White'  } }
    ]);
  }
};

/** Send the standard welcome message to a newly joined player. */
World._sendWelcomeMessage = (playerId) => {
  api.sendMessage(
    playerId,
    'Hello, welcome to this server. Please read the rules. Type /info for commands, /objective to see your current objective.',
    { color: 'white' }
  );
  if (World.Stolen === 1) {
    console.log('Lobby has stolen code — use /accept or /deny to decide the appeal outcome.');
  }
};

/** Apply a decorative block attachment to specific legendary players. */
World._applyLegendaryAttachment = (playerId) => {
  const LEGENDS = [];
  if (LEGENDS.includes(api.getEntityName(playerId))) {
    api.updateEntityNodeMeshAttachment(
      playerId, 'TorsoNode', 'BloxdBlock',
      { blockName: 'Cooked Mutton', size: 0.4, meshOffset: [0, 0, 0] },
      [-0.1, 0, 0.4], [0, 4.5, 0]
    );
  }
};

// ── Chat ─────────────────────────────────────────────────────

World.pendingMsgs = [];

World.Call.onPlayerChat = (playerId, text, channel) => {
  if (channel === "Private"){
    World.Call.playerCommand(playerId,"r "+text);
    return false;
  }
  if (channel === "Tribe") return;
  World.pendingMsgs.push([playerId, text]);
  const state = World.playerDialogState[playerId];
  if (state) World.handleDialogueSelection(playerId, text, state);
  return false;
};

/** Broadcast a global chat message attributed to a player. */
World.broadcastGlobalMessage = (playerId, text) => {
  const name = api.getEntityName(playerId);
  api.broadcastMessage([
    { str: `${name}: `, style: { color: 'LightCyan' } },
    { str: text,        style: { color: 'White'     } }
  ]);
};

// ── Dialogue ─────────────────────────────────────────────────

World.playerDialogState = {};
World.dialogues         = {};

/** Route a player's numeric chat input to the current dialogue option. */
World.handleDialogueSelection = (playerId, text, dialogId) => {
  const dialog = World.dialogues[dialogId];
  const idx    = parseInt(text, 10) - 1;
  if (isNaN(idx)) return false;
  if (idx < 0 || idx >= dialog.options.length) {
    api.sendTopRightHelper(playerId, 'exclamation', 'Please type a valid number!',
      { duration: 3, color: '#ff4444', fontSize: '16px' });
    return;
  }
  return sendDialogue(playerId, dialog.options[idx].id);
};

World.Call.onWorldAttemptSpawnMob=(mobType,x,y,z)=>{
  if(mobType=="NPC"){return}
  return "preventSpawn"
}

//function to manage behaviour across ALL callbacks
World.all=(fn, ...args)=>{
  api.getPlayerIds().map(id=>World.playerCall[api.getEntityName(id)]?.[fn]?.(id,[...args])) //handles player call data (map of players to code changes)

  if(args[0]+""===args[0] && !!+args[0]){ //if args[0] is stringified number
    let playerId = args[0]
    const code = api.getHeldItem(playerId)?.attributes?.customAttributes?.[fn]?.replace(/\n/g, '')
    if (code) {
      BE.try(code, {api, playerId});
      BE.log(2)
    }
  }
}

Reflect.ownKeys(globalThis).filter(item => typeof item === "string" && item.includes("Error"))
  .forEach(E => {
    Object.defineProperty(globalThis[E].prototype, "name", {
      configurable: true,
      get: function() {
        this.message += "\n"+this.stack;
        return E
      }
    });
  }); //replace all errors with new way


"Code Block 2 Manually Loaded"
