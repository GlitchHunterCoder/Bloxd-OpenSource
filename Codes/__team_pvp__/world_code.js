Colors = ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "Light Blue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"]
colorIndex = {}
Immune = ["BloxdKrishn", "Arthur", "DirtyFleaSack", "Tom", "pixelbaker", "Oliver", "Slushie", "Harry", "jasninus", "GlitchHunter", "BloxdAnas", "BloxdHemika"]
Allowed = ["BloxdKrishn", "Arthur", "DirtyFleaSack", "Tom", "pixelbaker", "Oliver", "Slushie", "Harry", "jasninus", "GlitchHunter", "BloxdAnas", "BloxdHemika"]
dev = ["BloxdKrishn", "Arthur", "DirtyFleaSack", "Tom", "pixelbaker", "Oliver", "Slushie", "Harry", "jasninus", "GlitchHunter", "BloxdAnas", "BloxdHemika"]

function shop(myId, buyItems, sellItems) {
  // Normalize inputs to arrays
  const buys = Array.isArray(buyItems) ? buyItems : [buyItems];
  const sells = Array.isArray(sellItems) ? sellItems : [sellItems];

  // Check if player has enough of all required sell items
  const hasAllItems = sells.every(({ name, amount }) =>
    api.getInventoryItemAmount(myId, name) >= amount
  );

  if (!hasAllItems) {
    api.sendMessage(myId, "You don't have the required items to Buy this item.", { color: "red" });
    return;
  }

  // Remove sell items
  sells.forEach(({ name, amount }) => {
    api.removeItemName(myId, name, amount);
  });

  // Give buy items
  buys.forEach(({ name, amount, attributes = {} }) => {
    api.giveItem(myId, name, amount, attributes);
  });

  // Confirmation message
  const buySummary = buys.map(({ name, amount }) => `${amount} ${name}`).join(", ");
  const sellSummary = sells.map(({ name, amount }) => `${amount} ${name}`).join(", ");
  api.sendMessage(myId, `You bought ${buySummary}`, { color: "lime" });
}


function onPlayerJoin(playerId) {
  api.setClientOption(playerId, "lobbyLeaderboardInfo", {
    r: {},
    pfp: {},
    name: {
      displayName: "Name:"
    },
    k: {
      displayName: "Kills:"
    }
  })

  if(dev.includes(api.getEntityName(playerId))) {
    api.setTargetedPlayerSettingForEveryone(playerId, "nameTagInfo", {
      backgroundColor: "default",
      content: [{
        str: "🔧🌈"
      }, ...api.getEntityName(playerId).split("").map((c, i) => ({
        str: c,
        style: {
          color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16],
          fontSize: "50px",
          fontWeight: "0"
        }
      }))]
    });
    api.broadcastMessage([{
      str: "A Dev has Joined the Lobby ",
      style: {
        color: "Red",
        fontSize: "14px"
      }
    }, ...api.getEntityName(playerId).split("").map((c, i) => ({
      str: c,
      style: {
        color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16],
        fontSize: "14px"
      }
    }))])
    api.sendMessage(playerId, "Hi, Welcome to this world. Type /devhelp for Dev Commands", {
      color: "yellow"
    })
  } else {
    api.broadcastMessage([{
      str: api.getEntityName(playerId) + " Joined",
      style: {
        color: "#CEFEFF",
        fontWeight: "0",
        fontSize: "14px",
        fontStyle: "",
        opacity: 1
      }
    }])
  }
  api.setClientOption(playerId, "usePlayAgainButton", true)
}

function onPlayerLeave(playerId, serverIsShuttingDown) {
  if(dev.includes(api.getEntityName(playerId))) {
    api.broadcastMessage([{
      str: "A Dev has Left the Lobby ",
      style: {
        color: "Red",
        fontSize: "14px"
      }
    }, ...api.getEntityName(playerId).split("").map((c, i) => ({
      str: c,
      style: {
        color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16],
        fontSize: "14px"
      }
    }))])
  } else {
    api.broadcastMessage([{
      str: api.getEntityName(playerId) + " left",
      style: {
        color: "#CEFEFF",
        fontWeight: "0",
        fontSize: "14px",
        fontStyle: "",
        opacity: 1
      }
    }])
  }
  api.clearInventory(playerId)
}

function playerCommand(playerId, command) {
  if(command.toLowerCase() == "devhelp") {
    api.sendMessage(playerId, "Dev-only commands: '/kick [name]' '/update'", {
      color: "yellow"
    })
  }
  if(command.split(" ")[0].toLowerCase() == "update" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
    getIds = api.getPlayerIds()
    for(let i = 0; i < api.getNumPlayers(); i++) {
      api.sendTopRightHelper(getIds[i], "exclamation", "Custom Game soon restarting for Update!!", {
        color: "red",
        duration: 10
      })
    }
    api.broadcastMessage("Custom Game soon restarting for Update!!", {
      color: "red"
    })
  }
  if(command.split(" ")[0].toLowerCase() == "kick" && Allowed.includes(api.getEntityName(playerId)) && !Immune.includes(command.split(" ")[1])) {
    api.kickPlayer(api.getPlayerId(command.split(" ")[1]), "Hi, You have been Kicked by Dev's for Rule Breaking")
  }
}
onPlayerChat = (id, msg, channel) => {
  const i = (colorIndex[id] = (colorIndex[id] || 0) + 1) % Colors.length;
  if(channel != "Tribe") {
    if(dev.includes(api.getEntityName(id))) {
      api.broadcastMessage([{
        str: "[🔧Dev]",
        style: {
          color: "red"
        }
      }, {
        str: "[🌈Rainbow]",
        style: {
          color: "white"
        }
      }, ...api.getEntityName(id).split("").map((c, i) => ({
        str: c,
        style: {
          color: ["Red", "Orange", "Yellow", "Green", "Lime", "Blue", "LightBlue", "Cyan", "Purple", "Magenta", "Pink", "Gray", "Light Gray", "Brown", "Black", "White"][i % 16]
        }
      })), {
        str: ": " + msg,
        style: {
          color: "white"
        }
      }, ]);
    } else {
      api.broadcastMessage([{
        str: api.getEntityName(id) + ":",
        style: {
          color: "#CEFEFF"
        }
      }, {
        str: " " + msg,
        style: {
          color: "white"
        }
      }, ]);
    }
    return false
  }
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
  api.setTargetedPlayerSettingForEveryone(id, 'colorInLobbyLeaderboard',
    Colors[i], true);
}
tickCount = 0
a = Date.now()

function leaderBoard() {
  api.getPlayerIds().forEach((id) => {
    api.setTargetedPlayerSettingForEveryone(id, "lobbyLeaderboardValues", {
      r: dev.includes(api.getEntityName(id)) ? "🔧🌈" : "",
    }, true)
  })
}

function tick() {
  leaderBoard()
  tickCount++;
  const ids = api.getPlayerIds();
  if(!ids) return;
  for(const id of ids) {
    if(tickCount % 20 === 0) {
      let [x, y, z] = api.getPosition(id);
      let block = api.getBlock([x, y - 1, z]);
      applyCape(id);
      armorChange(id, block)
    }
  }
  if((Date.now() - a) > 60000) {
    api.createItemDrop(996.50, -500.00, 1067.50, "Diamond", 1, true, {})
    api.createItemDrop(1004.50, -500.00, 1067.50, "Diamond", 1, true, {})
    api.createItemDrop(1004.50, -500.00, 1075.50, "Diamond", 1, true, {})
    api.createItemDrop(996.50, -500.00, 1075.50, "Diamond", 1, true, {})
    api.createItemDrop(1055.50, -500.00, 1017.50, "Moonstone", 1, true, {})
    api.createItemDrop(945.50, -500.00, 1126.50, "Moonstone", 1, true, {})
    api.createItemDrop(945.50, -500.00, 1016.50, "Moonstone", 1, true, {})
    api.createItemDrop(1055.50, -500.00, 1126.50, "Moonstone", 1, true, {})
    a = Date.now()
  }
}

function armorChange(id, block) {
  if(block.split(" ")[1] == "Wool" && api.isInsideRect(api.getPosition(id), [1020, -490, 970], [970, -510, 920], true)) {
    const key = block.split(" ")[0];
    item = ["Helmet", "Chestplate", "Gauntlets", "Leggings", "Boots"]
    item.forEach((e, i) => {
      api.setItemSlot(id, 46 + i, key + " Wood " + e, 1, {})
    })
  }
}
team = {
  player: {},
  team: {},
  join: function(id, team) {
    this.leave(id)
    this.team[team] ??= [];
    this.team[team].push(id);
    this.player[id] = team;
  },
  leave: function(id) {
    delete this.team[this.player[id]]
    delete this.player[id]
  }
}
