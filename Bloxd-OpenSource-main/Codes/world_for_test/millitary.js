Chief_of_Dev=["BloxdKrishn"]
Commader_of_Dev=[""]
General=[""]
Lieutenant_General=[""]
Major_General=[""]
Brigadier=[""]
Colonel=[""] 
Lieutenant_Colonel=[""]
Major=[""]
Captain=[""]
First_Lieutenant=[""]
Lieutenant=[""]
Warrant_Officers=[""]
Sergeants=[""]
Corporals=[""]
Dev=["BloxdAnas","GlitchHunter","BloxdHemika", "Arthur", "DirtyFleaSack", "Oliver", "Tom", "Slushie", "pixelbaker", "jasninus", "Harry"]
devs = ["BloxdKrishn", "Arthur", "DirtyFleaSack", "Oliver", "Tom", "Slushie", "pixelbaker", "jasninus", "Harry", "GlitchHunter", "BloxdAnas", "BloxdHemika"]

function onPlayerJoin(playerId){
api.setCantChangeBlockType(playerId, "Red Glass")
api.setCantChangeBlockType(playerId, "Yellow Glass")
api.setCantChangeBlockType(playerId, "Yellow Concrete")
api.setCantChangeBlockType(playerId, "Block of Diamond")
api.setCantChangeBlockType(playerId, "Block of Moonstone")
api.setCantChangeBlockType(playerId, "Block of Gold")
if(!devs.includes(api.getEntityName(playerId))){
api.kickPlayer(playerId, "Hi, This is only a World for Dev's so you are not allowed inside.")}
if(Chief_of_Dev.includes(api.getEntityName(playerId))){
api.broadcastMessage([{str:api.getEntityName(playerId),style:{color:"#CEFEFF"}},{str:" Chief of Dev Joined the Lobby", style:{color:"red" }}])
} else if(Dev.includes(api.getEntityName(playerId))){
api.broadcastMessage([{str:api.getEntityName(playerId),style:{color:"#CEFEFF"}},{str:" Dev Joined the Lobby", style:{color:"white" }}])
}
if(devs.includes(api.getEntityName(playerId))){
api.setWalkThroughType(playerId, "Red Glass", false)
  }
}
function onPlayerLeave(playerId){
if(Chief_of_Dev.includes(api.getEntityName(playerId))){
api.broadcastMessage([{str:api.getEntityName(playerId),style:{color:"#CEFEFF"}},{str:" Chief of Dev Left the Lobby", style:{color:"red" }}])
} else if(Dev.includes(api.getEntityName(playerId))){
api.broadcastMessage([{str:api.getEntityName(playerId),style:{color:"#CEFEFF"}},{str:" Dev Left the Lobby", style:{color:"white" }}])
  }
}

onPlayerChat = (id, msg, channel) => {  
if (channel != "Tribe") {
if (Chief_of_Dev.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔱Chief of Dev]",style:{color:"red"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Commander_of_Dev.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔧Commader of Dev]",style:{color:"orange"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(General.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[⚡General]",style:{color:"yellow"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Lieutenant_General.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[☄️Lieutenant General]",style:{color:"green"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Major_General.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[⭐Major General]",style:{color:"lime"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Brigadier.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔨Brigadier]",style:{color:"blue"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Colonel.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🛠️Colonel]",style:{color:"aqua"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Lieutenant_Colonel.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[⛏️Lieutenant Colonel]",style:{color:"cyan"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Major.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[⚒️Major]",style:{color:"purple"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Captain.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🛡️Captain]",style:{color:"magenta"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(First_Lieutenant.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[⚓First Lieutenant]",style:{color:"pink"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Lieutenant.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[⚔️Lieutenant]",style:{color:"gray"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Warrant_Officers.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[💥Warrant Officers]",style:{color:"LightGray"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Sergeants.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[💡Sergeants]",style:{color:"brown"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
} else if(Corporals.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔦Corporals]",style:{color:"black"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
    } else if(Dev.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔫Dev]",style:{color:"white"}},{str:api.getEntityName(id)+":",style:{color:"#CEFEFF"}},{str:" "+msg,style:{color:"white"}}])
     }
return false
   }                                    
}

