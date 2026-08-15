let _sbrCarry = new class{ 
  [x2, y1, z1],
  [x2, y2, z2], name
  ]);
  let wallY1 = hasFloor ? y1 + 1 : y1;
  let wallY2 = hasCeiling ? y2 - 1 : y2;
  if (wallY1 <= wallY2 && x1 + 1 <= x2 - 1) {
  rectTasks.push([
  [x1 + 1, wallY1, z1],
  [x2 - 1, wallY2, z1], name
  ]);
  rectTasks.push([
  [x1 + 1, wallY1, z2],
  [x2 - 1, wallY2, z2], name
  ]);
  }
  return rectTasks;
  }

  sbr=(...tasks)=>{
  if (tasks.length === 0) return;
  let commandList = tasks;
  while (commandList.length === 1 && Array.isArray(commandList[0])) {
  commandList = commandList[0];
  }
  if (Array.isArray(commandList[0]) && typeof commandList[0][0] === 'number') {
  commandList = [commandList];
  }
  let workQueue = [...commandList];
  while (workQueue.length > 0) {
  let task = workQueue.shift();
  if (task.length === 5) {
  workQueue.unshift(...deconstructWalls(task));
  } else {
  this.buildQueue.push(task);
  }
  }
  }

  tick1 = () => {
  for (let i = 0; i < this.MAX_OPS_PER_TICK && this.buildQueue.length > 0; i++) {
  let task = this.buildQueue.shift();
  if (!task) continue;
  try {
  if (task.length === 3 && Array.isArray(task[0])) {
  let [c1, c2, name] = task;
  let start = [Math.min(c1[0], c2[0]), Math.min(c1[1], c2[1]), Math.min(c1[2], c2[2])];
  let end = [Math.max(c1[0], c2[0]), Math.max(c1[1], c2[1]), Math.max(c1[2], c2[2])];
  let {
  dims,
  vol
  } = getVol(start, end);
  if (vol > this.MAX_RECT_VOLUME) {
  let axis = dims.indexOf(Math.max(...dims));
  let mid = start[axis] + Math.floor(dims[axis] / 2) - 1;
  let end1 = [...end];
  end1[axis] = mid;
  let start2 = [...start];
  start2[axis] = mid + 1;
  this.buildQueue.unshift([start, end1, name], [start2, end, name]);
  } else {
  api.setBlockRect(start, end, name);
  }
  } else {
  api.setBlock(...task);
  }
  } catch (e) {
  api.log("Couldn't perform task: [" + task + "]. Error: " + e.message);
  }
  }
  }
}

globalThis.sbr = _sbrCarry.sbr
globalThis.tick1 = _sbrCarry.tick1
