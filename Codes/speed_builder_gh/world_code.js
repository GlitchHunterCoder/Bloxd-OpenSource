







// TO PLAYERS: YOU AINT FINDING OUT HOW THIS WORKS
// TO CODERS: DO NOT EDIT HERE, EDIT THE CODE BLOCKS ONLY

globalThis.Emoji = {
    Mobile: "📱",
    PC: "💻"
};

Object.defineProperty(globalThis.InternalError.prototype, "name", {
    configurable: true,
    get: function () {
        console.log("InternalError: " + this.message + "\n" + this.stack);
        return "InternalError";
    }
});

allowedMob = [];

// you aint finding out how this code works here 
globalThis.World = {} 

globalThis.ErrMsg = (e) => {
    api.broadcastMessage(
        `${e.name}: ${e.message}\n${e.stack}`,
        { color: "red" }
    );
};

//optional try code, catch show better error
globalThis.Try = (fn, ctx = null, ...params) => {
    try { fn.apply(ctx, params); }
    catch (e) { ErrMsg(e); }
};

World.CALLBACKS = [
  "onPlayerDamagingMob",
  "onMobDamagingPlayer",
  "onMobDamagingOtherMob",
  "onWorldAttemptSpawnMob",
  "onWorldAttemptDespawnMob",
  "onPlayerJoin",
  "onPlayerChangeBlock",
  "onPlayerChat",
  "onPlayerAltAction"
]

World.CALLBACKS.map(name => {
  globalThis[name] = (...arg) => {
    try {
      return World[name]?.(...arg);
    } catch (e) {
      ErrMsg(e);
    }
  }
})

World.FALLBACKS = {
  onPlayerDamagingMob:"preventDamage",
  onMobDamagingPlayer:"preventDamage",
  onMobDamagingOtherMob:"preventDamage",
  onWorldAttemptSpawnMob:"preventSpawn",
  onWorldAttemptDespawnMob:"preventDespawn"
}

Object.entries(World.FALLBACKS).map(([key,value])=>{
  api.setCallbackValueFallback(key,value)
})

globalThis.BlockData = (x, y, z, data) => {
    let arr = [x, y, z].map(e => Math.floor(e));
    try {
        if (data) {
            api.setBlockData(...arr, {
                persisted: {
                    shared: {
                        text: data, textSize: 0,
                    }
                }
            });
        } else {
            return api.getBlockData(...arr)?.persisted?.shared?.text;
        }
    } catch (e) {
        return void 0;
    }
};
Init = new class {
    constructor() {
        this.ini = true;
        this.starter = undefined;
        this.pos = undefined;
        this.spawn = [526.5, 127, 169.5]; //loader spawn
    }
    main() {
        if (!this.ini) { return 1; }
        let data = [0, 1, 2, 3, 4].map(e => BlockData(525 + e, 102, 169));
        if (data.includes(void 0)) {
            api.setPosition(this.starter[0], ...this.spawn);
            ErrMsg(new ReferenceError(`Code Block ${data.indexOf(void 0)} failed to load, retrying next tick`));
            return 0;
        }
        try {
            data.forEach((e, i) => {
                try { eval(e); }
                catch (err) {
                    err.message = `Error In Code Block ${i}: ` + err.message;
                    ErrMsg(err);
                    api.setPosition(this.starter[0], ...this.spawn);
                    throw "Error" 
                }
            });
            return 1;
        } catch (e) {
            return 0;
        };
    }
};

World.spawn = [526.5, 70, 169.5]; //World Spawn

function tick(...arg) {
    try {
        if (Init.ini) {
            if (Init.starter?.[0] == void 0) {
                Init.starter = api.getPlayerIds();
                return;
            }
            if (!Init.pos) {
                Init.pos = World.spawn;
                return;
            }
            if (!Init.main()) { return; }
            Init.ini = false;
            return;
        }
        if (api.getBlock(1050, 25, 0) != "Air") { return; }
        return World.tick?.(...arg);
    } catch (e) {
        ErrMsg(e);
    }
}     
