ImmuneList = ["BloxdKrishn","_Hemika_","AnasBedwars_Pro303","Aditi_K_Chauhan","I_am_NervousKingYT", ]
AllowedList =["BloxdKrishn","AnasBedwars_Pro303","_Hemika_","Aditi_K_Chauhan","I_am_NervousKingYT"]
owner = ["BloxdKrishn"] //owner list
co_owner = ["AnasBedwars_Pro303"] // co owner list
head_admin = ["_Hemika_"] //head admin list
admin=["Aditi_K_Chauhan","Leakthewize123", "GlitchHunter","jazy_","FiestyBurrito92940432", "_NetherAetherEid_","Tootsieroll_candybar","ExP__megladonsss","x_Phsycotic_Wolf_x","Christian_slayer","Kaoi_","I_am_NervousKingYT","Mai_is_outside"] //admin list
arthur=["Arthur"]//arthur list
bloxd_admin=["pixelbaker","Tom","Oliver","DirtyFleaSack","Slushie"]//bloxd admin list
function onPlayerJoin(playerId) { 
 api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "blue", fontWeight:"0",fontSize:"14px",fontStyle:"",opacity:1}},{str:" is joining the lobby",style:{color:"cyan",fontWeight:"0",fontSize:"14px",fontStyle: "",opacity:1}}])
 api.setCanChangeBlockRect(playerId, [-2190, -259, -792], [-258, -259, -757])
if (owner.includes(api.getEntityName(playerId))) {
 api.updateEntityNodeMeshAttachment(playerId, "TorsoNode", "BloxdBlock", {blockName:"Toxin Ball", size:0.5, meshOffset:[0, 0, 0]},[0, 0.35, -0.3],[-0.4, 3.15, 0])
 api.updateEntityNodeMeshAttachment(playerId, "HeadMesh", "BloxdBlock", {blockName:"Knight Sword", size:0.3, meshOffset:[0, 0, 0]}, [0.53, 0.80, 0], [0, 0, 4.70])
 api.setTargetedPlayerSettingForEveryone(playerId, 'colorInLobbyLeaderboard',"red", true)
for(enId of api.getPlayerIds()){
api.setOtherEntitySettings(enId,playerId,{nameColour:"red"})
api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", {
subtitle: [{ str: "🔧⚡", style: { color:"yellow", fontSize:"50px" } }]}, true);}}
if (co_owner.includes(api.getEntityName(playerId))) {
api.updateEntityNodeMeshAttachment(playerId,"TorsoNode","BloxdBlock",{blockName:"Toxin Ball",size:0.5, meshOffset:[0, 0, 0]}, [0, 0.35, -0.3], [-0.4, 3.15, 0])
api.setTargetedPlayerSettingForEveryone(playerId, 'colorInLobbyLeaderboard',"orange", true)
for(enId of api.getPlayerIds()){
api.setOtherEntitySettings(enId,playerId,{nameColour:"orange"})}}
if (head_admin.includes(api.getEntityName(playerId))) {
api.updateEntityNodeMeshAttachment(playerId,"TorsoNode","BloxdBlock",{blockName:"Toxin Ball", size:0.5, meshOffset:[0, 0, 0]}, [0, 0.35, -0.3], [-0.4, 3.15, 0])
api.setTargetedPlayerSettingForEveryone(playerId, 'colorInLobbyLeaderboard',"yellow", true)
for(enId of api.getPlayerIds()){
api.setOtherEntitySettings(enId,playerId,{nameColour:"yellow"})}}
if (admin.includes(api.getEntityName(playerId))) {
api.updateEntityNodeMeshAttachment(playerId, "TorsoNode", "BloxdBlock", {blockName:"Toxin Ball",size:0.5, meshOffset:[0, 0, 0]}, [0, 0.35, -0.3], [-0.4, 3.15, 0])
api.setTargetedPlayerSettingForEveryone(playerId, 'colorInLobbyLeaderboard',"lime", true)
for(enId of api.getPlayerIds()){
api.setOtherEntitySettings(enId,playerId,{nameColour:"lime"})}}
if (arthur.includes(api.getEntityName(playerId))) {
api.updateEntityNodeMeshAttachment(playerId, "TorsoNode", "BloxdBlock", {blockName:"Toxin Ball", size:0.5, meshOffset:[0, 0, 0]}, [0, 0.35, -0.3],[-0.4, 3.15, 0])
api.setTargetedPlayerSettingForEveryone(playerId, 'colorInLobbyLeaderboard',"red", true)
for(enId of api.getPlayerIds()){
api.setOtherEntitySettings(enId,playerId,{nameColour:"red"})}}
if (bloxd_admin.includes(api.getEntityName(playerId))) {
api.updateEntityNodeMeshAttachment(playerId, "TorsoNode", "BloxdBlock", {blockName:"Toxin Ball", size:0.5, meshOffset:[0, 0, 0]},[0, 0.35, -0.3], [-0.4, 3.15, 0])
api.setTargetedPlayerSettingForEveryone(playerId, 'colorInLobbyLeaderboard',"red", true)
for(enId of api.getPlayerIds()){
api.setOtherEntitySettings(enId,playerId,{nameColour:"red"})}}
}
function onPlayerLeave(playerId, serverIsShuttingDown) {
 api.broadcastMessage([{str: api.getEntityName(playerId),style:{color:"blue",fontWeight:"0",fontSize:"14px",fontStyle:"",opacity:1}},{str:" has left the lobby",style:{color:"aqua",fontWeight:"0", fontSize: "14px", fontStyle: "", opacity: 1}}])
}
function playerCommand(playerId, command) {
  if(command.toLowerCase()=="devhelp"){
api.sendMessage(playerId,"Dev-only commands: '/kick [name]' '/freeze [name]' '/unfreeze [name]' 'clearinventor [name]'",{color:"yellow"})}
if(command.split(" ")[0].toLowerCase()=="kick"&&AllowedList.includes(api.getEntityName(playerId))&& !ImmuneList.includes(command.split(" ")[1])){
api.kickPlayer(api.getPlayerId(command.split(" ")[1]), "The Dev's kicked you")}
if(command.split(" ")[0].toLowerCase()=="freeze"&&AllowedList.includes(api.getEntityName(playerId))&& !ImmuneList.includes(command.split(" ")[1])){
api.applyEffect(api.getPlayerId(command.split(" ")[1]), "Frozen",null,{inbuiltLevel:10})}
if(command.split(" ")[0].toLowerCase()=="unfreeze"&&AllowedList.includes(api.getEntityName(playerId))&& !ImmuneList.includes(command.split(" ")[1])){
api.removeEffect(api.getPlayerId(command.split(" ")[1]), "Frozen")}
if(command.split(" ")[0].toLowerCase()=="clearinventor"&&AllowedList.includes(api.getEntityName(playerId))&& !ImmuneList.includes(command.split(" ")[1])){
api.clearInventory(api.getPlayerId(command.split(" ")[1]))}
}
onPlayerChat = (id, msg, channel) => {  
if (channel != "Tribe") {
if (owner.includes(api.getEntityName(id))) { //is owner
 api.broadcastMessage([{str:"[🔧Dev]",style:{color:"white"}},{str:"[👑Owner]",style:{color:"blue"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{color:"red"}},{str:" "+msg,style:{color:"aqua"}},]);
  }else if(co_owner.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔧Dev]",style:{color:"white"}},{str:"[👑Co Owner]",style:{color:"blue"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{ color:"orange"}},{str:" "+msg,style:{color:"aqua"}},]);
  }else if(head_admin.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔧Dev]",style:{color:"white"}},{str:"[👑Head Admin]",style:{color:"blue"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{color:"yellow"}},{str:" "+msg,style:{color:"aqua"}},]);
   } else if (admin.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔧Dev]",style:{color:"black"}},{str:"[👑Admin]",style:{color:"blue"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{color:"lime"}},{str:" "+msg,style:{color:"aqua"}},]);
    } else if (arthur.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔧Dev]",style:{color:"white"}},{str:"[👑Arthur]",style:{color:"blue"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{color:"red"}},{str:" "+msg,style:{color:"white"}},]);
    } else if (bloxd_admin.includes(api.getEntityName(id))) {
 api.broadcastMessage([{str:"[🔧Dev]",style:{color:"white"}},{str:"[👑Bloxd Admin]",style:{color:"blue"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{color:"red"}},{str:" "+msg,style:{color:"aqua"}},]);
    } else {
 api.broadcastMessage([{str:"[👑Player]",style:{color:"blue"}},{str:"[🎮Gamers]", style:{color:"lime"}},{str:"[⚡Super]",style:{color:"gold"}},{str:api.getEntityName(id)+":",style:{color:"magenta"}},{str:" "+msg,style:{color:"aqua"}},]);}return false}
}
a = Date.now()
function tick(dt) {
  if (Date.now() - a > 600000) { 
    a = Date.now()
    api.setBlockRect([-2158, -259, -757], [-2172, -259, -773], "Snow")
    api.setBlockRect([-2158, -259, -792], [-2172, -259, -774], "Snow")
    api.setBlockRect([-2190, -259, -792], [-2173, -259, -775], "Snow")
    api.setBlockRect([-2190, -259, -757], [-2172, -259, -774], "Snow")}
  if (Date.now() - a > 300000) {
    a = Date.now()
api.attemptSpawnMob("Frost Zombie",-2900,-259,-764,{name:"Dev Zombie"})
api.attemptSpawnMob("Frost Zombie",-2881,-259,-764,{name:"Dev Zombie"})
api.attemptSpawnMob("Pig",-2881,-259,-759,{name:"Dev Pig"})
api.attemptSpawnMob("Pig",-2900,-259,-759,{name:"Dev Pig"})
api.attemptSpawnMob("Cow",-2881,-259,-751,{name:"Dev Cow"})
api.attemptSpawnMob("Cow",-2900,-259,-751,{name:"Dev Cow"})
api.attemptSpawnMob("Sheep",-2900,-259,-727,{name:"Dev Sheep"})
api.attemptSpawnMob("Sheep",-2881,-259,-727,{name:"Dev Sheep"})
api.attemptSpawnMob("Draugr Knight",-2919,-259,-717,{name:"Dev Guard Knight"})
api.attemptSpawnMob("Draugr Knight",-2919,-259,-714,{name:"Dev Guard Knight"})
api.attemptSpawnMob("Draugr Skeleton",-2956,-259,-777,{name:"Dev Guard Skeleton"})
api.attemptSpawnMob("Draugr Skeleton",-2956,-259,-736,{name:"Dev Guard Skeleton"})}
} 
