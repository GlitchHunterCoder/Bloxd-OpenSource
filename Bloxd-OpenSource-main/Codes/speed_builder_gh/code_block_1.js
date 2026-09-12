// use this for block placing, sbr is replacement for block placing
(globalThis.sbr = function(...e) {
  e.length > 0 && sbr.rawInputQueue.push(e)
}).rawInputQueue = [], sbr.buildQueue = [], sbr.rateLimitCooldown = 0, sbr.SPECIAL_BLOCK_IDS = new Set([204, 205, 206, 207, 952, 953, 954, 955, 1291, 1292, 1293, 1294, 1510, 2088, 2089, 2090, 2091]), sbr.MAX_RECT_VOLUME = 360, sbr.TICK_BUDGET = 150, sbr.COST_SCAN_BLOCK = .5, sbr.COST_SCAN_DATA = .7, sbr.COST_BUILD_RECT = 10, sbr.COST_BUILD_DATA = 1, sbr.COST_SPLIT_RECT = 2, sbr.COST_CHUNK_CHECK = 8, sbr.free = function() {
  return 0 === sbr.rawInputQueue.length && 0 === sbr.buildQueue.length
}, sbr.kill = function() {
  sbr.rawInputQueue = [], sbr.buildQueue = []
}, sbr.getVol = function(e, t) {
  let l = [t[0] - e[0] + 1, t[1] - e[1] + 1, t[2] - e[2] + 1];
  return {
    dims: l,
    vol: l[0] * l[1] * l[2]
  }
}, sbr.deconstructWalls = function(e) {
  let [t, l, $, u, s] = e, n = [], i = Math.min(t[0], l[0]), o = Math.min(t[1], l[1]), a = Math.min(t[2], l[2]), r = Math.max(t[0], l[0]), _ = Math.max(t[1], l[1]), c = Math.max(t[2], l[2]);
  u && n.push([
    [i, o, a],
    [r, o, c], $
  ]), s && n.push([
    [i, _, a],
    [r, _, c], $
  ]), n.push([
    [i, o, a],
    [i, _, c], $
  ]), n.push([
    [r, o, a],
    [r, _, c], $
  ]);
  let C = u ? o + 1 : o,
    T = s ? _ - 1 : _;
  return C <= T && i + 1 <= r - 1 && (n.push([
    [i + 1, C, a],
    [r - 1, T, a], $
  ]), n.push([
    [i + 1, C, c],
    [r - 1, T, c], $
  ])), n
}, sbr.checkAndLoadChunks = function(e, t) {
  let l = [Math.min(e[0], t[0]), Math.min(e[1], t[1]), Math.min(e[2], t[2])],
    $ = [Math.max(e[0], t[0]), Math.max(e[1], t[1]), Math.max(e[2], t[2])],
    u = !0;
  for(let s = l[0]; s <= $[0]; s += 32)
    for(let n = l[1]; n <= $[1]; n += 32)
      for(let i = l[2]; i <= $[2]; i += 32) api.isBlockInLoadedChunk(s, n, i) || (api.getBlockId(s, n, i), u = !1);
  return u
}, sbr.getTaskRange = function(e) {
  return e ? "gclone" === e[0] || "rect_with_data" === e[0] ? [e[1], e[2]] : 3 === e.length && Array.isArray(e[0]) ? [e[0], e[1]] : 2 === e.length && Array.isArray(e[0]) ? [e[0], e[0]] : [e.slice(0, 3), e.slice(0, 3)] : [
    [0, 0, 0],
    [0, 0, 0]
  ]
}, sbr.tick = function() {
  if(sbr.rateLimitCooldown > 0) {
    sbr.rateLimitCooldown--;
    return
  }
  let e = 0;
  for(; sbr.rawInputQueue.length > 0 && e < 50;) {
    e++;
    let t = sbr.rawInputQueue.shift();
    for(; 1 === t.length && Array.isArray(t[0]);) t = t[0];
    t.length > 0 && (!Array.isArray(t[0]) || Array.isArray(t[0]) && !Array.isArray(t[0][0])) && (t = [t]);
    for(let l = 0; l < t.length; l++) {
      let $ = t[l];
      if($ && Array.isArray($)) {
        if(5 === $.length && "boolean" == typeof $[3]) {
          let u = sbr.deconstructWalls($);
          t.splice(l, 1, ...u), l--
        } else 4 === $.length && $.every(e => Array.isArray(e)) ? sbr.buildQueue.push(["gclone", ...$, {
          scanPos: null,
          run: null
        }]) : sbr.buildQueue.push($)
      }
    }
  }
  let s = sbr.TICK_BUDGET,
    n = 0;
  for(; s > 0 && sbr.buildQueue.length > 0 && n < 1e3;) {
    n++;
    let i = sbr.buildQueue[0],
      [o, a] = sbr.getTaskRange(i);
    if(!sbr.checkAndLoadChunks(o, a)) {
      s -= sbr.COST_CHUNK_CHECK;
      for(let r = 1; r < Math.min(sbr.buildQueue.length, 15) && s >= sbr.COST_CHUNK_CHECK; r++) {
        let [_, c] = sbr.getTaskRange(sbr.buildQueue[r]);
        sbr.checkAndLoadChunks(_, c), s -= sbr.COST_CHUNK_CHECK
      }
      break
    }
    try {
      if("gclone" === i[0]) {
        let [C, T, f, h, d, A] = i, g = [Math.min(T[0], f[0]), Math.min(T[1], f[1]), Math.min(T[2], f[2])], m = [Math.max(T[0], f[0]), Math.max(T[1], f[1]), Math.max(T[2], f[2])], k = [m[0] - g[0] + 1, m[1] - g[1] + 1, m[2] - g[2] + 1], S = [h[0] - T[0], h[1] - T[1], h[2] - T[2]];
        null === A.scanPos && (A.scanPos = [0, 0, 0], A.run = {
          startPos: [0, 0, 0],
          blockType: api.getBlockId(g[0], g[1], g[2])
        });
        let b = !1;
        for(; s >= sbr.COST_SCAN_BLOCK;) {
          s -= sbr.COST_SCAN_BLOCK;
          let [p, L, O] = A.scanPos, B = api.getBlockId(g[0] + p, g[1] + L, g[2] + O);
          if(B !== A.run.blockType || p === k[0] - 1) {
            let I = A.run.startPos,
              D = B !== A.run.blockType ? p - 1 : p,
              Q = A.run.blockType;
            if(Q && 0 !== Q) {
              let P = [g[0] + I[0] + S[0], g[1] + L + S[1], g[2] + O + S[2]],
                y = [g[0] + D + S[0], g[1] + L + S[1], g[2] + O + S[2]];
              if(sbr.SPECIAL_BLOCK_IDS.has(Q)) {
                let E = [];
                for(let U = I[0]; U <= D && s >= sbr.COST_SCAN_DATA; U++) s -= sbr.COST_SCAN_DATA, E.push(api.getBlockData(g[0] + U, g[1] + L, g[2] + O));
                sbr.buildQueue.splice(1, 0, ["rect_with_data", P, y, String(Q), E, 0])
              } else sbr.buildQueue.splice(1, 0, [P, y, String(Q)])
            }
            A.run = {
              startPos: [p, L, O],
              blockType: B
            }
          }
          if(A.scanPos[0]++, A.scanPos[0] >= k[0] && (A.scanPos[0] = 0, A.scanPos[1]++, A.scanPos[1] >= k[1] && (A.scanPos[1] = 0, A.scanPos[2]++), A.scanPos[2] < k[2] && (A.run = {
              startPos: [...A.scanPos],
              blockType: api.getBlockId(g[0], g[1] + A.scanPos[1], g[2] + A.scanPos[2])
            })), A.scanPos[2] >= k[2]) {
            b = !0;
            break
          }
        }
        b && sbr.buildQueue.shift()
      } else if("rect_with_data" === i[0]) {
        let [w, K, x, R, N, H] = i;
        0 === H && (api.setBlockRect(K, x, R), s -= sbr.COST_BUILD_RECT);
        let M = H;
        for(; s >= sbr.COST_BUILD_DATA && M < N.length;) s -= sbr.COST_BUILD_DATA, null !== N[M] && api.setBlockData(K[0] + M, K[1], K[2], N[M]), M++;
        M >= N.length ? sbr.buildQueue.shift() : i[5] = M
      } else if(3 === i.length && Array.isArray(i[0])) {
        let [V, v, G] = i, W = [Math.min(V[0], v[0]), Math.min(V[1], v[1]), Math.min(V[2], v[2])], X = [Math.max(V[0], v[0]), Math.max(V[1], v[1]), Math.max(V[2], v[2])], {
          dims: j,
          vol: q
        } = sbr.getVol(W, X);
        if(q > sbr.MAX_RECT_VOLUME) {
          let z = j.indexOf(Math.max(...j)),
            F = W[z] + Math.floor(j[z] / 2) - 1,
            J = [...X];
          J[z] = F;
          let Y = [...W];
          Y[z] = F + 1, sbr.buildQueue.splice(0, 1, [W, J, G], [Y, X, G]), s -= sbr.COST_SPLIT_RECT
        } else api.setBlockRect(W, X, String(G)), sbr.buildQueue.shift(), s -= sbr.COST_BUILD_RECT
      } else if(2 === i.length && Array.isArray(i[0])) api.setBlockData(i[0][0], i[0][1], i[0][2], i[1]), sbr.buildQueue.shift(), s -= sbr.COST_BUILD_DATA;
      else if(4 !== i.length || Array.isArray(i[0])) sbr.buildQueue.shift();
      else {
        let Z = i[3];
        "object" == typeof Z && null !== Z ? (api.setBlockData(i[0], i[1], i[2], Z), s -= sbr.COST_BUILD_DATA) : (api.setBlock(i[0], i[1], i[2], String(Z)), s -= sbr.COST_BUILD_RECT / 10), sbr.buildQueue.shift()
      }
    } catch (ee) {
      let et = ee.message ? ee.message.toLowerCase() : "";
      if(et.includes("rate limit")) sbr.rateLimitCooldown = 5;
      else if(et.includes("interrupted")) break;
      else api.log("sbr error: " + ee.message), sbr.buildQueue.shift()
    }
  }
};

// allowed list (disabled)
globalThis.devs=["The_Bloxd_Pro___","GlitchHunter","Wafferss","LeKroete93","MisterCasino","the_EliteOne","maffers","Tom","Aspect_SGK","Mafferss","delfineonx","T_Calabaza_T","4FK_D7L4N_ZZ","_Grax_","Schneekater","Arthur","Holland49","_Nijaxxu_Z","Ocelote","hospitals","Piles","WiT_Lava"]


globalThis.Inf = Number.MAX_VALUE //infinity used for owner rank

"Code Block 1 Done" //debug helper, keep this here, same for all
