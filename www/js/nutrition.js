/* ميزان — مولّد نظام الأكل: بيختار النظام ويحسب الماكروز ويبني وجبات 7 أيام بالكميات، مع بدائل لكل وجبة. */
'use strict';
const MEAT = new Set(['chicken', 'thigh', 'mince', 'steak', 'lamb', 'liver', 'tilapia', 'hamour', 'salmon', 'shrimp', 'tuna', 'sardine', 'beefcube', 'beefbone', 'chickwhole', 'grilledchk', 'mullet', 'fishfz']);
const GSWAP = {choke: {almond: 'avocado', walnut: 'avocado', grapes: 'banana', olives: 'oil'}, hard: {almond: 'avocado', walnut: 'avocado', apple: 'banana', ricecake: 'oats'}, honey: {honey: 'dates'}, lactose: {milk: 'lfmilk', yogurt: 'lfyog', greek: 'lfyog', cottage: 'lfyog', butter: 'oil', labneh: 'olives', feta: 'olives', halloumi: 'tofu', cheddar: 'olives'}, gluten: {baladi: 'gfbread', pita: 'gfbread', toast: 'gfbread', pasta: 'rice', bulgur: 'rice', freekeh: 'quinoa'}, nuts: {almond: 'olives', walnut: 'olives'}, peanut: {pb: 'tahini'}, sesame: {tahini: 'oil', hummus: 'cottage'}, fodmap: {apple: 'kiwi', watermelon: 'melon', cauli: 'zucchini', honey: 'banana', avocado: 'olives', milk: 'lfmilk', yogurt: 'lfyog', greek: 'lfyog', cottage: 'lfyog', baladi: 'gfbread', pita: 'gfbread', toast: 'gfbread', pasta: 'rice', bulgur: 'rice', freekeh: 'quinoa'}, organ: {liver: 'steak'}, fava: {ful: 'cottage'}, soy: {soymilk: 'lfmilk', tofu: 'cottage'}, highK: {}, salty: {feta: 'cottage', halloumi: 'cottage', sardine: 'tuna', olives: 'avocado'}};
function resolveDiet(p, hr){
  p ||= S.profile; hr ||= healthRules(p); const want = p.diet || 'auto';
  if (want !== 'auto' && DIETS[want] && !hr.block.has(want)) return want;
  for (const d of hr.prefer) if (DIETS[d] && !hr.block.has(d)) return d;
  const g = p.goalType || 'lose';
  if (g === 'gain' && !hr.block.has('bulk')) return 'bulk'; if ((g === 'lose' || g === 'recomp') && !hr.block.has('highprotein')) return 'highprotein';
  return 'balanced';
}
function dietAvoid(diet, p, hr){
  const a = new Set(hr.avoid); (p.dislikes || []).forEach(t => a.add(t));
  if (diet === 'lowfodmap') a.add('fodmap'); if (diet === 'glutenfree') a.add('gluten'); if (diet === 'vegetarian') a.add('meat');
  return a;
}
const foodHas = (id, tag) => tag === 'meat' ? MEAT.has(id) : FOOD[id].tags.has(tag);
/* adapt one dish to the person: swap or reject it */
function adaptDish(d, avoid, limit, budget, have){
  const parts = [], swaps = []; let hs = 0;
  for (const [fid, role, base] of d.parts) {
    let id = fid; const bad = t => foodHas(id, t);
    for (const t of avoid) { if (!bad(t)) continue; const alt = (d.swap || {})[id] || (GSWAP[t] || {})[id]; if (alt && FOOD[alt] && ![...avoid].some(tt => foodHas(alt, tt))) { id = alt; } else return null; }
    if (have && !have.has(id)) { const alt = typeof kitchenSub === 'function' ? kitchenSub(id, role, have, avoid) : null; if (!alt || (role === 'p' && ['grilledchk', 'tuna', 'sardine'].includes(alt)) || ++hs > 1) return null; id = alt; }
    if (id === fid && FOOD[id].cost > Math.max(2, budget || 2) && budget < 3) return null;
    if (id !== fid) swaps.push([fid, id]);
    const amt = id === fid ? base : (FOOD[id].u === FOOD[fid].u ? base : FOOD[id].u === 'pc' ? 1 : FOOD[id].u === 'tsp' ? 2 : 150), ex = parts.find(x => x[0] === id && x[1] === role);
    if (ex) ex[2] += amt; else parts.push([id, role, amt]);
  }
  const pen = parts.reduce((s, [id]) => s + [...limit].filter(t => foodHas(id, t)).length, 0);
  return {...d, parts, pen, swaps};
}
const gOf = (id, amt) => FOOD[id].u === 'pc' || FOOD[id].u === 'tsp' || FOOD[id].u === 'tbsp' ? amt * FOOD[id].gpu : amt;
function macrosOf(parts){ let k = 0, p = 0, c = 0, f = 0; parts.forEach(([id, , amt]) => { const g = gOf(id, amt) / 100, x = FOOD[id]; k += x.k * g; p += x.p * g; c += x.c * g; f += x.f * g; }); return {k, p, c, f}; }
function roundAmt(id, v){ const u = FOOD[id].u; if (u === 'pc') return id === 'baladi' || id === 'pita' ? Math.max(0.5, Math.round(v * 2) / 2) : Math.max(1, Math.round(v)); if (u === 'tsp' || u === 'tbsp') return Math.max(0, Math.round(v)); return Math.max(10, Math.round(v / (v >= 100 ? 10 : 5)) * (v >= 100 ? 10 : 5)); }
const MAXG = {p: 380, c: 450, f: 60};
function scaleDish(d, T){
  const by = r => d.parts.filter(x => x[1] === r), sum = list => macrosOf(list);
  let sp = 1, sc = 1, sf = 1; const P = by('p'), C = by('c'), Fp = by('f'), V = d.parts.filter(x => x[1] === 'v' || x[1] === 'x');
  const sc_ = (list, s) => list.map(([id, r, a]) => [id, r, a * s]);
  for (let it = 0; it < 4; it++) {
    const fixed = sum([...V, ...sc_(C, sc), ...sc_(Fp, sf)]), pb = sum(P);
    if (P.length && pb.p > 0) sp = Math.min(2.6, Math.max(0.45, (T.p - fixed.p) / pb.p));
    const fx2 = sum([...V, ...sc_(P, sp), ...sc_(C, sc)]), fb = sum(Fp);
    if (Fp.length && fb.f > 0) sf = Math.min(4, Math.max(0, (T.f - fx2.f) / fb.f));
    const fx3 = sum([...V, ...sc_(P, sp), ...sc_(Fp, sf)]), cb = sum(C);
    if (C.length && cb.k > 0) sc = Math.min(3, Math.max(T.keto ? 0 : 0.25, (T.k - fx3.k) / cb.k));
    else if (Fp.length && fb.k > 0) sf = Math.min(5, Math.max(0, (T.k - sum([...V, ...sc_(P, sp)]).k) / fb.k));
  }
  const parts = d.parts.map(([id, r, a]) => { const s = r === 'p' ? sp : r === 'c' ? sc : r === 'f' ? sf : 1; let v = roundAmt(id, a * s); const lim = MAXG[r]; if (lim && FOOD[id].u !== 'pc' && FOOD[id].u !== 'tsp' && FOOD[id].u !== 'tbsp') v = Math.min(v, lim); return [id, r, v]; }).filter(([id, r, v]) => v > 0);
  const m = macrosOf(parts);
  const sw = d.swaps || [], nm = sw.length ? {ar: d.ar + ' (' + sw.map(([a, b]) => FOOD[b].ar + ' بدل ' + FOOD[a].ar).join('، ') + ')', en: d.en + ' (' + sw.map(([a, b]) => FOOD[b].en + ' instead of ' + FOOD[a].en.toLowerCase()).join(', ') + ')'} : {ar: d.ar, en: d.en};
  return {id: d.id, n: nm, how: {ar: d.how[0], en: d.how[1]}, parts, k: Math.round(m.k), p: Math.round(m.p), c: Math.round(m.c), f: Math.round(m.f), ing: parts.map(([id, r, v]) => I(FOOD[id].ar, FOOD[id].en, v, FOOD[id].u === 'graw' ? 'graw' : FOOD[id].u === 'ml' ? 'ml' : FOOD[id].u === 'pc' ? 'pc' : FOOD[id].u === 'tsp' ? 'tsp' : FOOD[id].u === 'tbsp' ? 'tbsp' : 'g', r))};
}
const ingOf = parts => parts.map(([id, r, v]) => I(FOOD[id].ar, FOOD[id].en, v, FOOD[id].u === 'graw' ? 'graw' : FOOD[id].u === 'ml' ? 'ml' : FOOD[id].u === 'pc' ? 'pc' : FOOD[id].u === 'tsp' ? 'tsp' : FOOD[id].u === 'tbsp' ? 'tbsp' : 'g', r));
function refreshMeal(m){ m.parts = m.parts.map(([id, r, v]) => [id, r, roundAmt(id, v)]).filter(([, , v]) => v > 0); const x = macrosOf(m.parts); Object.assign(m, {k: Math.round(x.k), p: Math.round(x.p), c: Math.round(x.c), f: Math.round(x.f), ing: ingOf(m.parts)}); return m; }
/* nudge a whole day so it lands on the day's calories and protein (and keto carbs) */
function balanceDay(meals, T, diet, avoid, have){
  if (!meals.length) return meals;
  const okF = id => FOOD[id] && (!have || have.has(id)) && ![...avoid].some(t => foodHas(id, t)) && (diet !== 'keto' || FOOD[id].tags.has('keto')) && !(diet === 'vegetarian' && MEAT.has(id));
  const tot = () => macrosOf(meals.flatMap(m => m.parts)), roleTot = r => macrosOf(meals.flatMap(m => m.parts.filter(x => x[1] === r)));
  const cap = (id, r, v) => { const u = FOOD[id].u; if (u === 'pc') return Math.min(v, id === 'egg' || id === 'eggw' ? 5 : id === 'dates' ? 7 : 4); if (u === 'tsp' || u === 'tbsp') return Math.min(v, 4); return Math.min(v, (MAXG[r] || 400) * 1.6); };
  const scale = (r, f) => meals.forEach(m => { m.parts = m.parts.map(([id, rr, v]) => rr === r ? [id, rr, cap(id, rr, v * f)] : [id, rr, v]); });
  const cl = (x, a, b) => Math.max(a, Math.min(b, x));
  const pass = () => {
    let t = tot(); const pp = roleTot('p').p;
    if (pp > 0 && (t.p < T.p * 0.97 || t.p > T.p * 1.04)) scale('p', cl((T.p - (t.p - pp)) / pp, 0.4, 1.9));
    if (diet === 'keto') { t = tot(); if (t.c > T.c + 3) { const cc = roleTot('c').c; if (cc > 0) scale('c', cl((cc - (t.c - T.c)) / cc, 0, 1)); t = tot(); for (const r of ['v', 'x', 'f']) { t = tot(); const vc = roleTot(r).c; if (t.c > T.c + 3 && vc > 0) scale(r, cl((vc - (t.c - T.c)) / vc, 0.3, 1)); } } }
    for (const r of diet === 'keto' ? ['f'] : ['c', 'f']) { const rk = roleTot(r).k, t2 = tot(), diff = T.k - t2.k; if (rk > 0 && Math.abs(diff) > T.k * 0.025) scale(r, cl((rk + diff * (r === 'c' ? 0.7 : 1)) / rk, 0.2, 2.4)); }
    meals.forEach(refreshMeal);
  };
  for (let it = 0; it < 4; it++) pass();
  /* top-ups when scaling alone can't get there */
  const big = meals.reduce((a, m) => (m.share || 0) > (a.share || 0) ? m : a, meals[0]);
  let t = tot();
  if (t.p < T.p * 0.93) for (const id of diet === 'keto' ? ['chicken', 'tuna', 'eggw', 'tofu'] : ['chicken', 'tuna', 'greek', 'cottage', 'eggw', 'tofu', 'lentil', 'soymilk', 'chickpea']) { if (!okF(id)) continue; const per = FOOD[id].p * (FOOD[id].u === 'pc' ? FOOD[id].gpu : 1) / 100, need = (T.p - t.p) / per, ex = big.parts.find(x => x[0] === id); const add = Math.min(need, FOOD[id].u === 'pc' ? 4 : 220); if (ex) ex[2] = cap(id, 'p', ex[2] + add); else big.parts.push([id, 'p', add]); refreshMeal(big); t = tot(); if (t.p >= T.p * 0.95) break; }
  const fill = diet === 'keto' ? ['oil', 'ghee', 'butter', 'olives', 'avocado', 'almond', 'walnut'] : ['oil', 'dates', 'banana', 'oats', 'pita', 'rice', 'potato', 'almond', 'olives', 'honey'];
  const capF = (id, v) => FOOD[id].u === 'tsp' ? Math.min(v, diet === 'keto' ? 6 : 4) : FOOD[id].u === 'pc' ? Math.min(v, id === 'dates' ? 5 : 3) : Math.min(v, diet === 'keto' ? 150 : 200);
  const byShare = meals.slice().sort((a, b) => (b.share || 0) - (a.share || 0));
  t = tot();
  fillLoop: for (const id of fill) { if (!okF(id)) continue; for (const m of byShare) { const diff = T.k - t.k; if (diff < T.k * 0.04) break fillLoop; const per = FOOD[id].k * (['g', 'graw', 'ml'].includes(FOOD[id].u) ? 1 : FOOD[id].gpu) / 100, r = FOOD[id].tags.has('fat') ? 'f' : 'c', ex = m.parts.find(x => x[0] === id); if (ex) ex[2] = capF(id, ex[2] + diff / per); else m.parts.push([id, r, capF(id, diff / per)]); refreshMeal(m); t = tot(); } }
  for (let it = 0; it < 3; it++) pass();
  t = tot();
  if (t.k > T.k * 1.04) { for (const r of ['f', 'c', 'x', 'v']) { const rk = roleTot(r).k; t = tot(); const over = t.k - T.k; if (rk > 0 && over > T.k * 0.03) scale(r, cl((rk - over) / rk, r === 'v' ? 0.5 : 0.1, 1)); } meals.forEach(refreshMeal); }
  t = tot(); if (t.k > T.k * 1.05) { const pk = roleTot('p').k, f = cl((T.k - pk) / Math.max(1, t.k - pk), 0.3, 1); meals.forEach(m => { m.parts = m.parts.map(([id, r, v]) => [id, r, r === 'p' ? v : v * f]); refreshMeal(m); }); }
  t = tot(); if (t.p > T.p * 1.08) { const cp = roleTot('c').p; if (cp > 0) { const f = cl(1 - (t.p - T.p) / cp, 0.4, 1); scale('c', f); meals.forEach(refreshMeal); } t = tot(); const gap = T.k - t.k; if (gap > T.k * 0.04) for (const id of ['oil', 'honey', 'olives']) { if (!okF(id)) continue; const m = byShare[0], per = FOOD[id].k * (['g', 'graw', 'ml'].includes(FOOD[id].u) ? 1 : FOOD[id].gpu) / 100, ex = m.parts.find(x => x[0] === id), add = Math.min((T.k - tot().k) / per, FOOD[id].u === 'tsp' ? 4 : 60); if (add <= 0) break; if (ex) ex[2] += add; else m.parts.push([id, FOOD[id].tags.has('fat') ? 'f' : 'c', add]); refreshMeal(m); } }
  t = tot(); if (t.k > T.k * 1.06) { const f = T.k * 1.02 / t.k; meals.forEach(m => { m.parts = m.parts.map(([id, r, v]) => [id, r, v * f]); refreshMeal(m); }); }
  if (diet === 'keto') { t = tot(); if (t.c > T.c + 8) { const f = cl(1 - (t.c - T.c) / t.c, 0.4, 1); meals.forEach(m => { m.parts = m.parts.map(([id, r, v]) => FOOD[id].c > 3 && r !== 'p' ? [id, r, v * f] : [id, r, v]); refreshMeal(m); }); } }
  return meals;
}
const hm = m => pad2(Math.floor(((m % 1440) + 1440) % 1440 / 60)) + ':' + pad2(Math.round(m % 60));
function mealSlots(p, diet, isGymDay){
  const wake = t2m(p.wake || '07:00'), gym = t2m(S.settings.gymTime || '17:00'), n = Math.max(2, Math.min(5, +p.mealsPerDay || 3));
  if (diet === 'ramadan') { const pt = prayerTimes(todayISO()); return [{key: 'm1', s: 'if', title: {ar: 'الفطار', en: 'Iftar'}, t: hm(pt.maghrib), share: 0.45}, {key: 'm2', s: 'n', title: {ar: 'سناك بعد التراويح', en: 'After-taraweeh snack'}, t: hm(pt.isha + 120), share: 0.15}, {key: 'm3', s: 'su', title: {ar: 'السحور', en: 'Suhoor'}, t: hm(pt.fajr - 50), share: 0.4}]; }
  if (diet === 'if168' || diet === 'if186') { const st = t2m(p.ifStart || '12:00'), win = DIETS[diet].window * 60; return diet === 'if186' || n <= 2 ? [{key: 'm1', s: 'l', title: {ar: 'الوجبة الأولى', en: 'Meal 1'}, t: hm(st), share: 0.5}, {key: 'm2', s: 'd', title: {ar: 'الوجبة التانية', en: 'Meal 2'}, t: hm(st + win - 30), share: 0.5}] : [{key: 'm1', s: 'l', title: {ar: 'أول وجبة', en: 'First meal'}, t: hm(st), share: 0.4}, {key: 'm2', s: 'n', title: {ar: 'سناك', en: 'Snack'}, t: hm(st + win / 2), share: 0.15}, {key: 'm3', s: 'd', title: {ar: 'آخر وجبة', en: 'Last meal'}, t: hm(st + win - 30), share: 0.45}]; }
  const B = {key: 'm1', s: 'b', title: {ar: 'الفطار', en: 'Breakfast'}, t: hm(wake + 60)}, Lu = {key: 'm2', s: 'l', title: {ar: 'الغدا', en: 'Lunch'}, t: '13:30'}, Di = {key: 'm3', s: 'd', title: {ar: 'العشا', en: 'Dinner'}, t: hm(Math.max(t2m('19:30'), isGymDay ? gym + 105 : 0))};
  const pre = {key: 'pre', s: 'n', title: isGymDay ? {ar: 'سناك قبل التمرين', en: 'Pre-workout snack'} : {ar: 'سناك العصر', en: 'Afternoon snack'}, t: hm(isGymDay ? gym - 45 : t2m('16:30'))}, night = {key: 'night', s: 'n', title: {ar: 'سناك بالليل', en: 'Evening snack'}, t: hm(Math.min(t2m(p.sleep || '23:00') - 90, t2m('22:30')))};
  if (n === 2) return [{...Lu, key: 'm1', share: 0.45, title: {ar: 'الوجبة الأولى', en: 'Meal 1'}}, {...Di, key: 'm2', share: 0.55, title: {ar: 'الوجبة التانية', en: 'Meal 2'}}];
  if (n === 3) return [{...B, share: 0.28}, {...Lu, share: 0.40}, {...Di, share: 0.32}];
  if (n === 4) return [{...B, share: 0.25}, {...Lu, share: 0.33}, {...pre, share: 0.12}, {...Di, share: 0.30}];
  return [{...B, share: 0.22}, {...Lu, share: 0.30}, {...pre, share: 0.10}, {...Di, share: 0.28}, {...night, share: 0.10}];
}
function dayTargets(c, gymDay, diet){ const k = gymDay ? c.kTrain : c.kRest; const m = macroSplit(k, c.protein, diet); return {k, ...m}; }
function macroSplit(k, protein, diet){ const D_ = DIETS[diet] || DIETS.balanced; let p = protein, cg, fg;
  if (diet === 'keto') { cg = D_.carbMax; fg = Math.max(0, (k - p * 4 - cg * 4) / 9); }
  else if (diet === 'lowcarb') { cg = Math.round(k * D_.carbPct / 4); fg = Math.max(0, (k - p * 4 - cg * 4) / 9); }
  else { fg = k * D_.fat / 9; cg = Math.max(0, (k - p * 4 - fg * 9) / 4); }
  return {p: Math.round(p), c: Math.round(cg), f: Math.round(fg)}; }
function generateMeals(p){
  p ||= S.profile; if (typeof stageOf === 'function' && stageOf(p).under1) return null;
  if (p.eatMode && p.eatMode !== 'varied' && typeof generateKitchenMeals === 'function') return generateKitchenMeals(p);
  const c = calc(); if (!c) return null; const hr = healthRules(p), diet = resolveDiet(p, hr), avoid = dietAvoid(diet, p, hr), limit = hr.limit, budget = +p.budget || 2, pref = p.cuisine || 'x';
  const have = typeof kitchenAllowed === 'function' ? kitchenAllowed(p) : null, pools = {};
  const poolFor = s => pools[s] ||= DISH.filter(d => d.s.includes(s) && (diet === 'keto' ? (d.keto || s === 'n' && d.parts.every(([id]) => FOOD[id].tags.has('keto'))) : !d.keto || s === 'n')).map(d => adaptDish(d, avoid, limit, budget, have)).filter(Boolean).sort((a, b) => (a.pen - b.pen) || ((b.c === pref) - (a.c === pref)));
  const days = {}, used = {};
  for (let dow = 0; dow < 7; dow++) {
    const gymDay = GYM.includes(dow), slots = mealSlots(p, diet, gymDay); let T = dayTargets(c, gymDay, diet);
    if (diet === 'if52' && (dow === 1 || dow === 4)) T = {k: c.female ? 500 : 600, p: Math.round(c.protein * 0.45), c: 40, f: 15};
    const order = (dow + 1) % 7;
    days[dow] = slots.map((sl, si) => {
      const want = {k: T.k * sl.share, p: T.p * sl.share, f: T.f * sl.share, keto: diet === 'keto'};
      const pool = poolFor(sl.s).length ? poolFor(sl.s) : poolFor(sl.s === 'b' ? 'l' : sl.s === 'n' ? 'n' : sl.s === 'l' ? 'd' : 'l');
      if (!pool.length) { if (!['b', 'n'].includes(sl.s) && typeof kitchenDayDish === 'function') { const kd = kitchenDayDish(p, dow); if (kd) return {...sl, ...scaleDish(kd, want), alts: [], target: Math.round(want.k)}; } return null; }
      const top = pool.filter(d => d.pen === pool[0].pen).length > 3 ? pool.filter(d => d.pen === pool[0].pen) : pool;
      const u = used[sl.s] ||= [], start = (order * 3 + si * 2 + (S.plan?.mealSeed || 0) * 5) % top.length; let pick = null;
      for (let j = 0; j < top.length; j++) { const d = top[(start + j) % top.length]; if (!u.includes(d.id)) { pick = d; break; } }
      if (!pick) { used[sl.s] = []; pick = top[start]; } (used[sl.s] ||= []).push(pick.id);
      const others = top.filter(d => d.id !== pick.id), rot = others.length ? start % others.length : 0;
      const main = scaleDish(pick, want), alts = [...others.slice(rot), ...others.slice(0, rot)].slice(0, 3).map(d => scaleDish(d, want));
      return {...sl, ...main, alts, target: Math.round(want.k)};
    }).filter(Boolean);
    balanceDay(days[dow], T, diet, avoid, have); days[dow].forEach(m => { m.target = Math.round(T.k * (m.share || 0)); });
  }
  if (have && Object.values(days).some(d => !d.length || !d.some(m => !['b', 'n'].includes(m.s)))) { const r = generateMeals({...p, kitchen: null, eatMode: 'varied'}); if (r) r.kwarn = 'empty'; return r; }
  return {diet, days, created: todayISO(), mode: 'varied'};
}
/* the meal list for a date, in the shape the Meals page uses */
function mealsFor(iso){
  const plan = S.plan?.meals; if (!plan) return [];
  const dow = D(iso).getDay(); return (plan.days[dow] || []).map(m => ({...m, title: LX(m.title)}));
}
function scaleMeal(m){ return m; }
