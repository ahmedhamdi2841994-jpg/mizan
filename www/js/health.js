/* ميزان — health, training, food: calculations and views */
'use strict';
/* ---------- daily routine ---------- */
function scheduleFor(iso){
  const s = S.settings, dow = D(iso).getDay(), pt = prayerTimes(iso), gym = GYM.includes(dow) && !pregnantRest(), work = dow <= 4, fri = dow === 5;
  const meals = MEALS[dow], gT = t2m(s.gymTime || '16:30');
  const it = [
    ['fajr', pt.fajr, L('صلاة الفجر', 'Fajr prayer'), L('في المسجد + أذكار الصباح', 'At the mosque + morning adhkar'), 'prayer'],
    ['wake', 420, L('صحيان', 'Wake up'), L('كوبايتين مية + شمس 10 دقايق', 'Two glasses of water + 10 min sunlight'), 'h'],
    ['weigh', 425, L('الوزن', 'Weigh in'), L('بعد الحمام وقبل الأكل', 'After the bathroom, before food'), 'h'],
    ['tea1', 600, L('كوباية الشاي الأولى', 'First cup of tea'), L('مع كعك أرز، مش على معدة فاضية', 'With a rice cake, not on an empty stomach'), 'h'],
    ['dhuhr', pt.dhuhr, fri ? L('صلاة الجمعة', 'Jumuah prayer') : L('صلاة الظهر', 'Dhuhr prayer'), fri ? L('بكّر واقرأ سورة الكهف', 'Go early and read Surat Al-Kahf') : '', 'prayer'],
    ['meal1', 750, L('الوجبة الأولى', 'Meal 1'), LX(scaleMeal(meals.m1).n), 'meal'],
    ['tea2', 870, L('كوباية الشاي التانية', 'Second cup of tea'), '', 'h'],
    ['asr', pt.asr, L('صلاة العصر', 'Asr prayer'), '', 'prayer'],
    gym ? ['pre', gT - 20, L('سناك قبل الجيم + الشاي التالت', 'Pre-workout snack + third tea'), '', 'meal'] : ['tea3', 970, L('كوباية الشاي التالتة', 'Third cup of tea'), L('آخر شاي أحمر في اليوم', 'Last black tea of the day'), 'h'],
    gym ? ['gym', gT, L('الجيم: ', 'Gym: ') + LX(PROG[dow].t), L('75 دقيقة تقريبًا', 'About 75 minutes'), 'gym'] : (dow === 4 || pregnantRest() && dow !== 5 ? ['gym', gT, L('مشي 30–45 دقيقة', 'Walk 30–45 min'), '', 'gym'] : null),
    ['maghrib', pt.maghrib, L('صلاة المغرب', 'Maghrib prayer'), '', 'prayer'],
    ['meal2', Math.max(pt.maghrib + 15, gym ? gT + 95 : 0, 1080), L('الوجبة التانية', 'Meal 2'), LX(scaleMeal(meals.m2).n), 'meal'],
    ['quran', pt.maghrib + 50, L('ورد القرآن', 'Daily Quran'), L('حوالي نص ساعة', 'About half an hour'), 'h'],
    ['isha', pt.isha, L('صلاة العشاء', 'Isha prayer'), '', 'prayer'],
    ['ilm', pt.isha + 20, L('علم شرعي', 'Islamic study'), L('درس أو كتاب', 'A lesson or a book'), 'h'],
    (s.courseDays || []).includes(dow) ? ['course', t2m(s.courseTime || '20:30'), L('الكورس', 'Course'), L('PMP / التخطيط · مع نعناع أو زنجبيل', 'PMP / Planning · with mint or ginger tea'), 'h'] : null,
    ['night', 1350, L('سناك الليل', 'Night snack'), '', 'meal'],
    fri ? null : ['prep', 1365, L('تجهيز أكل بكرة + قفل الشاشات', 'Prep tomorrow’s food + screens off'), '', 'h'],
    ['sleep', 1395, L('النوم', 'Sleep'), L('أذكار النوم', 'Sleep adhkar'), 'h']
  ].filter(Boolean).map(([k, m, n, sub, c]) => ({k, m, n, s: sub, c}));
  return it.sort((a, b) => a.m - b.m);
}
function pregnantRest(){ return false; }
function prayersCount(iso, src){ const d = dayOf(iso, src); return PRAYER_KEYS.filter(k => d.sched?.[k]).length; }

/* ---------- calculations ---------- */
function calc(src){
  src = src || S; const p = src.profile; if (!p || !p.height || !p.age || !p.weight) return null;
  const t = src.today || todayISO(), dates = Object.keys(src.days).sort();
  const weights = dates.map(d => ({d, w: num(src.days[d].weight)})).filter(x => x.w !== null && x.d <= t);
  const last7 = weights.filter(x => daysBetween(x.d, t) < 7), prev7 = weights.filter(x => { const k = daysBetween(x.d, t); return k >= 7 && k < 14; });
  const curW = last7.length ? avg(last7.map(x => x.w)) : (weights.length ? weights.at(-1).w : p.weight);
  const female = (src.settings?.edition || S.settings.edition) === 'women' || p.sex === 'f';
  const h = p.height, bmi = curW / ((h / 100) ** 2);
  const bmr = 10 * curW + 6.25 * h - 5 * p.age + (female ? -161 : 5), tdee = bmr * (p.act || 1.375);
  const ibd = (p.conds || []).includes('ibd'); let def = +p.def || 0; if (ibd && def > 700) def = 700;
  const wm = src === S ? S.women || {} : {}; let extra = 0, mode = 'normal';
  if (female && wm.mode === 'pregnant') { def = 0; extra = wm.trimester === 3 ? 450 : wm.trimester === 2 ? 340 : 0; mode = 'pregnant'; }
  if (female && wm.mode === 'postpartum' && wm.breastfeeding) { def = Math.min(def, 300); extra = 400; mode = 'bf'; }
  const floor = female ? 1300 : 1600, avgT = Math.max(floor, tdee - def + extra), g = Math.min(7, Math.max(0, p.gymdays ?? 4)), split = g > 0 && g < 7 && mode === 'normal';
  const kTrain = r50(Math.max(floor, avgT + (split ? 100 : 0))), kRest = r50(Math.max(floor, avgT - (split ? 200 : 0)));
  let protein = r5(Math.min((female ? 1.6 : 1.8) * curW, 2.2 * (p.goal || curW))); if (mode === 'pregnant') protein = r5(Math.max(75, 1.1 * curW)); if (mode === 'bf') protein = r5(Math.max(protein, 1.3 * curW));
  const water = Math.round(curW * 0.035 * 4) / 4 + (mode === 'pregnant' ? 0.3 : mode === 'bf' ? 0.7 : 0);
  let rate = null;
  if (last7.length >= 3 && prev7.length >= 3) rate = avg(prev7.map(x => x.w)) - avg(last7.map(x => x.w));
  else if (weights.length >= 5) { const sp = daysBetween(weights[0].d, weights.at(-1).d); if (sp >= 5) rate = (weights[0].w - weights.at(-1).w) / sp * 7; }
  const expRate = def * 7 / 7700, toGo = p.goal && mode === 'normal' ? curW - p.goal : null;
  const useRate = rate && rate > 0.1 ? rate : (expRate > 0.1 ? expRate : null);
  const etaW = toGo !== null && toGo > 0 && useRate ? toGo / useRate : null, eta = etaW ? addDays(t, Math.round(etaW * 7)) : null;
  const meas = dates.filter(d => num(src.days[d].waist) && num(src.days[d].neck));
  let bf = null, waist = null; if (meas.length) { const m = src.days[meas.at(-1)]; waist = num(m.waist); bf = bodyFat(p, m, female); }
  return {curW, bmi, bmr, tdee, def, ibd, kTrain, kRest, protein, water, rate, expRate, eta, etaW, toGo, bf, waist, weights, floor, female, mode, startW: weights[0]?.w ?? p.weight};
}
function bodyFat(p, m, female){
  if (!m || !num(m.waist) || !num(m.neck) || !p.height) return null;
  if (female ?? S.settings.edition === 'women') return num(m.hip) ? 495 / (1.29579 - 0.35004 * Math.log10(m.waist + m.hip - m.neck) + 0.22100 * Math.log10(p.height)) - 450 : null;
  return 495 / (1.0324 - 0.19077 * Math.log10(m.waist - m.neck) + 0.15456 * Math.log10(p.height)) - 450;
}
const bmiLabel = b => b < 18.5 ? L('نحافة', 'Underweight') : b < 25 ? L('وزن طبيعي', 'Healthy') : b < 30 ? L('وزن زائد', 'Overweight') : L('سمنة', 'Obese');
const isGym = iso => GYM.includes(D(iso).getDay());
function scores(iso, src, c){
  const d = dayOf(iso, src), plan = planFor(iso);
  let wo = null;
  if (plan.ex.length) { let tot = 0, done = 0; plan.ex.forEach(e => { tot += e.sets; done += (d.wo?.[e.id] || []).slice(0, e.sets).filter(s => s && s.d).length; }); wo = tot ? done / tot : null; }
  const ml = mealsFor(iso), meals = ml.filter(m => ['done', 'swap'].includes(d.meals?.[m.key]?.s)).length / ml.length;
  const sc = scheduleFor(iso), hab = sc.filter(x => d.sched?.[x.k]).length / sc.length;
  c = c === undefined ? calc(src) : c; const wt = c ? Math.ceil(c.water / 0.25) : 12, water = Math.min(1, (d.water || 0) / wt);
  const parts = [wo, meals, hab, water].filter(v => v !== null), any = d.sched || d.meals || d.wo || d.water;
  return {wo, meals, hab, water, total: any ? parts.reduce((s, v) => s + v, 0) / parts.length : null};
}
function intake(iso, src){
  const d = dayOf(iso, src); let k = 0, p = 0;
  mealsFor(iso).forEach(m => { const st = d.meals?.[m.key]; if (!st) return; if (st.s === 'done') { k += m.k; p += m.p; } else if (st.s === 'swap') { const a = m.alts[st.alt || 0]; if (a) { k += a.k; p += a.p; } } });
  k += Math.round((d.tea || 0) * (d.sugar ?? 3) * 16);
  return {k, p};
}
function streak(){ const c = calc(); let n = 0, d = todayISO(); const s0 = scores(d, S, c).total; if (s0 === null || s0 < 0.6) d = addDays(d, -1); for (let i = 0; i < 400; i++) { const s = scores(d, S, c).total; if (s !== null && s >= 0.6) { n++; d = addDays(d, -1); } else break; } return n; }

/* ---------- alerts ---------- */
function lastN(n, src){ src = src || S; const t = src.today || todayISO(); return Object.keys(src.days).filter(d => { const k = daysBetween(d, t); return k >= 0 && k < n; }).sort().map(d => ({d, ...src.days[d], prayers: prayersCount(d, src)})); }
function evaluate(src){
  src = src || S; const c = calc(src), A = [], Sg = [], Im = [];
  const w7 = lastN(7, src), w3 = lastN(3, src), w14 = lastN(14, src);
  const add = (l, t, x) => A.push({l, t, x});
  if (w7.some(x => x.blood)) add('red', L('دم في البراز', 'Blood in stool'), L('راجع طبيب الجهاز الهضمي خلال يوم أو اتنين. لو الدم كتير أو معاه دوخة: طوارئ فورًا.', 'See a gastroenterologist within a day or two. Heavy bleeding or dizziness: go to the ER now.'));
  if (w3.some(x => x.vomit && num(x.pain) >= 6)) add('red', L('ألم شديد مع ترجيع', 'Severe pain with vomiting'), L('روح الطوارئ فورًا، خصوصًا لو مش قادر تخرج غازات أو براز.', 'Go to the ER now, especially if you cannot pass gas or stool.'));
  else if (w3.some(x => num(x.pain) >= 8)) add('red', L('ألم بطن شديد', 'Severe abdominal pain'), L('محتاج طبيب النهارده. لو معاه ترجيع أو حرارة عالية: طوارئ.', 'You need a doctor today. With vomiting or high fever: ER.'));
  if (w3.some(x => x.fever && num(x.pain) >= 5)) add('red', L('حرارة مع ألم في البطن', 'Fever with abdominal pain'), L('علامة التهاب نشط أو عدوى. كلم الطبيب في نفس اليوم.', 'A sign of active inflammation or infection. Call your doctor today.'));
  if (w3.some(x => num(x.stools) >= 6)) add('red', L('إسهال شديد', 'Severe diarrhoea'), L('6 مرات أو أكتر في اليوم. محلول معالجة جفاف وكلم الطبيب.', '6 or more times a day. Use oral rehydration and call your doctor.'));
  if (w7.filter(x => x.night).length >= 2) add('amber', L('إسهال بيصحيك من النوم', 'Night-time diarrhoea'), L('من علامات نشاط الالتهاب. حدد ميعاد مع طبيب الجهاز الهضمي.', 'A sign of active inflammation. Book a gastroenterologist.'));
  const pA = avg(w7.map(x => num(x.pain))), gA = avg(w7.map(x => num(x.gas))), sA = avg(w7.map(x => num(x.stools)));
  if (pA !== null && pA >= 4) add('amber', L('ألم مستمر في البطن', 'Ongoing abdominal pain'), L(`متوسط ${fmt(pA)} من 10. ارجع للأكل الآمن بس، ولو مفيش تحسن خلال أسبوع كلم الطبيب.`, `Average ${fmt(pA)}/10. Stick to safe foods; if no better within a week, call your doctor.`));
  if (gA !== null && gA >= 6) add('amber', L('انتفاخ عالي', 'High bloating'), L(`متوسط ${fmt(gA)} من 10. شوف "إيه اللي بيزوّد الانتفاخ" في التحليلات.`, `Average ${fmt(gA)}/10. Check "What triggers bloating" in Insights.`));
  if (sA !== null && sA >= 4) add('amber', L('دخول الحمام كتير', 'Frequent stools'), L(`متوسط ${fmt(sA)} مرات في اليوم.`, `Average ${fmt(sA)} a day.`));
  if (w7.filter(x => x.back).length >= 2) add('amber', L('ألم نص الضهر بعد الأكل', 'Mid-back pain after meals'), L('اتكرر الأسبوع ده. اطلب سونار على المرارة والبنكرياس.', 'Repeated this week. Ask for an ultrasound of the gallbladder and pancreas.'));
  if (w7.filter(x => x.allergy).length >= 3) add('amber', L('الحساسية الجلدية متكررة', 'Recurring skin allergy'), L('ظهرت 3 أيام أو أكتر. راجع طبيب جلدية أو حساسية.', 'Appeared 3+ days. See a dermatologist or allergist.'));
  const sl = avg(w7.map(x => num(x.sleep)));
  if (sl !== null && sl < 6 && w7.filter(x => num(x.sleep) !== null).length >= 4) add('amber', L('نوم قليل', 'Short sleep'), L(`متوسط ${fmt(sl)} ساعات. ثبّت ميعاد الصحيان.`, `Average ${fmt(sl)} h. Fix your wake-up time.`));
  if (c) {
    const ins = w7.map(x => intake(x.d, src)).filter(x => x.k > 200), prA = avg(ins.map(x => x.p)), kA = avg(ins.map(x => x.k));
    if (ins.length >= 3 && prA < c.protein * 0.8) add('amber', L('البروتين أقل من المطلوب', 'Protein below target'), L(`متوسط ${fmt(prA, 0)} جم من ${c.protein}.`, `Average ${fmt(prA, 0)} g of ${c.protein}.`));
    if (ins.length >= 3 && kA < c.floor) add('amber', L('سعرات قليلة جدًا', 'Calories too low'), L(`متوسط ${fmt(kA, 0)} سعر. متفوّتش وجبات.`, `Average ${fmt(kA, 0)} kcal. Don’t skip meals.`));
    if (c.mode === 'normal') {
      if (c.rate !== null && c.rate > 1.5 && w14.length >= 10) add('amber', L('نزول سريع زيادة', 'Losing too fast'), L(`حوالي ${fmt(c.rate)} كجم في الأسبوع. زوّد 150–200 سعر.`, `About ${fmt(c.rate)} kg/week. Add 150–200 kcal.`));
      if (c.rate !== null && c.rate < -0.2 && c.def > 0 && w14.length >= 10) add('amber', L('الوزن بيزيد', 'Weight is going up'), L('راجع السعرات والسناكس والسكر في الشاي.', 'Check calories, snacks and sugar in tea.'));
      else if (c.rate !== null && Math.abs(c.rate) < 0.15 && c.def > 0 && w14.length >= 12) add('amber', L('الوزن ثابت', 'Weight has stalled'), L('لو كده أسبوعين: قلّل 150 سعر من أيام الراحة أو زوّد 2000 خطوة.', 'If this lasts two weeks: cut 150 kcal on rest days or add 2,000 steps.'));
      if (c.bmi >= 30) add('amber', L('مؤشر كتلة الجسم في نطاق السمنة', 'BMI in the obese range'), L('تابع مع طبيب باطنة.', 'Follow up with an internist.'));
      if (c.bmi < 18.5) add('red', L('وزن أقل من الطبيعي', 'Underweight'), L('متنزلش أكتر. راجع طبيب وأخصائي تغذية.', 'Stop losing. See a doctor and a dietitian.'));
    }
  }
  const Lb = {}; [...(src.labs || [])].sort((a, b) => a.date.localeCompare(b.date)).forEach(l => Object.keys(l).forEach(k => { if (k !== 'date' && num(l[k]) !== null) Lb[k] = num(l[k]); }));
  const female = c?.female;
  if (Lb.sys || Lb.dia) { const s = Lb.sys || 0, d = Lb.dia || 0; if (s >= 180 || d >= 120) add('red', L('ضغط مرتفع جدًا', 'Very high blood pressure'), L(`${s}/${d}. مع صداع شديد أو ألم صدر أو زغللة: طوارئ.`, `${s}/${d}. With severe headache, chest pain or blurred vision: ER.`)); else if (s >= 140 || d >= 90) add(pregnant() ? 'red' : 'amber', L('الضغط أعلى من الطبيعي', 'Blood pressure above normal'), pregnant() ? L(`${s}/${d}. في الحمل ده محتاج دكتورة النسا النهارده.`, `${s}/${d}. In pregnancy, call your obstetrician today.`) : L(`${s}/${d}. قيسه أسبوع ولو فضل عالي روح لطبيب باطنة.`, `${s}/${d}. Measure for a week; if still high, see an internist.`)); }
  if (Lb.glu) { if (Lb.glu >= 126) add('red', L('سكر صائم مرتفع', 'High fasting glucose'), L(`${Lb.glu} mg/dL. طبيب باطنة يأكد بالتراكمي.`, `${Lb.glu} mg/dL. Confirm with HbA1c via a doctor.`)); else if (Lb.glu >= (pregnant() ? 92 : 100)) add('amber', L('سكر صائم حدّي', 'Borderline fasting glucose'), L(`${Lb.glu} mg/dL.`, `${Lb.glu} mg/dL.`)); }
  if (Lb.a1c) { if (Lb.a1c >= 6.5) add('red', L('السكر التراكمي مرتفع', 'High HbA1c'), L(`${Lb.a1c}%. لازم طبيب.`, `${Lb.a1c}%. See a doctor.`)); else if (Lb.a1c >= 5.7) add('amber', L('ما قبل السكر', 'Prediabetes range'), `${Lb.a1c}%`); }
  if (Lb.hb && Lb.hb < (pregnant() ? 11 : female ? 12 : 13)) add('red', L('مؤشر أنيميا', 'Possible anaemia'), L(`هيموجلوبين ${Lb.hb}. الطبيب يحدد السبب.`, `Haemoglobin ${Lb.hb}. A doctor should find the cause.`));
  if (Lb.fer && Lb.fer < 30) add('amber', L('مخزون الحديد قليل', 'Low iron stores'), L(`Ferritin ${Lb.fer}. العلاج يحدده الطبيب.`, `Ferritin ${Lb.fer}. Treatment is a doctor’s call.`));
  if (Lb.vitd && Lb.vitd < 30) add('amber', Lb.vitd < 20 ? L('نقص فيتامين د', 'Vitamin D deficiency') : L('فيتامين د أقل من المثالي', 'Vitamin D below optimal'), `${Lb.vitd} ng/mL`);
  if (Lb.b12 && Lb.b12 < 200) add('amber', L('نقص B12', 'Low B12'), `${Lb.b12} pg/mL`);
  if (Lb.crp && Lb.crp > 10) add('red', L('التهاب مرتفع في الدم', 'High inflammation marker'), `CRP ${Lb.crp} mg/L`);
  if (Lb.cal) { if (Lb.cal > 200) add('red', L('مؤشر التهاب نشط في الأمعاء', 'Active gut inflammation marker'), `Calprotectin ${Lb.cal} µg/g`); else if (Lb.cal >= 50) add('amber', L('Calprotectin حدّي', 'Borderline calprotectin'), `${Lb.cal} µg/g`); }
  if (src === S && typeof womenAlerts === 'function') womenAlerts(add);
  const sc7 = w7.map(x => scores(x.d, src, c)), woA = avg(sc7.map(s => s.wo)), mA = avg(sc7.filter(s => s.total !== null).map(s => s.meals));
  if (woA !== null && sc7.some(s => s.total !== null)) (woA >= 0.8 ? Sg : Im).push(L(`التزام التمرين ${fmt(woA * 100, 0)}%`, `Training adherence ${fmt(woA * 100, 0)}%`));
  if (mA !== null) (mA >= 0.8 ? Sg : Im).push(L(`الالتزام بالأكل ${fmt(mA * 100, 0)}%`, `Food adherence ${fmt(mA * 100, 0)}%`));
  if (sl !== null) (sl >= 7 ? Sg : Im).push(L(`متوسط النوم ${fmt(sl)} ساعات`, `Average sleep ${fmt(sl)} h`));
  const marked = w7.filter(x => x.sched); if (marked.length) { const prA = avg(marked.map(x => x.prayers)); (prA >= 4.5 ? Sg : Im).push(L(`الصلوات في وقتها ${fmt(prA)} من 5`, `On-time prayers ${fmt(prA)} of 5`)); }
  const stA = avg(w7.map(x => num(x.steps))); if (stA !== null) (stA >= 8000 ? Sg : Im).push(L(`الخطوات ${fmt(stA, 0)} في اليوم`, `${fmt(stA, 0)} steps a day`));
  const seeds = w7.filter(x => x.snackType === 'seeds').length; if (seeds) Im.push(L(`لب أو مكسرات ${seeds} ليالي`, `Seeds or nuts on ${seeds} nights`));
  if (c && c.rate !== null && c.rate >= 0.3 && c.rate <= 1.2 && c.mode === 'normal') Sg.push(L(`بتنزل بمعدل صحي: ${fmt(c.rate)} كجم أسبوعيًا`, `Losing at a healthy ${fmt(c.rate)} kg/week`));
  const reds = A.filter(a => a.l === 'red').length, ambers = A.filter(a => a.l === 'amber').length;
  return {A, Sg, Im, level: !c ? 'grey' : reds ? 'red' : ambers ? 'amber' : 'green', reds, ambers};
}

/* ---------- exercise figure ---------- */
function fig(ex){
  const f = ex.f, A = f.A, B = {...A, ...(f.B || {})}, dur = '2.8s';
  const an = (attr, a, b) => (reduceMotion || a === b) ? '' : `<animate attributeName="${attr}" values="${a};${b};${a}" dur="${dur}" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`;
  const mid = (Pp, a, b) => Pp[a] && Pp[b] ? [(Pp[a][0] + Pp[b][0]) / 2, (Pp[a][1] + Pp[b][1]) / 2] : null;
  const pt = (Pp, k) => k === 'sm' ? mid(Pp, 'sh', 'sh2') : k === 'hm' ? mid(Pp, 'hip', 'hip2') : Pp[k];
  const front = !!A.sh2;
  const bones = front ? [['sh', 'sh2'], ['hip', 'hip2'], ['sm', 'hm'], ['sh', 'el'], ['el', 'ha'], ['sh2', 'el2'], ['el2', 'ha2'], ['hip', 'kn'], ['kn', 'ft'], ['hip2', 'kn2'], ['kn2', 'ft2']]
                      : [['sh', 'hip'], ['sh', 'el'], ['el', 'ha'], ['hip', 'kn'], ['kn', 'ft'], ...(A.kn2 ? [['hip', 'kn2'], ['kn2', 'ft2']] : [])];
  const line = (a1, b1, a2, b2, cls) => `<line class="${cls}" x1="${a1[0]}" y1="${a1[1]}" x2="${b1[0]}" y2="${b1[1]}">${an('x1', a1[0], a2[0])}${an('y1', a1[1], a2[1])}${an('x2', b1[0], b2[0])}${an('y2', b1[1], b2[1])}</line>`;
  let eq = `<line class="gr" x1="14" y1="128.5" x2="186" y2="128.5"/>`;
  (f.eq || []).forEach(e => { if (e[0] === 'rect') eq += `<rect class="eqf" x="${e[1]}" y="${e[2]}" width="${e[3]}" height="${e[4]}" rx="2"/>`; else eq += `<line class="eq${e[5] ? ' thick' : ''}" x1="${e[1]}" y1="${e[2]}" x2="${e[3]}" y2="${e[4]}"/>`; });
  let att = '', att2 = '';
  (f.att || []).forEach(a => {
    const p1 = pt(A, a.at), p2 = pt(B, a.at);
    if (a.t === 'cable') { att += line(a.from, p1, a.from, p2, 'cab'); return; }
    if (a.t === 'toe') { att += line(p1, a.to, p2, a.to, 'body'); return; }
    let shape = '';
    if (a.t === 'db') shape = a.v ? '<rect class="wt" x="-4" y="-9" width="8" height="18" rx="2"/>' : '<rect class="wt" x="-9" y="-4" width="18" height="8" rx="2"/>';
    if (a.t === 'bar') shape = `<line class="bar" x1="${-a.w / 2}" y1="0" x2="${a.w / 2}" y2="0"/>`;
    if (a.t === 'handle') shape = '<circle class="wt" r="4"/>';
    if (a.t === 'pad') shape = '<rect class="pad" x="-8" y="-4" width="16" height="8" rx="3"/>';
    if (a.t === 'vpad') shape = '<line class="bar" x1="0" y1="-18" x2="0" y2="18"/>';
    if (a.t === 'plate') shape = '<circle class="wt" r="9"/>';
    const tr = (reduceMotion || (p1[0] === p2[0] && p1[1] === p2[1])) ? '' : `<animateTransform attributeName="transform" type="translate" values="${p1[0]} ${p1[1]};${p2[0]} ${p2[1]};${p1[0]} ${p1[1]}" dur="${dur}" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`;
    att2 += `<g transform="translate(${p1[0]} ${p1[1]})">${tr}${shape}</g>`;
  });
  let body = '';
  bones.forEach(([a, b]) => { const a1 = pt(A, a), b1 = pt(A, b), a2 = pt(B, a), b2 = pt(B, b); if (a1 && b1) body += line(a1, b1, a2, b2, 'body'); });
  const nk1 = front ? pt(A, 'sm') : A.sh, nk2 = front ? pt(B, 'sm') : B.sh;
  body += line(A.head, nk1, B.head, nk2, 'body');
  const head = `<circle class="head" cx="${A.head[0]}" cy="${A.head[1]}" r="9">${an('cx', A.head[0], B.head[0])}${an('cy', A.head[1], B.head[1])}</circle>`;
  return `<svg viewBox="0 -14 200 150" role="img" aria-label="${esc(LANG === 'en' ? ex.en : ex.ar)}" style="direction:ltr"><style>.body{stroke:var(--ink);stroke-width:6;stroke-linecap:round}.head{fill:var(--ink)}.gr{stroke:var(--line);stroke-width:1.5}.eq{stroke:var(--ink-3);stroke-width:3;stroke-linecap:round}.eq.thick{stroke-width:7}.eqf{fill:var(--ink-3);opacity:.55}.cab{stroke:var(--ink-3);stroke-width:1.5;stroke-dasharray:3 3}.wt{fill:var(--fire)}.bar{stroke:var(--fire);stroke-width:5;stroke-linecap:round}.pad{fill:var(--fire-2);opacity:.9}</style>${eq}${att}${body}${head}${att2}</svg>`;
}

/* ---------- views ---------- */
registerView('today', {title: {ar: 'اليوم', en: 'Today'}, icon: 'today', render(){
  const c = calc(), ev = evaluate(), sc = scores(CUR, S, c), plan = planFor(CUR), d = dayOf(CUR), name = S.profile?.name;
  const greet = new Date().getHours() < 12 ? L('صباح الخير', 'Good morning') : L('مساء الخير', 'Good evening');
  const lvlText = {grey: L('كمّل ملفك', 'Complete profile'), green: L('الحالة مستقرة', 'Stable'), amber: L('محتاج انتباه', 'Needs attention'), red: L('محتاج طبيب', 'See a doctor')}[ev.level];
  const tot = sc.total ?? 0, col = tot >= 0.8 ? 'var(--teal)' : tot >= 0.5 ? 'var(--fire-2)' : 'var(--fire)';
  const mini = (v, lbl, color) => `<div class="mini">${ring(v ?? 0, 48, 6, color)}<div><b>${v === null ? '—' : fmt(v * 100, 0) + '%'}</b><span>${lbl}</span></div></div>`;
  const sched = scheduleFor(CUR), isToday = CUR === todayISO(), nowM = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
  const nextIdx = nowM < 0 ? -1 : sched.findIndex(x => x.m >= nowM - 20 && !d.sched?.[x.k]);
  const tl = sched.map((x, i) => `<label class="tl ${x.c === 'prayer' ? 'pr' : ''} ${d.sched?.[x.k] ? 'done' : ''} ${i === nextIdx ? 'now' : ''}"><span class="t">${m2t(x.m)}</span><input type="checkbox" class="tick" data-sched="${x.k}" ${d.sched?.[x.k] ? 'checked' : ''}><span class="lab">${esc(x.n)}${x.s ? `<small>${esc(x.s)}</small>` : ''}</span></label>`).join('');
  const it = intake(CUR), tk = c ? (isGym(CUR) ? c.kTrain : c.kRest) : null;
  const motiv = [L('العضلة بتتبني من الالتزام، مش من الحماس.', 'Muscle is built by consistency, not hype.'), L('مجموعة كمان. دايمًا فيه مجموعة كمان.', 'One more set. There is always one more set.'), L('النهارده أقوى من امبارح.', 'Stronger than yesterday.'), L('الصلاة في وقتها أول مكسب في اليوم.', 'Praying on time is the first win of the day.')][new Date().getDate() % 4];
  const k = c ? (c.mode === 'normal' ? [
    [L('الوزن · متوسط 7 أيام', 'Weight · 7-day avg'), fmt(c.curW) + ` <small>${L('كجم', 'kg')}</small>`, c.toGo > 0 ? L(`فاضل ${fmt(c.toGo)} كجم للهدف`, `${fmt(c.toGo)} kg to goal`) : L('وصلت للهدف', 'Goal reached'), '', 1],
    [L('التغير الأسبوعي', 'Weekly change'), c.rate === null ? '—' : (c.rate >= 0 ? '−' : '+') + fmt(Math.abs(c.rate)) + ` <small>${L('كجم', 'kg')}</small>`, c.rate === null ? L('محتاج أسبوعين وزن', 'Needs two weeks of weigh-ins') : L(`المستهدف −${fmt(c.expRate)}`, `Target −${fmt(c.expRate)}`), c.rate === null ? '' : c.rate >= 0 ? 'down' : 'up'],
    [L('نزلت من البداية', 'Lost since start'), fmt(Math.max(0, c.startW - c.curW)) + ` <small>${L('كجم', 'kg')}</small>`, L(`من ${fmt(c.startW)} كجم`, `from ${fmt(c.startW)} kg`)],
    [L('الوصول للهدف', 'Goal date'), c.eta ? dShort(c.eta) + ' <small>' + D(c.eta).getFullYear() + '</small>' : '—', c.etaW ? L(`حوالي ${fmt(c.etaW, 0)} أسبوع`, `about ${fmt(c.etaW, 0)} weeks`) : ''],
    [L('سلسلة الالتزام', 'Streak'), streak() + ` <small>${L('يوم', 'days')}</small>`, L('أيام نتيجتها 60% أو أكتر', 'Days scoring 60%+')]
  ] : [[L('الوزن', 'Weight'), fmt(c.curW) + ` <small>${L('كجم', 'kg')}</small>`, '', '', 1], [L('سلسلة الالتزام', 'Streak'), streak() + ` <small>${L('يوم', 'days')}</small>`, '']]) : [];
  const pt = prayerTimes(CUR), nextP = PRAYER_KEYS.find(p => pt[p] > nowM);
  return topbar(`${greet}${name ? '، ' + esc(name) : ''}`, `${dLong(CUR)} · ${dHijri(CUR)}`, `<span class="pill ${ev.level}"><span class="dot"></span>${lvlText}</span>`) + `
  <div class="grid-hero">
    <div class="card hero">
      <div class="head"><div><div class="eyebrow">${esc(motiv)}</div><h2>${esc(plan.title)} · ${L('الأسبوع', 'Week')} ${plan.week} · ${esc(plan.ph.n)}</h2></div><button class="btn fire sm" type="button" data-v="${plan.ex.length ? 'workout' : 'meals'}">${plan.ex.length ? L('ابدأ التمرين', 'Start workout') : L('شوف الأكل', 'See meals')}</button></div>
      <div class="score">
        <div class="ringbig">${ring(tot, 170, 14, col)}<div class="c"><div><b class="num">${sc.total === null ? '0' : fmt(tot * 100, 0)}</b><span>${L('نتيجة اليوم', 'Day score')}</span></div></div></div>
        <div class="minirings">${mini(sc.wo, L('التمرين', 'Training'), 'var(--fire)')}${mini(sc.meals, L('الأكل', 'Food'), 'var(--teal)')}${mini(sc.hab, L('الروتين والصلاة', 'Routine & prayer'), 'var(--violet)')}${mini(sc.water, L('المية', 'Water'), 'var(--blue)')}</div>
      </div>
      <div class="meter" style="margin-top:18px">
        <div class="row"><span>${L('السعرات من الوجبات اللي علّمت عليها', 'Calories from meals you ticked')}</span><span class="num">${fmt(it.k, 0)} / ${tk ? fmt(tk, 0) : '—'}</span></div>
        <div class="bar-prog"><i style="width:${tk ? Math.min(100, it.k / tk * 100) : 0}%"></i></div>
        <div class="row"><span>${L('البروتين', 'Protein')}</span><span class="num">${fmt(it.p, 0)} / ${c ? c.protein : '—'} ${L('جم', 'g')}</span></div>
        <div class="bar-prog"><i style="width:${c ? Math.min(100, it.p / c.protein * 100) : 0}%"></i></div>
      </div>
    </div>
    <div class="card"><div class="head"><div><div class="eyebrow">${L('على مواقيت', 'Prayer times for')} ${esc(cityLabel())}${nextP && isToday ? ' · ' + L('الصلاة الجاية', 'Next') + ': ' + pName(nextP) + ' ' + m2t(pt[nextP]) : ''}</div><h2>${L('جدول اليوم', 'Today’s plan')}</h2></div><span class="muted small num">${sched.filter(x => d.sched?.[x.k]).length} / ${sched.length}</span></div><div class="timeline">${tl}</div></div>
  </div>
  ${typeof womenTodayCard === 'function' ? womenTodayCard() : ''}
  ${k.length ? `<div class="kpis">${k.map(x => `<div class="kpi"><div class="l">${x[0]}</div><div class="v">${x[1]}</div><div class="s ${x[3] || ''}">${x[2]}</div>${x[4] ? '<canvas id="spark"></canvas>' : ''}</div>`).join('')}</div>` : ''}
  <div class="two">
    <div class="card"><div class="head"><h2>${L('التنبيهات', 'Alerts')}</h2><button class="btn ghost sm" type="button" data-v="health">${L('كل التفاصيل', 'Details')}</button></div><div class="alerts">${alertsHTML(ev.A.slice(0, 3))}</div></div>
    <div class="card"><div class="head"><h2>${L('تسجيل سريع', 'Quick log')}</h2><span class="muted small">${L('الوزن الصبح بعد الحمام وقبل الأكل', 'Weigh in the morning before food')}</span></div>
      <div class="fgrid"><label class="f">${L('الوزن (كجم)', 'Weight (kg)')}<input type="number" step="0.1" inputmode="decimal" data-f="weight" value="${d.weight ?? ''}"></label><label class="f">${L('ساعات النوم', 'Sleep (h)')}<input type="number" step="0.25" inputmode="decimal" data-f="sleep" value="${d.sleep ?? ''}"></label><label class="f">${L('الخطوات', 'Steps')}<input type="number" inputmode="numeric" data-f="steps" value="${d.steps ?? ''}"></label></div>
      <p class="muted small" style="margin:12px 0 0">${L('الأعراض والمقاسات في', 'Symptoms and measurements are in')} <button type="button" class="link" data-v="log">${L('القياسات', 'Log')}</button>.</p></div>
  </div>`;
}, after(){ drawSpark(); }});
function drawSpark(){
  const el = document.getElementById('spark'); if (!el || !window.Chart) return;
  const t = todayISO(), ds = Array.from({length: 21}, (_, i) => addDays(t, i - 20)), w = ds.map(d => num(S.days[d]?.weight));
  if (w.filter(v => v !== null).length < 2) { el.remove(); return; }
  if (CH.spark) CH.spark.destroy();
  const c = hexOf('--fire');
  CH.spark = new Chart(el, {type: 'line', data: {labels: ds, datasets: [{data: w, borderColor: c, borderWidth: 2, pointRadius: 0, tension: .4, spanGaps: true, fill: true, backgroundColor: c + '22'}]}, options: {responsive: true, maintainAspectRatio: false, animation: false, plugins: {legend: {display: false}, tooltip: {enabled: false}}, scales: {x: {display: false}, y: {display: false}}}});
}

let WODAY = null;
function woDate(){ if (WODAY === null) return CUR; const diff = ((WODAY - D(CUR).getDay()) + 7) % 7; return addDays(CUR, diff > 3 ? diff - 7 : diff); }
registerView('workout', {title: {ar: 'التمرين', en: 'Workout'}, icon: 'workout', render(){
  const iso = woDate(), dow = D(iso).getDay(), plan = planFor(iso), d = dayOf(iso), sc = scores(iso);
  const seg = [6, 0, 1, 2, 3, 4, 5].map(w => `<button type="button" data-wday="${w}" aria-pressed="${w === dow}">${WD()[w]}<span class="d">${esc(LX(PROG[w].t))}</span></button>`).join('');
  let body;
  if (plan.k === 'rest') body = `<div class="card restday"><svg viewBox="0 0 120 120" width="110" height="110" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="var(--fire-soft)"/><path d="M74 36a28 28 0 1 0 10 34 24 24 0 0 1-10-34z" fill="var(--fire-2)"/></svg><h2>${L('يوم راحة كاملة', 'Full rest day')}</h2><p class="muted" style="max-width:46ch;margin:0">${L('العضل بيتبني في الراحة. صلاة الجمعة، والوجبة الحرة، ووقت مع الأهل.', 'Muscle grows while you rest. Jumuah, the free meal and family time.')}</p></div>`;
  else {
    const last = id => { const ds = Object.keys(S.days).filter(x => x < iso).sort().reverse(); for (const x of ds) { const sets = S.days[x].wo?.[id]; if (sets) { const kg = sets.map(s => num(s?.kg)).filter(v => v !== null); if (kg.length) return Math.max(...kg); } } return null; };
    body = `<div class="exgrid">${plan.ex.map((e, i) => {
      const X = EX[e.id], sets = d.wo?.[e.id] || [], doneN = sets.slice(0, e.sets).filter(s => s?.d).length, lk = last(e.id);
      const rows = Array.from({length: e.sets}, (_, j) => { const s = sets[j] || {}; return `<div class="set"><span class="sn">${L('مجموعة', 'Set')} ${j + 1}</span>${X.w ? `<input type="number" step="0.5" inputmode="decimal" placeholder="${lk !== null ? L('آخر مرة ', 'Last ') + lk : L('الوزن كجم', 'Weight kg')}" aria-label="${L('وزن المجموعة', 'Set weight')} ${j + 1}" data-kg="${e.id}|${j}" value="${s.kg ?? ''}">` : `<span class="muted small">${esc(e.reps)}</span>`}<button type="button" class="setbtn" data-set="${e.id}|${j}|${e.rest}" aria-pressed="${!!s.d}">${s.d ? L('تم ✓', 'Done ✓') : L('خلّصت', 'Done?')}</button></div>`; }).join('');
      return `<article class="card ex ${doneN === e.sets ? 'complete' : ''}"><div class="art">${fig(X)}<span class="idx" dir="ltr">${i + 1} / ${plan.ex.length}</span><span class="eq">${esc(LX({ar: X.eq[0], en: X.eq[1]}))}</span></div>
      <div class="bd"><h3>${esc(LANG === 'en' ? X.en : X.ar)}<small dir="ltr">${esc(LANG === 'en' ? X.ar : X.en)}</small></h3>
        <div class="meta"><span class="chip"><b dir="ltr">${e.sets} × ${esc(e.reps)}</b></span>${e.rest ? `<span class="chip">${L('راحة', 'Rest')} <b>${e.rest} ${L('ث', 's')}</b></span>` : ''}<span class="chip">${esc(LANG === 'en' ? X.mus[1] : X.mus[0])}</span><span class="chip ${doneN === e.sets ? 'ok' : ''}"><b>${fmt(doneN / e.sets * 100, 0)}%</b></span></div>
        <p class="tip">${esc(LANG === 'en' ? X.tip[1] : X.tip[0])}</p><div class="sets">${rows}</div>
        <div class="exfoot"><a class="link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(X.en + ' proper form')}" target="_blank" rel="noopener">${L('شوف الطريقة بالفيديو ↗', 'Watch the technique ↗')}</a>${lk !== null ? `<span class="muted">${L('أعلى وزن آخر مرة', 'Best last time')}: <b class="num">${lk}</b> ${L('كجم', 'kg')}</span>` : ''}</div></div></article>`; }).join('')}</div>`;
  }
  const ph = plan.ph;
  return topbar(L('التمرين', 'Workout'), `${WD()[dow]} · ${dShort(iso)}`) + `
  <div class="seg" role="group">${seg}</div>
  ${pregnant() ? `<div class="banner"><span>${L('أنتِ في وضع الحمل: الأوزان خفيفة، ومفيش تمارين على الضهر بعد الشهر الرابع، ووقّفي فورًا لو حسيتي بدوخة أو ألم أو نزيف. خدي موافقة دكتورتك على التمرين.', 'Pregnancy mode: keep weights light, no lying on your back after month 4, stop at once with dizziness, pain or bleeding. Get your obstetrician’s OK.')}</span></div>` : ''}
  <div class="card"><div class="row" style="justify-content:space-between"><div style="min-width:200px"><div class="eyebrow">${L('الأسبوع', 'Week')} ${plan.week} · ${L('المرحلة', 'Phase')} ${ph.c} ${L('من 12', 'of 12')}</div><h2>${esc(plan.title)} · ${esc(ph.n)}</h2></div>
    ${plan.ex.length ? `<div class="bar-prog"><i style="width:${(sc.wo || 0) * 100}%"></i></div><b class="num">${fmt((sc.wo || 0) * 100, 0)}%</b>` : ''}</div>
    <p class="muted small" style="margin:10px 0 0">${esc(ph.d)} ${plan.k === 'strength' ? L('قبل التمرين: إحماء 10 دقايق. بعده: مشي بميل 15 دقيقة وإطالة 5 دقايق.', 'Before: 10 min warm-up. After: 15 min incline walk and 5 min stretching.') : ''} ${L('لو بطنك تعبانة أو خدت مضاد هيستامين: خفّف الأوزان 30% أو اكتفي بالمشي.', 'If your gut is upset or you took an antihistamine: drop weights 30% or just walk.')}</p></div>
  ${body}`;
}});
on('click', e => {
  const wd = e.target.closest('[data-wday]'); if (wd) { WODAY = +wd.dataset.wday; if (WODAY === D(CUR).getDay()) WODAY = null; render(); return true; }
  const st = e.target.closest('[data-set]'); if (st) { const [id, j, rest] = st.dataset.set.split('|'), iso = woDate(), dd = day(iso); dd.wo ||= {}; dd.wo[id] ||= []; const s = dd.wo[id][+j] ||= {}; s.d = !s.d; store.save(); if (s.d && +rest > 0) startTimer(+rest); if (s.d) beep(660, .08, 1); render(); return true; }
});
on('change', e => { const T = e.target; if (T.dataset.kg) { const [id, j] = T.dataset.kg.split('|'), iso = woDate(), dd = day(iso); dd.wo ||= {}; dd.wo[id] ||= []; const s = dd.wo[id][+j] ||= {}; s.kg = num(T.value); store.save(); return true; } });

registerView('meals', {title: {ar: 'الأكل', en: 'Meals'}, icon: 'meals', render(){
  const c = calc(), list = mealsFor(CUR), d = dayOf(CUR), it = intake(CUR), gym = isGym(CUR);
  const tk = c ? (gym ? c.kTrain : c.kRest) : null, wt = c ? Math.ceil(c.water / 0.25) : 12, w = d.water || 0;
  const cards = list.map(m => {
    const st = d.meals?.[m.key] || {}, alt = m.alts[st.alt || 0], shown = st.s === 'swap' && alt ? alt : m;
    return `<article class="card meal ${st.s === 'done' || st.s === 'swap' ? 'done' : st.s === 'skip' ? 'skip' : ''}">
      <div class="when"><span class="pill fire">${m2t(t2m(m.t))} · ${esc(m.title)}</span><div class="meta"><span class="chip"><b>${shown.k}</b> ${L('سعر', 'kcal')}</span><span class="chip"><b>${shown.p}</b> ${L('جم بروتين', 'g protein')}</span></div></div>
      <h3>${esc(LX(shown.n))}</h3>
      <table class="ing">${shown.ing.map(x => `<tr><td>${esc(ingName(x))}</td><td>${esc(ingAmt(x))}</td></tr>`).join('')}</table>
      ${st.s !== 'swap' && m.how ? `<p class="muted small" style="margin:0">${esc(LX(m.how))}</p>` : ''}
      <div class="acts"><button type="button" class="d" data-meal="${m.key}|done" aria-pressed="${st.s === 'done'}">${L('أكلتها ✓', 'Ate it ✓')}</button><button type="button" class="s" data-meal="${m.key}|swap" aria-pressed="${st.s === 'swap'}">${L('بدّلت', 'Swapped')}</button><button type="button" class="x" data-meal="${m.key}|skip" aria-pressed="${st.s === 'skip'}">${L('مأكلتهاش', 'Skipped')}</button></div>
      ${st.s === 'swap' ? `<label class="f">${L('البديل اللي أكلته', 'What you ate instead')}<select data-alt="${m.key}">${m.alts.map((a, i) => `<option value="${i}" ${i === (st.alt || 0) ? 'selected' : ''}>${esc(LX(a.n))} (${a.k} ${L('سعر', 'kcal')})</option>`).join('')}</select></label>` : ''}
    </article>`; }).join('');
  return topbar(L('الأكل', 'Meals'), `${WD()[D(CUR).getDay()]} · ${gym ? L('يوم تمرين', 'Training day') : L('يوم راحة', 'Rest day')}`) + `
  <div class="kpis">
    <div class="kpi"><div class="l">${L('السعرات', 'Calories')}</div><div class="v">${fmt(it.k, 0)} <small>/ ${tk ? fmt(tk, 0) : '—'}</small></div><div class="bar-prog" style="margin-top:8px"><i style="width:${tk ? Math.min(100, it.k / tk * 100) : 0}%"></i></div></div>
    <div class="kpi"><div class="l">${L('البروتين', 'Protein')}</div><div class="v">${fmt(it.p, 0)} <small>/ ${c ? c.protein : '—'} ${L('جم', 'g')}</small></div><div class="bar-prog" style="margin-top:8px"><i style="width:${c ? Math.min(100, it.p / c.protein * 100) : 0}%"></i></div></div>
    <div class="kpi"><div class="l">${L('المية', 'Water')}</div><div class="v">${fmt(w * 0.25)} <small>/ ${c ? fmt(c.water) : '—'} ${L('لتر', 'L')}</small></div><div class="s">${w} ${L('من', 'of')} ${wt} ${L('كوباية', 'glasses')}</div></div>
    <div class="kpi"><div class="l">${L('سكر الشاي', 'Sugar in tea')}</div><div class="v">${fmt((d.tea || 0) * (d.sugar ?? 3) * 16, 0)} <small>${L('سعر', 'kcal')}</small></div><div class="s">${d.tea || 0} × ${d.sugar ?? 3} ${L('معلقة', 'tsp')}</div></div>
  </div>
  <div class="two">
    <div class="card"><div class="head"><h2>${L('المية', 'Water')}</h2><span class="muted small">${L('دوس على الكوباية · كل واحدة 250 مل', 'Tap a glass · 250 ml each')}</span></div><div class="glasses">${Array.from({length: wt}, (_, i) => `<button type="button" class="glass ${i < w ? 'on' : ''}" data-water="${i + 1}" aria-label="${i + 1}"></button>`).join('')}</div></div>
    <div class="card"><div class="head"><h2>${L('الشاي', 'Tea')}</h2><span class="muted small">${L('بعيد عن الأكل بساعة', 'One hour away from meals')}</span></div>
      <div class="row"><span>${L('كوبايات', 'Cups')}</span><span class="counter"><button type="button" data-cnt="tea|-1">−</button><b>${d.tea || 0}</b><button type="button" data-cnt="tea|1">+</button></span><span>${L('معالق سكر', 'Sugar tsp')}</span><span class="counter"><button type="button" data-cnt="sugar|-0.5">−</button><b>${d.sugar ?? 3}</b><button type="button" data-cnt="sugar|0.5">+</button></span></div>
      <p class="muted small" style="margin:10px 0 0">${L('الهدف: نص معلقة أقل كل أسبوعين لحد معلقة واحدة.', 'Goal: half a teaspoon less every two weeks, down to one.')} ${pregnant() ? L('في الحمل: الكافيين أقل من 200 مجم في اليوم (حوالي كوبايتين شاي).', 'In pregnancy: caffeine under 200 mg a day (about two cups of tea).') : ''}</p></div>
  </div>
  <div class="meals">${cards}</div>
  <p class="muted small">${L('ممنوع حاليًا: البيض، الألبان العادية، البصل والتوم والطماطم، المقلي والحراق، البقوليات، واللب والمكسرات. التفاصيل في الخطة.', 'Avoid for now: eggs, regular dairy, onion/garlic/tomato, fried and spicy food, legumes, seeds and nuts. Details in the Plan.')}</p>`;
}});
on('click', e => {
  const m = e.target.closest('[data-meal]'); if (m) { const [k, s] = m.dataset.meal.split('|'), dd = day(CUR); dd.meals ||= {}; const cur = dd.meals[k] || {}; dd.meals[k] = cur.s === s ? {} : {s, alt: cur.alt || 0}; const sk = {m1: 'meal1', m2: 'meal2', pre: 'pre', night: 'night'}[k]; dd.sched ||= {}; dd.sched[sk] = ['done', 'swap'].includes(dd.meals[k].s); store.save(); render(); return true; }
  const w = e.target.closest('[data-water]'); if (w) { const dd = day(CUR), n = +w.dataset.water; dd.water = dd.water === n ? n - 1 : n; store.save(); render(); return true; }
  const cn = e.target.closest('[data-cnt]'); if (cn) { const [f, step] = cn.dataset.cnt.split('|'), dd = day(CUR), base = f === 'sugar' ? (dd.sugar ?? 3) : (dd[f] || 0); dd[f] = Math.max(0, Math.round((base + +step) * 2) / 2); store.save(); render(); return true; }
});
on('change', e => {
  const T = e.target;
  if (T.dataset.alt) { const dd = day(CUR); dd.meals[T.dataset.alt].alt = +T.value; store.save(); render(); return true; }
  if (T.dataset.sched) { const dd = day(CUR); dd.sched ||= {}; dd.sched[T.dataset.sched] = T.checked; store.save(); render(); return true; }
  if (T.dataset.f) { const dd = day(CUR), f = T.dataset.f; dd[f] = T.dataset.text ? T.value : num(T.value); store.save(); if (VIEW !== 'log' || ['waist', 'neck', 'hip'].includes(f)) render(); return true; }
});

registerView('log', {title: {ar: 'القياسات', en: 'Log'}, icon: 'log', render(){
  const d = dayOf(CUR), women = S.settings.edition === 'women';
  const scale = (f, from, to, cls) => `<div class="scale ${cls || ''}" role="group">${Array.from({length: to - from + 1}, (_, i) => i + from).map(v => `<button type="button" data-scale="${f}|${v}" aria-pressed="${d[f] === v}">${v}</button>`).join('')}</div>`;
  const chip = (f, l) => `<button type="button" data-flag="${f}" aria-pressed="${!!d[f]}">${l}</button>`;
  const trig = (v, l) => `<button type="button" data-trig="${v}" aria-pressed="${(d.triggers || []).includes(v)}">${l}</button>`;
  const inp = (f, l, step) => `<label class="f">${l}<input type="number" ${step ? `step="${step}"` : ''} inputmode="decimal" data-f="${f}" value="${d[f] ?? ''}"></label>`;
  const bf = bodyFat(S.profile || {}, d);
  return topbar(L('القياسات واليوم', 'Daily log'), dLong(CUR)) + `
  <div class="three">
    <div class="card form"><h2>${L('الجسم', 'Body')}</h2><div class="fgrid">${inp('weight', L('الوزن الصبح (كجم)', 'Morning weight (kg)'), '0.1')}${inp('waist', L('الوسط عند السرة (سم)', 'Waist at navel (cm)'), '0.5')}${inp('neck', L('الرقبة (سم)', 'Neck (cm)'), '0.5')}${women ? inp('hip', L('الأرداف (سم)', 'Hips (cm)'), '0.5') : ''}${inp('steps', L('الخطوات', 'Steps'))}</div>
      <p class="muted small" style="margin:0">${bf ? L('نسبة الدهون التقديرية', 'Estimated body fat') + `: <b class="num">${fmt(bf)}%</b>` : L('المقاسات مرة في الأسبوع كفاية.', 'Measurements once a week are enough.')}</p></div>
    <div class="card form"><h2>${L('النوم والمزاج', 'Sleep & mood')}</h2><div class="fgrid">${inp('sleep', L('ساعات النوم', 'Hours slept'), '0.25')}</div>
      <div><div class="eyebrow">${L('جودة النوم', 'Sleep quality')}</div>${scale('sleepq', 1, 5)}</div><div><div class="eyebrow">${L('المزاج', 'Mood')}</div>${scale('mood', 1, 5)}</div><div><div class="eyebrow">${L('التوتر', 'Stress')}</div>${scale('stress', 1, 5)}</div></div>
    <div class="card form"><h2>${L('الجانب الروحاني', 'Faith')}</h2>
      <p class="muted small" style="margin:0">${L('الصلوات بتتحسب من جدول اليوم', 'Prayers are counted from today’s plan')}: <b class="num">${prayersCount(CUR)}</b> / 5</p>
      <div class="fgrid">${inp('quran', L('قرآن (دقيقة)', 'Quran (min)'))}${inp('ilm', L('علم شرعي (دقيقة)', 'Study (min)'))}</div></div>
  </div>
  <div class="card form"><h2>${L('المعدة والأمعاء', 'Gut')}</h2>
    <div class="two" style="gap:16px"><div><div class="eyebrow">${L('ألم البطن (0 = مفيش)', 'Abdominal pain (0 = none)')}</div>${scale('pain', 0, 10, 'gut')}</div><div><div class="eyebrow">${L('غازات وانتفاخ', 'Gas & bloating')}</div>${scale('gas', 0, 10, 'gut')}</div></div>
    <div class="row"><span>${L('مرات دخول الحمام', 'Bowel movements')}</span><span class="counter"><button type="button" data-cnt="stools|-1">−</button><b>${d.stools || 0}</b><button type="button" data-cnt="stools|1">+</button></span></div>
    <div><div class="eyebrow">${L('علامات (بتظهر في التنبيهات)', 'Warning signs (shown in alerts)')}</div><div class="chips danger" style="margin-top:6px">${chip('blood', L('دم في البراز', 'Blood in stool'))}${chip('night', L('إسهال صحّاني من النوم', 'Night diarrhoea'))}${chip('fever', L('حرارة', 'Fever'))}${chip('vomit', L('ترجيع', 'Vomiting'))}${chip('back', L('ألم نص الضهر بعد الأكل', 'Mid-back pain after food'))}${chip('allergy', L('حساسية جلدية', 'Skin allergy'))}</div></div>
    <div><div class="eyebrow">${L('أكلت حاجة من دول؟', 'Did you eat any of these?')}</div><div class="chips" style="margin-top:6px">${trig('lactose', L('ألبان عادية', 'Regular dairy'))}${trig('fried', L('مقلي أو دسم', 'Fried or fatty'))}${trig('onion', L('بصل أو توم أو طماطم', 'Onion, garlic or tomato'))}${trig('legumes', L('بقوليات', 'Legumes'))}${trig('spicy', L('حراق', 'Spicy'))}${trig('egg', L('بيض', 'Egg'))}</div></div>
    <div><div class="eyebrow">${L('سناك الليل كان', 'Night snack was')}</div><div class="chips" style="margin-top:6px">${[['safe', L('سناك آمن', 'Safe snack')], ['seeds', L('لب أو مكسرات', 'Seeds or nuts')], ['junk', L('حلويات أو مقرمشات', 'Sweets or chips')], ['none', L('مفيش', 'None')]].map(([v, l]) => `<button type="button" data-snack="${v}" aria-pressed="${d.snackType === v}">${l}</button>`).join('')}</div></div>
    <label class="f">${L('ملاحظات', 'Notes')}<textarea data-f="notes" data-text="1">${esc(d.notes || '')}</textarea></label>
  </div>`;
}});
on('click', e => {
  const s = e.target.closest('[data-scale]'); if (s) { const [f, v] = s.dataset.scale.split('|'), dd = day(CUR); dd[f] = dd[f] === +v ? null : +v; store.save(); render(); return true; }
  const fl = e.target.closest('[data-flag]'); if (fl) { const dd = day(CUR), f = fl.dataset.flag; dd[f] = !dd[f]; store.save(); render(); return true; }
  const tg = e.target.closest('[data-trig]'); if (tg) { const dd = day(CUR), v = tg.dataset.trig; dd.triggers ||= []; dd.triggers = dd.triggers.includes(v) ? dd.triggers.filter(x => x !== v) : [...dd.triggers, v]; store.save(); render(); return true; }
  const sn = e.target.closest('[data-snack]'); if (sn) { const dd = day(CUR), v = sn.dataset.snack; dd.snackType = dd.snackType === v ? null : v; store.save(); render(); return true; }
});

/* ---------- insights ---------- */
function demoData(){
  const t = todayISO(), start = addDays(t, -41), o = {profile: {...DEF_PROFILE, start}, days: {}, labs: [], today: t};
  const R = (i, a) => Math.abs((Math.sin(i * 12.9898 + a * 78.233) * 43758.5453) % 1);
  let w = 95.2;
  for (let i = 0; i <= 41; i++) {
    const iso = addDays(start, i), dow = D(iso).getDay(), plan = PROG[dow], seeds = R(i, 2) > (i < 14 ? 0.5 : 0.82);
    w -= (i < 10 ? 0.16 : 0.095); const wo = {};
    plan.ex.forEach(([id, sets]) => { wo[id] = Array.from({length: sets}, (_, j) => ({d: R(i, 3 + j) > 0.12, kg: EX[id].w ? Math.round((id === 'leg_press' ? 80 : id === 'assisted_pullup' ? 40 : 18) + i * 0.45) : null})); });
    const meals = {}; ['m1', 'm2', 'pre', 'night'].forEach((k, j) => meals[k] = {s: R(i, 5 + j) > 0.05 ? (R(i, 9 + j) > 0.85 ? 'swap' : 'done') : 'skip', alt: 0});
    const sched = {}; scheduleFor(iso).forEach((x, j) => sched[x.k] = R(i, 20 + j) > (i < 14 ? 0.35 : 0.15));
    o.days[iso] = {weight: +(w + (R(i, 4) - 0.5) * 0.7).toFixed(1), waist: i % 7 === 0 ? +(104 - i * 0.11).toFixed(1) : null, neck: i % 7 === 0 ? 41 : null,
      steps: Math.round(5800 + i * 90 + R(i, 8) * 2200), sleep: +(5.6 + i * 0.035 + R(i, 9) * 0.9).toFixed(2), pain: seeds ? 4 : (R(i, 11) > 0.7 ? 2 : 1), gas: seeds ? 7 : 3 + (R(i, 12) > 0.75 ? 2 : 0), stools: 2,
      snackType: seeds ? 'seeds' : 'safe', triggers: R(i, 13) > 0.82 ? ['fried'] : [], back: seeds && R(i, 14) > 0.6, water: 8 + Math.round(R(i, 15) * 5), tea: 3, sugar: i < 14 ? 3 : i < 28 ? 2.5 : 2,
      quran: 15 + Math.round(i * 0.4), ilm: i % 2 ? 20 : 0, wo, meals, sched};
  }
  return o;
}
registerView('insights', {title: {ar: 'التحليلات', en: 'Insights'}, icon: 'insights', render(){
  const real = Object.keys(S.days).filter(k => S.days[k].weight != null || S.days[k].wo || S.days[k].meals).length;
  const preview = real < 3, src = preview ? demoData() : S, c = calc(src), ev = evaluate(src), t = src.today || todayISO();
  INS_SRC = src; INS_C = c;
  const days = Array.from({length: 84}, (_, i) => addDays(t, i - 83)), padN = D(days[0]).getDay();
  const heat = Array.from({length: padN}, () => '<i style="visibility:hidden"></i>').join('') + days.map(dd => { const s = scores(dd, src, c).total; const l = s === null ? 0 : s < 0.4 ? 1 : s < 0.7 ? 2 : s < 0.9 ? 3 : 4; return `<i data-l="${l}" class="${dd === t ? 'today' : ''}" title="${dShort(dd)}: ${s === null ? '—' : fmt(s * 100, 0) + '%'}"></i>`; }).join('');
  const k = c ? [[L('الوزن الحالي', 'Current weight'), fmt(c.curW) + ` <small>${L('كجم', 'kg')}</small>`, `BMI ${fmt(c.bmi)} · ${bmiLabel(c.bmi)}`], [L('نسبة الدهون', 'Body fat'), c.bf ? fmt(c.bf) + '<small>%</small>' : '—', c.waist ? L(`الوسط ${fmt(c.waist)} سم`, `Waist ${fmt(c.waist)} cm`) : L('سجّل الوسط والرقبة', 'Log waist & neck')], [L('الحرق اليومي', 'Daily burn'), fmt(c.tdee, 0) + ` <small>${L('سعر', 'kcal')}</small>`, `BMR ${fmt(c.bmr, 0)}`], [L('معدل النزول', 'Loss rate'), c.rate === null ? '—' : fmt(c.rate) + ` <small>${L('كجم/أسبوع', 'kg/wk')}</small>`, L(`المستهدف ${fmt(c.expRate)}`, `Target ${fmt(c.expRate)}`)]] : [];
  const title = c && c.rate !== null ? L(`بتنزل ${fmt(c.rate)} كجم في الأسبوع`, `Losing ${fmt(c.rate)} kg per week`) + (c.eta ? L('، والوصول للهدف ', ', goal by ') + dShort(c.eta) + ' ' + D(c.eta).getFullYear() : '') : L('منحنى الوزن', 'Weight trend');
  const box = (id, h, sub) => `<div class="card"><div class="head"><h2>${h}</h2>${sub ? `<span class="muted small">${sub}</span>` : ''}</div><div class="chart"><canvas id="${id}"></canvas></div></div>`;
  return topbar(L('التحليلات', 'Insights'), preview ? L('معاينة ببيانات تجريبية', 'Preview with sample data') : L('آخر 12 أسبوع', 'Last 12 weeks'), '', true) + `
  ${preview ? `<div class="banner"><span><b>${L('دي معاينة ببيانات تجريبية', 'This is a sample preview')}</b> ${L('علشان تشوف شكل التحليلات. بعد 3 أيام تسجيل، بياناتك الحقيقية هتظهر مكانها.', 'so you can see how insights look. After 3 days of logging, your own data replaces it.')}</span><button class="btn sm" type="button" data-v="today">${L('ابدأ التسجيل', 'Start logging')}</button></div>` : ''}
  <div class="kpis">${k.map(x => `<div class="kpi"><div class="l">${x[0]}</div><div class="v">${x[1]}</div><div class="s">${x[2]}</div></div>`).join('')}</div>
  <div class="card"><div class="head"><div><div class="eyebrow">${L('الوزن الفعلي مقابل المسار المتوقع', 'Actual vs expected weight')}</div><h2>${title}</h2></div></div><div class="chart tall"><canvas id="cWeight"></canvas></div></div>
  <div class="card"><div class="head"><div><div class="eyebrow">${L('نتيجة كل يوم', 'Daily score')}</div><h2>${L('خريطة الالتزام', 'Consistency map')}</h2></div><div class="legend">${L('أقل', 'Less')} <i style="background:var(--panel-3)"></i><i style="background:color-mix(in srgb,var(--fire) 25%,var(--panel-3))"></i><i style="background:color-mix(in srgb,var(--fire) 50%,var(--panel-3))"></i><i style="background:color-mix(in srgb,var(--fire) 75%,var(--panel-3))"></i><i style="background:var(--fire-2)"></i> ${L('أكتر', 'More')}</div></div><div class="heat" style="direction:ltr">${heat}</div></div>
  <div class="two">
    ${box('cVol', L('حجم التمرين الأسبوعي', 'Weekly training volume'), L('مجموعات خلّصتها', 'Sets completed'))}
    <div class="card"><div class="head"><h2>${L('تطور القوة', 'Strength progress')}</h2><select id="strSel" style="width:auto">${Object.keys(EX).filter(x => EX[x].w).map(x => `<option value="${x}">${esc(LANG === 'en' ? EX[x].en : EX[x].ar)}</option>`).join('')}</select></div><div class="chart"><canvas id="cStr"></canvas></div></div>
    ${box('cFood', L('السعرات والبروتين', 'Calories & protein'), L('آخر 21 يوم', 'Last 21 days'))}
    ${box('cSleep', L('النوم', 'Sleep'), L('الهدف 7 ساعات', 'Target 7 h'))}
    ${box('cGut', L('المعدة والأمعاء', 'Gut symptoms'), L('من 10', 'out of 10'))}
    ${box('cTrig', L('إيه اللي بيزوّد الانتفاخ؟', 'What triggers bloating?'), L('اليوم واللي بعده', 'That day and the next'))}
    ${box('cSpirit', L('الصلاة والقرآن', 'Prayer & Quran'))}
    ${box('cBody', L('الوسط ونسبة الدهون', 'Waist & body fat'))}
  </div>
  <div class="two"><div class="card"><h2 style="margin-bottom:10px">${L('نقاط قوتك', 'Strengths')}</h2><ul class="muted" style="margin:0;padding-inline-start:20px">${(ev.Sg.length ? ev.Sg : [L('سجّل كام يوم علشان تظهر هنا', 'Log a few days to see these')]).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="card"><h2 style="margin-bottom:10px">${L('محتاج تحسين', 'To improve')}</h2><ul class="muted" style="margin:0;padding-inline-start:20px">${(ev.Im.length ? ev.Im : ['—']).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
}, after(){ drawInsights(INS_SRC, INS_C); }});
let INS_SRC = null, INS_C = null;
function drawInsights(src, c){
  if (!window.Chart || !src) return;
  const fire = hexOf('--fire'), fire2 = hexOf('--fire-2'), teal = hexOf('--teal'), violet = hexOf('--violet'), warn = hexOf('--warn'), bad = hexOf('--bad'), ink3 = hexOf('--ink-3'), good = hexOf('--good'), blue = hexOf('--blue');
  const t = src.today || todayISO(), all = Object.keys(src.days).sort(), span = all.length ? Math.min(84, daysBetween(all[0], t) + 1) : 0;
  const dates = Array.from({length: span}, (_, i) => addDays(t, i - span + 1)), labels = dates.map(dShort);
  const wts = dates.map(d => num(src.days[d]?.weight)), ma = wts.map((_, i) => { const v = avg(wts.slice(Math.max(0, i - 6), i + 1)); return v === null ? null : +v.toFixed(2); });
  const p = src.profile || {}, fw = c?.weights?.[0], kg = L(' كجم', ' kg');
  const proj = dates.map(d => fw && c ? Math.max(p.goal || 0, +(fw.w - c.expRate * daysBetween(fw.d, d) / 7).toFixed(2)) : null);
  mk('cWeight', {type: 'line', data: {labels, datasets: [
    {label: L('متوسط 7 أيام', '7-day average'), data: ma, borderColor: fire, backgroundColor: grad('cWeight', fire), fill: true, borderWidth: 3, pointRadius: 0, tension: .35, spanGaps: true},
    {label: L('الوزن اليومي', 'Daily weight'), data: wts, borderColor: 'transparent', backgroundColor: ink3, pointRadius: 2.5, showLine: false},
    {label: L('المسار المتوقع', 'Expected path'), data: proj, borderColor: teal, borderDash: [6, 5], borderWidth: 1.5, pointRadius: 0},
    {label: L('الهدف', 'Goal'), data: dates.map(() => p.goal || null), borderColor: good, borderDash: [2, 4], borderWidth: 1.5, pointRadius: 0}]},
    options: {scales: {x: {}, y: {ticks: {callback: v => v + kg}}}}});
  const weeks = []; for (let i = 0; i < 12; i++) { const st = addDays(t, -7 * i - 6); let n = 0; for (let j = 0; j < 7; j++) { const dd = src.days[addDays(st, j)]; if (dd?.wo) Object.values(dd.wo).forEach(a => a.forEach(s => { if (s?.d) n++; })); } weeks.unshift({l: dShort(st), n}); }
  mk('cVol', {type: 'bar', data: {labels: weeks.map(w => w.l), datasets: [{label: L('مجموعات', 'Sets'), data: weeks.map(w => w.n), backgroundColor: fire, borderRadius: 6, maxBarThickness: 26}]}, options: {plugins: {legend: {display: false}}, scales: {x: {}, y: {beginAtZero: true}}}});
  const drawStr = () => { const id = $('#strSel')?.value; if (!id) return; const pts = all.map(d => { const a = src.days[d].wo?.[id]; if (!a) return null; const k = a.map(s => num(s?.kg)).filter(v => v !== null); return k.length ? {d, k: Math.max(...k)} : null; }).filter(Boolean);
    mk('cStr', {type: 'line', data: {labels: pts.map(x => dShort(x.d)), datasets: [{label: L('أعلى وزن', 'Top weight'), data: pts.map(x => x.k), borderColor: teal, backgroundColor: grad('cStr', teal), fill: true, tension: .3, pointRadius: 3, pointBackgroundColor: teal}]}, options: {plugins: {legend: {display: false}}, scales: {x: {}, y: {ticks: {callback: v => v + kg}}}}}); };
  drawStr(); const sel = $('#strSel'); if (sel) sel.onchange = drawStr;
  const d21 = dates.slice(-21), l21 = d21.map(dShort), ins = d21.map(d => intake(d, src));
  mk('cFood', {type: 'bar', data: {labels: l21, datasets: [
    {type: 'bar', label: L('السعرات', 'Calories'), data: ins.map(x => x.k || null), backgroundColor: fire + '99', borderRadius: 4, yAxisID: 'y', maxBarThickness: 16},
    {type: 'line', label: L('هدف السعرات', 'Calorie target'), data: d21.map(d => c ? (GYM.includes(D(d).getDay()) ? c.kTrain : c.kRest) : null), borderColor: fire2, borderDash: [4, 4], pointRadius: 0, stepped: 'middle', yAxisID: 'y'},
    {type: 'line', label: L('البروتين', 'Protein'), data: ins.map(x => x.p || null), borderColor: teal, backgroundColor: teal, tension: .3, pointRadius: 2, yAxisID: 'y1', spanGaps: true}]},
    options: {scales: {x: {}, y: {position: LANG === 'en' ? 'left' : 'right', beginAtZero: true}, y1: {position: LANG === 'en' ? 'right' : 'left', beginAtZero: true, grid: {drawOnChartArea: false}}}}});
  mk('cSleep', {type: 'bar', data: {labels: l21, datasets: [{label: L('ساعات النوم', 'Hours'), data: d21.map(d => num(src.days[d]?.sleep)), backgroundColor: d21.map(d => (num(src.days[d]?.sleep) ?? 9) < 6 ? warn : violet), borderRadius: 5, maxBarThickness: 16}, {type: 'line', label: L('الهدف', 'Target'), data: d21.map(() => 7), borderColor: good, borderDash: [4, 4], pointRadius: 0}]}, options: {scales: {x: {}, y: {beginAtZero: true, suggestedMax: 9}}}});
  mk('cGut', {type: 'line', data: {labels: l21, datasets: [{label: L('الألم', 'Pain'), data: d21.map(d => num(src.days[d]?.pain)), borderColor: bad, backgroundColor: grad('cGut', bad), fill: true, tension: .35, pointRadius: 2, spanGaps: true}, {label: L('الانتفاخ', 'Bloating'), data: d21.map(d => num(src.days[d]?.gas)), borderColor: warn, tension: .35, pointRadius: 2, spanGaps: true}]}, options: {scales: {x: {}, y: {beginAtZero: true, max: 10}}}});
  const keys = [['seeds', L('لب ومكسرات', 'Seeds & nuts')], ['lactose', L('ألبان عادية', 'Regular dairy')], ['fried', L('مقلي أو دسم', 'Fried/fatty')], ['onion', L('بصل وتوم وطماطم', 'Onion/garlic/tomato')], ['legumes', L('بقوليات', 'Legumes')], ['tea4', L('شاي 4 كوبايات+', 'Tea 4+ cups')]];
  const has = (x, k) => k === 'seeds' ? x.snackType === 'seeds' : k === 'tea4' ? (x.tea || 0) >= 4 : (x.triggers || []).includes(k);
  const Lb = [], Y = [], N = [];
  keys.forEach(([k, n]) => { const y = [], no = []; all.forEach(d => { const x = src.days[d], nx = src.days[addDays(d, 1)], v = avg([num(x.gas), nx ? num(nx.gas) : null]); if (v === null) return; (has(x, k) ? y : no).push(v); }); if (y.length) { Lb.push(n); Y.push(+avg(y).toFixed(1)); N.push(no.length ? +avg(no).toFixed(1) : null); } });
  mk('cTrig', {type: 'bar', data: {labels: Lb.length ? Lb : ['—'], datasets: [{label: L('مع السبب', 'With it'), data: Y, backgroundColor: warn, borderRadius: 5, maxBarThickness: 14}, {label: L('من غيره', 'Without'), data: N, backgroundColor: ink3 + '66', borderRadius: 5, maxBarThickness: 14}]}, options: {indexAxis: 'y', scales: {x: {beginAtZero: true, max: 10}, y: {grid: {display: false}}}}});
  mk('cSpirit', {type: 'bar', data: {labels: l21, datasets: [{label: L('الصلوات في وقتها', 'On-time prayers'), data: d21.map(d => src.days[d]?.sched ? prayersCount(d, src) : null), backgroundColor: teal + 'aa', borderRadius: 4, yAxisID: 'y', maxBarThickness: 14}, {type: 'line', label: L('قرآن + علم (دقيقة)', 'Quran + study (min)'), data: d21.map(d => { const x = src.days[d]; return x && (x.quran != null || x.ilm != null) ? (num(x.quran) || 0) + (num(x.ilm) || 0) : null; }), borderColor: violet, tension: .3, pointRadius: 2, yAxisID: 'y1', spanGaps: true}]}, options: {scales: {x: {}, y: {position: LANG === 'en' ? 'left' : 'right', beginAtZero: true, max: 5}, y1: {position: LANG === 'en' ? 'right' : 'left', beginAtZero: true, grid: {drawOnChartArea: false}}}}});
  const bd = all.filter(d => num(src.days[d].waist));
  mk('cBody', {type: 'line', data: {labels: bd.map(dShort), datasets: [{label: L('الوسط (سم)', 'Waist (cm)'), data: bd.map(d => num(src.days[d].waist)), borderColor: fire, backgroundColor: fire, pointRadius: 3, tension: .3, yAxisID: 'y'}, {label: L('الدهون %', 'Body fat %'), data: bd.map(d => { const v = bodyFat(p, src.days[d]); return v === null ? null : +v.toFixed(1); }), borderColor: blue, backgroundColor: blue, pointRadius: 3, tension: .3, yAxisID: 'y1'}]}, options: {scales: {x: {}, y: {position: LANG === 'en' ? 'left' : 'right'}, y1: {position: LANG === 'en' ? 'right' : 'left', grid: {drawOnChartArea: false}}}}});
}

registerView('health', {title: {ar: 'الصحة', en: 'Health'}, icon: 'health', render(){
  const ev = evaluate();
  const title = {grey: L('كمّل ملفك الشخصي', 'Complete your profile'), green: L('الحالة مستقرة', 'Stable'), amber: L('محتاج انتباه', 'Needs attention'), red: L('محتاج تتواصل مع طبيب', 'Contact a doctor')}[ev.level];
  const text = {grey: L('سجّل بياناتك في الإعدادات.', 'Add your details in Settings.'), green: L('مفيش علامات خطر في آخر أسبوع.', 'No warning signs in the last week.'), amber: L(`فيه ${ev.ambers} نقطة محتاجة متابعة.`, `${ev.ambers} point(s) need follow-up.`), red: L(`فيه ${ev.reds} علامة محتاجة طبيب.`, `${ev.reds} sign(s) need a doctor.`)}[ev.level];
  const cols = [['date', L('التاريخ', 'Date')], ['sys', L('ضغط عالي', 'Systolic')], ['dia', L('ضغط واطي', 'Diastolic')], ['glu', L('سكر صائم', 'Fasting glucose')], ['a1c', 'HbA1c %'], ['hb', L('هيموجلوبين', 'Haemoglobin')], ['fer', 'Ferritin'], ['vitd', L('فيتامين د', 'Vitamin D')], ['b12', 'B12'], ['crp', 'CRP'], ['cal', 'Calprotectin']];
  const rows = [...S.labs].sort((a, b) => b.date.localeCompare(a.date)).map(l => `<tr>${cols.map(([k]) => `<td>${k === 'date' ? dShort(l.date) + ' ' + D(l.date).getFullYear() : (l[k] ?? '—')}</td>`).join('')}</tr>`).join('');
  return topbar(L('الصحة', 'Health'), L('التنبيهات والتحاليل', 'Alerts and lab results'), '', true) + `
  <div class="card statushero ${ev.level}"><div class="s"></div><div class="b"><div class="eyebrow">${L('تقييم آخر 7 أيام وآخر تحاليل', 'Last 7 days and latest labs')}</div><h2>${title}</h2><p class="muted" style="margin:6px 0 0;max-width:70ch">${text} ${L('التنبيه مش تشخيص، هو إشارة إنك تراجع طبيب.', 'An alert is not a diagnosis; it tells you when to see a doctor.')}</p></div></div>
  <div class="card"><div class="head"><h2>${L('التنبيهات', 'Alerts')}</h2></div><div class="alerts">${alertsHTML(ev.A)}</div></div>
  <div class="card"><div class="head"><h2>${L('سجّل تحاليل أو ضغط', 'Add labs or blood pressure')}</h2></div>
    <form id="labForm" class="form"><div class="fgrid"><label class="f">${L('التاريخ', 'Date')}<input type="date" id="l_date" value="${todayISO()}"></label>
    ${[['sys', L('الضغط العالي', 'Systolic')], ['dia', L('الضغط الواطي', 'Diastolic')], ['glu', L('سكر صائم mg/dL', 'Fasting glucose mg/dL')], ['a1c', 'HbA1c %'], ['hb', L('هيموجلوبين g/dL', 'Haemoglobin g/dL')], ['fer', 'Ferritin ng/mL'], ['vitd', L('فيتامين د ng/mL', 'Vitamin D ng/mL')], ['b12', 'B12 pg/mL'], ['crp', 'CRP mg/L'], ['cal', 'Calprotectin µg/g']].map(([k, l]) => `<label class="f">${l}<input type="number" step="0.1" inputmode="decimal" id="l_${k}"></label>`).join('')}</div>
    <div><button class="btn fire" type="submit">${L('احفظ', 'Save')}</button></div></form></div>
  <div class="card"><div class="head"><h2>${L('سجل التحاليل', 'Lab history')}</h2></div>${rows ? `<div class="tablewrap"><table class="t"><thead><tr>${cols.map(x => `<th>${x[1]}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty">${L('مفيش تحاليل متسجلة لسه.', 'No lab results yet.')}</div>`}</div>
  <div class="card"><h2 style="margin-bottom:10px">${L('روح الطوارئ فورًا لو', 'Go to the ER at once if')}</h2><ul class="muted" style="margin:0;padding-inline-start:20px"><li>${L('وجع بطن شديد مع ترجيع، أو مش قادر تخرج غازات أو براز.', 'Severe abdominal pain with vomiting, or you cannot pass gas or stool.')}</li><li>${L('نزيف كتير.', 'Heavy bleeding.')}</li><li>${L('حرارة عالية مع وجع بطن.', 'High fever with abdominal pain.')}</li><li>${L('دوخة شديدة أو إغماء.', 'Severe dizziness or fainting.')}</li><li>${L('ألم في الصدر أو ضيق تنفس.', 'Chest pain or shortness of breath.')}</li></ul></div>`;
}});
on('submit', e => {
  if (e.target.id !== 'labForm') return; e.preventDefault();
  const d = $('#l_date').value; if (!d) return true;
  const l = {date: d}; ['sys', 'dia', 'glu', 'a1c', 'hb', 'fer', 'vitd', 'b12', 'crp', 'cal'].forEach(k => { const v = num($('#l_' + k).value); if (v !== null) l[k] = v; });
  if (Object.keys(l).length < 2) { toast(L('سجّل قيمة واحدة على الأقل.', 'Enter at least one value.')); return true; }
  const i = S.labs.findIndex(x => x.date === d); if (i >= 0) Object.assign(S.labs[i], l); else S.labs.push(l);
  store.save(); toast(L('اتحفظت.', 'Saved.')); render(); return true;
});
