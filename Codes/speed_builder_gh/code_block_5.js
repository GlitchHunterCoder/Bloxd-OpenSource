//handles all the score display short term
globalThis.Score = new class {
  constructor(){
    this.playerWins = {}
    this.playerLoss = {}
    this.playerCoins = {}
  }
  
  addPlayer(playerId){
    let device = api.isMobile(playerId)?
      Emoji.Mobile+" Mobile":
      Emoji.PC+" PC/Laptop"
    const playerName = api.getEntityName(playerId)
    const [wins,loss,coins] = ["win","loss","coins"].map(e=>{
      let score = vvt.getStoredValue(playerId,e)
      if(score == void 0){vvt.setStoredValue(playerId,e,0);score=0}
      return score
    })
    const dbid = api.getPlayerDbId(playerId)
    this.playerWins[dbid] = [playerName, wins]
    this.playerLoss[dbid] = [playerName, loss]
    this.playerCoins[dbid] = [playerName, coins]
    api.setTargetedPlayerSettingForEveryone(playerId, "lobbyLeaderboardValues", {
      dv: device,
      name: playerName,
      wins: wins.toString(),
      lost: loss.toString(),
      coins: coins.toString(),
      sortPriority: 0
    })
    
    api.setClientOption(playerId, "lobbyLeaderboardInfo", {
      dv: {
        displayName: [{ str: "Device", style: { color: "white" } }],
        sortPriority: 0
      },
      name: {
        displayName: [{icon:"hammer", style: { color: "cyan" } }, { str: " Builder", style: { color: "white" } }],
        sortPriority: 0
      },
      wins: {
        displayName: [{ icon: "Gold Trophy" }, { str: " Wins" }],
        sortPriority: -2
      },
      lost: {
        displayName: [{ icon: "x", style: { color: "red" } }, { str: " Lost Games" }],
        sortPriority: -4
      },
      coins: {
        displayName: [{ icon: "Gold Coin"}, { str: " Gold" }],
        sortPriority: -6
      }
    })
  }

  addWin(playerId, amount = 1) {
    const dbid = api.getPlayerDbId(playerId)
    const name = api.getEntityName(playerId)
    if (!this.playerWins[dbid]){
      this.playerWins[dbid] = [name, vvt.getStoredValue(playerId, "win")]
    }
    this.playerWins[dbid][0] = name
    this.playerWins[dbid][1] += amount
    vvt.setStoredValue(playerId, "win", this.playerWins[dbid][1])
    this.updateLeaderboard(playerId)
  }
  
  addLoss(playerId, amount = 1) {
    const dbid = api.getPlayerDbId(playerId)
    const name = api.getEntityName(playerId)
    if (!this.playerLoss[dbid]){
      this.playerLoss[dbid] = [name, vvt.getStoredValue(playerId, "loss")]
    }
    this.playerLoss[dbid][0] = name
    this.playerLoss[dbid][1] += amount
    vvt.setStoredValue(playerId, "loss", this.playerLoss[dbid][1])
    this.updateLeaderboard(playerId)
  }

  addCoins(playerId, amount = 1) {
    const dbid = api.getPlayerDbId(playerId)
    const name = api.getEntityName(playerId)
    if (!this.playerCoins[dbid]){
      this.playerCoins[dbid] = [name, vvt.getStoredValue(playerId, "coins")]
    }
    this.playerCoins[dbid][0] = name
    this.playerCoins[dbid][1] += amount
    vvt.setStoredValue(playerId, "coins", this.playerCoins[dbid][1])
    this.updateLeaderboard(playerId)
  }
  
  updateLeaderboard(playerId) {
    const dbid = api.getPlayerDbId(playerId)
    const [name, wins] = this.playerWins[dbid] || [api.getEntityName(playerId), 0]
    const [, loss] = this.playerLoss[dbid] || [api.getEntityName(playerId), 0]
    const [, coins] = this.playerCoins[dbid] || [api.getEntityName(playerId), 0]
    api.setTargetedPlayerSettingForEveryone(playerId, "lobbyLeaderboardValues", {
      wins: wins.toString(),
      lost: loss.toString(),
      coins: coins.toString(),
      sortPriority: 0
    })
  }
}

"Code Block 5 Done"
