owner={
  name:"GlitchHunter",
  id:api.getPlayerId("GlitchHunter"),
  dbId:api.ownerDbId
}

ply={}

function BlockData(x,y,z,data){
  let arr=[x,y,z].map(e=>Math.floor(e))
  try{
    if(data){
      api.setBlockData(...arr,{persisted: {shared: {
        text: data,textSize: 0,
      }}})
    }else{
      return api.getBlockData(...arr).persisted.shared.text
    }
  }catch(e){
    return void 0;
    //throw e
  }
}

Init = new class{
  constructor(){
    this.ini = true
  }
  main(){
    if(!this.ini){return true;}
    let data=[0,1,2].map(e=>BlockData(e,1,0))
    if(data.includes(void 0)){api.setPosition(api.getPlayerIds()[0],-2.5,0,0.5);return;}
    try{data.forEach(e=>eval(e))}catch(e){throw e};this.ini=false;
  }
}

ListUpdate = new class {
  constructor() {
    this.i = 0;
    this.s = 0;
  }

  main() {
    for(let _=0;_<list.length;_++){
      const z = list[this.i][0][2]; // original: list[this.i][0][2]
      list[this.i][5] = [0, 11, this.s]; // create shared pos
      this.i++;
      this.s += z + 5;
    }
    api.broadcastMessage("data setup completed");
  }
}


Gen = new class {
  constructor() {
    this.i = 0;
    this.s = 0;
    this.round = 2; // matches original
    this.b = ["Red Wool", "Blue Wool", "Maple Wood Planks"];
  }

  main() {
    if (!list[this.i]) {
      if (this.round === 3) return;

      this.i = 0;
      this.s = 0;
      this.round++;
      return;
    }

    const z = list[this.i][0][2];
    const num = Math.ceil(Math.log2(list[this.i][3]));
    const block = ranks[num][0];
    const color = block ? block.split(" ").slice(0, -1).join(" ") : "";
    const [x, y, zSize] = list[this.i][0];

    if (this.round === 0) {
      api.setPosition(owner.id, -2.5, 11, this.s);
      sbr([0, 7, this.s - 2], [x + 2, 15, this.s + zSize + 2], block); 
      sbr([0, 8, this.s - 1], [x + 1, 14, this.s + zSize + 1], "Air"); //parkour room
      sbr(
        [0, 11, this.s - 1],
        [0, 14, this.s + zSize + 1],
        color ? color + " Glass" : "Glass"
      );
      sbr(
        [0, 10, this.s - 1],
        [0, 10, this.s + zSize + 1],
        this.b[2]
      );
      sbr(
        [0, 10, this.s - 1],
        [0, 14, this.s + 1],
        "Air"
      );
      sbr([0, 10, this.s], list[this.i][4] ?? this.b[0]); //fromBlock
      sbr([x, 10 + y, this.s + zSize], this.b[1]); //toBlock
      sbr([-1, 7, this.s - 2], [-1, 10, this.s + zSize + 2], this.b[2]); 
      sbr([-1, 10, this.s - 2], [-6, 15, this.s + zSize + 2], this.b[2]);
      sbr([-1, 11, this.s - 2], [-5, 14, this.s + zSize + 2], "Air");
      sbr(-1, 11, this.s, "Board|meta|rot4");
      sbr([-6, 12, this.s - 2], [-6, 13, this.s + zSize + 2], block);

      sbr(
        [-2, 11, this.s - 2],
        [-4, 11, this.s + zSize + 2],
        color ? color + " Carpet" : "Air"
      );
      sbr(
        [-2, 16, this.s - 1],
        [-4, 16, this.s + zSize + 1],
        "Dim Lamp On"
      );
      sbr(
        [-2, 15, this.s - 1],
        [-4, 15, this.s + zSize + 1],
        color ? "Patterned " + color + " Glass" : "Air"
      );
      sbr([-1,4,this.s-1], [1,6,this.s+1], "Maple Wood Planks",true,false)
      if(api.getBlock(0,6,this.s)!="Code Block"){
        sbr(0,6,this.s,"Code Block");sbr(0,5,this.s,"Code Block")
      }
    }

    if (this.round === 1) {
      api.setPosition(owner.id, -2.5, 11, this.s);
      BlockData(-1, 11, this.s, `Jump: ${list[this.i][1]}
${list[this.i][2]} B/S
Diff: ${list[this.i][3]}
Rank: ${ranks[num][1]}`);
      if(api.getBlock(0,6,this.s)!="Code Block"){
        BlockData(0,6,this.s,""+this.i)
        BlockData(0,5,this.s,"[]")
      }else{ //safe data protocol
        /*let pos = [0,5,this.s]
        let data = JSON.parse(BlockData(...pos))
        BlockData(...pos,JSON.stringify(data))*/
      }
    }

    if (this.round === 2) {
      ListUpdate.main()
      this.round++;
    }

    this.i++;
    this.s += z + 5;
  }
}

wait=0

function tick(){
  if(wait!=5){wait++;return;}else{wait=0};
  if(!Init.main()){return;}
  tick1();
  Gen.main();
  api.getPlayerIds().forEach(e=>{
    if(api.getPosition(e)[1]==8){
      if(ply[e].row){ply[e].row--;ply[e].fall=true;call(plyCmd, ["end"], e)}
      api.setPosition(e,-2.5,11,api.getPosition(e)[2])
    }
  })
}

function find(data, columnIndex, value,comp) {
  if(comp==">"){return data.find(row => row[columnIndex] > value)}
  if(comp=="=="){return data.find(row => row[columnIndex] == value)}
}

plyCmd={
  guide:id=>{
    api.setClientOption(id,"RightInfoText",[
      {str:"===Parkour Helper Commands===\n",style:{color:"White",fontSize:"30px"}},
      {str:"# General Commands #",style:{color:"White",fontSize:"20px"}},
      {str:`
- /guide : Opens this menu
- /close : closes this menu
- /soon : find out about upcoming updates
- /find [Catagory] [Value] : Tp to [jumpName] in [Catagory]
  [Catagory]=> can be "name" , "speed" or "diff"
  [Value]=>
    for catagory name, jumpName,
    for catagory speed, speedNeeded,
    for catagory diff, difficultyNumber
- /start : allows you to start a jump attempt
  (must stand on red wool to start)
- /start : use instead of end, to add 1 to jump streak
- /end : allows you to end a jump attempt,
  and get your rank and leaderboard added
  if applicable
- /next : instead of using /end , you can use next
  this allows you to stack multiple of the same jump
- /leaderboard : see the current jumps leaderboard
  (get on the leaderboard before spots fill up)
- /hide : use this to hide all players
- /unhide : use this to unhide all players

if your unsure about what argument to use for the commands,
type "help" instead, eg
/find help
to find how "/find" works
`,style:{color:"White",fontSize:"15px"}}
]);return true;
    },
  soon : (id)=>{
    api.setClientOption(id,"RightInfoText",[
      {str:`# Coming Soon #`,style:{color:"White",fontSize:"20px"}},
      {str:`
- /join [RoomNum] : make new room
  use a negative number to make private
- /invite [PlayerName] : invites player to your room
- /leave : leave current room
- /make : make own room

- /filter [Spec]: filters the jumps in your room
- /sort [Mode]: sorts the jumps in your room

- /babel : takes you to library of babel
- /copy [ID/Name] : copy the current jump name/id
- /paste [ID/Name/Done] : gives book to paste
  when done, use /paste while holding book to paste
`,style:{color:"White",fontSize:"15px"}}
]);return true;
  },
  close:(id=>{api.setClientOption(id,"RightInfoText","");return true}),
  find: (id, type ,arg) => {
    if(type=="help"){api.sendMessage(id,[{str:`valid usage includes: 
/find name 5x5-1
/find diff 4
find speed 7`,style:{color:"lime"}}]);return true;}
    let a={name:1,speed:2,diff:3}[type]
    if(arg=="help"){api.sendMessage(id,[{str:`Valid Usage is:
/find ${type} enter_${type}_here`,style:{color:"lime"}}]);return true;}
    let comp = "=="
    if(!a){
      api.sendMessage(id,[{str:`search type is invalid`,style:{color:"red"}}]);
      return true;
    }
    if(type=="speed"){arg=+arg;comp=">"}
    if(type=="diff"){arg=+arg;comp=">"}
    pos=find(list,a,arg,comp)[5];console.log(pos)
    if(!pos){
      api.sendMessage(id,[{str:`couldnt find the specified jump`,style:{color:"red"}}]);
      return true;
    }
    api.setPosition(id,...pos)
    return true;
  },
  start:(id,help)=>{
    let arr=api.getPosition(id).map(e=>Math.floor(e))
    let inx = BlockData(arr[0],6,arr[2])
    if(arr[0]!=0 || arr[1]!=11 || inx==void 0){
      api.sendMessage(id,[{str:`You are not standing at jump start
please stand at jump start before trying again`,style:{color:"red"}}]);
      return true;
    }
    ply[id]={
      inx:inx,
      start:[arr[0],11,arr[2]],
      end:list[inx][0],
      row:0
    };
    api.sendMessage(id,[{str:`cmd /start done`,style:{color:"lime"}}]);
    return true;
  },
  next:(id)=>{
    if(!ply[id]){
      api.sendMessage(id,[{str:`You do not have a Current Jump
use /start on a jump before trying again`,style:{color:"red"}}]);
      return true;
    }
    let arr = api.getPosition(id).map(e=>Math.floor(e));
    let est = ply[id].start.map((e,i)=>e+ply[id].end[i])
    if(`${arr}`!=`${est}` && arr[1]!=8){
      api.sendMessage(id,[{str:`You are not standing at jump end
please land at jump end before trying again`,style:{color:"red"}}]);return true
    }
    ply[id].row++;
    api.setPosition(id,ply[id].start)
    api.sendMessage(id,[{str:`done ${ply[id].row}x in a row`,style:{color:"lime"}}]);
    return true;
  },
  end:(id)=>{
    let arr = api.getPosition(id).map(e=>Math.floor(e));
    let est = ply[id].start.map((e,i)=>e+ply[id].end[i])
    if(!ply[id]){
      api.sendMessage(id,[{str:`You do not have a Current Jump
use /start on a jump before trying again`,style:{color:"red"}}]);
      return true;
    }
    if(`${arr}`!=`${est}` && !ply[id].fall){
      api.sendMessage(id,[{str:`You are not standing at jump end
please land at jump end before trying again`,style:{color:"red"}}]);return true
    }
    if(ply[id].fall){ply[id].row++}
    let [x,y,z] = ply[id].start;
    let data = JSON.parse(BlockData(x,5,z));
    let name=api.getEntityName(id)
    let length = data.length
    data = lAdd(data,{[name]:ply[id].row}) //ranked addition to list
    BlockData(x,5,z,JSON.stringify(data));
    let diff = list[ply[id].inx][3]
    let num = Math.ceil(Math.log2(diff))
    const block = ranks[num][0];
    const color = (block ? block.split(" ").slice(0, -1).join(" ") : "").replace(/ /g,"")
    const rows = ply[id].row<2?(""):`(${ply[id].row}x in a row !!)`
    
    api.broadcastMessage([
      {
        str:`${name}`,
        style:{color:"Red",fontSize:"20px"}
      },{
        str:` has Completed a
`,
        style:{color:"white",fontSize:"20px"}
      },{
        str:`${list[ply[id].inx][1]}`,
        style:{color:"Blue",fontSize:"20px"}
      },{
        str:` Jump! ${rows}`,
        style:{color:"white",fontSize:"20px"}
      },{
        str:`
Stats:
Difficulty: ${diff}
Rank: ${ranks[num][1]}`,
        style:{color:color,fontSize:"15px"}
      },
    ]);
    ply[id]={}
    return true;
  },
  leaderboard:(id,type)=>{
    let arr=api.getPosition(id).map(e=>Math.floor(e))
    let inx = BlockData(arr[0],6,arr[2])
    if(arr[0]!=0 || arr[1]!=11 || inx==void 0){
      api.sendMessage(id,[{str:`You are not standing at jump start
please stand at jump start before trying again`,style:{color:"red"}}]);
      return true;
    }
    let a ={
      inx:inx,
      start:[arr[0],11,arr[2]],
      end:list[inx][0]
    };
    let [x,y,z] = a.start;
    let data = JSON.parse(BlockData(x,5,z));
    if(`${data}`==`${[]}`){data = [{"No Players Yet":0}]}
    let diff = list[a.inx][3]
    let num = Math.ceil(Math.log2(diff))
    const block = ranks[num][0];
    const color = (block ? block.split(" ").slice(0, -1).join(" ") : "").replace(/ /g,"")
    let msg = data.flatMap(obj =>
      Object.entries(obj).map(([key, value]) => `${key}: ${value}`)
    ).join("\n");
    api.sendMessage(id,[{"str":msg,style:{color:color}}])
    return true;
  },
  hide:(id)=>{api.setClientOption(id,"numClosestPlayersVisible",0);return true;},
  unhide:(id)=>{api.setClientOption(id,"numClosestPlayersVisible",null);return true;}
}

function call(obj, keys, id) {
  try {
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // Only allow direct keys
      if (current && Object.hasOwn(current, key)) {
        current = current[key];
        // If we hit a function, run it with id + remaining keys
        if (typeof current === "function") {
          const remaining = keys.slice(i + 1);
          return current(id, ...remaining);
        }
      } else {
        return; // invalid path
      }
    }

    // If traversal ends on a function, run it
    if (typeof current === "function") {
      return current(id);
    }
    return false; //not function
  } catch (err) {
    if(err){api.sendMessage(id,[{str:ErrMsg(err),style:{color:"red"}}]);return false;}
  }
}

function playerCommand(id, command) {
  const cmd = command.toLowerCase().split(" ");
  console.log("Command parts:", cmd);
  return call(plyCmd, cmd, id);
}

function onPlayerJoin(id){
  api.setPosition(id,-2.5,0,0.5);
  ply[id]={}
  api.sendMessage(id,[{str:`Welcome to 
BLOXD JUMP RANKS
- each jump is ranked
- leaderboard system
- train to get better at parkour`,style:{color:"white",fontSize:"20px"}}]);
}

function onPlayerLeave(id){delete ply[id]}
