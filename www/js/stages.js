/* زاد — الفئات: من الولادة لكبار السن، والحمل وبعد الولادة، وأصحاب الهمم.
   الفئة بتتحسب من تاريخ الميلاد أو السن ومن حالة الحمل، وبتأثر على السعرات والأكل والتمرين والتذكيرات والإرشادات.
   المراجع: منظمة الصحة العالمية (النشاط والنوم ومنحنيات النمو)، الأكاديمية الأمريكية لطب النوم، مراكز السيطرة على الأمراض CDC (مراحل النمو)،
   معادلات الاحتياج من الطاقة للأطفال (IOM/DRI 2005)، ومعهد الطب الأمريكي لزيادة الوزن في الحمل. كله إرشادي ومش بديل عن الطبيب. */
'use strict';
const STAGES = {
  infant: ['رضيع (0–6 شهور)', 'Infant (0–6 m)', '👶'], baby: ['رضيع (6–12 شهر)', 'Baby (6–12 m)', '👶'], toddler: ['طفل صغير (1–3 سنين)', 'Toddler (1–3 y)', '🧒'], preschool: ['طفل (3–5 سنين)', 'Preschooler (3–5 y)', '🧒'],
  child: ['طفل (5–12 سنة)', 'Child (5–12 y)', '🧒'], teen: ['مراهق (13–17 سنة)', 'Teen (13–17 y)', '🧑'], adult: ['شباب وكبار (18–59)', 'Adult (18–59)', '🧑'], senior: ['كبار السن (60–74)', 'Older adult (60–74)', '🧓'], elder: ['كبار السن (75+)', 'Older adult (75+)', '🧓'],
  preg: ['حامل', 'Pregnant', '🤰'], post: ['بعد الولادة', 'Postpartum', '🤱']
};
const ABIL = {wheelchair: ['بستخدم كرسي متحرك', 'Wheelchair user'], lowerlimb: ['بتر أو ضعف في الرجلين', 'Leg amputation or weakness'], upperlimb: ['ضعف أو بتر في الدراعين أو الإيدين', 'Arm or hand weakness / amputation'], lowvision: ['ضعف نظر', 'Low vision'], blind: ['فاقد البصر', 'Blind'], hearing: ['ضعف أو فقدان السمع', 'Hard of hearing / deaf'], intellectual: ['إعاقة ذهنية أو متلازمة داون', 'Intellectual disability / Down syndrome'], neuro: ['حالة عصبية (شلل دماغي، تصلب متعدد، إصابة حبل شوكي، جلطة سابقة)', 'Neurological condition (CP, MS, spinal cord injury, past stroke)']};
const monthsBetween = (a, b) => { const x = D(a), y = D(b); let m = (y.getFullYear() - x.getFullYear()) * 12 + y.getMonth() - x.getMonth(); if (y.getDate() < x.getDate()) m--; return Math.max(0, m); };
function ageMonths(p){ p ||= S.profile; if (p?.birth) return monthsBetween(p.birth, todayISO()); if (p?.age != null && p.age !== '') return Math.round(+p.age * 12 + 6); return null; }
function refreshAge(p){ p ||= S.profile; if (p?.birth) { const m = monthsBetween(p.birth, todayISO()); p.age = Math.floor(m / 12); p.ageM = m; } }
function stageOf(p, w){
  p ||= S.profile || {}; w ||= S.women || {}; const m = ageMonths(p), female = p.sex === 'f';
  let k = 'adult';
  if (m != null) { if (m < 6) k = 'infant'; else if (m < 12) k = 'baby'; else if (m < 36) k = 'toddler'; else if (m < 60) k = 'preschool'; else if (m < 156) k = 'child'; else if (m < 216) k = 'teen'; else if (m >= 900) k = 'elder'; else if (m >= 720) k = 'senior'; }
  const adultish = ['adult', 'senior', 'teen'].includes(k);
  if (female && adultish && m >= 180 && w.mode === 'pregnant') k = 'preg'; else if (female && adultish && m >= 180 && w.mode === 'postpartum') k = 'post';
  const order = ['infant', 'baby', 'toddler', 'preschool', 'child', 'teen'];
  return {k, m, kid: order.slice(0, 5).includes(k), minor: order.includes(k), under5: order.slice(0, 4).includes(k), under1: k === 'infant' || k === 'baby', older: k === 'senior' || k === 'elder', label: LX({ar: STAGES[k][0], en: STAGES[k][1]}), ic: STAGES[k][2]};
}
const stageNow = () => stageOf(S.profile, S.women);
/* ---------- energy & protein by stage (applied on top of the adult calculation) ---------- */
function eerChild(p, w, hM, female, act){
  const age = (ageMonths(p) || 0) / 12;
  if (age < 3) { const add = age < 0.25 ? 175 : age < 0.5 ? 56 : age < 1 ? 22 : 20; return 89 * w - 100 + add; }
  const pa = female ? [1, 1.16, 1.31, 1.56][act] : [1, 1.13, 1.26, 1.42][act];
  return female ? 135.3 - 30.8 * age + pa * (10 * w + 934 * hM) + (age < 9 ? 20 : 25) : 88.5 - 61.9 * age + pa * (26.7 * w + 903 * hM) + (age < 9 ? 20 : 25);
}
const KID_WATER = m => m < 12 ? 0 : m < 48 ? 0.9 : m < 108 ? 1.2 : null;
function stageAdjust(r, src){
  const p = src.profile, st = stageOf(p, src === S ? S.women : {}), out = {...r, stage: st.k};
  if (st.minor) {
    const hM = (p.height || 100) / 100, female = r.female, days = (p.trainDays || []).length, act = st.k === 'teen' ? (days >= 5 ? 2 : days >= 3 ? 1 : 0) + (p.job === 'labor' ? 1 : 0) : 1;
    const eer = eerChild(p, r.curW, hM, female, Math.min(3, act)), k = r50(Math.max(st.under1 ? 400 : 700, eer));
    out.tdee = eer; out.bmr = null; out.def = 0; out.kTrain = k; out.kRest = k; out.floor = 0; out.expRate = 0; out.eta = null; out.etaW = null;
    const ag = (st.m || 0) / 12, rda = ag < 1 ? 1.2 : ag < 4 ? 1.05 : ag < 14 ? 0.95 : 0.85;
    out.protein = r5(Math.max(10, r.curW * rda * (st.k === 'teen' && days >= 3 ? 1.4 : 1.15), k * (st.k === 'teen' ? 0.15 : 0.13) / 4));
    out.water = KID_WATER(st.m) ?? (st.k === 'teen' ? (female ? 1.8 : 2.6) : (female ? 1.6 : 1.8));
    if (typeof macroSplit === 'function') { out.mT = macroSplit(k, out.protein, r.diet); out.mR = out.mT; }
    const ge = growthEval(female, st.m, r.curW, p.height); if (ge.bmi) out.bmiLab = ge.bmi.lab;
  }
  if (st.older) {
    const ckd = (p.conds || []).includes('ckd'), weak = (p.conds || []).includes('sarcopenia') || p.weak;
    let prot = r5(r.curW * (ckd ? 0.8 : weak ? 1.4 : 1.2)); if (!ckd) out.protein = Math.max(prot, Math.min(r.protein, r5(r.curW * 1.5))); else out.protein = Math.min(r.protein, prot);
    out.water = Math.max(r.water, 1.7);
    if (typeof macroSplit === 'function') { out.mT = macroSplit(r.kTrain, out.protein, r.diet); out.mR = macroSplit(r.kRest, out.protein, r.diet); }
  }
  if ((p.abil || []).includes('wheelchair') && !st.minor) {
    const t2 = r.bmr * Math.min(p.act || 1.2, 1.25), d = Math.min(r.def, 400), k = r50(Math.max(1200, t2 - d));
    out.tdee = t2; out.kTrain = k; out.kRest = k; out.def = d; if (typeof macroSplit === 'function') { out.mT = macroSplit(k, out.protein, r.diet); out.mR = out.mT; }
  }
  return out;
}
/* ---------- extra health rules by stage and ability (merged into healthRules) ---------- */
function stageRules(p, R){
  const st = stageOf(p, p === S.profile ? S.women : {}), bmi = p.weight && p.height ? p.weight / ((p.height / 100) ** 2) : 22;
  R.flags.add('st_' + st.k);
  if (st.minor) { R.maxDef = st.k === 'teen' ? Math.min(R.maxDef, 0) : 0; ['keto', 'if168', 'if186', 'if52', 'lowcarb', 'bulk'].forEach(d => R.block.add(d)); R.trainAvoid.add('heavy'); if (st.k !== 'teen') { R.block.add('ramadan'); R.avoid.add('caffeine'); } if (st.m < 60) R.avoid.add('choke'); if (st.under1) R.avoid.add('honey'); }
  if (st.older) { R.maxDef = Math.min(R.maxDef, bmi < 27 ? 0 : 500); R.trainAvoid.add('impact'); if (st.k === 'elder' || p.fell || (p.aid && p.aid !== 'none')) R.trainAvoid.add('fall'); if (p.soft) R.avoid.add('hard'); }
  if (p.soft && !st.older) R.avoid.add('hard');
  const ab = p.abil || [];
  if (ab.includes('blind') || ab.includes('lowvision')) { R.trainAvoid.add('vision'); R.trainAvoid.add('impact'); }
  if (ab.includes('neuro') || ab.includes('wheelchair') || ab.includes('lowerlimb')) { R.trainAvoid.add('fall'); R.trainAvoid.add('impact'); }
  if (ab.includes('neuro')) R.doctor = true;
  if (st.k === 'post') { const w = S.women || {}; if ((w.ppWeeks ?? 0) < 12) { R.trainAvoid.add('impact'); R.trainAvoid.add('flexload'); } }
  return R;
}
/* ---------- WHO growth (z-scores from LMS) ---------- */
function lmsRow(key, sexF, m){ const t = typeof WHO_LMS !== 'undefined' ? WHO_LMS[(sexF ? 'g' : 'b') + key] : null; if (!t) return null; const i = Math.max(0, Math.min(t.length - 1, Math.round(m))); return t[i]; }
const lmsZ = (x, [L_, M, S_]) => L_ === 0 ? Math.log(x / M) / S_ : (Math.pow(x / M, L_) - 1) / (L_ * S_);
const lmsAt = (z, [L_, M, S_]) => L_ === 0 ? M * Math.exp(S_ * z) : M * Math.pow(1 + L_ * S_ * z, 1 / L_);
const zPct = z => { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), pr = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return Math.round((z > 0 ? 1 - pr : pr) * 1000) / 10; };
function growthEval(sexF, m, w, h){
  const out = {}; if (m > 228) return out;
  if (w && m <= 60) { const r = lmsRow('wfa', sexF, m); if (r) { const z = lmsZ(w, r); out.wfa = {z, p: zPct(z), lab: z < -3 ? L('وزن قليل جدًا للسن', 'Severely underweight') : z < -2 ? L('وزن قليل للسن', 'Underweight') : z > 2 ? L('وزن أعلى من المعتاد للسن (اسأل الدكتور عن الطول كمان)', 'High weight for age (check height too)') : L('في المعدل الطبيعي', 'Within normal range'), lvl: z < -2 || z > 2 ? 'amber' : 'good'}; } }
  if (h) { const r = lmsRow('hfa', sexF, m); if (r) { const z = lmsZ(h, r); out.hfa = {z, p: zPct(z), lab: z < -3 ? L('قِصَر شديد للسن', 'Severely stunted') : z < -2 ? L('أقصر من المعتاد للسن', 'Stunted') : z > 3 ? L('أطول بكتير من المعتاد', 'Very tall') : L('في المعدل الطبيعي', 'Within normal range'), lvl: z < -2 || z > 3 ? 'amber' : 'good'}; } }
  if (w && h) { const b = w / ((h / 100) ** 2), r = lmsRow('bmi', sexF, m); if (r) { const z = lmsZ(b, r), u5 = m <= 60; out.bmi = {v: b, z, p: zPct(z), lab: z < -3 ? L('نحافة شديدة', 'Severe thinness') : z < -2 ? L('نحافة', 'Thinness') : u5 ? (z > 3 ? L('سمنة', 'Obesity') : z > 2 ? L('وزن زيادة', 'Overweight') : z > 1 ? L('معرّض لزيادة الوزن', 'Risk of overweight') : L('طبيعي', 'Normal')) : (z > 2 ? L('سمنة', 'Obesity') : z > 1 ? L('وزن زيادة', 'Overweight') : L('طبيعي', 'Normal')), lvl: z < -2 || z > (u5 ? 2 : 1) ? 'amber' : 'good'}; } }
  return out;
}
/* ---------- guidance by stage ---------- */
const SLEEP_BY = {infant: ['14–17 ساعة (شامل القيلولات)', '14–17 h incl. naps'], baby: ['12–16 ساعة (شامل القيلولات)', '12–16 h incl. naps'], toddler: ['11–14 ساعة (شامل القيلولات)', '11–14 h incl. naps'], preschool: ['10–13 ساعة', '10–13 h'], child: ['9–12 ساعة', '9–12 h'], teen: ['8–10 ساعات', '8–10 h'], adult: ['7–9 ساعات', '7–9 h'], senior: ['7–8 ساعات', '7–8 h'], elder: ['7–8 ساعات', '7–8 h'], preg: ['7–9 ساعات، ويفضل على الجنب الشمال في آخر الحمل', '7–9 h; sleep on your side late in pregnancy'], post: ['نامي وقت ما البيبي ينام لما تقدري', 'Sleep when the baby sleeps when you can']};
const MOVE_BY = {
  infant: ['أكتر من مرة في اليوم لعب على الأرض، و30 دقيقة على الأقل على بطنه (وقت البطن) متقسمين على اليوم وهو صاحي وتحت عينك.', 'Floor play several times a day, including at least 30 min of tummy time spread through the day, awake and supervised.'],
  baby: ['لعب على الأرض كذا مرة في اليوم، وزحف ووقوف بالسند. من غير شاشات خالص.', 'Floor play several times a day, crawling and pulling to stand. No screen time.'],
  toddler: ['180 دقيقة حركة في اليوم بأي شدة، ومن غير شاشات قبل سنتين، ومش أكتر من ساعة بعد سنتين.', '180 min of activity a day at any intensity; no screens before age 2, under an hour after.'],
  preschool: ['180 دقيقة حركة في اليوم، منهم 60 دقيقة نشاط قوي زي الجري والنط. الشاشات أقل من ساعة.', '180 min of activity a day, 60 of them energetic (running, jumping). Screens under an hour.'],
  child: ['60 دقيقة على الأقل كل يوم نشاط متوسط لقوي، وتقوية عضل وعضم (نط، تسلق) 3 أيام في الأسبوع. قلّل الشاشات.', 'At least 60 min of moderate-to-vigorous activity daily, with muscle- and bone-strengthening play 3 days a week. Limit screens.'],
  teen: ['60 دقيقة على الأقل كل يوم، و3 أيام تقوية. الأوزان مسموحة بتكنيك سليم وإشراف، من غير أقصى وزن.', 'At least 60 min daily and 3 strengthening days. Weights are fine with good technique and supervision, no max lifts.'],
  adult: ['150–300 دقيقة نشاط متوسط في الأسبوع، وتمارين قوة يومين على الأقل.', '150–300 min of moderate activity a week plus strength training at least twice.'],
  senior: ['150 دقيقة نشاط في الأسبوع، وقوة يومين، و**توازن 3 أيام** علشان تقلل خطر الوقوع.', '150 min of activity a week, strength twice, and balance 3 days to cut fall risk.'],
  elder: ['حركة يومية خفيفة، وقوة وتوازن بسند أو على الكرسي 3 أيام. أي حركة أحسن من مفيش.', 'Gentle daily movement, plus supported or seated strength and balance 3 days a week. Some is better than none.'],
  preg: ['150 دقيقة في الأسبوع نشاط متوسط لو الدكتور موافق. ابعدي عن الوقوع والخبط والنوم على الضهر بعد الشهر الرابع.', '150 min a week of moderate activity if your doctor agrees. Avoid falls, contact and lying flat on your back after month four.'],
  post: ['تنفس وقاع حوض من الأيام الأولى، ومشي خفيف، والتمرين العادي بعد كشف 6–8 أسابيع (وأكتر بعد القيصري). لو فيه بروز في نص البطن لما بتقومي من النوم (انفصال عضلات البطن)، ابعدي عن تمارين البطن التقليدية واسألي أخصائية علاج طبيعي.', 'Breathing and pelvic floor from the first days, gentle walks, and normal training after the 6–8 week check (longer after a C-section). If a ridge bulges down the middle of your belly when you sit up (abdominal separation), skip crunches and ask a women’s-health physio.']
};
const FOOD_BY = {
  infant: ['رضاعة طبيعية بس (أو صناعي لو مفيش طبيعي) لحد 6 شهور، من غير مية ولا أعشاب. نقط فيتامين د حسب الدكتور.', 'Breast milk only (or formula) until 6 months, no water or herbal drinks. Vitamin D drops as advised by the doctor.'],
  baby: ['من 6 شهور: أكل بالمعلقة مع استمرار الرضاعة. ابدأ بأكل غني بالحديد (لحمة مهروسة، سيريلاك مدعم). **ممنوع العسل قبل سنة**، ومن غير ملح ولا سكر. دخّل الأكل الجديد واحد واحد.', 'From 6 months: spoon foods alongside milk. Start with iron-rich foods (puréed meat, fortified cereal). No honey before 1 year, no salt or sugar. Introduce new foods one at a time.'],
  toddler: ['أكل البيت مقطع صغير، 3 وجبات وسناكين. لبن كامل الدسم 350–500 مل في اليوم بالكتير. ابعد عن اللي يسبب شَرْقة: مكسرات كاملة، عنب كامل، فشار، خضار نيّة ناشفة.', 'Family food cut small, 3 meals and 2 snacks. Whole milk 350–500 ml a day at most. Avoid choking hazards: whole nuts, whole grapes, popcorn, hard raw veg.'],
  preschool: ['طبق متوازن: نص خضار وفاكهة، وربع نشويات، وربع بروتين، ولبن. مية بدل العصير والمشروبات الحلوة.', 'Balanced plate: half veg and fruit, a quarter starch, a quarter protein, plus milk. Water instead of juice and sweet drinks.'],
  child: ['من غير رجيم ولا عدّ سعرات قدام الطفل. فطار كل يوم، وسناك صحي، ومية. لو الوزن زيادة: حركة وعادات، مش حرمان، وراجع الدكتور.', 'No dieting or calorie talk in front of the child. Daily breakfast, healthy snacks, water. If weight is high: activity and habits, not restriction; see the doctor.'],
  teen: ['3 وجبات حقيقية، وبروتين كفاية للنمو والتمرين، وكالسيوم وحديد (خصوصًا البنات). مفيش أنظمة قاسية ولا صيام متقطع.', 'Three real meals, enough protein for growth and training, calcium and iron (especially girls). No harsh diets or intermittent fasting.'],
  adult: ['حسب هدفك ونظامك.', 'According to your goal and diet.'],
  senior: ['بروتين في كل وجبة علشان العضل، وكالسيوم وفيتامين د، ومية حتى لو مش عطشان. وجبات صغيرة لو الشهية ضعيفة.', 'Protein at every meal to protect muscle, calcium and vitamin D, and water even when not thirsty. Smaller meals if appetite is low.'],
  elder: ['زي اللي فوق، ولو المضغ صعب اختار "أكل طري" من المعالج.', 'As above; choose “soft food” in the wizard if chewing is hard.'],
  preg: ['مفيش تنشيف. ممنوع النيّ والسمك عالي الزئبق والألبان مش مبسترة، والكافيين أقل من 200 مجم. الفوليك والحديد حسب الدكتور.', 'No calorie deficit. Avoid raw foods, high-mercury fish and unpasteurised dairy; caffeine under 200 mg. Folic acid and iron as your doctor advises.'],
  post: ['سعرات زيادة لو بترضّعي، ومية كتير، والتنشيف خفيف جدًا.', 'Extra calories if breastfeeding, plenty of water, only a very gentle deficit.']
};
const SAFE_BY = {
  infant: ['النوم على الضهر، على سطح ناشف ومستوي، من غير مخدات ولا ألعاب في السرير.', 'Sleep on the back, on a firm flat surface, with no pillows or toys in the cot.'],
  baby: ['النوم على الضهر، وابعد الحاجات الصغيرة عن إيده، وغطّي الفيش.', 'Back to sleep, keep small objects out of reach, cover sockets.'],
  toddler: ['اقفل الدواليب اللي فيها أدوية ومنظفات، ومتسيبوش لوحده قريب من المية.', 'Lock away medicines and cleaners, never leave them alone near water.'],
  senior: ['شيل السجاجيد اللي بتزحلق، ونور كويس بالليل، ومسكة في الحمام.', 'Remove slippery rugs, light the way at night, fit a bathroom grab bar.'],
  elder: ['زي اللي فوق، واستخدم العكاز أو المشاية لو الدكتور قال كده.', 'As above, and use your cane or walker if advised.']
};
/* CDC "Learn the Signs. Act Early." milestones (most children by this age) */
const MILESTONES = [
  [2, ['بيهدى لما تكلمه أو تشيله', 'بيبص في وشك', 'بيضحك لما تكلمه', 'بيرفع راسه وهو على بطنه'], ['Calms down when spoken to or picked up', 'Looks at your face', 'Smiles when you talk to them', 'Holds head up when on tummy']],
  [4, ['بيضحك علشان يلفت نظرك', 'بيضحك بصوت', 'بيحط إيده في بقه', 'بيمسك اللعبة', 'بيسند على كوعه وهو على بطنه'], ['Smiles to get your attention', 'Chuckles', 'Brings hands to mouth', 'Holds a toy', 'Pushes up onto elbows on tummy']],
  [6, ['بيعرف الناس اللي يعرفهم', 'بيضحك بصوت عالي', 'بيتقلب من بطنه لضهره', 'بيسند على إيده وهو قاعد'], ['Knows familiar people', 'Laughs', 'Rolls from tummy to back', 'Leans on hands to support when sitting']],
  [9, ['بيتكسف أو بيتعلق بيك قدام الغرب', 'بيبص لما تنده اسمه', 'بيقعد من غير سند', 'بينقل الحاجة من إيد لإيد', 'بيقول أصوات زي "مامامام"'], ['Is shy or clingy with strangers', 'Looks when you call their name', 'Sits without support', 'Moves things from one hand to the other', 'Makes sounds like "mamamama"']],
  [12, ['بيعمل باي باي', 'بيقف ماسك في حاجة', 'بيمشي ماسك في العفش', 'بيلقط الحاجة بالإبهام والسبابة', 'بيقول "ماما" أو "بابا"'], ['Waves bye-bye', 'Pulls up to stand', 'Walks holding on to furniture', 'Picks things up with thumb and pointer finger', 'Calls a parent "mama" or "dada"']],
  [18, ['بيمشي لوحده من غير ما يمسك', 'بيشخبط', 'بيحاول ياكل بالمعلقة', 'بيقول 3 كلمات أو أكتر', 'بينفّذ طلب بسيط من غير إشارة'], ['Walks without holding on', 'Scribbles', 'Tries to use a spoon', 'Tries to say three or more words', 'Follows one-step directions without gestures']],
  [24, ['بيشوط الكورة', 'بيجري', 'بيقول كلمتين مع بعض', 'بيشاور على حاجات في الكتاب', 'بياكل بالمعلقة'], ['Kicks a ball', 'Runs', 'Says at least two words together', 'Points to things in a book', 'Eats with a spoon']],
  [36, ['بيتكلم معاك كلام رايح جاي', 'بيرسم دايرة لو وريته', 'بيلبس شوية هدوم لوحده', 'بيبعد عن السخن لما تحذره'], ['Talks with you in conversation', 'Draws a circle when shown how', 'Puts on some clothes by themselves', 'Avoids hot objects when warned']],
  [48, ['بيقول جمل من 4 كلمات أو أكتر', 'بيرسم شخص بـ3 أجزاء', 'بيمسك كورة كبيرة أغلب الوقت', 'بيغرف لنفسه الأكل'], ['Says sentences with four or more words', 'Draws a person with three or more body parts', 'Catches a large ball most of the time', 'Serves themselves food']],
  [60, ['بيحكي قصة فيها حدثين', 'بيعد لـ10', 'بينط على رجل واحدة', 'بيقفل زراير', 'بيكتب حروف من اسمه'], ['Tells a story with at least two events', 'Counts to 10', 'Hops on one foot', 'Buttons some buttons', 'Writes some letters in their name']]
];
const WEANING = [
  [6, ['البداية', 'Starting out'], ['معلقة أو اتنين مرة في اليوم: هريس ناعم (خضار، لحمة أو فراخ مهروسة، سيريلاك مدعم بالحديد). الرضاعة لسه الأساس. شوية مية في كوباية.', '1–2 teaspoons once a day: smooth purées (veg, puréed meat or chicken, iron-fortified cereal). Milk is still the main food. Small sips of water from a cup.']],
  [7, ['هريس أتقل', 'Thicker textures'], ['وجبتين في اليوم، وهريس أتقل وفيه حتت صغيرة طرية. أكل بالإيد زي خضار مسلوق طري.', 'Two meals a day, thicker mashes with soft lumps, and soft finger foods like well-cooked veg.']],
  [9, ['أكل البيت مهروس', 'Mashed family food'], ['3 وجبات، وأكل البيت مفروم أو مقطع صغير ومن غير ملح. البيض والزبادي والفول مهروس، كل حاجة جديدة لوحدها.', 'Three meals, family food minced or chopped small without salt. Egg, yoghurt and mashed beans, one new food at a time.']],
  [12, ['أكل العيلة', 'Family food'], ['3 وجبات وسناكين. اللبن كامل الدسم يبقى مشروب مش وجبة (350–500 مل). العسل بقى مسموح.', 'Three meals and two snacks. Whole milk becomes a drink, not a meal (350–500 ml). Honey is now allowed.']]
];
/* plan-page card with the stage's key rules */
function stageCard(){ return stageCardFor(S.profile, S.women); }
function stageCardFor(p, w){
  p ||= S.profile; const st = stageOf(p, w || (p === S.profile ? S.women : {mode: p.status === 'preg' ? 'pregnant' : ['bf', 'post'].includes(p.status) ? 'postpartum' : 'normal'})); if (st.k === 'adult' && !(p.abil || []).length) return '';
  const rows = [[L('النوم', 'Sleep'), SLEEP_BY[st.k]], [L('الحركة', 'Movement'), MOVE_BY[st.k]], [L('الأكل', 'Food'), FOOD_BY[st.k]], [L('الأمان', 'Safety'), SAFE_BY[st.k]]].filter(([, v]) => v);
  const ab = (p.abil || []).map(a => LX({ar: ABIL[a][0], en: ABIL[a][1]}));
  return `<div class="card stagecard"><div class="head"><h2>${st.ic} ${L('فئتك: ', 'Your group: ')}${esc(st.label)}</h2>${st.minor ? `<button class="btn ghost sm" type="button" data-v="growth">📈 ${L('النمو والتطور', 'Growth')}</button>` : ''}</div>
    <ul class="tips">${rows.map(([t, v]) => `<li><b>${t}:</b> ${esc(LX({ar: v[0], en: v[1]})).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`).join('')}</ul>
    ${ab.length ? `<p class="small" style="margin:8px 0 0">♿ ${esc(ab.join('، '))}: ${L('البرنامج اتظبط على قدراتك (تمارين قاعد أو بسند حسب الحالة).', 'the program is adapted to your abilities (seated or supported as needed).')}${(p.abil || []).includes('neuro') ? ' <b>' + L('محتاج موافقة الدكتور أو أخصائي العلاج الطبيعي قبل البدء.', 'Get clearance from your doctor or physiotherapist first.') + '</b>' : ''}</p>` : ''}
    <p class="muted small" style="margin:8px 0 0">${L('المراجع: منظمة الصحة العالمية، والأكاديمية الأمريكية لطب النوم، وCDC. إرشاد عام مش بديل عن الطبيب.', 'Sources: WHO, American Academy of Sleep Medicine, CDC. General guidance, not a substitute for a doctor.')}</p></div>`;
}
