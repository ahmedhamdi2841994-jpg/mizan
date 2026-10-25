/* ميزان — مولّد برامج التمرين: بيختار التقسيمة والتمارين والمجموعات حسب الهدف والمستوى والمكان والأدوات والإصابات والأمراض. */
'use strict';
['jump_squat', 'jacks', 'burpee', 'box_jump', 'skater', 'tuck_jump', 'jump_rope', 'high_knees', 'sprint', 'run', 'treadmill_run'].forEach(id => EX[id] && EX[id].avoid.push('impact'));
['crunch', 'situp', 'vup', 'russian_twist', 'good_morning', 'bw_good_morning', 'leg_raise', 'flutter', 'bicycle', 'heel_touch', 'cable_crunch', 'ab_machine', 'deadlift', 'sumo_deadlift', 'pendlay_row', 'bb_row'].forEach(id => EX[id] && EX[id].avoid.push('flexload'));
['pike_pushup', 'down_dog', 'decline_pushup', 'decline_bench'].forEach(id => EX[id] && !EX[id].avoid.includes('htn') && EX[id].avoid.push('htn'));
['pike_pushup', 'down_dog', 'decline_pushup', 'decline_bench', 'hang_leg_raise'].forEach(id => EX[id] && EX[id].avoid.push('inversion'));
['bb_bench', 'db_bench', 'incline_bb', 'smith_bench', 'db_fly', 'skull', 'db_skull', 'close_bench', 'db_pullover', 'leg_raise', 'reverse_crunch', 'glute_bridge', 'db_floor_press', 'dead_bug', 'hollow', 'flutter', 'crunch', 'situp', 'vup', 'bicycle', 'heel_touch', 'lying_leg_curl', 'superman', 'cobra', 'leg_curl_band', 'bridge_march', 'band_bridge', 'glute_bridge_1', 'pelvic_tilt'].forEach(id => EX[id] && !EX[id].avoid.includes('preg2') && EX[id].avoid.push('preg2'));
/* preferred order per slot (first allowed wins; variants pick the next ones) */
const PRI = {
  squat: ['bb_squat', 'leg_press', 'goblet_squat', 'hack_squat', 'smith_squat', 'kb_goblet', 'db_squat', 'front_squat', 'leg_press_w', 'sumo_squat', 'band_squat', 'bw_squat', 'box_squat', 'squat_pulse'],
  hinge: ['rdl', 'deadlift', 'db_rdl', 'kb_deadlift', 'rack_pull', 'sumo_deadlift', 'kb_swing', 'single_rdl', 'cable_pullthrough', 'back_extension', 'band_deadlift', 'bw_good_morning', 'superman'],
  lunge: ['bulgarian', 'walk_lunge', 'db_lunge', 'split_squat', 'db_step_up', 'rev_lunge', 'bw_bulgarian', 'step_up', 'lateral_lunge', 'lunge', 'curtsy_lunge'],
  quad: ['leg_extension', 'narrow_press', 'wall_sit', 'squat_pulse'],
  ham: ['lying_leg_curl', 'seated_leg_curl', 'nordic', 'leg_curl_band', 'single_rdl', 'glute_bridge_1'],
  glute: ['hip_thrust', 'machine_thrust', 'db_hip_thrust', 'cable_kickback', 'hip_abduction', 'glute_bridge', 'band_bridge', 'bridge_march', 'glute_bridge_1', 'band_walk', 'band_kickback', 'donkey_kick', 'clamshell', 'side_leg_raise'],
  calf: ['calf_raise', 'standing_calf_m', 'seated_calf', 'leg_press_calf', 'sl_calf', 'bw_calf'],
  hpush: ['bb_bench', 'db_bench', 'incline_db_press', 'chest_press', 'incline_bb', 'machine_incline', 'smith_bench', 'db_floor_press', 'decline_bench', 'band_pushup', 'pushup', 'decline_pushup', 'wide_pushup', 'archer_pushup', 'incline_pushup', 'knee_pushup', 'wall_pushup'],
  vpush: ['db_shoulder_press', 'bb_ohp', 'machine_ohp', 'db_ohp_stand', 'arnold', 'kb_press', 'landmine_press', 'band_ohp', 'pike_pushup', 'front_raise'],
  chest: ['cable_cross', 'pec_deck', 'db_fly', 'incline_fly', 'low_cable_fly', 'band_fly'],
  hpull: ['cable_row', 'bb_row', 'chest_supported_row', 'db_row', 'machine_row', 'tbar_row', 'wide_cable_row', 'db_bent_row', 'kb_row', 'pendlay_row', 'band_row', 'inv_row', 'towel_row'],
  vpull: ['lat_pulldown', 'pullup', 'assisted_pullup', 'chinup', 'close_pulldown', 'straight_pulldown', 'neg_pullup', 'db_pullover', 'band_pulldown'],
  rear: ['face_pull', 'rev_pec_deck', 'reverse_fly', 'band_face_pull', 'band_pullapart'],
  side: ['lateral_raise', 'cable_lateral', 'band_lateral', 'upright_row', 'band_upright'],
  bi: ['db_curl', 'bb_curl', 'hammer_curl', 'cable_curl', 'ez_curl', 'preacher', 'incline_curl', 'conc_curl', 'db_preacher', 'band_curl', 'towel_curl', 'chinup'],
  tri: ['tri_pushdown', 'rope_pushdown', 'overhead_triceps', 'skull', 'db_skull', 'close_bench', 'cable_oh_tri', 'dips', 'machine_dip', 'kickback', 'band_pushdown', 'band_oh_tri', 'diamond_pushup', 'bench_dip'],
  core: ['plank', 'dead_bug', 'bird_dog', 'hang_leg_raise', 'cable_crunch', 'reverse_crunch', 'leg_raise', 'hollow', 'shoulder_tap', 'crunch', 'flutter', 'superman', 'farmer_walk', 'ab_machine', 'vup', 'situp', 'pelvic_tilt', 'kegel'],
  rot: ['side_plank', 'pallof', 'band_pallof', 'bicycle', 'russian_twist', 'heel_touch'],
  trap: ['db_shrug', 'bb_shrug', 'band_shrug'],
  cardio: ['incline_walk', 'bike', 'elliptical', 'rowing', 'outdoor_walk', 'cycling', 'swim', 'treadmill_run', 'run', 'stairs', 'march'],
  hiit: ['mountain', 'jacks', 'high_knees', 'burpee', 'jump_squat', 'skater', 'bear_crawl', 'shadow_box', 'jump_rope', 'box_jump', 'tuck_jump', 'battle_rope', 'sprint'],
  mob: ['cat_cow', 'world_stretch', 'hip_flexor', 'ham_stretch', 'thoracic_rot', 'child_pose', 'down_dog', 'cobra', 'quad_stretch', 'calf_stretch', 'butterfly', 'chest_stretch']
};
const DAYT = {
  fullA: {t: ['جسم كامل A', 'Full body A'], s: ['squat', 'hpush', 'hpull', 'hinge', 'side', 'core']},
  fullB: {t: ['جسم كامل B', 'Full body B'], s: ['hinge', 'vpull', 'lunge', 'hpush:1', 'rear', 'rot']},
  fullC: {t: ['جسم كامل C', 'Full body C'], s: ['squat:1', 'vpush', 'hpull:1', 'glute', 'bi', 'tri', 'core:1']},
  upA: {t: ['جزء علوي A', 'Upper body A'], s: ['hpush', 'vpull', 'vpush', 'hpull', 'side', 'bi', 'tri']},
  upB: {t: ['جزء علوي B', 'Upper body B'], s: ['hpush:2', 'hpull:1', 'vpull:1', 'chest', 'rear', 'bi:1', 'tri:1']},
  loA: {t: ['جزء سفلي A', 'Lower body A'], s: ['squat', 'hinge', 'ham', 'quad', 'calf', 'core']},
  loB: {t: ['جزء سفلي B', 'Lower body B'], s: ['hinge:1', 'lunge', 'glute', 'ham:1', 'calf:1', 'rot']},
  push: {t: ['دفع: صدر وكتف وتراي', 'Push: chest, shoulders, triceps'], s: ['hpush', 'vpush', 'hpush:2', 'chest', 'side', 'tri', 'tri:1']},
  pull: {t: ['سحب: ضهر وباي', 'Pull: back & biceps'], s: ['vpull', 'hpull', 'hpull:1', 'vpull:1', 'rear', 'bi', 'bi:1']},
  legs: {t: ['رجل وبطن', 'Legs & core'], s: ['squat', 'hinge', 'lunge', 'quad', 'ham', 'calf', 'core']},
  strA: {t: ['قوة A', 'Strength A'], s: ['squat', 'hpush', 'hpull', 'core']},
  strB: {t: ['قوة B', 'Strength B'], s: ['squat', 'vpush', 'hinge', 'vpull', 'rot']},
  cond: {t: ['دايرة حرق', 'Conditioning circuit'], s: ['hiit', 'squat:1', 'hpush:1', 'hpull:1', 'lunge:1', 'hiit:1', 'core'], circuit: 1},
  cardio: {t: ['كارديو وبطن', 'Cardio & core'], s: ['cardio', 'core:1', 'rot', 'mob'], k: 'cardio'},
  mobility: {t: ['حركة وإطالة', 'Mobility & stretching'], s: ['mob', 'mob:1', 'mob:2', 'mob:3', 'cardio:1'], k: 'cardio'},
  prenatal: {t: ['حركة آمنة للحمل', 'Pregnancy-safe session'], s: ['squat', 'hpull', 'hpush', 'glute', 'core', 'cardio'], k: 'strength'}
};
const SPLITS = {
  full2: {ar: 'جسم كامل يومين', en: 'Full body · 2 days', days: ['fullA', 'fullB']},
  full3: {ar: 'جسم كامل 3 أيام', en: 'Full body · 3 days', days: ['fullA', 'fullB', 'fullC']},
  str3: {ar: 'قوة 5×5 (3 أيام)', en: 'Strength 5×5 · 3 days', days: ['strA', 'strB', 'strA']},
  ppl3: {ar: 'دفع · سحب · رجل', en: 'Push · Pull · Legs', days: ['push', 'pull', 'legs']},
  ul4: {ar: 'علوي · سفلي (4 أيام)', en: 'Upper · Lower · 4 days', days: ['upA', 'loA', 'upB', 'loB']},
  pplul5: {ar: 'دفع · سحب · رجل · علوي · سفلي', en: 'PPL + Upper/Lower · 5 days', days: ['push', 'pull', 'legs', 'upA', 'loB']},
  ul4c: {ar: 'علوي · سفلي + دايرة حرق', en: 'Upper/Lower + conditioning', days: ['upA', 'loA', 'cond', 'upB', 'loB']},
  full3c: {ar: 'جسم كامل + كارديو', en: 'Full body + cardio', days: ['fullA', 'cardio', 'fullB', 'cond', 'fullC']},
  ppl6: {ar: 'دفع · سحب · رجل × 2', en: 'Push · Pull · Legs × 2', days: ['push', 'pull', 'legs', 'push', 'pull', 'legs']},
  ul6: {ar: 'علوي · سفلي × 2 + حرق', en: 'Upper/Lower × 2 + conditioning', days: ['upA', 'loA', 'cond', 'upB', 'loB', 'cond']},
  str4: {ar: 'قوة 4 أيام', en: 'Strength · 4 days', days: ['strA', 'upB', 'strB', 'loB']},
  health3: {ar: 'صحة ولياقة عامة', en: 'General health & fitness', days: ['fullA', 'cardio', 'fullB', 'mobility', 'fullC']},
  prenatal: {ar: 'برنامج الحمل الآمن', en: 'Safe pregnancy program', days: ['prenatal', 'mobility', 'prenatal']}
};
const DEFAULT_DAYS = {1: [6], 2: [6, 2], 3: [6, 1, 3], 4: [6, 0, 2, 3], 5: [6, 0, 1, 2, 3], 6: [6, 0, 1, 2, 3, 4]};
function trainCtx(p){
  p ||= S.profile; const hr = healthRules(p), place = p.place || 'gym';
  const have = new Set(['none', 'mat', 'bench', 'box']); if (place === 'gym') Object.keys(EQ).forEach(k => have.add(k)); else (p.homeEq || []).forEach(k => have.add(k));
  return {place, have, avoid: hr.trainAvoid, lvl: +p.level || 1, goal: p.goalType || 'lose', female: p.sex === 'f', hr};
}
function exAllowed(id, ctx){ ctx = typeof ctx === 'string' || !ctx ? trainCtx() : ctx; const e = EX[id]; if (!e) return false; if (!(e.eqk || ['none']).every(k => ctx.have.has(k))) return false; if ((e.avoid || []).some(a => ctx.avoid.has(a))) return false; return true; }
function pickEx(slot, n, ctx, used){
  const list = (PRI[slot] || []).filter(id => exAllowed(id, ctx));
  const lvlOk = list.filter(id => (EX[id].lvl || 1) <= ctx.lvl + (ctx.lvl === 1 ? 0 : 1));
  const pool = (lvlOk.length ? lvlOk : list).filter(id => !used.has(id));
  if (!pool.length) return null;
  return pool[Math.min(n, pool.length - 1)];
}
function chooseSplit(p){
  const g = p.goalType || 'lose', n = Math.max(1, Math.min(6, (p.trainDays || []).length || 3)), lvl = +p.level || 1;
  if (p.sex === 'f' && S.women?.mode === 'pregnant') return 'prenatal';
  if (p.program && p.program !== 'auto' && SPLITS[p.program]) return p.program;
  if (n <= 2) return 'full2';
  if (n === 3) return g === 'strength' && lvl >= 2 ? 'str3' : g === 'gain' && lvl >= 2 ? 'ppl3' : 'full3';
  if (n === 4) return g === 'strength' ? 'str4' : 'ul4';
  if (n === 5) return g === 'gain' ? 'pplul5' : (g === 'lose' || g === 'recomp') ? 'ul4c' : (g === 'fitness' || g === 'health') ? 'health3' : g === 'strength' ? 'str4' : 'ul4c';
  return g === 'gain' || g === 'strength' ? 'ppl6' : 'ul6';
}
const REPS = {
  strength: {main: [5, '3–5', 180], sec: [3, '6–8', 120], acc: [3, '10–12', 75]},
  gain: {main: [4, '6–10', 120], sec: [3, '8–12', 90], acc: [3, '12–15', 60]},
  recomp: {main: [4, '8–10', 90], sec: [3, '10–12', 75], acc: [3, '12–15', 60]},
  lose: {main: [3, '8–12', 90], sec: [3, '10–15', 60], acc: [3, '12–15', 45]},
  fitness: {main: [3, '10–12', 60], sec: [3, '12–15', 45], acc: [2, '15', 45]},
  health: {main: [3, '10–12', 75], sec: [2, '12', 60], acc: [2, '12–15', 60]}
};
function setScheme(id, i, goal, lvl, circuit, preg){
  const e = EX[id], sl = e.sl;
  if (sl === 'cardio') return [1, {ar: goal === 'lose' ? '30–40 دقيقة' : '20–30 دقيقة', en: goal === 'lose' ? '30–40 min' : '20–30 min'}, 0];
  if (sl === 'hiit') return circuit ? [3, {ar: '40 ث شغل / 20 ث راحة', en: '40 s on / 20 s off'}, 20] : [1, {ar: '8 جولات: 30 ث شغل / 30 ث راحة', en: '8 rounds: 30 s on / 30 s off'}, 0];
  if (sl === 'mob') return [2, {ar: '30–45 ث', en: '30–45 s'}, 15];
  const hold = ['plank', 'side_plank', 'hollow', 'wall_sit', 'superman', 'farmer_walk'].includes(id);
  let [s, r, rest] = (REPS[goal] || REPS.lose)[i < 2 ? 'main' : i < 4 ? 'sec' : 'acc'];
  if (lvl === 1) { s = Math.min(s, 3); if (goal === 'strength' && i < 2) r = '5–6'; }
  if (preg) { s = Math.min(s, 2); r = '10–12'; rest = Math.max(rest, 75); }
  if (circuit) { s = 3; r = '12–15'; rest = 20; }
  if (hold) return [s, {ar: lvl === 1 ? '20–30 ث' : '30–45 ث', en: lvl === 1 ? '20–30 s' : '30–45 s'}, Math.min(rest, 60)];
  if (!e.w && !['cardio', 'hiit', 'mob'].includes(sl)) { const bw = lvl === 1 ? '8–12' : lvl === 2 ? '12–15' : '15–20'; return [s, {ar: id.includes('lunge') || id.includes('bulg') || id.includes('step') || id === 'single_rdl' ? bw + ' لكل رجل' : ['bird_dog', 'dead_bug', 'bicycle', 'shoulder_tap', 'heel_touch'].includes(id) ? '10 لكل جنب' : bw, en: id.includes('lunge') || id.includes('bulg') || id.includes('step') || id === 'single_rdl' ? bw + ' per leg' : ['bird_dog', 'dead_bug', 'bicycle', 'shoulder_tap', 'heel_touch'].includes(id) ? '10 per side' : bw}, rest]; }
  return [s, r, rest];
}
const cardioMin = r => { const m = String(r?.en || r || '').match(/(\d+)\s*min/); return m ? +m[1] : 30; };
const exMinutes = ex => ex.reduce((m, [id, s, r, rest]) => m + (EX[id].sl === 'cardio' ? cardioMin(r) : EX[id].sl === 'hiit' && s === 1 ? 8 : s * (45 + rest) / 60 + 1), 0);
function buildDay(key, ctx, minutes, goal){
  const T = DAYT[key], used = new Set(), ex = [], preg = ctx.avoid.has('preg');
  T.s.forEach(sl => { const [slot, n] = sl.split(':'); const id = pickEx(slot, +(n || 0), ctx, used); if (!id) return; used.add(id); ex.push(id); });
  let rows = ex.map((id, i) => [id, ...setScheme(id, i, goal, ctx.lvl, !!T.circuit, preg)]);
  const cap = Math.max(25, minutes - 10);
  const over = () => exMinutes(rows) > cap, isCardio = r => EX[r[0]].sl === 'cardio' || (EX[r[0]].sl === 'hiit' && r[1] === 1);
  while (rows.length > 3 && over() && !isCardio(rows[rows.length - 1])) rows.pop();
  for (let pass = 0; pass < 3 && over(); pass++) for (let i = rows.length - 1; i >= 0 && over(); i--) if (!isCardio(rows[i]) && rows[i][1] > 2) rows[i][1]--;
  rows.forEach(r => { if (EX[r[0]].sl === 'cardio' && over()) { const m = Math.max(10, Math.floor((cap - exMinutes(rows.filter(x => x !== r))) / 5) * 5); r[2] = {ar: `${m} دقيقة`, en: `${m} min`}; } });
  while (rows.length > 2 && over()) rows.splice(rows.findIndex(r => !isCardio(r)) >= 0 && rows.length > 3 ? rows.length - 1 : rows.length - 1, 1);
  if ((goal === 'lose' || goal === 'recomp' || goal === 'fitness') && !T.circuit && T.k !== 'cardio' && !preg && exMinutes(rows) + 15 <= cap) { const f = pickEx(goal === 'lose' && !ctx.avoid.has('impact') && ctx.lvl > 1 ? 'hiit' : 'cardio', 0, ctx, new Set(ex)); if (f) rows.push([f, 1, EX[f].sl === 'hiit' ? {ar: '8 جولات: 30 ث / 30 ث', en: '8 rounds: 30 s / 30 s'} : {ar: '12–15 دقيقة', en: '12–15 min'}, 0]); }
  return {t: {ar: T.t[0], en: T.t[1]}, k: T.k || (T.circuit ? 'cond' : 'strength'), key, ex: rows};
}
function generateProgram(p){
  p ||= S.profile; const ctx = trainCtx(p), split = chooseSplit(p), sp = SPLITS[split];
  let days = (p.trainDays && p.trainDays.length ? p.trainDays : DEFAULT_DAYS[sp.days.length] || DEFAULT_DAYS[3]).slice().sort((a, b) => ((a + 1) % 7) - ((b + 1) % 7));
  const minutes = +p.minutes || 60, goal = p.goalType || 'lose', out = {};
  const keys = sp.days; days.forEach((dow, i) => { out[dow] = buildDay(keys[i % keys.length], ctx, minutes, goal); });
  const rest = [0, 1, 2, 3, 4, 5, 6].filter(d => !days.includes(d));
  const walkDays = goal === 'lose' || goal === 'recomp' || goal === 'health' || goal === 'fitness' ? rest.filter(d => d !== 5).slice(0, 2) : [];
  rest.forEach(d => { out[d] = walkDays.includes(d) ? {t: {ar: 'مشي خفيف', en: 'Easy walk'}, k: 'walk', key: 'walk', ex: [[exAllowed('outdoor_walk', ctx) ? 'outdoor_walk' : 'march', 1, minutes >= 55 ? {ar: '30–45 دقيقة', en: '30–45 min'} : {ar: `${Math.max(20, minutes - 10)} دقيقة`, en: `${Math.max(20, minutes - 10)} min`}, 0]]} : {t: {ar: 'راحة', en: 'Rest'}, k: 'rest', key: 'rest', ex: []}; });
  return {split, name: {ar: sp.ar, en: sp.en}, days: out, place: ctx.place, created: todayISO()};
}
function applyProgram(prog){ PROG = prog.days; GYM = Object.keys(prog.days).map(Number).filter(d => ['strength', 'cond', 'cardio'].includes(prog.days[d].k)); }
