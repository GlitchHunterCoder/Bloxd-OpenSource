globalThis.lAdd = (board, newPlayer) => {
  let current = board.map(obj => ({ ...obj }));
  if (!newPlayer || Object.keys(newPlayer).length === 0) {
    return current;
  }
  let [newName, newScore] = Object.entries(newPlayer)[0];
  let existingIndex = current.findIndex(obj => obj.hasOwnProperty(newName));
  if (existingIndex !== -1) {
    current[existingIndex][newName] = newScore;
    return current;
  }
  if (current.length < 10) {
    current.push({ [newName]: newScore });
    return current;
  }
  let scores = current.map(obj => Object.values(obj)[0]);
  let minScore = Math.min(...scores);
  if (newScore <= minScore) {
    return current;
  }
  let lowestIndex = current.findIndex(obj => Object.values(obj)[0] === minScore);
  current.splice(lowestIndex, 1);
  current.push({ [newName]: newScore });
  return current;
};

globalThis.type = (v) => {
  return Object.prototype.toString.call(v);
}

globalThis.ErrMsg = (err) => {
  return `${err.name}: ${err.message}
${err.stack}

Please Report to @GlitchHunter `
}

globalThis.ranks=[
  ["Green Concrete","Effortless"],
  ["Yellow Concrete","Medium"],
  ["Red Concrete","Difficult"],

  ["Black Wool","Intense"],
  ["Blue Wool","Insane"],
  ["Light Blue Wool","Terrifying"],

  ["White Portal","Catastrophic"],
  ["Purple Portal","Remorseless"],
  ["Light Gray Portal","Nil"],

  ["Beacon","Beacon"],
]
