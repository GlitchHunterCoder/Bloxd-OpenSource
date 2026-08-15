Colors = ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "Light Blue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"]
colorIndex = {} 
Immune=["BloxdKrishn","Arthur","DirtyFleaSack","Tom","pixelbaker","Oliver","Slushie","Harry","GlitchHunter","I_am_NervousKingYT","AnasBedwars_Pro303","_Hemika_"]
Allowed=["BloxdKrishn","Arthur","DirtyFleaSack","Tom","pixelbaker","Oliver","Slushie","Harry","GlitchHunter","I_am_NervousKingYT","AnasBedwars_Pro303","_Hemika_"]
dev = ["BloxdKrishn","Arthur","DirtyFleaSack","Tom","pixelbaker","Oliver","Slushie","Harry","GlitchHunter","I_am_NervousKingYT","AnasBedwars_Pro303","_Hemika_"]
coder = ["BloxdKrishn", "GlitchHunter", "I_am_NervousKingYT"]
function onPlayerJoin(playerId) {
api.sendMessage(playerId, "Hi, Welcome to this world. Type /help for player commands", { color:"yellow" })
api.setCantChangeBlockRect(playerId, [9957, -135, 9957],[9939, -128, 9941])
 if(coder.includes(api.getEntityName(playerId))) {
api.setClientOption(playerId, "canEditCode", true)}
  if(dev.includes(api.getEntityName(playerId))) {
   api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", {
  backgroundColor: "#002244",content:[ {str:"🔧"},{str:"🌈"},
      ...api.getEntityName(playerId).split("").map((c, i) => ({str: c,style: {
color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16],fontSize: "50px",fontWeight: "0"}}))]});
api.broadcastMessage([{str: "A Dev has Joined the Lobby ",style: {color: "Red",fontSize: "14px"}}, ...api.getEntityName(playerId).split("").map((c, i) => ({str: c,style: {
color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16],fontSize: "14px"}}))])
  } else {
api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "blue",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str: " has Joined the lobby",style: {color: "cyan",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}}])}
  if(dev.includes(api.getEntityName(playerId))) {
    api.setClientOption(playerId, "invincible", true);
 api.sendMessage(playerId, "Hi, Welcome to this world. Type /devhelp for Dev Commands", {color: "yellow"})}
}
function onPlayerLeave(playerId, serverIsShuttingDown) {
if (dev.includes(api.getEntityName(playerId))){
api.broadcastMessage([{str: "A Dev has Left the Lobby ",style: {color: "Red",fontSize: "14px"}}, ...api.getEntityName(playerId).split("").map((c, i) => ({str: c,style: {
color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16],fontSize: "14px"}}))])
} else {
api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "blue",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}}, {str: " has Left the Lobby",style: {color: "aqua",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}}])}
}
function playerCommand(playerId, command) {
  if(command.toLowerCase() == "help") {
   api.sendMessage(playerId, "Custom Commands: '/devs'", { color:"yellow"})}
  if(command.toLowerCase() == "devs") {
api.sendMessage(playerId, "BloxdKrishn, Arthur, DirtyFleaSack, Tom, pixelbaker, Oliver, Slushie, Harry, GlitchHunter, I_am_NervousKingYT, AnasBedwars_Pro303 and _Hemika_ are the devs", { color:"yellow" })}
  if(command.toLowerCase() == "devhelp") {
    api.sendMessage(playerId, "Dev-only commands: '/kick [name]' '/freeze [name]' '/unfreeze [name]' '/clearinventor [name]' '/tpposdevhome'", {color: "yellow"})}
if(command.split(" ")[0].toLowerCase() == "update" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
getIds=api.getPlayerIds()
for(let i=0;i<api.getNumPlayers();i++){
api.sendTopRightHelper(getIds[i], "exclamation", "Custom Game soon restarting for Update!!", {color:"red", duration:10})}
api.broadcastMessage("Custom Game soon restarting for Update!!", { color:"red"})}
  if(command.split(" ")[0].toLowerCase() == "kick" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
  api.kickPlayer(api.getPlayerId(command.split(" ")[1]), "The Dev's kicked you")}
  if(command.split(" ")[0].toLowerCase() == "freeze" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
api.applyEffect(api.getPlayerId(command.split(" ")[1]), "Frozen", null, {inbuiltLevel: 10})}
  if(command.split(" ")[0].toLowerCase() == "unfreeze" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
    api.removeEffect(api.getPlayerId(command.split(" ")[1]), "Frozen")}
  if(command.split(" ")[0].toLowerCase() == "clearinventor" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
    api.clearInventory(api.getPlayerId(command.split(" ")[1]))}
  if(command.split(" ")[0].toLowerCase() == "tpposdevhome" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
    api.setPosition(playerId, [9948, -134, 9950])}
}
onPlayerChat = (id, msg, channel) => {
  const i = (colorIndex[id] = (colorIndex[id] || 0) + 1) % Colors.length;
  if(channel != "Tribe") {
    if(dev.includes(api.getEntityName(id))) { 
api.broadcastMessage([{str: "[🔧Dev]",style: {color: "red"}},{str: "[🌈Rainbow]",style: {color: "white"}}, ...api.getEntityName(id).split("").map((c, i) => ({str: c,style: {color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16]}})),{str: ": " + msg,style: {color: "white"}},]);
    } else {
api.broadcastMessage([{str: api.getEntityName(id) + ":",style: {color: "#CEFEFF"}},{str: " " + msg,style: {color: "white"}},]);}return false}
}
function applyCape(id) {
  const name = api.getEntityName(id);
  if(!dev.includes(name)) return;
  const i = (colorIndex[id] = (colorIndex[id] || 0) + 1) % Colors.length;
  api.updateEntityNodeMeshAttachment(id, "TorsoNode", "BloxdBlock", {
    blockName: Colors[i] + " Carpet",
    size: 0.5,
    meshOffset: [0, 0, 0]
  }, [0, 0.35, -0.3], [-0.5, 3.15, 1.6]);
}
  tickCount = 0
function tick() {
  tickCount++;
  const ids = api.getPlayerIds();
  if(!ids) return;
  for(const id of ids) {
    if(tickCount % 10 === 0) applyCape(id)}
   a = Date.now()
 if (Date.now = 3) {
 a = Date.now()
api.attemptSpawnMob("Pig",10016,-500,10000)
api.attemptSpawnMob("Pig",9983,-500,10022)
api.attemptSpawnMob("Sheep",10004,-500,10022)
api.attemptSpawnMob("Cow",10025,-500,10022)
api.attemptSpawnMob("Cow",10039,-500,10001)
api.attemptSpawnMob("Bear",10040,-500,9979)
api.attemptSpawnMob("Draugr Knight",10038,-500,9957)
api.attemptSpawnMob("Wildcat",10018,-500,9955)
api.attemptSpawnMob("Gorilla",9996,-500,9956)
api.attemptSpawnMob("Gold Watermelon Stag",9972,-500,9956)
api.attemptSpawnMob("Draugr Skeleton",9948,-500,9956)
api.attemptSpawnMob("Draugr Zombie",9951,-500,9979)
api.attemptSpawnMob("Gold Watermelon Stag",9977,-500,9983)
api.attemptSpawnMob("Wolf",9964,-500,10000)
api.attemptSpawnMob("Draugr Knight",9960,-500,10027)
api.attemptSpawnMob("Deer",9983,-500,10000)
api.attemptSpawnMob("Sheep",9995,-500,9979)
api.attemptSpawnMob("Deer",10018,-500,9979)}
  a = Date.now()
api.getPlayerIds().forEach(pid=>api.setClientOption(pid,"skyBox",{ type: "earth", vertexTint:[500,500,0], "inclination": Date.now()/ 100000}));
}
