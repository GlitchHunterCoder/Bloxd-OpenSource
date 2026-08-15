devs=["BloxdKrishn","GlitchHunter","BloxdAnas","BloxdHemika"]
roles={"BloxdKrishn": "Harry Potter","GlitchHunter": "Neville Longbottom","BloxdAnas": "Ron Weasley","BloxdHemika": "Hermione Granger"}
function onPlayerJoin(playerId){
api.setTargetedPlayerSettingForEveryone(playerId, "canAttack", false)
api.sendMessage(playerId, "Hi, Welcome to Hogwarts! Type /help for Custom Commands and type /devhelp for Dev Commands.", { color:"yellow" })
api.setClientOption(playerId, "lobbyLeaderboardInfo", {
    r: {},
    pfp: {},
    name: { 
      displayName: "Name:"
    }
  })
if(devs.includes(api.getEntityName(playerId))){
api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", {
      subtitle: [{ str: roles[api.getEntityName(playerId)], style: { color:"magenta", fontSize: "50px", } }]}, true);
api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "#CEFEFF",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str: " ["+roles[api.getEntityName(playerId)]+"] ",style: {color: "magenta",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str:"Joined",style:{ color:"#CEFEFF",fontWeight: "0", fontSize: "14px", fontStyle: "", opacity: 1}}]);
} else { 
api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "#CEFEFF",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str: " [Wizard]",style: {color: "#7F00FF",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str:" Joined", style: {color:"#CEFEFF",fontWeight: "0",fontSize: "14px", fontStyle: "",opacity: 1}}])
api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", {
     subtitle: [{ str: "Wizard", style: { color:"#7F00FF", fontSize: "50px", } }]
    }, true);}
}
function onPlayerLeave(playerId, serverIsShuttingDown) {
if(devs.includes(api.getEntityName(playerId))){
api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "#CEFEFF",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str: " ["+roles[api.getEntityName(playerId)]+"] ",style: {color: "magenta",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str:"left",style:{ color:"#CEFEFF",fontWeight: "0", fontSize: "14px", fontStyle: "", opacity: 1}}]);
} else {
api.broadcastMessage([{str: api.getEntityName(playerId),style: {color: "#CEFEFF",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str: " [Wizard]",style: {color: "#7F00FF",fontWeight: "0",fontSize: "14px",fontStyle: "",opacity: 1}},{str:" left", style: {color:"#CEFEFF",fontWeight: "0",fontSize: "14px", fontStyle: "",opacity: 1}}])}
}
function playerCommand(playerId, command) {
 if(command.toLowerCase() == "devhelp") {
api.sendMessage(playerId, "Dev-Only Commands: '/kick [name]' '/update'", { color:"yellow" })}
  if(command.toLowerCase() == "help") {
   api.sendMessage(playerId, "Custom Commands: '/spells'", { color:"yellow"})}
  if(command.toLowerCase() == "spells") {
   api.sendMessage(playerId, "Immobulus", { color:"yellow"})}
if(command.split(" ")[0].toLowerCase() == "update" && devs.includes(api.getEntityName(playerId))) {
getIds=api.getPlayerIds()
for(let i=0;i<api.getNumPlayers();i++){
api.sendTopRightHelper(getIds[i], "exclamation", "Custom Game soon restarting for Update!!", {color:"red", duration:20})}
api.broadcastMessage("Custom Game soon restarting for Update!!", { color:"red"})}
  if(command.split(" ")[0].toLowerCase() == "kick" && devs.includes(api.getEntityName(playerId))) {
  api.kickPlayer(api.getPlayerId(command.split(" ")[1]), "You have been Kicked by a Dev for Breaking Rule's")}
}
onPlayerChat = (id, msg, channel) => {
if(channel != "Tribe") {
if(msg.split(" ")[0].toLowerCase() == "immobulus"){ 
api.applyEffect(api.getPlayerId(msg.split(" ")[1]),"Frozen",null,{inbuiltLevel:10})
}
if(devs.includes(api.getEntityName(id))){
api.broadcastMessage([{str:"[🪄"+roles[api.getEntityName(id)]+"] ",style:{color:"magenta"}},{str: api.getEntityName(id) + ":",style: {color: "#CEFEFF"}},{str: " " + msg,style: {color: "white"}}])
} else {
api.broadcastMessage([{str:"[🔮Wizard] ",style:{color:"#7F00FF"}},{str: api.getEntityName(id) + ":",style:{color: "#CEFEFF"}},{str: " " + msg,style: {color: "white"}}])}return false;} 
}
function leaderBoard() {
  api.getPlayerIds().forEach((id) => {
    const name = api.getEntityName(id);
    const isDev = devs.includes(name);

    const leaderboardEntry = isDev
      ? [{ str: roles[name], style: { color: "magenta" } }]
      : [{ str: "Wizard", style: { color: "#7F00FF" } }];

    api.setTargetedPlayerSettingForEveryone(id, "lobbyLeaderboardValues", {
      r: leaderboardEntry
    }, true);
  });
}

function tick() {
  leaderBoard()
  const ids = api.getPlayerIds();
  if(!ids) return;
}

function tmpl(val) {
  return typeof val === "string" ? `"${val}"` : JSON.stringify(val);
}

function onPlayerAltAction(playerId, x, y, z, block, targetEId) {
  runItem(playerId, "onPlayerAltAction", { playerId, x, y, z, block, targetEId });
}

function onPlayerSelectInventorySlot(playerId, slotIndex) {
  if (!runItem(playerId, "onPlayerSelectInventorySlot", { playerId, slotIndex })){
    api.updateEntityNodeMeshAttachment(playerId, "LegRightMesh", null);
    api.updateEntityNodeMeshAttachment(playerId, "LegLeftMesh", null);
    api.setPlayerPose(playerId, "standing");
    api.setClientOption(playerId, "airJumpCount", 0);
  }
}

function runItem(playerId, actionKey, args) {
  const item = api.getHeldItem(playerId);
  const magic = item?.attributes?.customAttributes?.magic?.[actionKey];
  if (!magic) return false;
  const argNames = Object.keys(args).join(',');
  const argValues = Object.values(args).map(tmpl).join(',');
  eval(`(function(${argNames}){${magic}})(${argValues})`);
  return true
}


function codeItem(playerId, itemData, magicDataList) {
  const { name: itemName, amount: itemAmount, attributes } = itemData;
  let item = { name: itemName, attributes };
  item.attributes = item.attributes ?? {};
  item.attributes.customAttributes = item.attributes.customAttributes ?? {};
  item.attributes.customAttributes.magic = item.attributes.customAttributes.magic ?? {};
  for (const { code, callback } of magicDataList) {
    const existingCode = item.attributes.customAttributes.magic[callback] ?? "";
    item.attributes.customAttributes.magic[callback] = existingCode + "\n" + code;
  }
  return [playerId, item.name, itemAmount, item.attributes];
}

api.giveItem(
  ...codeItem(
    myId,
    {
      name:"Stick",
      amount:1,
      attributes:{
        "customDisplayName":"Broom Stick"
      }
    },[{
      code: `api.updateEntityNodeMeshAttachment(playerId, "LegRightMesh", "BloxdBlock", {blockName:"Stick", size:1, meshOffset:[0,0,0]}, [-0.1, 0, -0.4], [0, 1.60, 30.50]);
        api.updateEntityNodeMeshAttachment(playerId, "LegLeftMesh", "BloxdBlock", {blockName:"Brown Wool", size:0.7, meshOffset:[0,0,0]}, [0.2, 1.50, -0.4], [0, 1.60, 55]);
        api.setPlayerPose(playerId, "driving");
        api.setClientOption(playerId, "airJumpCount", 100);`,
      callback: "onPlayerAltAction"
    },{
      code: `api.updateEntityNodeMeshAttachment(playerId, "LegRightMesh", "BloxdBlock", {blockName:"Stick", size:1, meshOffset:[0, 0, 0]}, [-0.3, 1, -0.1], [0, 1.60, 30.50]);api.updateEntityNodeMeshAttachment(playerId, "LegLeftMesh", "BloxdBlock", {blockName:"Brown Wool", size:0.7, meshOffset:[0, 0, 0]}, [-0.6, -0.1, -0.1], [0, 1.60, 55]);api.setPlayerPose(playerId, "standing");api.setClientOption(playerId, "airJumpCount", 0)`,
      callback: "onPlayerSelectInventorySlot" 
    }]
  )
)
