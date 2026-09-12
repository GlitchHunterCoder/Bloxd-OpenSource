// ── Dynamic code execution ───────────────────────────────────

World.Call.onPlayerPotionEffect = (playerId, otherId, effectName) => {
  const code = api.getHeldItem(playerId)?.attributes?.customAttributes?.onPlayerPotionEffect//?.replace(/\n/g, '')
  if (code) {
    eval(code)
  }
};

// ── Combat ───────────────────────────────────────────────────

World.Call.onPlayerDamagingOtherPlayer = (attacker) => {
  api.applyEffect(attacker, 'violence', 10000, { icon: 'Red Wool' });
};

// ── Chest shop ───────────────────────────────────────────────
// Three vertically stacked chests per shop slot:
//   y-1 → display items   (shown to the player, with cost appended to description)
//   y-2 → cost items      (what the player pays)
//   y-3 → buy items       (what the player receives)

World.chestShops           = {};
World.chestShopPositioning = ['16608,95,-206', '16611,95,-209'];
World.chestShopOpeners     = [];   // flat [playerId, [x,y,z], ...] pairs
World.chestShopLoaded      = {};   // key → true once display chest is populated

/** Read all shop chest stacks and rebuild the in-memory shop catalogue. */
World.chestShop = () => {
  World.chestShopPositioning.forEach((posStr, idx) => {
    const pos     = posStr.split(',').map(Number);
    const display = api.getStandardChestItems([pos[0], pos[1] - 1, pos[2]]);
    const costs   = api.getStandardChestItems([pos[0], pos[1] - 2, pos[2]]);
    const buys    = api.getStandardChestItems([pos[0], pos[1] - 3, pos[2]]);
    const shopId  = idx + 1;
    World.chestShops[shopId] = [[...pos]];

    (display || []).forEach((slot, i) => {
      if (!slot) return;
      World.chestShops[shopId].push({
        disp: {
          item:       display[i]?.name,
          amount:     display[i]?.amount || 1,
          attributes: display[i]?.attributes,
          description:
            (display[i]?.attributes?.customDescription || '') +
            '\n Costs: ' + (costs[i]?.amount ?? 0) + ' x ' +
            (costs[i]?.attributes?.customDisplayName ?? costs[i]?.name ?? 'Nothing')
        },
        cost: costs[i]
          ? [{ item: costs[i].name, amount: costs[i].amount || 1, name: costs[i].attributes?.customDisplayName ?? costs[i].name }]
          : [],
        buy: {
          item:       buys[i]?.name,
          amount:     buys[i]?.amount || 1,
          attributes: buys[i]?.attributes,
          name:       buys[i]?.attributes?.customDisplayName ?? buys[i]?.name
        }
      });
    });
  });
};

World.Call.onPlayerOpenedChest = (playerId, x, y, z, isMoon, isIron) => {
  if(isMoon || isIron){return}
  World.chestShop();
  const key   = `${x},${y},${z}`;
  const index = World.chestShopPositioning.indexOf(key);
  if (index === -1) return;

  // Remove any stale opener entry for this player.
  const opIdx = World.chestShopOpeners.indexOf(playerId);
  if (opIdx !== -1) World.chestShopOpeners.splice(opIdx, 2);

  // Populate display chest once per session.
  if (!World.chestShopLoaded[key]) {
    const shopId = index + 1;
    const pos    = World.chestShops[shopId][0].map(Number);
    const data   = World.chestShops[shopId];
    for (let i = 1; i < data.length; i++) {
      const { disp } = data[i];
      if (disp?.attributes) disp.attributes.customDescription = disp.description;
      api.setStandardChestItemSlot(pos, i - 1, disp.item, disp.amount, undefined, disp.attributes);
    }
    World.chestShopLoaded[key] = true;
  }

  World.chestShopOpeners.push(playerId, [x, y, z]);
};

/** Prevent players from dropping items out of shop chests. */
World.Call.onPlayerDropItem = (playerId,x,y,z,itemName,itemAmt,fromInx) => {
  if (fromInx >= 51 && World.chestShopOpeners.includes(playerId)) return 'preventDrop';
};

/** Handle inventory moves in and out of shop chests — process purchases. */
World.Call.onPlayerMoveInvenItem = (playerId, fromSlot, toSlot) => {
  // Block players from adding items into any shop chest.
  if (fromSlot < 51 && toSlot >= 51 && !World.coderList.includes(api.getEntityName(playerId)) && World.chestShopOpeners.includes(playerId)) {
    api.sendMessage(playerId, "You can't add items to the shop!", { color: 'red' });
    return 'preventChange';
  }

  const shopSlotInvolved = fromSlot >= 51 || toSlot >= 51;
  if (!shopSlotInvolved || !World.chestShopOpeners.includes(playerId)) return;

  const chestPos = World.chestShopOpeners[World.chestShopOpeners.indexOf(playerId) + 1];
  const shopData = World.chestShops[
    World.chestShopPositioning.indexOf(`${chestPos[0]},${chestPos[1]},${chestPos[2]}`) + 1
  ];
  if (!shopData) return;

  const entry = shopData[fromSlot - 50];
  if (!entry) return;

  const { cost, buy } = entry;
  const canAfford = (cost || []).every(c => !c?.item || api.getInventoryItemAmount(playerId, c.item) >= c.amount);

  if (canAfford) {
    (cost || []).forEach(c => api.removeItemName(playerId, c.item ?? '2', c.item ? c.amount ?? 0 : 0));
    api.giveItem(playerId, buy?.item ?? '2', buy?.item ? buy?.amount ?? 0 : 0, buy?.attributes ?? {});
    api.sendMessage(playerId, `You purchased ${buy?.name ?? 'an item'}!`, { color: 'lime' });
  } else {
    api.sendMessage(playerId, "You can't afford that!", { color: 'orange' });
  }
  return 'preventChange';
};

// ── Main tick ────────────────────────────────────────────────

/** Per-frame state used across tick. */
World.effectList        = {};
//globalThis.player_Minus319   = null;
//replace with player level system

//run 1 step of tick task every tick
World.TickTask={}

World.Call.tick = (delta) => {
  World.all("tick")
  TS.tick();
  World.vvt.tick();
  World.Check("tick");

  //step
  Reflect.ownKeys(World.TickTask).map(e=>World.TickTask[e]())

  // Restore starter player's position after code-load phase.
  const starter = World.Init.starter;
  if (starter&&World.Init.first) {
    World.Call.onPlayerJoin(starter);
    api.setPosition(starter, ...World.Init.pos);
    World.Init.starter = undefined;
  }

  // Flush one pending chat message per tick.
  const msg = World.pendingMsgs.shift();
  if (msg) World.broadcastGlobalMessage(...msg);
};

World.TickTask.Lv2 = () => {
  for (let i = 0; i < 4; i++) {
    api.setBlock(
      [World.randInt(484, 488), World.randInt(14, 18), World.randInt(100, 119)],
      i === 0 ? 'Stone' : 'Air'
    );
  } 
}

World.TickTask.OBS = () => {
  if(Math.random()*3>1){return}
  let playerId = api.getPlayerIds()
  playerId = playerId[Math.floor(playerId.length*Math.random())]
  let [x,y,z] = api.getPosition(playerId)
  y-=1;

  const below = [x, y - 1, z];
  const block = api.getBlock(below)
  if (!block.startsWith('Chest')) return;
  eval(World.Chest(below, true) ?? "")
}

World.Call.onWorldChangeBlock=(x,y,z,fromBlock,toBlock,initDbId,info)=>{
  if(info.cause=="Explosion"){return "preventChange"}
  console.log(x,y,z,fromBlock,toBlock,initDbId,info)
}

"Code Block 3 Manually Loaded"
