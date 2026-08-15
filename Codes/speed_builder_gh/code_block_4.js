//anti mute chat
globalThis.pendingMsgs=[]

World.onPlayerChat=(playerId,msg,tribe)=>{
  if(tribe == "Tribe"){return;}
  pendingMsgs.push([playerId, msg])
  return false
}

globalThis.broadcastGlobalMessage=(playerId, msg)=>{
  let color = "White"
  let r = getRank(vvt.getStoredValue(playerId,"elo"))
  if(r=="Noub"){return;}
  const name = api.getEntityName(playerId);
  api.broadcastMessage([{
    str:"[ "
  },{
    icon:ranks[r].block
  },{
    str:" ]"
  },{
    str: ` ${r}: ${name}: `,
    style: {
      color: ranks[r].color
    }
  }, {
    str: msg,
    style: {
      color: "White"
    }
  }])
}

//its here for interruption safe plot building, DO NOT REMOVE
globalThis.TS = new class {
  constructor() {
    this.tasks = []; // FIFO queue
  }
  add(f) {
    this.tasks.push(f);
  }
  run() {
    let task = this.tasks.shift();
    if (!task) return;
    if (typeof task === "function") {
      return task();
    } else if (typeof task.next === "function") {
      const result = task.next();
      if (!result.done) {
        this.tasks.push(task);
        return;
      }
      return result.value
    }
  }
  tick() {
    let value = this.run();
    if(value == void 0){return;}
  }
};

//all those at once
World.tick=()=>{
  let starter=Init.starter
  if(starter){ //world code player loading
    while(api.getMobIds().length!=0){
      api.getMobIds().forEach(e=>api.despawnMob(e))
    }
    starter.forEach(e=>World.onPlayerJoin(e))
    api.setPosition(starter[0],...Init.pos)
    Init.starter=undefined
  };
  Try(()=>{
    TS.tick()
    sbr.tick()
    vvt.tick()
    let msgs = pendingMsgs.shift()
    if(msgs){broadcastGlobalMessage(...msgs)}
  },globalThis)
}

//NPC class, pending use
globalThis.NPC = class {
  constructor(name, typeId, color) { 
    this.name = name;
    switch (typeId) {
      case 1:
        this.type = "Draugr Knight";
        break;
      case 2:
        this.type = "Frost Zombie";
        break;
      default:
        throw new Error("Invalid NPC type. Enter 1 (Draugr Knight) or 2 (Frost Zombie).");
    }
    this.color = color;
    this.spawned = false
  }
  spawn([x, y, z]) {
    const spawnerId = api.getPlayerIds()[0];
    const npcId = api.attemptSpawnMob(this.type, x, y, z, {
      name: this.name,
      spawnerId,
    });
    if (npcId != null) {
      api.applyEffect(npcId,"Frozen",null,{})
      api.setMobSetting(npcId, "baseWalkingSpeed", 0);
      api.setMobSetting(npcId, "baseRunningSpeed", 0);
      api.setMobSetting(npcId, "heldItemName", null);
      api.setTargetedPlayerSettingForEveryone(
        npcId,
        "nameTagInfo",
        {
          backgroundColor: this.color ?? "#002244",
          content: [{ str: this.name }],
        },
        true
      );

      api.setTargetedPlayerSettingForEveryone(npcId, "hasPriorityNametag", true, true);
      api.setMobSetting(npcId, "onDeathItemDrops", []);

      try {
        api.setPlayerPose(npcId, "standing");
      } catch {
      }
    }

    this.id = npcId;
    this.spawned = true
    return npcId;
  }
  despawn() {
    if (!api.getMobIds().includes(this.id)) {
      throw new Error("NPC does not exist.");
    }
    api.despawnMob(this.id);
    this.spawned = false;
  }
  isSpawned(){
    return this.spawned
  }
}

World.onPlayerAltAction = (playerId, x,y, z, block, targetId) => {
  if (!targetId) return;
  globalThis?.onNpcInteract?.(playerId, api.getOtherEntitySetting(playerId, targetId, "nameTagInfo")?.content?.[0]?.str);
};

globalThis.onNpcInteract = (playerId,npcName) => {
console.log(playerId,npcName)
}

"Code Block 4 Done"
