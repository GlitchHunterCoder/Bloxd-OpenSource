World.onPlayerChangeBlock = (playerId,x,y,z,from,to,drop,fromInfo,toInfo) => {
  eval() //interrupt or continue
  //console.log(playerId,x,y,z,from,to,drop,fromInfo,toInfo)

  let id = Plot.ply[playerId]?.plot //find plot id from player
  if(id == void 0){return;}

  //maps plotId to build schem place and back
  let own = Plot.plotList[id]
  let disp = own.clone.map((e,i)=>e- (own.pos[i]+2) )
  let cPos = [x,y,z].map((e,i)=>e+disp[i])
  cPos[1]+=1
  let cBlock = api.getBlock(cPos) 

  //updates magic, (how close to end) via from and to
  let [fromYes,toYes] = [cBlock == from,cBlock == to]
  if(fromYes && !toYes){Plot.ply[playerId].magic++}
  if(!fromYes && toYes){Plot.ply[playerId].magic--}
  //console.log(Plot.ply[playerId])

  if(from != "Air"){api.giveItem(playerId,from,1)}
  if(to != "Air"){api.removeItemName(playerId,to,1)}

  //if 0 end game
  if(Plot.ply[playerId].magic == 0){
    Game.EndMany(playerId,Plot.ply[playerId].game)
  }
}

World.onPlayerJoin = (playerId, fromGameReset) => {Try(()=>{
  api.setCallbackValueFallback("onPlayerChangeBlock", "preventDrop")
  
  let locked = true //change to false when ready

  //kick system (disabled)
  //if(!devs.includes(api.getEntityName(playerId)) && locked){api.kickPlayer(playerId,"Lobby Is Locked");return;}
  sideBar(playerId)

  let elo = vvt.getStoredValue(playerId, "elo")

  //ifDev allow change and creative
  let isDev = devs.includes(api.getEntityName(playerId))

  isDev = false //test

  api.setClientOption(playerId,"creative",isDev)
  api.setClientOption(playerId,"canChange",isDev)

  //if new to game, reset and set
  if (elo == void 0) {
    vvt.resetStored(playerId)
    vvt.setStoredValue(playerId, "elo", 0)
  }
  
  //resiter that player and give perms
  Plot.ply[playerId]={}
  api.setWalkThroughType(playerId, "Yellow Portal")
  api.setClientOption(playerId,"skyBox","space_red");
  api.clearInventory(playerId)
  api.changePlayerIntoSkin(playerId,"head","trader_black");

  api.setPosition(playerId,526.5,70,169.5)
  Score.addPlayer(playerId)
})}

World.onPlayerLeave = (playerId) => {
  delete Plot.ply[playerId]
  Queue.leave(playerId)
}

//deals with player queues
globalThis.Queue = new class {
  constructor() {
    this.limit = { Single: 2, Double: 4 }
    this.q = { Single: [], Double: [] }
  }
  //honestly idk
  all(name, fn) {
    const keys = name ? [name] : Object.keys(this.q)
    keys.forEach(k => fn(this.q[k], k))
  }
  //loads area and then adds player to queue
  add(id, name) {
    let non = ["Unloaded",void 0]
    if(
      non.includes(api.getBlock([20*Plot.plotInx+1020,50,0]  )) || //plot
      non.includes(api.getBlock(Build.plot[Plot.buildInx].pos)) //build
    ){
      api.sendMessage(id,`Failed to Load Area, Please Try Again`,{color:"red"})
      return;
    }
    if (!this.q[name]) return false
    // allow multi-queue presence
    if (!this.q[name].includes(id)) {
      this.q[name].push(id)
    }
    if (this.q[name].length >= this.limit[name]) {
      this.flush(name)
      return true
    }
    return false
  }
  //remove pending queue players and begin
  flush(name) {
    const players = [...this.q[name]]
    // clear from ALL queues
    players.forEach(id => {
      this.all(null, arr => {
        const i = arr.indexOf(id)
        if (i !== -1) arr.splice(i, 1)
      })
    })
    Game.StartMany(players)
    return players
  }
  //remove player from queue
  remove(id, name) {
    this.all(name, arr => {
      const i = arr.indexOf(id)
      if (i !== -1) arr.splice(i, 1)
    })
  }
  //leave from all
  leave(id) {
    this.all(null, arr => {
      const i = arr.indexOf(id)
      if (i !== -1) arr.splice(i, 1)
    })
  }
  //clear a queue, and check if in queue
  clear(name) {this.all(name, arr => arr.length = 0)}
  isInQueue(id, name) {return this.q[name]?.includes(id)}
}

//rating
globalThis.est=(rating1, rating2)=>{
  return 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));
}

globalThis.elo=(Ra, Rb, K, outForA)=>{
  let Pb = est(Ra, Rb);
  let Pa = est(Rb, Ra);
  Ra = Ra + K * (outForA - Pa);
  Rb = Rb + K * ((1 - outForA) - Pb);
  return [Ra, Rb];
}

globalThis.ranks = {
  // SECTOR I
  Noub: {
    range: [-1E6, 0],
    block: "Dirt",
    color: "Brown"
  },
  Wood: {
    range: [0, 250],
    block: "Maple Wood Planks",
    color: "SaddleBrown"
  },
  Iron: {
    range: [250, 500],
    block: "Block of Iron",
    color: "SeaShell"
  },
  Gold: {
    range: [500, 750],
    block: "Block of Gold",
    color: "Gold"
  },
  Diamond: {
    range: [750, 1000],
    block: "Block of Diamond",
    color: "Blue"
  },

  // SECTOR II
  Moonstone: {
    range: [1000, 1250],
    block: "Block of Moonstone",
    color: "Indigo"
  },
  Emerald: {
    range: [1250, 1500],
    block: "Block of Emerald",
    color: "Lime"
  },
  Lazuli: {
    range: [1500, 1750],
    block: "Block of Lapis Lazuli",
    color: "DarkBlue"
  },
  Beacon: {
    range: [1750, 2000],
    block: "Beacon",
    color: ""
  },

  // SECTOR III
  Master: {
    range: [2000, 2500],
    block: "",
    color: ""
  },
  GrandMaster: {
    range: [2500, 3000],
    block: "",
    color: ""
  },
  Champion: {
    range: [3000, 1E6],
    block: "",
    color: ""
  },
  OWNER:{
    range:[1E6,Infinity],
    block:"Water",
    color:"Gold"
  },
  cheater:{
    range:[-Infinity,-1E6],
    block:"po"+""+"op",
    color:"SaddleBrown"
  }
};

globalThis.getRank=(number)=>{
  for (const [rankName, rankData] of Object.entries(ranks)) {
    const [min, max] = rankData.range;
    if (number >= min && number < max) {
      return rankName;
    }
  }
  return null; // or "Unknown"
}

"Code Block 3 Done"
