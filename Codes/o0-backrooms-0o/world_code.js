


// ── World namespace ──────────────────────────────────────────
globalThis.World = {}
globalThis.Code = {}
globalThis.World.Call = {}

Object.getOwnPropertyNames(globalThis)
    .filter(e=>e.includes("Error") && e!=="InternalError")
    .map(e=>Object.defineProperty(globalThis[e].prototype,"name",{
        get:function(){
            this.message += "\n" + this.stack
            return e
        },
    }))

Object.defineProperty(globalThis.InternalError.prototype, "name", {
  configurable: true,
  get: function() {
    if(!BE.get.isRun){
      this.stack=""
      this.message=""
      return ""
    }
    let a = this
    this.name = "InternalError"
    let instance = BE.get
    instance.store = a
    instance.isRun = false
    BE.stack.pop()
    BE.last = instance
    BE.log(2)
    return "CaughtInternalError"
  }
});

let BetterError = class {
  constructor(){
    this.store = void 0
    this.isRun = false
    this.src = void 0
    this.offset = 3
  }
  getErr(err) {
    return err.stack.split("\n").map(line => line.trim().replace(/^at\s+/, "").replace(/\s+/g, " "))
  }
  getLines(err, src){
    let lineCount = src.split("\n").length
    let seen = new Set()
    return this.getErr(err)
      .map(line => {
        let match = line.match(/:(\d+)\)?$/);
        return match ? Number(match[1]) - this.offset : void 0;
      })
      .filter(n => {
        if(n === null || n === undefined || n < 0 || n >= lineCount) return false
        if(seen.has(n)) return false
        seen.add(n)
        return true
      })
  }
  renderFrame(src, line, ctx){
    let start = Math.max(line - ctx, 0)
    let end = Math.min(line + ctx + 1, src.split("\n").length)
    let list = src.split("\n").slice(start, end).map(e => "    |   | " + e)
    let errorIndex = line - start
    if(list[errorIndex]){
      list[errorIndex] = "    |>| " + list[errorIndex].slice(10)
    }
    return list
  }
  try(src,kvArgs={}){
    this.isRun = true
    this.src = "//BE_START\n"+src+"\n//BE_END"
    this.store = void 0
    try{
      Function(...Object.keys(kvArgs),this.src)(...Object.values(kvArgs));
    }catch(e){
      if(!this.isRun){return;}
      this.store = e
    }
    this.isRun = false
  }
  throw(){
    if(!this.store){return;}
    if(!this.store._beChain) this.store._beChain = []
    this.store._beChain.push({src: this.src})
    throw this.store
  }
  catch(){
    if(!this.store){return [];}
    return this.getLines(this.store, this.src, this.offset)
  }
  find(num=0, ctx=1){
    if(!this.store){return "";}
    let line = this.catch()[num]
    if(line === void 0){return "";}
    let list = this.renderFrame(this.src, line, ctx)
    return "\n" + list.join("\n") + "\n"
  }
  log(ctx=1, size=Infinity){
    let logMessage
    if(myId != void 0){logMessage = (...args) => api.sendMessage(myId, ...args)}
    else{logMessage = (...args) => api.broadcastMessage(...args)}
    if(!this.store){logMessage("0 Errors Found", {color:"lime"}); return;}
    let e = this.store
    let str = e.name + ": " + e.message + "\n" + e.stack
    let frames = e._beChain ? [...e._beChain] : []
    frames.push({src: this.src})
    frames.slice(0, size).forEach((frame, fi) => {
      let lines = this.getLines(e, frame.src)
      let label = fi === 0 ? "Error" : "Rethrown"
      lines.forEach(line => {
        let list = this.renderFrame(frame.src, line, ctx)
        str += label + " on Line " + line + " (<input>:" + (line + this.offset) + "): \n" + list.join("\n") + "\n"
      })
    })
    str += "End of Log"
    logMessage(str, {color:"red"})
    return str
  }
}

globalThis.BE = new class {
  constructor(){
    this.stack = []
    this.last = new BetterError()
  }
  get get(){
    return this.stack.length
      ? this.stack[this.stack.length - 1]
      : this.last
  }
  try(src,arg){
    let instance = new BetterError()
    this.stack.push(instance)
    instance.try(src,arg)
    this.stack.pop()
    this.last = instance
  }
  log(ctx=1, size=Infinity){ this.last.log(ctx, size) }
  throw(){ this.last.throw() }
  get store(){ return this.last.store }
  get src(){ return this.last.src }
} 

// ── Shared error formatter ───────────────────────────────────

/** Format any Error into a single broadcast-ready string. */
const ErrMsg = (e) => `${e.name}: ${e.message}\n${e.stack}`;

// ── Callback wiring ──────────────────────────────────────────
// Each in-game callback is proxied through safeCall so a runtime
// error in one handler never silently kills the whole tick.

const CALLBACKS = [
  'tick', 'onPlayerLeave', 'playerCommand', 'onPlayerChat', 'onPlayerDropItem',
  'onPlayerOpenedChest', 'onPlayerMoveInvenItem',
  'onPlayerClick', 'onPlayerDamagingOtherPlayer', 'onPlayerPotionEffect',
  'onPlayerStartChargingItem', 'onPlayerJoin', 'onWorldAttemptSpawnMob', 'onWorldChangeBlock'
];

const FALLBACKS = {
  onPlayerDropItem:"preventDrop",
  onWorldAttemptSpawnMob:"preventSpawn",
  onWorldChangeBlock:"preventChange",
  onPlayerAttemptOpenChest:"preventOpen"
}

CALLBACKS.forEach(name => { globalThis[name] = (...args) => safeCall(name, ...args); });


Object.entries(FALLBACKS).forEach((kvPair) => {
  api.setCallbackValueFallback(...kvPair)
})

Manage = new class {
  constructor(){
    this.prev = {} //temp always
    this.curr = {} //temp now
    this.callback = {} //CALLBACK METRICS
    this.date = Date.now() //tick and lag detect
  }

  rateLimit(fnName){ //collect, and enforce
    this.callback[fnName] ??=0
    this.callback[fnName]+=1
  }

  tick(){ //analyse, and change
    if((Date.now() - this.date) > 100){
        //console.log(this.callback, Date.now() - this.date)
    }
    this.date = Date.now()
  }
} 


const safeCall=(fnName, ...args)=>{
  if(World.Init.active){ 
    if(fnName=="tick"){World.Init.tick()}
    return FALLBACKS[fnName]
  }
  if(fnName=="tick"){Manage.tick()}
  if(Manage.rateLimit(fnName)){return FALLBACKS[fnName]} //RECODE THIS SYSTEM
  try {
    World?.all(fnName, ...args)
    return World.Call[fnName]?.(...args);
  } catch (e) {
    api.broadcastMessage(ErrMsg(e), { color: 'red' });
  }
}



// ── BlockData helper ─────────────────────────────────────────

/**
 * Read or write the persisted shared text on a block.
 * @param {number} x/y/z  — block coordinates (floored)
 * @param {string} [data] — if provided, writes; otherwise reads and returns value
 */
const BlockData=(x, y, z, data)=>{
  const pos = [x, y, z].map(Math.floor);
  try {
    if (data !== undefined) {
      api.setBlockData(...pos, { persisted: { shared: { text: data, textSize: 0 } } });
      return;
    }
    return api.getBlockData(...pos)?.persisted?.shared?.text;
  } catch (e) {
    console.log('BlockData error', e);
  }
}

// ── Init — startup code loader ───────────────────────────────
// Reads up to 4 code strings from sign blocks at startup,
// evaluates each via BE, then hands off to normal tick.

World.Init = new class {
  constructor() {
    this.first   = 1 //!`${api.getPlayerIds()}` //is lobby opened for first time
    this.active  = 1;        // still in startup phase, is bool and state
    this.starter = undefined;   // first player seen, used for position restore
    this.pos     = undefined;   // starter's original position
    this.spawn   = [1000.5, -4, 1000.5];
    this.step = 0
    this.len = 7
    this.compiled = []
  }
  


  main() {
    console.log("main", this.active, this.step)
    if (!this.active) return true;
  
    if(this.active == 1){ // load stage
      const code = BlockData(1000 + this.step, 0, 997);
      if (!code) {
        if (this.starter) api.setPosition(this.starter, ...this.spawn);
        BE.try(`throw new ReferenceError("Code Block ${this.step+1} failed to load in load step")`)
        BE.log(2)
        this.step = 0
        return;
      }
      this.compiled[this.step] = code
      if(this.step != (this.len-1)){this.step++; return}
      else{this.active = 2; this.step = 0; return}
    }
  
    if(this.active == 2){ // execute stage
      const code = this.compiled[this.step]
      if(!code){ // should NEVER happen
        BE.try(`throw new ReferenceError("FATAL ERROR: Code Block ${this.step+1} failed to load after load step, should NEVER happen")`)
        BE.log(2)
        if (this.starter) api.setPosition(this.starter, ...this.spawn);
        this.active = 0; return
      }
      try {
        eval(code) //until BE is optimised for large code
      } catch (e) {
        if (this.starter) api.setPosition(this.starter, ...this.spawn);
        this.step = 0
      }
      if(this.step != (this.len-1)){this.step++; return}
      else{this.active = 3}
    }

    if(this.active == 3){
      //api.broadcastMessage("World Code is in RECOVERY mode, some features may not work as intended, apologies for any inconviences")
      this.active = 0
    }
  }

  tick(){
    if (!this.starter) { this.starter = api.getPlayerIds()[0]; return; }
    if (!this.pos)     { this.pos     = api.getPosition(this.starter); return; }
    this.main();
    return;
  }
};

"World Code Manually Loaded" 
                           
