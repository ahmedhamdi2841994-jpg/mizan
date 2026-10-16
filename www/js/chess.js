/* ميزان — chess with full rules (castling, en passant, promotion) and a computer opponent */
'use strict';
const CH_ENG = (() => {
  const VAL = {p: 100, n: 320, b: 330, r: 500, q: 900, k: 0};
  const PST = {
    p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
  };
  const col = p => p ? (p === p.toUpperCase() ? 'w' : 'b') : null;
  const start = () => ({b: 'rnbqkbnrpppppppp' .split('').concat(Array(32).fill(''), 'PPPPPPPPRNBQKBNR'.split('')), turn: 'w', castle: {K: 1, Q: 1, k: 1, q: 1}, ep: -1});
  const rc = i => [i >> 3, i & 7], ix = (r, c) => r * 8 + c, on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  function attacked(b, sq, by){
    const [r, c] = rc(sq), pawnDir = by === 'w' ? 1 : -1;
    for (const dc of [-1, 1]) { const rr = r + pawnDir, cc = c + dc; if (on(rr, cc)) { const p = b[ix(rr, cc)]; if (p && col(p) === by && p.toLowerCase() === 'p') return true; } }
    for (const [dr, dc] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]) { const rr = r + dr, cc = c + dc; if (on(rr, cc)) { const p = b[ix(rr, cc)]; if (p && col(p) === by && p.toLowerCase() === 'n') return true; } }
    for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]) { let rr = r + dr, cc = c + dc, d = 1; while (on(rr, cc)) { const p = b[ix(rr, cc)]; if (p) { if (col(p) === by) { const t = p.toLowerCase(), diag = dr && dc; if (t === 'q' || (t === 'k' && d === 1) || (diag && t === 'b') || (!diag && t === 'r')) return true; } break; } rr += dr; cc += dc; d++; } }
    return false;
  }
  function pseudo(st){
    const {b, turn} = st, out = [];
    for (let i = 0; i < 64; i++) { const p = b[i]; if (!p || col(p) !== turn) continue; const t = p.toLowerCase(), [r, c] = rc(i);
      const add = (to, extra) => out.push({from: i, to, p, cap: b[to], ...extra});
      if (t === 'p') { const dir = turn === 'w' ? -1 : 1, sr = turn === 'w' ? 6 : 1, pr = turn === 'w' ? 0 : 7, r1 = r + dir;
        if (on(r1, c) && !b[ix(r1, c)]) { add(ix(r1, c), r1 === pr ? {promo: 1} : {}); if (r === sr && !b[ix(r + 2 * dir, c)]) add(ix(r + 2 * dir, c), {dbl: 1}); }
        for (const dc of [-1, 1]) { const cc = c + dc; if (!on(r1, cc)) continue; const to = ix(r1, cc); if (b[to] && col(b[to]) !== turn) add(to, r1 === pr ? {promo: 1} : {}); else if (to === st.ep) add(to, {epCap: ix(r, cc)}); } }
      else if (t === 'n' || t === 'k') { const ds = t === 'n' ? [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]] : [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]; for (const [dr, dc] of ds) { const rr = r + dr, cc = c + dc; if (on(rr, cc) && col(b[ix(rr, cc)]) !== turn) add(ix(rr, cc)); }
        if (t === 'k') { const opp = turn === 'w' ? 'b' : 'w', home = turn === 'w' ? 60 : 4; if (i === home && !attacked(b, i, opp)) { const K = turn === 'w' ? 'K' : 'k', Q = turn === 'w' ? 'Q' : 'q';
          if (st.castle[K] && !b[i + 1] && !b[i + 2] && b[i + 3]?.toLowerCase() === 'r' && !attacked(b, i + 1, opp) && !attacked(b, i + 2, opp)) add(i + 2, {castle: 'k'});
          if (st.castle[Q] && !b[i - 1] && !b[i - 2] && !b[i - 3] && b[i - 4]?.toLowerCase() === 'r' && !attacked(b, i - 1, opp) && !attacked(b, i - 2, opp)) add(i - 2, {castle: 'q'}); } } }
      else { const ds = t === 'b' ? [[1,1],[1,-1],[-1,1],[-1,-1]] : t === 'r' ? [[1,0],[-1,0],[0,1],[0,-1]] : [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dr, dc] of ds) { let rr = r + dr, cc = c + dc; while (on(rr, cc)) { const q = b[ix(rr, cc)]; if (q) { if (col(q) !== turn) add(ix(rr, cc)); break; } add(ix(rr, cc)); rr += dr; cc += dc; } } } }
    return out;
  }
  function make(st, m){
    const b = st.b.slice(), turn = st.turn, castle = {...st.castle};
    b[m.to] = m.promo ? (turn === 'w' ? 'Q' : 'q') : m.p; b[m.from] = '';
    if (m.epCap !== undefined) b[m.epCap] = '';
    if (m.castle === 'k') { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = ''; } if (m.castle === 'q') { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = ''; }
    if (m.p === 'K') castle.K = castle.Q = 0; if (m.p === 'k') castle.k = castle.q = 0;
    [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']].forEach(([sq, k]) => { if (m.from === sq || m.to === sq) castle[k] = 0; });
    return {b, turn: turn === 'w' ? 'b' : 'w', castle, ep: m.dbl ? (m.from + m.to) / 2 : -1};
  }
  const kingSq = (b, c) => b.indexOf(c === 'w' ? 'K' : 'k');
  const inCheck = (st, c) => attacked(st.b, kingSq(st.b, c), c === 'w' ? 'b' : 'w');
  const legal = st => pseudo(st).filter(m => !inCheck(make(st, m), st.turn));
  function evalBoard(b){ let s = 0; for (let i = 0; i < 64; i++) { const p = b[i]; if (!p) continue; const t = p.toLowerCase(); if (col(p) === 'w') s += VAL[t] + PST[t][i]; else s -= VAL[t] + PST[t][(7 - (i >> 3)) * 8 + (i & 7)]; } return s; }
  function search(st, depth, alpha, beta){
    const moves = legal(st);
    if (!moves.length) return inCheck(st, st.turn) ? -100000 - depth : 0;
    if (depth === 0) { const e = evalBoard(st.b); return st.turn === 'w' ? e : -e; }
    moves.sort((a, b) => (b.cap ? VAL[b.cap.toLowerCase()] * 10 - VAL[b.p.toLowerCase()] : 0) - (a.cap ? VAL[a.cap.toLowerCase()] * 10 - VAL[a.p.toLowerCase()] : 0));
    for (const m of moves) { const v = -search(make(st, m), depth - 1, -beta, -alpha); if (v >= beta) return beta; if (v > alpha) alpha = v; }
    return alpha;
  }
  function best(st, level){
    const moves = shuffle(legal(st)); if (!moves.length) return null;
    if (level === 1 && Math.random() < 0.35) return moves[0];
    const depth = level === 1 ? 1 : level === 2 ? 2 : 3; let bestM = moves[0], bv = -Infinity;
    for (const m of moves) { const v = -search(make(st, m), depth - 1, -Infinity, -bv); if (v > bv) { bv = v; bestM = m; } }
    return bestM;
  }
  return {start, legal, make, inCheck, best, col};
})();
GAMES.chess = area => {
  const G = {st: CH_ENG.start(), hist: [], sel: -1, last: null, level: S.games.chess?.level || 2, me: 'w', thinking: false, over: ''};
  const glyph = {k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'};
  const status = () => { const lg = CH_ENG.legal(G.st); if (!lg.length) return CH_ENG.inCheck(G.st, G.st.turn) ? (G.st.turn === G.me ? L('كش مات! الكمبيوتر كسب', 'Checkmate! The computer wins') : L('كش مات! إنت كسبت 🏆', 'Checkmate! You win 🏆')) : L('تعادل (مفيش حركات)', 'Stalemate'); if (G.st.b.filter(Boolean).length === 2) return L('تعادل', 'Draw'); return ''; };
  const draw = () => {
    const legalFrom = G.sel >= 0 ? CH_ENG.legal(G.st).filter(m => m.from === G.sel).map(m => m.to) : [];
    const order = G.me === 'w' ? [...Array(64).keys()] : [...Array(64).keys()].reverse();
    const chk = CH_ENG.inCheck(G.st, G.st.turn);
    area.innerHTML = `<div class="row" style="justify-content:center"><div class="seg">${[1, 2, 3].map(l => `<button type="button" data-clv="${l}" aria-pressed="${l === G.level}">${[L('مبتدئ', 'Easy'), L('متوسط', 'Medium'), L('قوي', 'Strong')][l - 1]}</button>`).join('')}</div><button class="btn ghost sm" type="button" id="cNew">${L('دور جديد', 'New game')}</button><button class="btn ghost sm" type="button" id="cSide">${G.me === 'w' ? L('العب بالأسود', 'Play black') : L('العب بالأبيض', 'Play white')}</button><button class="btn ghost sm" type="button" id="cUndo" ${G.hist.length < 2 ? 'disabled' : ''}>${L('رجوع حركة', 'Undo')}</button></div>
    <div class="board">${order.map(i => { const p = G.st.b[i], r = i >> 3, c = i & 7; return `<button type="button" data-sq="${i}" class="${(r + c) % 2 ? 'dk' : 'lt'} ${i === G.sel ? 'sel' : ''} ${legalFrom.includes(i) ? 'hint' : ''} ${G.last && (G.last.from === i || G.last.to === i) ? 'last' : ''}"><span class="${CH_ENG.col(p) === 'w' ? 'pw' : 'pb'}">${p ? glyph[p.toLowerCase()] : ''}</span></button>`; }).join('')}</div>
    <p class="pill ${G.over ? 'fire' : chk ? 'red' : 'grey'}" style="margin:0">${G.over || (G.thinking ? L('الكمبيوتر بيفكر…', 'Computer is thinking…') : chk ? L('كش!', 'Check!') : G.st.turn === G.me ? L('دورك', 'Your move') : '')}</p>`;
    area.querySelectorAll('[data-sq]').forEach(b => b.onclick = () => click(+b.dataset.sq));
    area.querySelectorAll('[data-clv]').forEach(b => b.onclick = () => { G.level = +b.dataset.clv; (S.games.chess ||= {}).level = G.level; store.save(); draw(); });
    $('#cNew').onclick = () => reset(G.me); $('#cSide').onclick = () => reset(G.me === 'w' ? 'b' : 'w');
    $('#cUndo').onclick = () => { if (G.thinking) return; G.st = G.hist[G.hist.length - 2]; G.hist.length -= 2; G.last = null; G.over = ''; G.sel = -1; draw(); };
  };
  const play = m => { G.hist.push(G.st); G.st = CH_ENG.make(G.st, m); G.last = m; beep(m.cap ? 420 : 560, .04, 1); G.over = status(); if (G.over) { if (G.over.includes('🏆')) { const w = (S.games.chess.wins || 0) + 1; S.games.chess.wins = w; setBest(w); } } };
  const aiTurn = () => { if (G.over || G.st.turn === G.me) return; G.thinking = true; draw(); setTimeout(() => { const m = CH_ENG.best(G.st, G.level); G.thinking = false; if (m) play(m); draw(); }, 60); };
  const click = i => { if (G.over || G.thinking || G.st.turn !== G.me) return; const p = G.st.b[i];
    if (G.sel >= 0) { const m = CH_ENG.legal(G.st).find(x => x.from === G.sel && x.to === i); if (m) { G.sel = -1; play(m); draw(); setTimeout(aiTurn, 120); return; } }
    G.sel = p && CH_ENG.col(p) === G.me ? i : -1; draw(); };
  const reset = side => { G.st = CH_ENG.start(); G.hist = []; G.sel = -1; G.last = null; G.over = ''; G.me = side; S.games.chess ||= {}; draw(); if (side === 'b') setTimeout(aiTurn, 200); };
  reset('w'); return () => {};
};
