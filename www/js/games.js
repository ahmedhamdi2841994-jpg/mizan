/* ميزان — games: brain games + original arcade games (all made for this app) */
'use strict';
const GAME_LIST = [
  {id: 'chess', g: 'brain', ic: '♞', n: {ar: 'شطرنج', en: 'Chess'}, d: {ar: 'ضد الكمبيوتر بـ3 مستويات', en: 'Versus the computer, 3 levels'}},
  {id: 'sudoku', g: 'brain', ic: '9', n: {ar: 'سودوكو', en: 'Sudoku'}, d: {ar: 'سهل ومتوسط وصعب', en: 'Easy, medium, hard'}},
  {id: 'g2048', g: 'brain', ic: '2⁴', n: {ar: '2048', en: '2048'}, d: {ar: 'اجمع الأرقام لحد 2048', en: 'Merge tiles up to 2048'}},
  {id: 'memory', g: 'brain', ic: '🃏', n: {ar: 'الذاكرة', en: 'Memory'}, d: {ar: 'افتح الكروت المتشابهة', en: 'Match the pairs'}},
  {id: 'math', g: 'brain', ic: '±', n: {ar: 'حساب سريع', en: 'Math sprint'}, d: {ar: 'أكبر عدد إجابات في 60 ثانية', en: 'Most answers in 60 seconds'}},
  {id: 'puzzle15', g: 'brain', ic: '15', n: {ar: 'لغز الأرقام', en: '15 puzzle'}, d: {ar: 'رتّب الأرقام من 1 لـ 15', en: 'Order the tiles 1 to 15'}},
  {id: 'simon', g: 'brain', ic: '◐', n: {ar: 'ذاكرة الألوان', en: 'Color memory'}, d: {ar: 'كرّر ترتيب الألوان', en: 'Repeat the color sequence'}},
  {id: 'penalty', g: 'arcade', ic: '⚽', n: {ar: 'ضربات جزاء', en: 'Penalty shootout'}, d: {ar: 'اختار مكان الشوطة واغلب الحارس', en: 'Pick your spot and beat the keeper'}},
  {id: 'runner', g: 'arcade', ic: '🏃', n: {ar: 'جري وقفز', en: 'Runner'}, d: {ar: 'اقفز فوق العقبات', en: 'Jump the obstacles'}},
  {id: 'arm', g: 'arcade', ic: '💪', n: {ar: 'مصارعة الذراعين', en: 'Arm wrestling'}, d: {ar: 'اضغط بسرعة واغلب الخصم', en: 'Tap fast to win'}},
  {id: 'maze', g: 'arcade', ic: '🤖', n: {ar: 'متاهة الروبوت', en: 'Robot maze'}, d: {ar: 'اجمع كل النقط وابعد عن الدرونز', en: 'Collect every dot, dodge the drones'}},
  {id: 'breakout', g: 'arcade', ic: '🧱', n: {ar: 'تكسير الطوب', en: 'Brick breaker'}, d: {ar: 'كسّر كل الطوب بالكورة', en: 'Smash every brick'}},
  {id: 'snake', g: 'arcade', ic: '🐍', n: {ar: 'الثعبان', en: 'Snake'}, d: {ar: 'كُل وكبّر من غير ما تخبط', en: 'Eat and grow without crashing'}}
];
const GAMES = {};
let GV = null, GSTOP = null;
const best = (id, v, lower) => { S.games[id] ||= {}; const b = S.games[id].best; if (v !== undefined && (b === undefined || (lower ? v < b : v > b))) { S.games[id].best = v; store.save(); return true; } return false; };
registerView('games', {title: {ar: 'الألعاب', en: 'Games'}, icon: 'games', render(){
  if (GV) { const g = GAME_LIST.find(x => x.id === GV); return `<div class="topbar"><div class="grow"><div class="eyebrow">${esc(LX(g.d))}</div><h1>${esc(LX(g.n))}</h1></div><div class="row"><span class="pill fire">${L('أفضل نتيجة', 'Best')}: <span id="gBest">${S.games[GV]?.best ?? '—'}</span></span><button class="btn ghost sm" type="button" id="gBack">${L('كل الألعاب', 'All games')}</button></div></div><div class="card game-wrap" id="gArea"></div>`; }
  const sec = (k, t) => `<div class="card"><div class="head"><h2>${t}</h2></div><div class="tiles">${GAME_LIST.filter(g => g.g === k).map(g => `<button class="tile" type="button" data-game="${g.id}"><span class="ico" style="font-size:1.4rem;font-family:var(--font-display)">${g.ic}</span><b>${esc(LX(g.n))}</b><span>${esc(LX(g.d))}</span>${S.games[g.id]?.best !== undefined ? `<span class="chip">${L('أفضل', 'Best')}: <b>${S.games[g.id].best}</b></span>` : ''}</button>`).join('')}</div></div>`;
  return topbar(L('الألعاب', 'Games'), L('وقت التسلية · كل الألعاب أصلية ومعمولة للتطبيق', 'Downtime · every game is original and made for this app'), '', true) + sec('brain', L('ألعاب العقل والذكاء', 'Brain games')) + sec('arcade', L('ألعاب زمان', 'Arcade classics'));
}, after(){ if (GV) { GSTOP && GSTOP(); GSTOP = GAMES[GV]($('#gArea')) || null; } }, leave(){ GSTOP && GSTOP(); GSTOP = null; GV = null; }});
on('click', e => {
  const g = e.target.closest('[data-game]'); if (g) { GV = g.dataset.game; render(); window.scrollTo({top: 0}); return true; }
  if (e.target.id === 'gBack') { GSTOP && GSTOP(); GSTOP = null; GV = null; render(); return true; }
});
const setBest = (v, lower) => { if (best(GV, v, lower)) { const el = $('#gBest'); if (el) el.textContent = v; toast(L('رقم قياسي جديد! 🏆', 'New best! 🏆')); } };
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- canvas helper ---------- */
function makeCanvas(area, w, h, wide){
  area.innerHTML = `<div class="row" style="justify-content:center;gap:18px"><span class="pill grey" id="gInfo"></span></div><canvas class="game ${wide ? 'wide' : ''}" width="${w}" height="${h}" tabindex="0"></canvas><p class="muted small" id="gHelp" style="text-align:center;margin:0"></p>`;
  const cv = area.querySelector('canvas'), ctx = cv.getContext('2d');
  const pos = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * w, y: (e.clientY - r.top) / r.height * h}; };
  return {cv, ctx, pos, info: t => { $('#gInfo').textContent = t; }, help: t => { $('#gHelp').textContent = t; }};
}
function loop(fn){ let id, last = performance.now(), on = true; const f = t => { if (!on) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt); id = requestAnimationFrame(f); }; id = requestAnimationFrame(f); return () => { on = false; cancelAnimationFrame(id); }; }
function keys(handler){ const k = e => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault(); handler(e.key); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }
function swipe(el, handler){ let sx, sy; const s = e => { sx = e.clientX; sy = e.clientY; }, u = e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) handler(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp')); sx = null; }; el.addEventListener('pointerdown', s); el.addEventListener('pointerup', u); return () => { el.removeEventListener('pointerdown', s); el.removeEventListener('pointerup', u); }; }
const C = {bg: '#0e1318', grid: '#1a2330', fire: '#ff7a2f', gold: '#ffc23d', teal: '#2fd3b5', ink: '#eef2f6', mute: '#6f7c8b', bad: '#ff5d68', blue: '#5aa9ff', violet: '#9b8cff'};
function centerText(ctx, w, h, lines){ ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; lines.forEach((t, i) => { ctx.font = (i ? '500 18px ' : '800 30px ') + 'Alexandria, sans-serif'; ctx.fillText(t, w / 2, h / 2 - 10 + i * 34); }); }

/* ---------- Snake ---------- */
GAMES.snake = area => {
  const N = 20, S0 = 24, W = N * S0, {cv, ctx, info, help} = makeCanvas(area, W, W, true); cv.style.aspectRatio = '1'; cv.style.maxWidth = '480px';
  let sn, dir, nd, food, score, over, acc, speed, started;
  const reset = () => { sn = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}]; dir = nd = {x: 1, y: 0}; score = 0; over = false; acc = 0; speed = 7; started = false; place(); };
  const place = () => { do { food = {x: rnd(N), y: rnd(N)}; } while (sn.some(p => p.x === food.x && p.y === food.y)); };
  const turn = k => { started = true; if (over) { reset(); return; } const m = {ArrowUp: {x: 0, y: -1}, ArrowDown: {x: 0, y: 1}, ArrowLeft: {x: -1, y: 0}, ArrowRight: {x: 1, y: 0}}[k]; if (m && (m.x !== -dir.x || m.y !== -dir.y)) nd = m; };
  reset(); help(L('اسحب بصباعك أو استخدم الأسهم', 'Swipe or use the arrow keys'));
  const offK = keys(turn), offS = swipe(cv, turn);
  const stop = loop(dt => {
    if (started && !over) { acc += dt; if (acc > 1 / speed) { acc = 0; dir = nd; const h = {x: sn[0].x + dir.x, y: sn[0].y + dir.y};
      if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || sn.some(p => p.x === h.x && p.y === h.y)) { over = true; setBest(score); beep(200, .3, 1); }
      else { sn.unshift(h); if (h.x === food.x && h.y === food.y) { score++; speed = Math.min(16, 7 + score * 0.35); place(); beep(880, .05, 1); } else sn.pop(); } } }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, W);
    ctx.fillStyle = C.grid; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) ctx.fillRect(i * S0, j * S0, S0, S0);
    ctx.fillStyle = C.fire; ctx.beginPath(); ctx.arc(food.x * S0 + S0 / 2, food.y * S0 + S0 / 2, S0 / 2.6, 0, 7); ctx.fill();
    sn.forEach((p, i) => { ctx.fillStyle = i ? C.teal : C.gold; ctx.fillRect(p.x * S0 + 2, p.y * S0 + 2, S0 - 4, S0 - 4); });
    info(L('النقط: ', 'Score: ') + score);
    if (!started) centerText(ctx, W, W, [L('الثعبان', 'Snake'), L('اسحب أو دوس سهم للبدء', 'Swipe or press an arrow')]);
    if (over) centerText(ctx, W, W, [L('خسرت!', 'Game over'), L(`النتيجة ${score} · اسحب للعب تاني`, `Score ${score} · swipe to replay`)]);
  });
  return () => { stop(); offK(); offS(); };
};

/* ---------- Breakout ---------- */
GAMES.breakout = area => {
  const W = 480, H = 640, {cv, ctx, pos, info, help} = makeCanvas(area, W, H);
  let px, ball, bricks, score, lives, state, level;
  const build = () => { bricks = []; const cols = 8, rows = 5 + Math.min(3, level - 1); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) bricks.push({x: 16 + c * 56, y: 70 + r * 24, w: 50, h: 18, hp: r < 2 && level > 1 ? 2 : 1, col: [C.bad, C.fire, C.gold, C.teal, C.blue, C.violet, C.fire, C.gold][r]}); };
  const serve = () => { ball = {x: W / 2, y: H - 80, vx: (Math.random() < .5 ? -1 : 1) * 190, vy: -(330 + level * 30), r: 8}; state = 'ready'; };
  const reset = () => { px = W / 2; score = 0; lives = 3; level = 1; build(); serve(); };
  reset(); help(L('حرّك صباعك أو الماوس لتحت، ودوس علشان تبدأ', 'Move your finger or mouse; tap to launch'));
  const mv = e => { px = Math.max(50, Math.min(W - 50, pos(e).x)); }, tap = () => { if (state === 'ready') state = 'play'; else if (state === 'over' || state === 'win') reset(); };
  cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', e => { mv(e); tap(); });
  const offK = keys(k => { if (k === 'ArrowLeft') px = Math.max(50, px - 40); if (k === 'ArrowRight') px = Math.min(W - 50, px + 40); if (k === ' ') tap(); });
  const stop = loop(dt => {
    if (state === 'ready') { ball.x = px; ball.y = H - 50; }
    if (state === 'play') {
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < ball.r || ball.x > W - ball.r) { ball.vx *= -1; ball.x = Math.max(ball.r, Math.min(W - ball.r, ball.x)); }
      if (ball.y < ball.r) { ball.vy = Math.abs(ball.vy); }
      if (ball.y > H - 46 && ball.y < H - 30 && Math.abs(ball.x - px) < 56 && ball.vy > 0) { const off = (ball.x - px) / 56; const sp = Math.hypot(ball.vx, ball.vy); ball.vx = sp * off * 0.85; ball.vy = -Math.sqrt(Math.max(1, sp * sp - ball.vx * ball.vx)); beep(520, .03, 1); }
      for (const b of bricks) if (b.hp > 0 && ball.x > b.x - ball.r && ball.x < b.x + b.w + ball.r && ball.y > b.y - ball.r && ball.y < b.y + b.h + ball.r) { b.hp--; score += 10; const ox = Math.min(Math.abs(ball.x - b.x), Math.abs(ball.x - b.x - b.w)), oy = Math.min(Math.abs(ball.y - b.y), Math.abs(ball.y - b.y - b.h)); if (ox < oy) ball.vx *= -1; else ball.vy *= -1; beep(760, .03, 1); break; }
      if (ball.y > H + 20) { lives--; if (lives <= 0) { state = 'over'; setBest(score); } else serve(); }
      if (bricks.every(b => b.hp <= 0)) { level++; build(); serve(); }
    }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    bricks.forEach(b => { if (b.hp > 0) { ctx.fillStyle = b.col; ctx.globalAlpha = b.hp > 1 ? 1 : .85; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.globalAlpha = 1; } });
    ctx.fillStyle = C.ink; ctx.fillRect(px - 50, H - 40, 100, 12);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, 7); ctx.fill();
    info(`${L('النقط', 'Score')}: ${score} · ${L('المحاولات', 'Lives')}: ${lives} · ${L('المرحلة', 'Level')}: ${level}`);
    if (state === 'over') centerText(ctx, W, H, [L('انتهت اللعبة', 'Game over'), L(`النتيجة ${score} · دوس للعب تاني`, `Score ${score} · tap to replay`)]);
  });
  return () => { stop(); offK(); };
};

/* ---------- Runner ---------- */
GAMES.runner = area => {
  const W = 640, H = 360, {cv, ctx, info, help} = makeCanvas(area, W, H, true); cv.style.aspectRatio = '16/9'; cv.style.maxWidth = '720px';
  const G = 290; let y, vy, obs, speed, dist, state, t, legs;
  const reset = () => { y = G; vy = 0; obs = []; speed = 300; dist = 0; state = 'ready'; t = 1.2; legs = 0; };
  const jump = () => { if (state === 'ready') state = 'play'; else if (state === 'over') reset(); else if (y >= G) { vy = -620; beep(600, .04, 1); } };
  reset(); help(L('دوس على الشاشة أو المسافة للقفز', 'Tap or press space to jump'));
  cv.addEventListener('pointerdown', jump); const offK = keys(k => { if (k === ' ' || k === 'ArrowUp') jump(); });
  const stop = loop(dt => {
    if (state === 'play') {
      speed += dt * 8; dist += speed * dt / 10; legs += dt * speed / 40;
      vy += 1800 * dt; y = Math.min(G, y + vy * dt); if (y >= G) vy = 0;
      t -= dt; if (t <= 0) { const tall = Math.random() < .35; obs.push({x: W + 20, w: tall ? 22 : 30, h: tall ? 56 : 32, fly: Math.random() < .18}); t = 0.8 + Math.random() * 1.1 - Math.min(.4, speed / 2000); }
      obs.forEach(o => o.x -= speed * dt); obs = obs.filter(o => o.x > -40);
      for (const o of obs) { const oy = o.fly ? G - 82 : G - o.h + 2; if (110 + 18 > o.x && 110 - 18 < o.x + o.w && y > oy && y - 50 < oy + o.h) { state = 'over'; setBest(Math.floor(dist)); beep(200, .3, 1); } }
    }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#16202b'; for (let i = 0; i < 5; i++) { const x = (i * 180 - (dist * 2) % 180); ctx.fillRect(x, 140, 90, 150); }
    ctx.fillStyle = C.mute; ctx.fillRect(0, G + 2, W, 3);
    const s = Math.sin(legs) * 10;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(110, y - 50, 8, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(110, y - 42); ctx.lineTo(108, y - 18); ctx.moveTo(108, y - 18); ctx.lineTo(108 + s, y); ctx.moveTo(108, y - 18); ctx.lineTo(108 - s, y); ctx.moveTo(110, y - 36); ctx.lineTo(110 + s, y - 24); ctx.moveTo(110, y - 36); ctx.lineTo(110 - s, y - 24); ctx.stroke();
    obs.forEach(o => { ctx.fillStyle = o.fly ? C.violet : C.fire; ctx.fillRect(o.x, o.fly ? G - 82 : G - o.h + 2, o.w, o.fly ? 16 : o.h); });
    info(`${L('المسافة', 'Distance')}: ${Math.floor(dist)} ${L('م', 'm')}`);
    if (state === 'ready') centerText(ctx, W, H, [L('جري وقفز', 'Runner'), L('دوس للبدء', 'Tap to start')]);
    if (state === 'over') centerText(ctx, W, H, [L('خبطت!', 'Crashed!'), L(`${Math.floor(dist)} متر · دوس للعب تاني`, `${Math.floor(dist)} m · tap to replay`)]);
  });
  return () => { stop(); offK(); };
};

/* ---------- Penalty shootout ---------- */
GAMES.penalty = area => {
  const W = 480, H = 640, {cv, ctx, pos, info, help} = makeCanvas(area, W, H);
  const goal = {x: 60, y: 120, w: 360, h: 150};
  let shots, goals, ball, keeper, state, target, msg, msgT, round;
  const reset = () => { shots = 0; goals = 0; round = 1; newShot(); state = 'aim'; };
  const newShot = () => { ball = {x: W / 2, y: 540, r: 14, t: 0}; keeper = {x: W / 2, dx: 0, dive: 0, speed: 90 + round * 25, dir: 1}; target = null; msg = ''; };
  reset(); help(L('دوس جوه المرمى في المكان اللي عايز تشوط فيه', 'Tap inside the goal where you want to shoot'));
  cv.addEventListener('pointerdown', e => {
    const p = pos(e);
    if (state === 'end') { reset(); return; }
    if (state !== 'aim') return;
    if (p.x < goal.x || p.x > goal.x + goal.w || p.y < goal.y || p.y > goal.y + goal.h) { toast(L('دوس جوه المرمى', 'Tap inside the goal')); return; }
    target = p; state = 'shoot'; ball.t = 0;
    const guess = Math.random() < Math.min(.55, .3 + round * .05) ? (p.x < W / 2 ? -1 : 1) : (Math.random() < .5 ? -1 : 1);
    keeper.dive = guess; beep(300, .05, 1);
  });
  const stop = loop(dt => {
    if (state === 'aim') { keeper.x += keeper.dir * keeper.speed * dt; if (keeper.x < W / 2 - 60 || keeper.x > W / 2 + 60) keeper.dir *= -1; }
    if (state === 'shoot') {
      ball.t += dt * 1.9; const k = Math.min(1, ball.t);
      ball.x = W / 2 + (target.x - W / 2) * k; ball.y = 540 + (target.y - 540) * k; ball.r = 14 - 6 * k;
      keeper.x += keeper.dive * 260 * dt; keeper.x = Math.max(goal.x + 30, Math.min(goal.x + goal.w - 30, keeper.x));
      if (k >= 1) { shots++; const kx = keeper.x, saved = Math.abs(target.x - kx) < 58 && target.y > goal.y + 10; if (saved) { msg = L('صدّها الحارس!', 'Saved!'); beep(220, .2, 1); } else { goals++; msg = L('جووول! ⚽', 'GOAL! ⚽'); beep(880, .1, 3); } msgT = 1.2; state = 'result'; }
    }
    if (state === 'result') { msgT -= dt; if (msgT <= 0) { if (shots >= 5) { state = 'end'; setBest(goals); } else { newShot(); state = 'aim'; } } }
    // pitch
    ctx.fillStyle = '#0f2a1b'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#123220' : '#0f2a1b'; ctx.fillRect(0, 280 + i * 45, W, 45); }
    ctx.strokeStyle = '#d9e6dc'; ctx.lineWidth = 3; ctx.strokeRect(20, 270, W - 40, 200); ctx.beginPath(); ctx.arc(W / 2, 540, 3, 0, 7); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(goal.x + i * 30, goal.y); ctx.lineTo(goal.x + i * 30, goal.y + goal.h); ctx.stroke(); } for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(goal.x, goal.y + i * 30); ctx.lineTo(goal.x + goal.w, goal.y + i * 30); ctx.stroke(); }
    // keeper
    const ky = goal.y + goal.h - 70, lean = state === 'shoot' || state === 'result' ? keeper.dive * 0.6 : 0;
    ctx.save(); ctx.translate(keeper.x, ky + 40); ctx.rotate(lean); ctx.fillStyle = C.fire; ctx.fillRect(-20, -40, 40, 50); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, -52, 12, 0, 7); ctx.fill(); ctx.fillStyle = C.fire; ctx.fillRect(-48, -38, 28, 10); ctx.fillRect(20, -38, 28, 10); ctx.fillStyle = '#ddd'; ctx.fillRect(-16, 10, 12, 26); ctx.fillRect(4, 10, 12, 26); ctx.restore();
    // ball
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, 7); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r / 3, 0, 7); ctx.fill();
    info(`${L('الأهداف', 'Goals')}: ${goals} / ${shots} · ${L('الشوطة', 'Kick')} ${Math.min(5, shots + 1)} ${L('من 5', 'of 5')}`);
    if (state === 'result') { ctx.fillStyle = C.ink; ctx.font = '800 36px Alexandria, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(msg, W / 2, 360); }
    if (state === 'end') centerText(ctx, W, H, [L(`جبت ${goals} من 5`, `You scored ${goals} of 5`), L('دوس للعب تاني', 'Tap to play again')]);
  });
  return () => stop();
};

/* ---------- Arm wrestling ---------- */
GAMES.arm = area => {
  const W = 480, H = 480, {cv, ctx, info, help} = makeCanvas(area, W, H); cv.style.aspectRatio = '1';
  let p, state, cpu, time, lvl = 1;
  const reset = () => { p = 0; state = 'ready'; cpu = 0.42 + lvl * 0.12; time = 0; };
  reset(); help(L('دوس بسرعة على الشاشة أو المسافة. كل مستوى الخصم بيقوى.', 'Tap fast or hammer space. The rival gets stronger every level.'));
  const tap = () => { if (state === 'ready') state = 'play'; else if (state === 'play') { p += 0.045; beep(400 + p * 300, .02, 1); } else { if (state === 'win') lvl++; else lvl = 1; reset(); } };
  cv.addEventListener('pointerdown', tap); const offK = keys(k => { if (k === ' ') tap(); });
  const stop = loop(dt => {
    if (state === 'play') { time += dt; p -= cpu * dt * (0.8 + Math.sin(time * 3) * 0.3); if (p >= 1) { state = 'win'; setBest(lvl); beep(880, .1, 3); } if (p <= -1) { state = 'lose'; beep(200, .3, 1); } }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(60, 300, 360, 30);
    const ang = -p * 1.1; ctx.save(); ctx.translate(W / 2, 300); ctx.rotate(ang);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.stroke();
    ctx.strokeStyle = C.teal; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(4, -122); ctx.stroke();
    ctx.fillStyle = '#e8b48a'; ctx.beginPath(); ctx.arc(0, -128, 22, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(120, 300); ctx.lineTo(W / 2 - 4, 300 - 4); ctx.stroke();
    ctx.strokeStyle = C.teal; ctx.beginPath(); ctx.moveTo(360, 300); ctx.lineTo(W / 2 + 4, 300 - 4); ctx.stroke();
    ctx.fillStyle = C.panel || '#1a2027'; ctx.fillRect(60, 400, 360, 18); ctx.fillStyle = p >= 0 ? C.gold : C.teal; ctx.fillRect(W / 2, 400, p * 180, 18); ctx.fillStyle = C.ink; ctx.fillRect(W / 2 - 1, 394, 2, 30);
    ctx.fillStyle = C.gold; ctx.font = '600 16px Alexandria'; ctx.textAlign = 'left'; ctx.fillText(L('إنت', 'You'), 60, 452); ctx.fillStyle = C.teal; ctx.textAlign = 'right'; ctx.fillText(L('الخصم', 'Rival'), 420, 452);
    info(`${L('المستوى', 'Level')} ${lvl}`);
    if (state === 'ready') centerText(ctx, W, H, [L('مصارعة الذراعين', 'Arm wrestling'), L('دوس للبدء', 'Tap to start')]);
    if (state === 'win') centerText(ctx, W, H, [L('كسبت! 💪', 'You win! 💪'), L('دوس للمستوى اللي بعده', 'Tap for the next level')]);
    if (state === 'lose') centerText(ctx, W, H, [L('الخصم كسب', 'Rival wins'), L('دوس للعب تاني', 'Tap to retry')]);
  });
  return () => { stop(); offK(); };
};

/* ---------- Robot maze ---------- */
GAMES.maze = area => {
  const MAP = ['###################', '#........#........#', '#.##.###.#.###.##.#', '#o##.###.#.###.##o#', '#.................#', '#.##.#.#####.#.##.#', '#....#...#...#....#', '####.###.#.###.####', '   #.#.......#.#   ', '####.#.##=##.#.####', '    ...#   #...    ', '####.#.#####.#.####', '   #.#.......#.#   ', '####.#.#####.#.####', '#........#........#', '#.##.###.#.###.##.#', '#o.#.....P.....#.o#', '##.#.#.#####.#.#.##', '#....#...#...#....#', '#.######.#.######.#', '#.................#', '###################'];
  const R = MAP.length, Cc = MAP[0].length, T = 24, W = Cc * T, H = R * T, {cv, ctx, info, help} = makeCanvas(area, W, H); cv.style.aspectRatio = `${Cc}/${R}`; cv.style.maxWidth = '460px';
  let grid, pl, nd, en, score, lives, power, state, acc;
  const wall = (x, y) => { const c = grid[y]?.[x]; return c === undefined || c === '#' || c === '='; };
  const reset = full => { grid = MAP.map(r => r.replace('P', ' ').split('')); if (full) { score = 0; lives = 3; } pl = {x: 9, y: 16, d: {x: 0, y: 0}}; nd = {x: 0, y: 0}; en = [{x: 9, y: 10, c: C.bad}, {x: 8, y: 10, c: C.violet}, {x: 10, y: 10, c: C.blue}].map(e => ({...e, d: {x: 0, y: -1}})); power = 0; state = 'ready'; acc = 0; };
  reset(true); help(L('اسحب أو استخدم الأسهم. الدواير الكبيرة بتخليك تقدر تطرد الدرونز شوية.', 'Swipe or use arrows. Big dots let you chase the drones for a while.'));
  const turn = k => { if (state === 'ready') state = 'play'; if (state === 'over' || state === 'win') { reset(true); return; } const m = {ArrowUp: {x: 0, y: -1}, ArrowDown: {x: 0, y: 1}, ArrowLeft: {x: -1, y: 0}, ArrowRight: {x: 1, y: 0}}[k]; if (m) nd = m; };
  const offK = keys(turn), offS = swipe(cv, turn);
  const step = () => {
    if (!wall(pl.x + nd.x, pl.y + nd.y)) pl.d = nd;
    if (!wall(pl.x + pl.d.x, pl.y + pl.d.y)) { pl.x += pl.d.x; pl.y += pl.d.y; }
    if (pl.x < 0) pl.x = Cc - 1; if (pl.x >= Cc) pl.x = 0;
    const c = grid[pl.y][pl.x]; if (c === '.') { score += 10; grid[pl.y][pl.x] = ' '; } if (c === 'o') { score += 50; power = 40; grid[pl.y][pl.x] = ' '; beep(700, .08, 2); }
    en.forEach(e => { const opts = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}].filter(d => !wall(e.x + d.x, e.y + d.y) && !(d.x === -e.d.x && d.y === -e.d.y));
      if (opts.length) { opts.sort((a, b) => { const da = Math.abs(e.x + a.x - pl.x) + Math.abs(e.y + a.y - pl.y), db = Math.abs(e.x + b.x - pl.x) + Math.abs(e.y + b.y - pl.y); return power ? db - da : da - db; }); e.d = Math.random() < 0.7 ? opts[0] : opts[rnd(opts.length)]; } else e.d = {x: -e.d.x, y: -e.d.y};
      if (!wall(e.x + e.d.x, e.y + e.d.y)) { e.x += e.d.x; e.y += e.d.y; } if (e.x < 0) e.x = Cc - 1; if (e.x >= Cc) e.x = 0; });
    en.forEach(e => { if (e.x === pl.x && e.y === pl.y) { if (power) { score += 200; e.x = 9; e.y = 10; beep(900, .06, 2); } else { lives--; beep(180, .4, 1); if (lives <= 0) { state = 'over'; setBest(score); } else { const s = score, l = lives, g = grid; reset(false); grid = g; score = s; lives = l; state = 'play'; } } } });
    if (power) power--;
    if (!grid.some(r => r.includes('.') || r.includes('o'))) { state = 'win'; setBest(score); }
  };
  const stop = loop(dt => {
    if (state === 'play') { acc += dt; if (acc > 0.16) { acc = 0; step(); } }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < R; y++) for (let x = 0; x < Cc; x++) { const c = grid[y][x]; if (c === '#') { ctx.fillStyle = '#1d3350'; ctx.fillRect(x * T + 1, y * T + 1, T - 2, T - 2); } else if (c === '.') { ctx.fillStyle = C.gold; ctx.fillRect(x * T + T / 2 - 2, y * T + T / 2 - 2, 4, 4); } else if (c === 'o') { ctx.fillStyle = C.fire; ctx.beginPath(); ctx.arc(x * T + T / 2, y * T + T / 2, 6, 0, 7); ctx.fill(); } }
    ctx.fillStyle = C.teal; ctx.fillRect(pl.x * T + 3, pl.y * T + 3, T - 6, T - 6); ctx.fillStyle = C.bg; ctx.fillRect(pl.x * T + 7, pl.y * T + 8, 3, 3); ctx.fillRect(pl.x * T + T - 10, pl.y * T + 8, 3, 3);
    en.forEach(e => { ctx.fillStyle = power ? '#4a5a6e' : e.c; ctx.beginPath(); ctx.moveTo(e.x * T + T / 2, e.y * T + 2); ctx.lineTo(e.x * T + T - 2, e.y * T + T / 2); ctx.lineTo(e.x * T + T / 2, e.y * T + T - 2); ctx.lineTo(e.x * T + 2, e.y * T + T / 2); ctx.fill(); });
    info(`${L('النقط', 'Score')}: ${score} · ${L('المحاولات', 'Lives')}: ${lives}`);
    if (state === 'ready') centerText(ctx, W, H, [L('متاهة الروبوت', 'Robot maze'), L('اسحب للبدء', 'Swipe to start')]);
    if (state === 'over') centerText(ctx, W, H, [L('الدرونز مسكوك!', 'Caught!'), L(`${score} نقطة`, `${score} points`)]);
    if (state === 'win') centerText(ctx, W, H, [L('خلّصت المتاهة! 🏆', 'Maze cleared! 🏆'), L(`${score} نقطة`, `${score} points`)]);
  });
  return () => { stop(); offK(); offS(); };
};

/* ---------- 2048 ---------- */
GAMES.g2048 = area => {
  let b, score, over;
  const reset = () => { b = Array(16).fill(0); score = 0; over = false; add(); add(); draw(); };
  const add = () => { const e = b.map((v, i) => v ? -1 : i).filter(i => i >= 0); if (e.length) b[e[rnd(e.length)]] = Math.random() < .9 ? 2 : 4; };
  const colors = {0: 'var(--panel-2)', 2: '#3a3f47', 4: '#4b4537', 8: '#a8572a', 16: '#c4602a', 32: '#d9552f', 64: '#e8432f', 128: '#d9a73a', 256: '#dbb13b', 512: '#e3b52f', 1024: '#ecbf2a', 2048: '#ffc23d'};
  const draw = () => { area.innerHTML = `<div class="row" style="justify-content:center"><span class="pill grey">${L('النقط', 'Score')}: ${score}</span><button class="btn ghost sm" type="button" id="n2048">${L('لعبة جديدة', 'New game')}</button></div><div class="g2048" id="b2048">${b.map(v => `<div style="background:${colors[v] || '#ffc23d'};color:${v >= 8 ? '#fff' : 'var(--ink)'}">${v || ''}</div>`).join('')}</div><p class="muted small" style="margin:0">${over ? L('خلصت الحركات! دوس لعبة جديدة.', 'No moves left. Start a new game.') : L('اسحب أو استخدم الأسهم', 'Swipe or use arrow keys')}</p>`; const el = $('#b2048'); offS && offS(); offS = swipe(el, move); $('#n2048').onclick = reset; };
  const slide = row => { const r = row.filter(v => v); for (let i = 0; i < r.length - 1; i++) if (r[i] === r[i + 1]) { r[i] *= 2; score += r[i]; r.splice(i + 1, 1); } while (r.length < 4) r.push(0); return r; };
  const move = k => { if (over) return; const old = b.join(); const idx = (r, c) => ({ArrowLeft: r * 4 + c, ArrowRight: r * 4 + 3 - c, ArrowUp: c * 4 + r, ArrowDown: (3 - c) * 4 + r})[k]; if (idx(0, 0) === undefined) return;
    for (let r = 0; r < 4; r++) { const row = [0, 1, 2, 3].map(c => b[idx(r, c)]), s = slide(row); s.forEach((v, c) => b[idx(r, c)] = v); }
    if (b.join() !== old) { add(); beep(500, .02, 1); }
    over = !b.includes(0) && ![0, 1, 2, 3].some(r => [0, 1, 2].some(c => b[r * 4 + c] === b[r * 4 + c + 1] || b[c * 4 + r] === b[(c + 1) * 4 + r]));
    setBest(score); if (b.includes(2048) && !S.games.g2048?.won) { (S.games.g2048 ||= {}).won = true; toast(L('وصلت 2048! 🏆', 'You reached 2048! 🏆')); } draw(); };
  let offS = null; const offK = keys(move); reset();
  return () => { offK(); offS && offS(); };
};

/* ---------- Memory ---------- */
GAMES.memory = area => {
  const E = ['⚽', '🏋️', '🍌', '🐟', '🌙', '⭐', '📘', '🕌'];
  let cards, open, moves, matched, lock;
  const reset = () => { cards = shuffle([...E, ...E]).map(e => ({e, s: 0})); open = []; moves = 0; matched = 0; lock = false; draw(); };
  const draw = () => { area.innerHTML = `<div class="row" style="justify-content:center"><span class="pill grey">${L('محاولات', 'Moves')}: ${moves}</span><button class="btn ghost sm" type="button" id="mNew">${L('لعبة جديدة', 'New game')}</button></div><div class="cards">${cards.map((c, i) => `<button type="button" data-mc="${i}" class="${c.s === 2 ? 'won' : c.s ? 'open' : ''}">${c.s ? c.e : ''}</button>`).join('')}</div>${matched === E.length ? `<p class="pill green">${L(`خلصتها في ${moves} محاولة`, `Done in ${moves} moves`)}</p>` : ''}`; $('#mNew').onclick = reset; area.querySelectorAll('[data-mc]').forEach(b => b.onclick = () => flip(+b.dataset.mc)); };
  const flip = i => { if (lock || cards[i].s) return; cards[i].s = 1; open.push(i); if (open.length === 2) { moves++; const [a, b] = open; if (cards[a].e === cards[b].e) { cards[a].s = cards[b].s = 2; matched++; open = []; beep(880, .05, 1); if (matched === E.length) setBest(moves, true); } else { lock = true; setTimeout(() => { cards[a].s = cards[b].s = 0; open = []; lock = false; draw(); }, 700); } } draw(); };
  reset(); return () => {};
};

/* ---------- Math sprint ---------- */
GAMES.math = area => {
  let score, left, q, t, running;
  const make = () => { const op = ['+', '−', '×'][rnd(score > 8 ? 3 : 2)]; let a = rnd(op === '×' ? 12 : 50) + 1, b = rnd(op === '×' ? 12 : 50) + 1; if (op === '−' && b > a) [a, b] = [b, a]; const ans = op === '+' ? a + b : op === '−' ? a - b : a * b; const opts = new Set([ans]); while (opts.size < 4) opts.add(ans + (rnd(11) - 5 || 7)); return {txt: `${a} ${op} ${b}`, ans, opts: shuffle([...opts])}; };
  const draw = () => { area.innerHTML = running ? `<div class="row" style="justify-content:center"><span class="pill fire">${left} ${L('ثانية', 's')}</span><span class="pill grey">${L('صح', 'Correct')}: ${score}</span></div><div class="countdown" style="text-align:center;direction:ltr">${q.txt}</div><div class="tiles" style="width:min(92vw,420px)">${q.opts.map(o => `<button class="tile" type="button" data-ans="${o}" style="justify-items:center;font-size:1.6rem;font-family:var(--font-display)">${o}</button>`).join('')}</div>` : `<div class="empty" style="gap:12px"><b style="font-size:1.2rem">${score !== undefined ? L(`جاوبت ${score} صح`, `${score} correct`) : L('جاوب أكبر عدد في 60 ثانية', 'Answer as many as you can in 60 s')}</b><button class="btn fire" type="button" id="mStart">${L('ابدأ', 'Start')}</button></div>`;
    area.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => { if (+b.dataset.ans === q.ans) { score++; beep(880, .04, 1); } else { beep(220, .1, 1); left = Math.max(0, left - 3); } q = make(); draw(); });
    const st = $('#mStart'); if (st) st.onclick = () => { score = 0; left = 60; running = true; q = make(); draw(); clearInterval(t); t = setInterval(() => { left--; if (left <= 0) { clearInterval(t); running = false; setBest(score); } draw(); }, 1000); }; };
  draw(); return () => clearInterval(t);
};

/* ---------- 15 puzzle ---------- */
GAMES.puzzle15 = area => {
  let b, moves;
  const solvable = a => { let inv = 0; const f = a.filter(v => v); for (let i = 0; i < 15; i++) for (let j = i + 1; j < 15; j++) if (f[i] > f[j]) inv++; const row = 3 - Math.floor(a.indexOf(0) / 4); return (inv + row) % 2 === 1 ? false : true; };
  const reset = () => { do { b = shuffle([...Array(16).keys()]); } while (!solvable(b) || b.every((v, i) => v === (i + 1) % 16)); moves = 0; draw(); };
  const draw = () => { const won = b.every((v, i) => v === (i + 1) % 16); area.innerHTML = `<div class="row" style="justify-content:center"><span class="pill grey">${L('حركات', 'Moves')}: ${moves}</span><button class="btn ghost sm" type="button" id="pNew">${L('لعبة جديدة', 'New game')}</button></div><div class="g2048">${b.map((v, i) => `<div data-pz="${i}" style="cursor:pointer;background:${v ? 'var(--panel)' : 'transparent'};border:${v ? '1px solid var(--line)' : '0'};color:${v ? 'var(--ink)' : 'transparent'}">${v || ''}</div>`).join('')}</div>${won ? `<p class="pill green">${L(`حلّيتها في ${moves} حركة 🏆`, `Solved in ${moves} moves 🏆`)}</p>` : ''}`; $('#pNew').onclick = reset; area.querySelectorAll('[data-pz]').forEach(el => el.onclick = () => tap(+el.dataset.pz)); };
  const tap = i => { const z = b.indexOf(0), r = Math.floor(i / 4), c = i % 4, zr = Math.floor(z / 4), zc = z % 4; if ((r === zr && Math.abs(c - zc) === 1) || (c === zc && Math.abs(r - zr) === 1)) { [b[i], b[z]] = [b[z], b[i]]; moves++; beep(600, .02, 1); if (b.every((v, k) => v === (k + 1) % 16)) setBest(moves, true); draw(); } };
  reset(); return () => {};
};

/* ---------- Color memory ---------- */
GAMES.simon = area => {
  const cols = [C.fire, C.teal, C.gold, C.violet], tones = [330, 392, 494, 587];
  let seq = [], idx = 0, busy = false, lit = -1, level = 0, timers = [];
  const draw = msg => { area.innerHTML = `<div class="row" style="justify-content:center"><span class="pill grey">${L('المستوى', 'Level')}: ${level}</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:min(80vw,360px);aspect-ratio:1">${cols.map((c, i) => `<button type="button" data-sm="${i}" style="border:0;border-radius:22px;background:${c};opacity:${lit === i ? 1 : .35};cursor:pointer;transition:opacity .1s"></button>`).join('')}</div><p class="muted small" style="margin:0">${msg || ''}</p>${!seq.length ? `<button class="btn fire" type="button" id="smStart">${L('ابدأ', 'Start')}</button>` : ''}`;
    area.querySelectorAll('[data-sm]').forEach(b => b.onclick = () => press(+b.dataset.sm)); const s = $('#smStart'); if (s) s.onclick = next; };
  const flash = (i, d) => { lit = i; draw(L('ركّز...', 'Watch...')); beep(tones[i], d / 1000 * .8, 1); timers.push(setTimeout(() => { lit = -1; draw(L('ركّز...', 'Watch...')); }, d)); };
  const next = () => { seq.push(rnd(4)); level = seq.length; idx = 0; busy = true; const sp = Math.max(260, 600 - level * 25); seq.forEach((v, k) => timers.push(setTimeout(() => flash(v, sp * .7), 500 + k * sp))); timers.push(setTimeout(() => { busy = false; draw(L('دورك', 'Your turn')); }, 500 + seq.length * sp)); };
  const press = i => { if (busy || !seq.length) return; lit = i; beep(tones[i], .15, 1); timers.push(setTimeout(() => { lit = -1; draw(L('دورك', 'Your turn')); }, 180)); if (i !== seq[idx]) { setBest(level - 1); seq = []; level = 0; busy = false; draw(L('غلط! ابدأ تاني', 'Wrong! Start again')); return; } idx++; if (idx === seq.length) { busy = true; timers.push(setTimeout(next, 700)); } };
  draw(L('كرّر الألوان بنفس الترتيب', 'Repeat the colors in order')); return () => timers.forEach(clearTimeout);
};

/* ---------- Sudoku ---------- */
GAMES.sudoku = area => {
  let sol, puz, cur, sel = -1, diff = 'easy', start, timerI, mistakes;
  const ok = (g, i, v) => { const r = Math.floor(i / 9), c = i % 9, br = r - r % 3, bc = c - c % 3; for (let k = 0; k < 9; k++) { if (g[r * 9 + k] === v || g[k * 9 + c] === v || g[(br + Math.floor(k / 3)) * 9 + bc + k % 3] === v) return false; } return true; };
  const fill = g => { const i = g.indexOf(0); if (i < 0) return true; for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) { if (ok(g, i, v)) { g[i] = v; if (fill(g)) return true; g[i] = 0; } } return false; };
  const count = (g, lim) => { const i = g.indexOf(0); if (i < 0) return 1; let n = 0; for (let v = 1; v <= 9 && n < lim; v++) if (ok(g, i, v)) { g[i] = v; n += count(g, lim - n); g[i] = 0; } return n; };
  const gen = () => { sol = Array(81).fill(0); fill(sol); puz = [...sol]; const target = {easy: 38, medium: 48, hard: 54}[diff]; let removed = 0; for (const i of shuffle([...Array(81).keys()])) { if (removed >= target) break; const b = puz[i]; puz[i] = 0; if (count([...puz], 2) !== 1) puz[i] = b; else removed++; } cur = [...puz]; sel = -1; mistakes = 0; start = Date.now(); };
  const draw = () => {
    const won = cur.every((v, i) => v === sol[i]); const t = Math.floor((Date.now() - start) / 1000);
    const peers = i => { if (i < 0) return () => false; const r = Math.floor(i / 9), c = i % 9; return j => Math.floor(j / 9) === r || j % 9 === c || (Math.floor(j / 27) === Math.floor(i / 27) && Math.floor((j % 9) / 3) === Math.floor(c / 3)); };
    const pe = peers(sel);
    area.innerHTML = `<div class="row" style="justify-content:center"><div class="seg">${['easy', 'medium', 'hard'].map(d => `<button type="button" data-sd="${d}" aria-pressed="${d === diff}">${{easy: L('سهل', 'Easy'), medium: L('متوسط', 'Medium'), hard: L('صعب', 'Hard')}[d]}</button>`).join('')}</div><span class="pill grey" id="sdT">${Math.floor(t / 60)}:${pad2(t % 60)}</span><span class="pill ${mistakes ? 'red' : 'grey'}">${L('أخطاء', 'Mistakes')}: ${mistakes}</span></div>
    <div class="sudoku">${cur.map((v, i) => `<button type="button" data-sc="${i}" class="${puz[i] ? 'given' : v ? (v === sol[i] ? 'user' : 'bad') : ''} ${i === sel ? 'sel' : pe(i) ? 'peer' : ''}">${v || ''}</button>`).join('')}</div>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-sn="${n}">${n}</button>`).join('')}<button type="button" data-sn="0">⌫</button></div>
    ${won ? `<p class="pill green">${L(`حلّيتها في ${Math.floor(t / 60)}:${pad2(t % 60)} 🏆`, `Solved in ${Math.floor(t / 60)}:${pad2(t % 60)} 🏆`)}</p>` : ''}`;
    area.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => { sel = +b.dataset.sc; draw(); });
    area.querySelectorAll('[data-sn]').forEach(b => b.onclick = () => put(+b.dataset.sn));
    area.querySelectorAll('[data-sd]').forEach(b => b.onclick = () => { diff = b.dataset.sd; gen(); draw(); });
  };
  const put = n => { if (sel < 0 || puz[sel]) return; cur[sel] = n; if (n && n !== sol[sel]) { mistakes++; beep(220, .08, 1); } if (cur.every((v, i) => v === sol[i])) { const t = Math.floor((Date.now() - start) / 1000); setBest(t, true); beep(880, .1, 3); } draw(); };
  const offK = keys(k => { if (/^[1-9]$/.test(k)) put(+k); if (k === 'Backspace' || k === 'Delete') put(0); });
  gen(); draw(); timerI = setInterval(() => { const el = $('#sdT'); if (el && !cur.every((v, i) => v === sol[i])) { const t = Math.floor((Date.now() - start) / 1000); el.textContent = `${Math.floor(t / 60)}:${pad2(t % 60)}`; } }, 1000);
  return () => { clearInterval(timerI); offK(); };
};
