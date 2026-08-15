//sidebar constructor
globalThis.sideBar=(playerId)=>{
  let map = []
  Object.keys(ranks).forEach(e=>{
    map.push({icon: ranks[e].block},{str: e+"\n",style:{color:ranks[e].color}})
  })
  
  api.setClientOption(playerId,"RightInfoText",[
    { str: "🔥 SPEED BUILDER 🔥\n",style:{
      color:"#00ffff",fontSize:"22px",fontWeight:"bold"}},
    { str: "Build fast. Think fast.\n",
      style:{ color:"#ffffff",fontSize:"13px" }},
    { str: "Prove your skill!\n\n",style:{
      color:"#cccccc",fontSize:"13px"}},
    { str: "🏆 RANKS 🏆\n",style:{
      color:"#ffffff",fontSize:"16px",fontWeight:"bold"}},
    ...map,   
    { str: "🎯 Goal: Reach Champion!",style:{
      color:"#ffffff",fontSize:"13px" }}
  ]);
}

//used for interval and timeouts, similar to TS but NOT the same, this has set chests data
globalThis.vvt = {
  tickFunctions: new Map,
  timeouts: new Map,
  intervals: new Map,
  addTickFn(e, t) {"function" == typeof t && this.tickFunctions.set(e, t)},
  removeTickFn(e) {this.tickFunctions.delete(e)},
  setTimeout(e, t, o) {
    const n = Date.now(),
      s = () => {
        Date.now() - n >= o && (t(), this.removeTickFn(e))
      };
    this.addTickFn(e, s), this.timeouts.set(e, s)
  },
  clearTimeout(e) {this.removeTickFn(e), this.timeouts.delete(e)},
  setInterval(e, t, o) {
    const n = Date.now(),
      s = () => {
        Date.now() - n >= o && (t(), this.setInterval(e, t, o))
      };
    this.addTickFn(e, s), this.intervals.set(e, s)
  },
  clearInterval(e) {this.removeTickFn(e), this.intervals.delete(e)},
  setStoredValue(e, t, o) {
    let cond = ("object" == typeof e)
    let get = ["getMoonstoneChestItemSlot","getStandardChestItemSlot"][+cond]
    let set = ["setMoonstoneChestItemSlot","setStandardChestItemSlot"][+cond]
    let raw = api[get](e,0)?.attributes?.customDescription
    let data
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw)
      } catch {
        data = {}
      }
    } else {
      data = {}
    }
    data[t] = o
    let out = {
      customDisplayName: "SaveData",
      customDescription: JSON.stringify(data)
    }
    let last = [[out],[api.getPlayerIds()[0],out]][+cond]
    api[set](e,0,"Grass Block",1,...last)
  },
  getStoredValue(e, t) {
    let cond = ("object" == typeof e)
    let get = ["getMoonstoneChestItemSlot","getStandardChestItemSlot"][+cond]
    let raw = api[get](e,0)?.attributes?.customDescription
    if (raw == null) return undefined
    let obj
    try {
      obj = JSON.parse(raw)
    } catch {
      obj = void 0
    }
    if(typeof obj == "string"){
      obj = void 0
    }
    return obj?.[t]
  },
  resetStored(e){
    let cond=("object"==typeof e)
    let get=["getMoonstoneChestItemSlot","getStandardChestItemSlot"][+cond]
    let set=["setMoonstoneChestItemSlot","setStandardChestItemSlot"][+cond]
    let out = {
      customDisplayName:"SaveData",
      customDescription:undefined,
    }
    let last = [[out],[api.getPlayerIds()[0],out]][+cond]
    api[set](e,0,"Grass Block",1,...last)
  },
  tick(){
    let fns=this.tickFunctions
    if(!fns){return;}
    fns.forEach((t => t()))
  }
};

//deals with build schems
globalThis.Build = new class {
  constructor(){
    this.plot = void 0
    this.varRef = [539,102,170]
    this.fromData()
  }
  //looped function which is safe for interruptions
  //(not going to add anti interrupt general framework, that take forever)
  *loop([a,b,c],[A,B,C],fn){
    for(let i=a; i<=A;i++){
      for(let j=b; j<=B;j++){
        for(let k=c; k<=C;k++){
          fn(i,j,k)
        }
      }
      yield;
    }
  }
  //update plot with block data
  fromData(){
    this.plot = JSON.parse(BlockData(...this.varRef)).map(e=>{return {pos:e,magic:void 0}})
  }
  //upload code data to block
  toData(){
    BlockData(...this.varRef,JSON.stringify(this.plot.map(e=>e.pos)))
  }
  //auto detects builds
  detect(){
    function getRect(pos){
      let rect = [[], [], []]
      for (let i = 0; i < 6; i++) {
        let sign = i % 2
        let axis = Math.floor(i / 2)
        let dir = sign === 0 ? -1 : 1
        let temp = [...pos]
        let isExp = false
        while (api.getBlock(temp) !== "Air") {
          rect[axis][sign] = temp[axis]
          temp[axis] += dir
          isExp = true
        }
        if (!isExp) {
          rect[axis][sign] = pos[axis]
        }
      }
      for (let i = 0; i < 3; i++) {
        const min = rect[i][0] !== pos[i]
        const max = rect[i][1] !== pos[i]
        if (min === max) {
          throw new ReferenceError("Invalid corner position")
        }
      }
      let opp = rect.map((e, i) =>
        e[0] !== pos[i]
          ? e[0]
          : e[1]
      )
      return opp
    }
    let a = getRect(thisPos)
    a[1]=Math.min(a[1],thisPos[1])
    let floor = [thisPos,a] //first
    a = thisPos.map((e,i)=>Math.min(e,a[i]))
    a[1]+=1
    let b = getRect(a)
    let rect = [a,b] //second
    rect[1][1]=a[1]
    let center = rect[0].map((_, i) =>
      Math.floor((rect[0][i] + rect[1][i]) / 2)
    )
    let half = 3
    let smallMin = [
      center[0] - half,
      center[1],
      center[2] - half
    ]
    let smallMax = [
      center[0] + half,
      center[1],
      center[2] + half
    ]
    let plot = [smallMin,smallMax] //third
    center[0]+=4 //fourth
    api.setBlockRect(...floor,"Grass Block")
    api.setBlockRect(...rect,"Stone")
    api.setBlockRect(...plot,"Maple Wood Planks")
    api.setBlock(center,"Block of Gold")
  }
  make(){
    let [x,y,z] = thisPos.map(e=>14*Math.floor(e/14))
    Plot.makeArea([x,y,z])
    sbr([x+11,y+12,z+11],[x-1,y+1,z-1],"Air")
  }
  //add build
  add([x,y,z],[X,Y,Z]){
    let pos = [Math.min(x,X),Math.min(y,Y),Math.min(z,Z)]
    if(!this.plot.map(e=>e.pos+"").includes(pos+"")){
      this.fromData()
      this.plot.push({pos:pos,magic:void 0})
      this.toData()
      api.broadcastMessage(`the pos [${pos}] has been added to buildList`,{color:"lime"})
    }
  }
}

//deals with player plots
globalThis.Plot = new class {
  constructor(){
    this.plotInx = 0
    this.buildInx = 0
    this.plotList = {}
    this.ply = {}
  }
  //builds the plot itself
  makeArea([x,y,z]){
    sbr([x-1,y-1,z-1],[x+11,y+10,z+11],"Black Concrete")
    sbr([x,y,z],[x+10,y+9,z+10],"Invisible Solid")
    sbr([x+1,y+1,z+1],[x+9,y+8,z+9],"Air")
    sbr([x+1,y+9,z+1],[x+9,y+9,z+9],"Patterned Black Glass")
    sbr([x+1,y,z+1],[x+9,y,z+9],"Barkless Cedar Log")
    sbr([x+9,y,z+4],[x+9,y,z+6],"Block of Gold")
    sbr([x+2,y,z+2],[x+8,y,z+8],"Grass Block")
  }
  //deletes the plot itself
  unmakeArea([x,y,z]){
    sbr([x-1,y-1,z-1],[x+11,y+10,z+11],"Air")
  }
  //front end command to start whole plot
  setup(playerId){
    this.ply[playerId].game = Game.gameInx
    TS.add(this.S(playerId))
  }
  //starts the game loop, from start to end
  *S(playerId){
    let pos = [20*Plot.plotInx+1000,50,0]
    let id = Plot.spawn(pos)
    /*console.log(
    "\nGame.gameList: "+JSON.stringify(Game.gameList)+
    "\nGame.gameInx: "+Game.gameInx+
    "\nthis.ply: "+JSON.stringify(this.ply)
    )*/
    this.buildInx = Math.floor(Math.random()*Build.plot.length)
    let inx = this.buildInx
    {
      let magic = 0
      let needed = {}
      let [a,b,c]=Build.plot[inx].pos
      yield* Build.loop([a,b,c],[a+6,b+7,c+6],(i,j,k)=>{
        let block = api.getBlock(i,j,k)
        let isAir = block=="Air" || block=="Unloaded"
        magic+=+!(isAir)
        if(!isAir){
          needed[block]+=1
          needed[block]||=1
        }
      })
      let items = Object.keys(needed)
      items.forEach(e=>api.giveItem(playerId,e,needed[e]))
      Build.plot[inx].magic = magic
      this.ply[playerId].magic = magic
    }
    Plot.clone(id,inx)
    let [x,y,z] = pos
    try{api.setPosition(playerId,x+9.5,y+3,z+5.5)}catch(e){}
    //handles non graceful later
    Plot.assign(id,playerId)
    vvt.setTimeout(Math.random()+"",()=>{
      Plot.unclone(id)
    },10000)
    //return id
  }
  //creates a plot, and updates plotlist
  spawn([x,y,z]){
    this.makeArea([x,y,z])
    this.plotList[this.plotInx]={pos:[x,y,z],own:void 0,clone:void 0,magic:void 0}
    let c = this.plotInx
    this.plotInx++;
    return c
  }
  //assigns a plot to a player
  assign(id,playerId){
    this.plotList[id].own=playerId
    this.ply[playerId].plot=id
  }
  //clones a build schem and places it inside plot
  clone(id,inx){
    let [x,y,z] = this.plotList[id].pos
    let pos1=Build.plot[inx].pos
    let [a,b,c] = pos1
    this.plotList[id].clone = pos1
    sbr(pos1,[a+6,b+7,c+6],[x+2,y+1,z+2],[x+8,y+8,z+8])
  }
  //unclodes the build schem, and begins the game, and handles ending
  unclone(id){
    let arr = this?.plotList?.[id]?.pos
    if(arr == void 0){return;}
    let [x,y,z] = arr
    sbr([x+2,y+1,z+2],[x+8,y+8,z+8],"Air")
    let playerId = this.plotList[id].own
    if(!api.getPlayerIds().includes(playerId)){
      this.unsetup(playerId,void 0);return;
    }
    api.setClientOption(playerId,"creative",true)
    api.setCanChangeBlockRect(playerId,[x+2,y+1,z+2],[x+8,y+8,z+8])
    this.ply[playerId].time = Date.now()
    let time = 60000
    vvt.setInterval(playerId,()=>{
      if(this.ply[playerId]==void 0){this.unsetup(playerId,void 0);return;}
      let part = (Date.now() - this.ply[playerId].time)/time
      if(part>1){ //fail condition
        if(this.ply?.[playerId]?.plot == void 0){
          return;
        }
        //boot all other players from building
        this.unsetup(playerId,false)
        vvt.clearInterval(playerId)
      }
      api.setClientOption(playerId,"middleTextLower",[
        {str:"|".repeat(100*(1-part)),style:{color:"Lime"}},
        {str:"|".repeat(100*part),style:{color:"Red"}},
      ])
    },0)
  }
  //when game is done this handles setup to end game
  unsetup(playerId,win){
    let list = this.ply[playerId]
    if(list == void 0){return} //bugged list
    let [x,y,z] = Plot.plotList[list.plot].pos
    if(win != void 0 && api.getPlayerIds().includes(playerId)){ //graceful
      api.setClientOption(playerId,"creative",false)
      api.setClientOption(playerId,"middleTextLower","")
      api.setCantChangeBlockRect(playerId,[x+2,y+1,z+2],[x+8,y+8,z+8])
      let msg = [
        {str:api.getEntityName(playerId)},
        {str:" has "},
        win?
          ({str:" WON in "+(Date.now()-list.time)/1000+"s",style:{color:"lime"}}):
          ({str:" LOST ",style:{color:"red"}})
      ]
      api.broadcastMessage(msg)
      win?Score.addWin(playerId, 1):Score.addLoss(playerId, 1)
      Score.addCoins(playerId,-20*(-1)**(+win)) //+20 , -20
      api.sendMessage(playerId,`YOU ${win?"WON!!":"LOST!"} LOOK AT YOUR SCOREBOARD! YOU ${win?"RECEIVED":"LOST"} 20 COINS! ${win?"KEEP IT UP!!":"MAYBE NEXT TIME!"}`,{color:win?"Lime":"Red"})
      api.setClientOption(playerId,"middleTextUpper",[
        win?{str:"You won!",style:{color:"lime"}}:{str:"You lost",style:{color:"red"}}
     ]);
api.clearInventory(playerId)
      vvt.setTimeout(Math.random()+"",()=>{
        api.setClientOption(playerId,"middleTextUpper","")
      },5000)
    }
    Plot.despawn(list.plot)
    delete Game.gameList[this.ply[playerId].game]
    this.ply[playerId] = {}
    api.setPosition(playerId,...World.spawn)
  }
  //despawns the plot and deletes off plot list
  despawn(id){
    let [x,y,z] = this.plotList[id].pos
    sbr([x-1,y-1,z-1],[x+11,y+10,z+11],"Air")
    delete this.plotList[id]
  }
}

//deals with grouped games
globalThis.Game = new class {
  constructor(){
    this.gameInx = 0
    //remember to update buildInx for each game,
    //so each game has a random sutable game
    this.gameList = {} //{gameInx: [...playerIds]}
  }
  //starts a single game setup
  StartSingle(playerId){
    Plot.setup(playerId)
  }
  //starts a single game unsetup
  EndSingle(playerId,win){
    Plot.unsetup(playerId,win)
  }
  //starts a grouped game
  StartMany(playerIds){
    this.gameList[this.gameInx] = playerIds
    playerIds.forEach(playerId=>{this.StartSingle(playerId)})
    this.gameInx++
  }
  //ends a grouped game, with 1 winner and rest losers
  EndMany(playerId,game){
    let playerIds = Game.gameList[Plot.ply[playerId].game].filter(e=>api.getPlayerIds().includes(e) && e!=playerId)
    this.EndSingle(playerId,true)
    playerIds.forEach(e=>this.EndSingle(e,false))
  }
}

"Code Block 2 Done"
