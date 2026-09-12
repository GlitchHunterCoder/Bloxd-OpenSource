//function playerCommand(...arg){playerCommand...arg)}
roles={"BloxdKrishn":"Krishna","GlitchHunter":"Balram"}
god = ["BloxdKrishn", "GlitchHunter"]
bigList = []
function playerCommand(id, command) {
  if(command.toLowerCase() == "light" && god.includes(api.getEntityName(id))) {
    const pos = api.getPosition(id);
    if(!pos) return;
    const x = pos[0],
      y = pos[1] + 1, z = pos[2];
api.playParticleEffect({dir1: [-1, -1, -1],dir2: [1, 1, 1],pos1: [x, y, z],pos2: [x + 1, y + 1, z + 1],texture: "square_particle",minLifeTime: 0,maxLifeTime: 100,minEmitPower: 2,maxEmitPower: 2,minSize: 1,maxSize: 100,manualEmitCount: 50,gravity: [0, -10, 0],colorGradients: [{timeFraction: 0,minColor: [60, 60, 150, 1],maxColor: [200, 200, 255, 1],}, ],velocityGradients: [{timeFraction: 10,factor: 1,factor2: 1,}, ],blendMode: 1,})
}
if(command.toLowerCase() == "big" && god.includes(api.getEntityName(id))) {
api.scalePlayerMeshNodes(id, {"TorsoNode": [10, 10, 10],"HeadMesh": [1, 1, 1],"ArmRightMesh": [1, 1, 1],"ArmLeftMesh": [1, 1, 1],"LegLeftMesh": [19, 10, 10],"LegRightMesh": [19, 10, 10]});
    api.setCameraZoom(id, 1000);
    bigList.push(api.getEntityName(id));
    const playerName = roles[api.getEntityName(id)];
    const content = [];
    for(let i = 0; i < playerName.length; i++) {
content.push({str: playerName[i],style: {color: "red",fontSize: "500px",fontWeight: "bold"}});}
     api.setTargetedPlayerSettingForEveryone(id, "nameTagInfo", {
      backgroundColor: "default",content: content});
}
 if(command.toLowerCase() == "small" && god.includes(api.getEntityName(id))) {
api.scalePlayerMeshNodes(id, {"TorsoNode": [1, 1, 1],"HeadMesh": [1, 1, 1],"ArmRightMesh": [1, 1, 1],"ArmLeftMesh": [1, 1, 1],"LegLeftMesh": [1, 1, 1],"LegRightMesh": [1, 1, 1]});
    bigList = bigList.filter(name => name !== api.getEntityName(id));
   const playerName = api.getEntityName(id);
   const content = [];
    for(let i = 0; i < playerName.length; i++) {
 content.push({str: playerName[i],style: {color: "white",fontSize: "50px",fontWeight: "bold"}});}
api.setTargetedPlayerSettingForEveryone(id, "nameTagInfo", {backgroundColor: "#002244",content: content});
}
  if(command.toLowerCase().startsWith("sun") && god.includes(api.getEntityName(id))) {
    if(command.toLowerCase().split(" ")[1] == "on") {
    bigList.includes(api.getEntityName(id)) ? Sun(id, "big") : Sun(id, "small")}}
}
function Sun(id, size) {
  let [x, y, z] = api.getPosition(id);
  let scale;
  if(size == "big") {
    y += 10;
    scale = 10
  } else if(size == "small") {
    y += 1;
    scale = 1
  }
  if(size == "none") {
    return;
  }
api.playParticleEffect({dir1: [0, 0, 0],dir2: [0, 0, 0],pos1: [x, y, z],pos2: [x, y, z],texture: "square_particle",minLifeTime: 9.5,maxLifeTime: 10,minEmitPower: 2,maxEmitPower: 2,minSize: 0.1 * scale,maxSize: 2 * scale,manualEmitCount: 100,gravity: [0, 0, 0],colorGradients: [{timeFraction: 0,minColor: [255, 223, 34],maxColor: [255, 212, 55],}, ],velocityGradients: [{timeFraction: 0,factor: 1,factor2: 1,}, ],blendMode: 4,})
}
