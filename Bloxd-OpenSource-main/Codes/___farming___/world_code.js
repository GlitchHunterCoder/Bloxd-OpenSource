const ORIGIN = 10000;
const PLOT_SIZE = 24;
const Y_GROUND = -1000;
const Y_SURFACE = -999;
const INFO_COLOR = { color: "aqua", fontSize: "20px" };
const LABEL_COLOR = { color: "red", fontSize: "20px" };
const SKY_TIME = 200000;

const build = Object.create(null);

const Allowed = [
  "Ocelote", "ChaosCheeseManE200", "BloxdKrishn", "Arthur", "DirtyFleaSack",
  "pixelbaker", "Tom", "Oliver", "Slushie", "Harry", "jasninus", "GlitchHunter",
  "AnasBedwars_Pro303", "_Hemika_"
];

const Dev = [
  "BloxdKrishn", "Arthur", "DirtyFleaSack", "pixelbaker", "Tom", "Oliver", "Slushie",
  "Harry", "jasninus", "GlitchHunter", "AnasBedwars_Pro303", "_Hemika_", "CleanFleaSack1"
];

let b = 0; // preserved (if used elsewhere)

const vvt = {
  tickFunctions: new Map(),
  timeouts: new Map(),
  intervals: new Map(),

  addTickFn(id, fn) {
    if (typeof fn === "function") this.tickFunctions.set(id, fn);
  },
  removeTickFn(id) {
    this.tickFunctions.delete(id);
  },

  _schedule(bucket, id, fn, delay, repeat = false) {
    const start = Date.now();
    const tickFn = () => {
      if (Date.now() - start >= delay) {
        fn();
        if (repeat) {
          this._schedule(bucket, id, fn, delay, true); // reschedule
        } else {
          this.clearTimeout(id);
        }
      }
    };
    this.addTickFn(id, tickFn);
    bucket.set(id, tickFn);
  },

  setTimeout(id, fn, delay) {
    this._schedule(this.timeouts, id, fn, delay, false);
  },
  clearTimeout(id) {
    this.removeTickFn(id);
    this.timeouts.delete(id);
  },
  setInterval(id, fn, delay) {
    this._schedule(this.intervals, id, fn, delay, true);
  },
  clearInterval(id) {
    this.removeTickFn(id);
    this.intervals.delete(id);
  },

  setStoredValue(posOrKey, key, value) {
    const isPos = typeof posOrKey === "object";
    const getSlot = isPos ? api.getStandardChestItemSlot : api.getMoonstoneChestItemSlot;
    const setSlot = isPos ? api.setStandardChestItemSlot : api.setMoonstoneChestItemSlot;

    const slot = getSlot(posOrKey, 0);
    let data = {};
    try {
      data = JSON.parse(slot.attributes?.customDisplayName ?? "{}");
    } catch {
      data = {};
    }
    data[key] = value;

    const attrs = {
      customDisplayName: JSON.stringify(data),
      customDescription: "To Reset,\nTake out of Chest"
    };

    if (isPos) {
      setSlot(posOrKey, 0, "Empty Bottle", 1, api.getPlayerIds()[0], attrs);
    } else {
      setSlot(posOrKey, 0, "Empty Bottle", 1, attrs);
    }
  },

  getStoredValue(posOrKey, key) {
    const getSlot = (typeof posOrKey === "object")
      ? api.getStandardChestItemSlot
      : api.getMoonstoneChestItemSlot;

    const slot = getSlot(posOrKey, 0);
    if (slot && slot.attributes?.customDisplayName) {
      try {
        const parsed = JSON.parse(slot.attributes.customDisplayName);
        return parsed?.[key];
      } catch {
        return;
      }
    }
  }
};

function tick(dt) {
  vvt.tickFunctions.forEach(fn => fn(dt));
}

function spiral(n) {
  if (n < 1) throw new Error("n must be >= 1");
  if (n === 1) return { x: 0, z: 0 };
  const t = Math.ceil((Math.sqrt(n) - 1) / 2);
  const m = n - (2 * t - 1) ** 2 - 1;
  const side = 2 * t;
  const o = m % side;
  let x, z;
  switch (Math.floor(m / side)) {
    case 0: x = t;       z = o - (t - 1); break;
    case 1: x = t - 1 - o; z = t;        break;
    case 2: x = -t;      z = t - 1 - o;  break;
    case 3: x = o - (t - 1); z = -t;     break;
  }
  return { x, z };
}

function plotBase(x, z) {
  return {
    bx: ORIGIN + PLOT_SIZE * x,
    bz: ORIGIN + PLOT_SIZE * z
  };
}

function setRect(x1, y1, z1, x2, y2, z2, block) {
  api.setBlockRect([x1, y1, z1], [x2, y2, z2], block);
}

function setIfAirRect(condPos, from, to, block) {
  if (api.getBlock(condPos) === "Air") setRect(...from, ...to, block);
}

function buildPlotStructure(bx, bz) {
  // Build only if center isn’t already grass (original behavior).
  if (api.getBlock([bx + 15, Y_GROUND, bz + 15]) !== "Grass Block") {
    setIfAirRect(
      [bx, Y_GROUND, bz - 8], // position to check for air
      [
        api.getBlock([bx - 4, Y_GROUND, bz - 8]) === "Air" ? bx - 7 : bx - 1,
        Y_GROUND,
        bz - 7
      ],
      [
        api.getBlock([bx + 20, Y_GROUND, bz - 8]) === "Air" ? bx + 23 : bx + 17,
        Y_GROUND,
        bz - 7
      ],
      "Yellow Concrete"
    );
    setIfAirRect(
      [bx, Y_GROUND, bz + 24],
      [(api.getBlock([bx - 4, Y_GROUND, bz + 24]) === "Air" ? bx - 7 : bx - 1), Y_GROUND, bz + 23],
      [(api.getBlock([bx + 20, Y_GROUND, bz + 24]) === "Air" ? bx + 23 : bx + 17), Y_GROUND, bz + 23],
      "Yellow Concrete"
    );

    setIfAirRect(
      [bx - 8, Y_GROUND, bz],
      [bx - 7, Y_GROUND, (api.getBlock([bx - 8, Y_GROUND, bz - 4]) === "Air" ? bz - 7 : bz - 1)],
      [bx - 7, Y_GROUND, (api.getBlock([bx - 8, Y_GROUND, bz + 20]) === "Air" ? bz + 23 : bz + 17)],
      "Yellow Concrete"
    );

    setIfAirRect(
      [bx + 24, Y_GROUND, bz],
      [bx + 23, Y_GROUND, (api.getBlock([bx + 24, Y_GROUND, bz - 4]) === "Air" ? bz - 7 : bz - 1)],
      [bx + 23, Y_GROUND, (api.getBlock([bx + 24, Y_GROUND, bz + 20]) === "Air" ? bz + 23 : bz + 17)],
      "Yellow Concrete"
    );

    // Black corners
    setRect(bx - 6, Y_GROUND, bz - 6, bx + 8, Y_GROUND, bz + 8, "Black Concrete");
    setRect(bx - 6, Y_GROUND, bz + 22, bx + 8, Y_GROUND, bz + 9, "Black Concrete");
    setRect(bx + 22, Y_GROUND, bz - 6, bx + 9, Y_GROUND, bz + 8, "Black Concrete");
    setRect(bx + 22, Y_GROUND, bz + 22, bx + 9, Y_GROUND, bz + 9, "Black Concrete");

    // White frame
    setRect(bx - 5, Y_GROUND, bz - 4, bx + 21, Y_GROUND, bz - 4, "White Concrete");
    setRect(bx - 4, Y_GROUND, bz - 5, bx - 4, Y_GROUND, bz + 21, "White Concrete");
    setRect(bx - 5, Y_GROUND, bz + 20, bx + 21, Y_GROUND, bz + 20, "White Concrete");
    setRect(bx + 20, Y_GROUND, bz - 5, bx + 20, Y_GROUND, bz + 21, "White Concrete");

    // Roads
    const road = [9998, 10001, 10004, 10007, 10009, 10012, 10015, 10018];
    road.forEach((val) => {
      setRect(bx - 4, Y_GROUND, val + PLOT_SIZE * (bz - ORIGIN) / PLOT_SIZE, bx + 20, Y_GROUND, val + PLOT_SIZE * (bz - ORIGIN) / PLOT_SIZE, "Black Concrete");
      setRect(val + PLOT_SIZE * (bx - ORIGIN) / PLOT_SIZE, Y_GROUND, bz - 4, val + PLOT_SIZE * (bx - ORIGIN) / PLOT_SIZE, Y_GROUND, bz + 20, "Black Concrete");
    });

    // Yellow center strips
    setRect(bx - 1, Y_GROUND, bz - 1, bx + 7, Y_GROUND, bz + 17, "Yellow Concrete");
    setRect(bx + 7, Y_GROUND, bz - 1, bx + 17, Y_GROUND, bz + 17, "Yellow Concrete");

    // Stone layers and farm bed
    setRect(bx, Y_GROUND - 1, bz, bx + 16, Y_GROUND - 1, bz + 16, "Smooth Stone");
    setRect(bx, Y_GROUND,     bz, bx + 16, Y_GROUND,     bz + 16, "Smooth Stone");
    setRect(bx, Y_GROUND + 1, bz, bx + 16, Y_GROUND + 1, bz + 16, "Smooth Stone");
    setRect(bx + 1, Y_GROUND + 1, bz + 1, bx + 15, Y_GROUND + 1, bz + 15, "Air");
    setRect(bx + 1, Y_GROUND,     bz + 1, bx + 15, Y_GROUND,     bz + 15, "Tilled Soil");

    // Center chest
    api.setBlock([bx, Y_GROUND, bz], "Chest");
  }
}

function setPlotMetadata(playerId, bx, bz, plotIndex) {
  const pos = [bx, Y_GROUND, bz];
  vvt.setStoredValue(pos, "Num", vvt.getStoredValue([ORIGIN, -505, ORIGIN], "Plot"));
  vvt.setStoredValue(pos, "Owner", api.getEntityName(playerId));
}

function teleportAndPerm(playerId, bx, bz) {
  // Build/permission area
  api.setCanChangeBlockRect(
    playerId,
    [bx + 1, Y_SURFACE, bz + 1],
    [bx + 15, Y_GROUND,  bz + 15]
  );
  // Teleport to center-ish
  api.setPosition(playerId, [bx + 8, Y_SURFACE, bz + 8]);
}

function incrementPlotCounter(playerId) {
  const current = Number(vvt.getStoredValue([ORIGIN, -505, ORIGIN], "Plot") ?? 0);
  const next = current + 1;
  vvt.setStoredValue([ORIGIN, -505, ORIGIN], "Plot", next);
  vvt.setStoredValue(playerId, "Plot", next);
}

function onPlayerJoin(playerId) {
  const name = api.getEntityName(playerId);
  if ([...Allowed, ...Dev].includes(name)) {
    build[playerId] = false;
  } else {
    api.kickPlayer(playerId, "Hi, This is a only dev Lobby for now");
  }
}

function onPlayerLeave(playerId) {
  delete build[playerId];
}

function claimAndBuild(playerId, index) {
  const name = api.getEntityName(playerId);
  const { x, z } = spiral(index);
  const { bx, bz } = plotBase(x, z);

  // Build the plot if needed and set metadata
  buildPlotStructure(bx, bz);
  vvt.setStoredValue([bx, Y_GROUND, bz], "Num", index);
  vvt.setStoredValue([bx, Y_GROUND, bz], "Owner", name);

  // Teleport and set permissions
  api.setCanChangeBlockRect(
    playerId,
    [bx + 1, Y_SURFACE, bz + 1],
    [bx + 15, Y_GROUND,  bz + 15]
  );
  api.setPosition(playerId, [bx + 8, Y_SURFACE, bz + 8]);
  return true;
}

function makePlot(playerId) {
  const GLOBAL_POS = [ORIGIN, -505, ORIGIN];
  const name = api.getEntityName(playerId);

  let counter = Number(vvt.getStoredValue(GLOBAL_POS, "Plot") ?? 0);
  let pIdx = vvt.getStoredValue(playerId, "Plot");
  pIdx = Number(pIdx);

  // 1) Missing player plot -> allocate next
  if (!Number.isFinite(pIdx) || pIdx <= 0) {
    const next = counter + 1;
    vvt.setStoredValue(playerId, "Plot", next);
    vvt.setStoredValue(GLOBAL_POS, "Plot", next);
    return claimAndBuild(playerId, next);
  }

  // 2) Player index > counter -> build and sync counter up to player’s index
  if (pIdx > counter) {
    vvt.setStoredValue(GLOBAL_POS, "Plot", pIdx);
    return claimAndBuild(playerId, pIdx);
  }

  // 3) Player has an index <= counter; check ownership at that plot
  {
    const { x, z } = spiral(pIdx);
    const { bx, bz } = plotBase(x, z);
    const owner = vvt.getStoredValue([bx, Y_GROUND, bz], "Owner");

    // Not the owner -> allocate a fresh new plot
    if (owner !== name) {
      const next = counter + 1;
      vvt.setStoredValue(playerId, "Plot", next);
      vvt.setStoredValue(GLOBAL_POS, "Plot", next);
      return claimAndBuild(playerId, next);
    }

    // Already the owner -> ensure structure exists and go there
    buildPlotStructure(bx, bz);
    // keep metadata fresh
    vvt.setStoredValue([bx, Y_GROUND, bz], "Num", pIdx);
    vvt.setStoredValue([bx, Y_GROUND, bz], "Owner", name);

    api.setCanChangeBlockRect(
      playerId,
      [bx + 1, Y_SURFACE, bz + 1],
      [bx + 15, Y_GROUND,  bz + 15]
    );
    api.setPosition(playerId, [bx + 8, Y_SURFACE, bz + 8]);
    return true;
  }
}


function editPerm(ownerId, targetPlayerId, action) {
  let allowed; // "can" or "cant"
  switch (action) {
    case "allow": allowed = "can";  break;
    case "deny":  allowed = "cant"; break;
    default: return "Unknown Edit Perm Action";
  }

  const { x, z } = spiral(vvt.getStoredValue(ownerId, "Plot"));
  if (!api.getPlayerIds().includes(targetPlayerId)) return "Unknown Player Name";

  api[`set${allowed}ChangeBlockRect`](
    targetPlayerId,
    [ORIGIN + PLOT_SIZE * x + 1, Y_SURFACE, ORIGIN + PLOT_SIZE * z + 1],
    [ORIGIN + PLOT_SIZE * x + 15, Y_SURFACE, ORIGIN + PLOT_SIZE * z + 15]
  );
}

function playerCommand(playerId, text) {
  const c = text.toLowerCase().split(" ");
  if (c[0] === "edit") {
    api.sendMessage(editPerm(playerId, c[2], c[1]), { color: "red" });
  }
  if (c[0] === "build" && Dev.includes(api.getEntityName(playerId))) {
    build[playerId] = !build[playerId];
    api.sendMessage(playerId, `Illegal Block Placer is Now ${build[playerId]}`);
  }
}

function onPlayerClick(playerId, isDown) {
  if (!build[playerId]) return;
  const facing = api.getPlayerFacingInfo(playerId);
  if (isDown) {
    const hit = api.raycastForBlock(facing.camPos, facing.dir);
    api.setBlock(hit.adjacent, api.getHeldItem(playerId)?.name);
  }
}

// NOTE: fixed Y range logic:
// original had (-999 <= y && -1000 >= y) which is impossible.
// This version checks -1000 <= y <= -999.
function onPlayerChangeBlock(playerId, x, y, z, faceDir, blockName, oldBlock, n7, n8) {
  if (y >= -1000 && y <= -999) {
    const chestPos = [x, y - 3, z];
    if (blockName === "Air") {
      api.setStandardChestItemSlot(chestPos, 0, "Air", 1, api.getPlayerIds()[0]);
      api.setBlock(chestPos, "Air");
    } else {
      api.setBlock(chestPos, "Chest");
      vvt.setStoredValue(chestPos, "Plant", { time: Date.now() });
    }
  }
}

function onPlayerAttemptOpenChest(playerId, x, y, z, side) {
  const name = api.getEntityName(playerId);
  if (![...Allowed, ...Dev].includes(name)) {
    api.sendMessage(playerId, "You can't open chest in this game.");
    return "preventOpen";
  }
}

// ============================
// Poses (as-is, just cleaned)
// ============================
const setCustomPose = function (playerId, poseText) {
  let head, torso, armL, armR, legL, legR;
  const scaling = api.getOtherEntitySetting(playerId, playerId, "meshScaling");
  head = scaling.HeadMesh ?? [1, 1, 1];
  torso = scaling.TorsoNode ?? [1, 1, 1];
  armL = scaling.ArmLeftMesh ?? [1, 1, 1];
  armR = scaling.ArmRightMesh ?? [1, 1, 1];
  legL = scaling.LegLeftMesh ?? [1, 1, 1];
  legR = scaling.LegRightMesh ?? [1, 1, 1];

  let tokens = poseText.toLowerCase().split(",");
  for (let i = 0; i < tokens.length; i++) {
    tokens[i] = tokens[i].trim()
      .replace(/pointing|point|wards|ward|to the|in the|to/g, "")
      .replace(/\s+/g, " ")
      .replace(/hand/g, "arm")
      .replace(/the sky|sky/g, "up")
      .replace(/ground|the floor|floor/g, "down")
      .replace(/for/g, "front")
      .replace(/down/g, "0")
      .replace(/front/g, "1")
      .replace(/up/g, "2")
      .replace(/back/g, "3")
      .replace(/left arm/g, "la")
      .replace(/right arm/g, "ra")
      .replace(/both arms|both arm/g, "ba")
      .replace(/left leg/g, "ll")
      .replace(/right leg/g, "rl")
      .replace(/both legs|both leg/g, "bl");
  }

  let p = { la: 0, ra: 0, ll: 0, rl: 0 };
  for (let t of tokens) {
    const key = t.slice(0, 2);
    if (key === "ba") { p.la = +t.slice(3, 4); p.ra = +t.slice(3, 4); }
    else if (key === "bl") { p.ll = +t.slice(3, 4); p.rl = +t.slice(3, 4); }
    else { p[key] = +t.slice(3, 4); }
  }

  if ((p.la + p.ra) % 2 === 1) throw "Arms cannot be perpendicular";
  if ((p.ll + p.rl) % 2 === 1) throw "Legs cannot be perpendicular";

  const armLFlip = p.la > 1 ? [1, -1, -1] : [1, 1, 1];
  const armRFlip = p.ra > 1 ? [1, -1, -1] : [1, 1, 1];
  const legLFlip = p.ll > 1 ? [1, -1, -1] : [1, 1, 1];
  const legRFlip = p.rl > 1 ? [1, -1, -1] : [1, 1, 1];

  armL = [Math.abs(armL[0]) * armLFlip[0], Math.abs(armL[1]) * armLFlip[1], Math.abs(armL[2]) * armLFlip[2]];
  armR = [Math.abs(armR[0]) * armRFlip[0], Math.abs(armR[1]) * armRFlip[1], Math.abs(armR[2]) * armRFlip[2]];
  legL = [Math.abs(legL[0]) * legLFlip[0], Math.abs(legL[1]) * legLFlip[1], Math.abs(legL[2]) * legLFlip[2]];
  legR = [Math.abs(legR[0]) * legRFlip[0], Math.abs(legR[1]) * legRFlip[1], Math.abs(legR[2]) * legRFlip[2]];

  let nodes = {
    HeadMesh: head,
    TorsoNode: torso,
    ArmLeftMesh: armL,
    ArmRightMesh: armR,
    LegLeftMesh: legL,
    LegRightMesh: legR
  };

  for (let k of Object.keys(nodes)) {
    const v = nodes[k];
    // discard identity scales
    if (v[0] === 1 && v[1] === 1 && v[2] === 1) delete nodes[k];
  }

  const armsForward = !!(p.la % 2);
  const legsForward = !!(p.ll % 2);
  const pose = armsForward ? (legsForward ? "driving" : "zombie") : (legsForward ? "sitting" : "standing");

  api.setPlayerPose(playerId, pose);
  api.scalePlayerMeshNodes(playerId, nodes);
};

// ============================
// UI + ambiance + lamps
// ============================
vvt.setInterval("Owner", () => {
  // Right info text near plots
  api.getPlayerIds().forEach((pid) => {
    const [x, y, z] = api.getPosition(pid);
    const inPlotX = ((x - 16) % 24) < 17;
    const inPlotZ = ((z - 16) % 24) < 17;

    if (inPlotX && y < -900 && inPlotZ) {
      const pos = [
        24 * Math.floor((x - ORIGIN) / 24) + ORIGIN,
        Y_GROUND,
        24 * Math.floor((z - ORIGIN) / 24) + ORIGIN
      ];

      api.setClientOption(pid, "RightInfoText", [
        { str: "Farm Number: ", style: LABEL_COLOR },
        { str: "" + (vvt.getStoredValue(pos, "Num") ?? "..."), style: INFO_COLOR },
        { str: "\nFarm Owner: ", style: LABEL_COLOR },
        { str: vvt.getStoredValue(pos, "Owner") ?? "...", style: INFO_COLOR }
      ]);
    } else {
      api.setClientOption(pid, "RightInfoText", [
        { str: "Farm Number: ", style: LABEL_COLOR },
        { str: "...", style: INFO_COLOR },
        { str: "\nFarm Owner: ", style: LABEL_COLOR },
        { str: "...", style: INFO_COLOR }
      ]);
    }
  });

  // Skybox
  api.getPlayerIds().forEach((pid) => {
    api.setClientOption(pid, "skyBox", {
      type: "earth",
      inclination: Date.now() / SKY_TIME,
      luminance: 1,
      turbidity: 2,
      azimuth: 0,
      vertexTint: [255, 255, 255]
    });
  });

  // Lamps flicker
  const lamps = [
    [10015, -492, 9966], [10012, -492, 9963], [9988, -492, 9963], [9985, -492, 9966],
    [10012, -492, 9993], [9985, -492, 9990], [10002, -486, 9978], [10015, -492, 9990],
    [9988, -492, 9993], [10000, -486, 9976], [9998, -486, 9978], [10000, -486, 9980],
    [10011, -496, 9989], [10007, -496, 9985], [10003, -496, 9981], [10001, -496, 9978],
    [10000, -496, 9978], [10000, -496, 9977], [10000, -496, 9979], [9999, -496, 9978],
    [9997, -496, 9981], [9993, -496, 9985], [9989, -496, 9989], [9997, -496, 9975],
    [9993, -496, 9971], [9989, -496, 9967], [10003, -496, 9975], [10007, -496, 9971],
    [10011, -496, 9967], [10003, -498, 9994], [9997, -498, 9994]
  ];

  lamps.forEach((pos) => {
    if (Math.random() < 0.1) {
      const phase = (Date.now() / SKY_TIME) % 2;
      api.setBlock(pos, (phase > 0.5 && phase < 1.5) ? "Dim Lamp On" : "Dim Lamp Off");
    }
  });
}, 1000);

// ============================
// Plants (kept for future use)
// ============================
const plant = {
  "Red Chalk": {
    name: "Strawberry",
    ttg: "1",
    stages: ["Red Chalk", "Red Carpet", "Red Concrete", "Strawberry"],
    buy: 0,
    sell: 5,
    oneTime: true
  },
  "Blue Chalk": {
    name: "Blueberry",
    ttg: "2",
    stages: ["Blue Chalk", "Blue Carpet", "Blue Concrete", "Blueberry"],
    buy: 60,
    sell: 100,
    oneTime: true
  },
  "Green Chalk": {
    name: "Watermelon",
    ttg: "3",
    stages: ["Green Chalk", "Green Carpet", "Green Concrete", "Watermelon"],
    buy: 150,
    sell: 300,
    oneTime: true
  },
  "Red Chalk Bricks": {
    name: "Cranberry",
    ttg: "4",
    stages: ["Red Chalk Bricks", "Red Concrete Slab", "Red Wool", "Cranberry"],
    buy: 200,
    sell: 370,
    oneTime: false
 },
 "Orange Chalk": {
    name: "Carrot",
    ttg: "5",
    stages: ["Orange Chalk", "Orange Carpet", "Orange Concrete", "Carrot"],
    buy: 300,
    sell: 400,
    oneTime: false
 },
};
