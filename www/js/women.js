/* ميزان — women's edition: cycle tracking, pregnancy week by week, postpartum. Guidance only; it never replaces the obstetrician. */
'use strict';
const WEEKS = {
  4: ['بذرة خشخاش', 'a poppy seed', 'الجنين بيزرع نفسه في جدار الرحم، وهرمون الحمل بيبدأ يظهر في التحليل.', 'The embryo implants in the uterus and the pregnancy hormone starts to show on tests.'],
  5: ['بذرة سمسم', 'a sesame seed', 'القلب والجهاز العصبي بيبدأوا يتكونوا.', 'The heart and nervous system begin to form.'],
  6: ['حباية عدس', 'a lentil', 'نبضات القلب ممكن تظهر في السونار المهبلي.', 'A heartbeat may be seen on a transvaginal scan.'],
  7: ['حباية توت', 'a blueberry', 'المخ بيكبر بسرعة، وبراعم الإيدين والرجلين بتظهر.', 'The brain grows fast; arm and leg buds appear.'],
  8: ['توتة حمرا', 'a raspberry', 'الصوابع بتبدأ تتشكل، والجنين بيتحرك حركات صغيرة.', 'Fingers start to form; tiny movements begin.'],
  9: ['حباية عنب', 'a grape', 'كل الأعضاء الأساسية موجودة وبتكمل نموها.', 'All major organs are present and maturing.'],
  10: ['فراولة', 'a strawberry', 'من هنا بيتسمى "جنين" رسميًا، والعضم بيبدأ يتكون.', 'Now officially a fetus; bones start forming.'],
  11: ['تينة', 'a fig', 'الجنين بيتقلب ويتمطّع، والراس حوالي نص طوله.', 'The baby kicks and stretches; the head is about half its length.'],
  12: ['ليمونة صغيرة', 'a lime', 'نهاية التلت الأول. سونار الأسبوع 11–13 مهم للفحص.', 'End of the first trimester. The week 11–13 scan is an important screening.'],
  13: ['ليمونة', 'a lemon', 'البصمات بتتكون على الصوابع.', 'Fingerprints form.'],
  14: ['خوخة', 'a peach', 'الغثيان غالبًا بيخف، والطاقة بترجع.', 'Nausea usually eases and energy returns.'],
  15: ['تفاحة', 'an apple', 'الجنين بيحس بالنور، والعضم بيقوى.', 'The baby senses light; bones harden.'],
  16: ['أفوكادو', 'an avocado', 'حوالي 100 جرام. ممكن تحسي بأول رفرفة.', 'About 100 g. You may feel the first flutters.'],
  17: ['كمثرى', 'a pear', 'الدهون بتبدأ تتكون تحت الجلد.', 'Fat begins to form under the skin.'],
  18: ['فلفل رومي', 'a bell pepper', 'السمع بيشتغل، وممكن يسمع صوتك.', 'Hearing develops; the baby may hear your voice.'],
  19: ['مانجا', 'a mango', 'طبقة حماية بيضا بتغطي الجلد.', 'A protective white coating covers the skin.'],
  20: ['موزة', 'a banana', 'نص الحمل! سونار التشوهات بيتعمل عادة بين 18 و22.', 'Halfway! The anatomy scan is usually done between weeks 18 and 22.'],
  21: ['جزرة', 'a carrot', 'الحركة بتبقى أوضح.', 'Movements become clearer.'],
  22: ['بابايا', 'a papaya', 'الشفايف والحواجب واضحة.', 'Lips and eyebrows are distinct.'],
  23: ['جريب فروت', 'a grapefruit', 'الجنين بيتمرن على التنفس.', 'The baby practises breathing movements.'],
  24: ['كوز درة', 'an ear of corn', 'حوالي 600 جرام. تحليل سكر الحمل بيتعمل عادة بين 24 و28.', 'About 600 g. The pregnancy glucose test is usually done between 24 and 28.'],
  25: ['قرنبيط', 'a cauliflower', 'الشعر بيظهر، والإيد بتقفل وتفتح.', 'Hair appears; hands open and close.'],
  26: ['خسة', 'a lettuce', 'العينين بتبدأ تفتح.', 'The eyes begin to open.'],
  27: ['كرنبة صغيرة', 'a small cabbage', 'نهاية التلت التاني.', 'End of the second trimester.'],
  28: ['باذنجانة', 'an aubergine', 'حوالي كيلو. ابدئي عدّ الحركة كل يوم.', 'About 1 kg. Start daily kick counts.'],
  29: ['قرعة', 'a butternut squash', 'العضلات والرئة بيكبروا.', 'Muscles and lungs keep maturing.'],
  30: ['كرنبة', 'a cabbage', 'المخ بيكبر بسرعة.', 'The brain grows rapidly.'],
  31: ['جوزة هند', 'a coconut', 'الجنين بيقلب راسه من جنب للتاني.', 'The baby turns its head side to side.'],
  32: ['أناناس صغير', 'a small pineapple', 'حوالي 1.7 كيلو. الضوافر كملت.', 'About 1.7 kg. Nails are complete.'],
  33: ['أناناسة', 'a pineapple', 'العضم بيقوى، وجمجمة لسه طرية.', 'Bones harden; the skull stays soft.'],
  34: ['شمامة', 'a cantaloupe', 'الرئة قربت تكمل.', 'The lungs are nearly mature.'],
  35: ['شمامة كبيرة', 'a honeydew melon', 'المساحة بتضيق، فالحركات بتبقى تقلبات.', 'Space is tight, so movements become rolls.'],
  36: ['خسة كبيرة', 'a large lettuce', 'حوالي 2.6 كيلو. جهزي شنطة الولادة.', 'About 2.6 kg. Pack the hospital bag.'],
  37: ['بطيخة صغيرة', 'a small watermelon', 'الحمل مكتمل المدة من الأسبوع ده.', 'The pregnancy is now full term.'],
  38: ['قرعة عسلي', 'a pumpkin', 'الجنين بيكمل يزود وزن.', 'The baby keeps gaining weight.'],
  39: ['بطيخة', 'a watermelon', 'جاهز للولادة في أي وقت.', 'Ready to be born any time.'],
  40: ['بطيخة كبيرة', 'a big watermelon', 'ميعاد الولادة المتوقع. كلمي دكتورتك لو عدّى الأسبوع.', 'Due date. Talk to your obstetrician if this week passes.']
};
const IOM = [[18.5, 12.5, 18], [25, 11.5, 16], [30, 7, 11.5], [99, 5, 9]];
function updateWomen(){
  const w = S.women ||= {};
  if (w.mode === 'pregnant' && w.lmp) { const days = daysBetween(w.lmp, todayISO()); w.week = Math.max(1, Math.floor(days / 7)); w.dayOf = days % 7; w.trimester = w.week < 14 ? 1 : w.week < 28 ? 2 : 3; w.due = addDays(w.lmp, 280); }
  if (w.mode === 'postpartum' && w.birth) { w.ppWeeks = Math.max(0, Math.floor(daysBetween(w.birth, todayISO()) / 7)); }
}
function gainRange(){ const w = S.women, h = (S.profile.height || 165) / 100, pre = w.prePreg || S.profile.weight, bmi = pre / (h * h); const r = IOM.find(x => bmi < x[0]); return {bmi, lo: r[1], hi: r[2], pre}; }
function expectedGain(week, r){ if (week <= 13) return [0.5, 2]; const f = (week - 13) / 27; return [0.5 + (r.lo - 0.5) * f, 2 + (r.hi - 2) * f]; }
function womenTodayCard(){
  if (S.settings.edition !== 'women') return ''; updateWomen(); const w = S.women;
  if (w.mode === 'pregnant' && w.lmp) { const wk = WEEKS[Math.min(40, Math.max(4, w.week))]; return `<div class="card hero"><div class="week-hero"><div class="belly">${w.week}</div><div><div class="eyebrow">${L('الأسبوع', 'Week')} ${w.week} + ${w.dayOf} ${L('يوم', 'd')} · ${L('التلت', 'Trimester')} ${w.trimester} · ${L('الولادة المتوقعة', 'Due')} ${dShort(w.due)}</div><h2>${L('حجم الجنين زي ', 'Baby is the size of ')}${esc(LANG === 'en' ? wk[1] : wk[0])}</h2><p class="muted small" style="margin:6px 0 0">${esc(LANG === 'en' ? wk[3] : wk[2])}</p><button class="btn ghost sm" type="button" data-v="women" style="margin-top:10px">${L('برنامج الحمل', 'Pregnancy program')}</button></div></div></div>`; }
  if (w.mode === 'postpartum' && w.birth) return `<div class="card hero"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">${L('ما بعد الولادة', 'Postpartum')}</div><h2>${L('الأسبوع', 'Week')} ${w.ppWeeks} ${L('بعد الولادة', 'after birth')}</h2></div><button class="btn ghost sm" type="button" data-v="women">${L('برنامج ما بعد الولادة', 'Postpartum program')}</button></div></div>`;
  const nx = nextPeriod(); return nx ? `<div class="card"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">${L('الدورة الجاية المتوقعة', 'Next period expected')}</div><h2>${dShort(nx)} · ${L('بعد', 'in')} ${daysBetween(todayISO(), nx)} ${L('يوم', 'days')}</h2></div><button class="btn ghost sm" type="button" data-v="women">${L('صحتي', 'My health')}</button></div></div>` : '';
}
function cycleLen(){ const p = (S.women.periods || []).slice().sort(); if (p.length < 2) return 28; const gaps = p.slice(1).map((d, i) => daysBetween(p[i], d)).filter(g => g >= 21 && g <= 40); return gaps.length ? Math.round(avg(gaps.slice(-6))) : 28; }
function nextPeriod(){ const p = (S.women.periods || []).slice().sort(); if (!p.length) return null; let n = addDays(p.at(-1), cycleLen()); while (n < todayISO()) n = addDays(n, cycleLen()); return n; }
function womenAlerts(add){
  if (S.settings.edition !== 'women') return; updateWomen(); const w = S.women;
  const recent = [0, 1].map(i => dayOf(addDays(todayISO(), -i)).pw || {});
  const any = k => recent.some(r => r[k]);
  if (w.mode === 'pregnant') {
    if (any('bleed')) add('red', L('نزيف في الحمل', 'Bleeding in pregnancy'), L('كلمي دكتورتك أو روحي الطوارئ فورًا.', 'Call your obstetrician or go to the ER now.'));
    if (any('headache')) add('red', L('صداع شديد أو زغللة', 'Severe headache or blurred vision'), L('ممكن تكون علامة تسمم حمل. قيسي الضغط وروحي الطوارئ.', 'Could be pre-eclampsia. Check BP and go to the ER.'));
    if (any('swelling')) add('red', L('تورم مفاجئ في الوش أو الإيدين', 'Sudden swelling of face or hands'), L('قيسي الضغط وكلمي الدكتورة النهارده.', 'Check BP and call your doctor today.'));
    if (any('fluid')) add('red', L('نزول مية', 'Fluid leaking'), L('ممكن يكون نزول مية الرأس. روحي المستشفى.', 'Your waters may have broken. Go to hospital.'));
    if (any('pain')) add('red', L('ألم شديد في البطن', 'Severe abdominal pain'), L('روحي الطوارئ.', 'Go to the ER.'));
    if (any('fever')) add('red', L('حرارة في الحمل', 'Fever in pregnancy'), L('كلمي الدكتورة النهارده.', 'Call your doctor today.'));
    if (w.week >= 28 && any('lessMoves')) add('red', L('حركة الجنين قلّت', 'Reduced baby movements'), L('متستنيش لبكرة. روحي المستشفى للمتابعة.', 'Don’t wait until tomorrow. Go to hospital to be checked.'));
    if (w.week < 37 && any('contractions')) add('red', L('انقباضات منتظمة قبل الأسبوع 37', 'Regular contractions before week 37'), L('ممكن تكون ولادة مبكرة. روحي المستشفى.', 'Could be preterm labour. Go to hospital.'));
    if (any('vomit')) add('amber', L('ترجيع شديد', 'Severe vomiting'), L('لو مش قادرة تشربي مية أو بتتقيأ كل حاجة، كلمي الدكتورة.', 'If you cannot keep water down, call your doctor.'));
    const c = calc(); if (c && w.prePreg && w.week >= 12) { const r = gainRange(), g = c.curW - r.pre, [lo, hi] = expectedGain(w.week, r); if (g > hi + 1.5) add('amber', L('زيادة الوزن أسرع من المتوقع', 'Weight gain above the expected range'), L(`زودتي ${fmt(g)} كجم، والمتوقع لحد دلوقتي ${fmt(lo)}–${fmt(hi)}. اعرضيها على الدكتورة.`, `Gained ${fmt(g)} kg vs ${fmt(lo)}–${fmt(hi)} expected so far. Show your doctor.`)); if (g < lo - 1.5) add('amber', L('زيادة الوزن أقل من المتوقع', 'Weight gain below the expected range'), L(`زودتي ${fmt(g)} كجم، والمتوقع ${fmt(lo)}–${fmt(hi)}.`, `Gained ${fmt(g)} kg vs ${fmt(lo)}–${fmt(hi)} expected.`)); }
  }
  if (w.mode === 'postpartum') {
    if (any('bleed')) add('red', L('نزيف شديد بعد الولادة', 'Heavy bleeding after birth'), L('لو بتغيري فوطة كل ساعة أو فيه جلطات كبيرة: طوارئ.', 'Soaking a pad every hour or large clots: ER.'));
    if (any('fever')) add('red', L('حرارة بعد الولادة', 'Fever after birth'), L('كلمي الدكتورة النهارده.', 'Call your doctor today.'));
    if (any('low')) add('amber', L('حزن أو قلق مستمر', 'Persistent sadness or anxiety'), L('لو مستمر أكتر من أسبوعين، أو فيه أفكار إيذاء: كلمي دكتورة أو حد قريب منك فورًا. ده علاجه متاح ومش ضعف.', 'If it lasts over two weeks, or there are thoughts of harm, talk to a doctor or someone close right away. It is treatable and not a weakness.'));
  }
}
function womenReminders(iso, push){
  if (S.settings.edition !== 'women') return; const w = S.women || {};
  if (w.mode === 'pregnant' && w.vitamins) push('vit', 9 * 60, L('فيتامينات الحمل 💊', 'Pregnancy vitamins 💊'), L('حسب اللي كتبته الدكتورة', 'As prescribed by your doctor'), 'remind');
  if (w.mode === 'pregnant' && w.week >= 28) push('kicks', 20 * 60, L('عدّ حركة الجنين 👶', 'Kick count 👶'), L('اقعدي مرتاحة وعدّي 10 حركات', 'Sit comfortably and count 10 movements'), 'remind');
}
const PREG_CHECK = [
  ['أول زيارة: تأكيد الحمل وتحاليل الدم والبول والفصيلة', 'First visit: confirm pregnancy, blood and urine tests, blood group'], ['سونار الأسبوع 11–13 (فحص الشهور الأولى)', 'Week 11–13 scan (first trimester screening)'],
  ['سونار التشوهات بين الأسبوع 18 و22', 'Anatomy scan between weeks 18 and 22'], ['تحليل سكر الحمل بين الأسبوع 24 و28', 'Glucose test between weeks 24 and 28'],
  ['متابعة الضغط والوزن في كل زيارة', 'Blood pressure and weight at every visit'], ['تطعيمات الحمل اللي بتحددها الدكتورة', 'Pregnancy vaccines your doctor recommends'],
  ['مسحة البكتيريا العقدية حوالي الأسبوع 36', 'Group B strep swab around week 36'], ['زيارات كل أسبوعين بعد الأسبوع 28، وكل أسبوع بعد 36', 'Visits every 2 weeks after week 28, weekly after 36']
];
const BAG = [['أوراق الهوية وملف المتابعة', 'ID and pregnancy file'], ['هدوم مريحة وروب', 'Comfortable clothes and a robe'], ['فوط ما بعد الولادة', 'Maternity pads'], ['حمالات رضاعة', 'Nursing bras'], ['شاحن الموبايل', 'Phone charger'], ['هدوم البيبي (مقاس حديث الولادة)', 'Newborn clothes'], ['حفاضات ومناديل مبللة', 'Nappies and wipes'], ['بطانية للبيبي', 'Baby blanket'], ['كرسي العربية للبيبي', 'Car seat'], ['مية وسناكس', 'Water and snacks']];
let WTAB = null;
registerView('women', {women: true, title: {ar: 'صحتي', en: 'My health'}, icon: 'women', render(){
  updateWomen(); const w = S.women, mode = w.mode || 'normal', tab = WTAB || 'main';
  const modeSeg = `<div class="seg">${[['normal', L('عادي', 'Regular')], ['pregnant', L('حامل', 'Pregnant')], ['postpartum', L('بعد الولادة', 'Postpartum')]].map(([k, l]) => `<button type="button" data-wmode="${k}" aria-pressed="${k === mode}">${l}</button>`).join('')}</div>`;
  const flags = (list) => { const d = dayOf(todayISO()).pw || {}; return `<div class="chips danger">${list.map(([k, l]) => `<button type="button" data-pw="${k}" aria-pressed="${!!d[k]}">${l}</button>`).join('')}</div>`; };
  let body = '';
  if (mode === 'normal') {
    const p = (w.periods || []).slice().sort().reverse(), nx = nextPeriod();
    body = `<div class="two"><div class="card form"><h2>${L('الدورة الشهرية', 'Cycle tracking')}</h2><div class="row"><input type="date" id="perDate" value="${todayISO()}" style="max-width:200px"><button class="btn fire sm" type="button" id="perAdd">${L('سجّلي أول يوم', 'Log first day')}</button></div>
      <div class="kpis"><div class="kpi"><div class="l">${L('متوسط طول الدورة', 'Average cycle')}</div><div class="v">${cycleLen()} <small>${L('يوم', 'days')}</small></div></div><div class="kpi"><div class="l">${L('الجاية المتوقعة', 'Next expected')}</div><div class="v" style="font-size:1.2rem">${nx ? dShort(nx) : '—'}</div></div></div>
      ${p.length ? `<div class="chips">${p.slice(0, 12).map(d => `<button type="button" data-perdel="${d}">${dShort(d)} ✕</button>`).join('')}</div>` : ''}
      <p class="muted small" style="margin:0">${L('دورة أقصر من 21 يوم أو أطول من 35، أو نزيف شديد، أو ألم شديد: اعرضيها على دكتورة نسا. التوقع ده مش وسيلة لمنع الحمل.', 'Cycles shorter than 21 or longer than 35 days, heavy bleeding or severe pain: see a gynaecologist. This prediction is not contraception.')}</p></div>
      <div class="card"><h2>${L('أكلك وتمرينك', 'Food & training')}</h2><p class="muted" style="margin:8px 0 0">${L('الوجبات بنفس النظام بكميات مناسبة للسيدات (البروتين أقل 15% والنشويات أقل 30%)، والسعرات محسوبة بمعادلة السيدات. أيام الدورة: خففي الأوزان لو حسيتي بتعب، والمشي والإطالة مفيدين للتقلصات. ركزي على الحديد: الكبدة واللحمة والسمك، والشاي بعيد عن الأكل.', 'Meals follow the same plan with women’s portions (protein −15%, starch −30%) and calories use the female formula. During your period lighten the weights if tired; walking and stretching help cramps. Focus on iron: liver, red meat and fish, with tea away from meals.')}</p></div></div>`;
  }
  if (mode === 'pregnant') {
    if (!w.lmp) body = `<div class="card form"><h2>${L('ابدئي برنامج الحمل', 'Start the pregnancy program')}</h2><div class="fgrid"><label class="f">${L('أول يوم في آخر دورة', 'First day of last period')}<input type="date" id="wLmp"></label><label class="f">${L('أو الولادة المتوقعة', 'Or due date')}<input type="date" id="wDue"></label><label class="f">${L('وزنك قبل الحمل (كجم)', 'Pre-pregnancy weight (kg)')}<input type="number" step="0.1" id="wPre"></label></div><div><button class="btn fire" type="button" id="wStart">${L('ابدئي', 'Start')}</button></div></div>`;
    else {
      const wk = Math.min(40, Math.max(4, w.week)), info = WEEKS[wk], r = gainRange(), c = calc(), gain = c && w.prePreg ? c.curW - w.prePreg : null, [elo, ehi] = expectedGain(w.week, r);
      const tabs = [['main', L('الأسبوع', 'This week')], ['food', L('الأكل', 'Food')], ['move', L('الحركة', 'Exercise')], ['check', L('المتابعة', 'Check-ups')], ['mind', L('النفسية', 'Wellbeing')], ['bag', L('شنطة الولادة', 'Hospital bag')], ['tools', L('أدوات', 'Tools')]];
      const tseg = `<div class="seg">${tabs.map(([k, l]) => `<button type="button" data-wtab="${k}" aria-pressed="${k === tab}">${l}</button>`).join('')}</div>`;
      let t = '';
      if (tab === 'main') t = `<div class="card hero"><div class="week-hero"><div class="belly">${w.week}</div><div><div class="eyebrow">${L('التلت', 'Trimester')} ${w.trimester} · ${L('فاضل', 'Left')} ${Math.max(0, daysBetween(todayISO(), w.due))} ${L('يوم', 'days')} · ${L('الولادة المتوقعة', 'Due')} ${dLong(w.due)}</div><h2 style="font-size:1.3rem">${L('حجمه زي ', 'Size of ')}${esc(LANG === 'en' ? info[1] : info[0])}</h2><p style="margin:6px 0 0">${esc(LANG === 'en' ? info[3] : info[2])}</p></div></div><div class="bar-prog" style="margin-top:16px"><i style="width:${Math.min(100, w.week / 40 * 100)}%"></i></div></div>
        <div class="kpis"><div class="kpi"><div class="l">${L('زيادة الوزن', 'Weight gained')}</div><div class="v">${gain === null ? '—' : fmt(gain)} <small>${L('كجم', 'kg')}</small></div><div class="s">${L('المتوقع لحد دلوقتي', 'Expected so far')} <span dir="ltr">${fmt(elo)}–${fmt(ehi)}</span></div></div><div class="kpi"><div class="l">${L('الزيادة الكلية الموصى بيها', 'Total recommended gain')}</div><div class="v"><span dir="ltr">${r.lo}–${r.hi}</span> <small>${L('كجم', 'kg')}</small></div><div class="s">BMI ${L('قبل الحمل', 'pre-pregnancy')} ${fmt(r.bmi)}</div></div><div class="kpi"><div class="l">${L('السعرات النهارده', 'Calories today')}</div><div class="v">${c ? fmt(c.kRest, 0) : '—'}</div><div class="s">${w.trimester === 1 ? L('من غير زيادة في التلت الأول', 'No extra in trimester 1') : w.trimester === 2 ? L('+340 سعر في التلت التاني', '+340 kcal in trimester 2') : L('+450 سعر في التلت التالت', '+450 kcal in trimester 3')}</div></div><div class="kpi"><div class="l">${L('البروتين', 'Protein')}</div><div class="v">${c ? c.protein : '—'} <small>${L('جم', 'g')}</small></div></div></div>
        <div class="card"><div class="head"><h2>${L('علامات النهارده (لو حصل أي حاجة)', 'Today’s warning signs (if any)')}</h2></div>${flags([['bleed', L('نزيف', 'Bleeding')], ['headache', L('صداع شديد أو زغللة', 'Severe headache / blurred vision')], ['swelling', L('تورم مفاجئ', 'Sudden swelling')], ['fluid', L('نزول مية', 'Fluid leak')], ['pain', L('ألم شديد', 'Severe pain')], ['fever', L('حرارة', 'Fever')], ['lessMoves', L('الحركة قلّت', 'Fewer movements')], ['contractions', L('انقباضات منتظمة', 'Regular contractions')], ['vomit', L('ترجيع شديد', 'Severe vomiting')]])}<p class="muted small" style="margin:10px 0 0">${L('أي علامة حمرا بتظهر في الصحة والرئيسية على طول.', 'Any red sign appears on Health and Today immediately.')}</p></div>`;
      if (tab === 'food') t = `<div class="card plan"><div class="pc" style="padding-top:6px">
        <p><b>${L('السعرات', 'Calories')}:</b> ${L('التلت الأول من غير زيادة، التاني +340، التالت +450 سعر في اليوم. التطبيق بيحسبها لوحده، والتنشيف بيتوقف خالص في الحمل.', 'Trimester 1 no extra, trimester 2 +340, trimester 3 +450 kcal a day. The app adjusts automatically, and any fat-loss deficit is switched off.')}</p>
        <p><b>${L('مهم', 'Important')}:</b> ${L('بروتين في كل وجبة، ألبان خالية من اللاكتوز للكالسيوم، سمك قليل الزئبق (بلطي وباسا وسلمون) مرتين لـ3 في الأسبوع، خضار وفاكهة مغسولة كويس، ومية كتير.', 'Protein at every meal, lactose-free dairy for calcium, low-mercury fish (tilapia, basa, salmon) 2–3 times a week, well-washed fruit and veg, plenty of water.')}</p>
        <p><b>${L('ممنوع في الحمل', 'Avoid in pregnancy')}:</b> ${L('اللحمة أو السمك أو الفراخ النية أو مش مستوية كويس، الألبان غير المبسترة، السمك عالي الزئبق (سمك القرش وأبو سيف والماكريل الملكي)، الكبدة (فيتامين A عالي ولذلك اتشالت من نظامك)، الكافيين أكتر من 200 مجم في اليوم، والأعشاب من غير ما تسألي الدكتورة.', 'Raw or undercooked meat, fish or chicken; unpasteurised dairy; high-mercury fish (shark, swordfish, king mackerel); liver (very high vitamin A, already removed from your plan); more than 200 mg caffeine a day; herbal remedies without asking your doctor.')}</p>
        <p><b>${L('المكملات', 'Supplements')}:</b> ${L('حمض الفوليك والحديد وفيتامين د وغيرهم شائعين في الحمل، بس الجرعة والنوع بتحددهم الدكتورة حسب تحاليلك. فعّلي تذكير الفيتامينات من "أدوات".', 'Folic acid, iron, vitamin D and others are common in pregnancy, but your doctor decides the type and dose from your labs. Turn on the vitamin reminder in Tools.')}</p>
        <p><b>${L('الغثيان', 'Nausea')}:</b> ${L('وجبات صغيرة كل 2–3 ساعات، كعك أرز أو بقسماط أول ما تصحي، زنجبيل، وابعدي عن الروايح القوية. ترجيع مستمر: كلمي الدكتورة.', 'Small meals every 2–3 hours, a rice cake when you wake, ginger, avoid strong smells. Persistent vomiting: call your doctor.')}</p>
        <p><b>${L('الحموضة والإمساك', 'Heartburn & constipation')}:</b> ${L('متناميش بعد الأكل على طول، ارفعي المخدة، مية كتير، ومشي يومي.', 'Don’t lie down right after eating, raise your pillow, drink plenty, walk daily.')}</p>
        <p><b>${L('مع الكرونز أو القولون', 'With Crohn’s or IBS')}:</b> ${L('الحمل مع مرض أمعاء التهابي محتاج متابعة مشتركة بين دكتورة النسا ودكتور الجهاز الهضمي، ومتوقفيش أي علاج من نفسك.', 'Pregnancy with IBD needs joint follow-up between your obstetrician and gastroenterologist. Never stop a medicine on your own.')}</p></div></div>`;
      if (tab === 'move') t = `<div class="card plan"><div class="pc" style="padding-top:6px"><p>${L('لو الدكتورة موافقة، الهدف حوالي 150 دقيقة في الأسبوع مجهود متوسط: تقدري تتكلمي وإنتي بتتمرني.', 'If your doctor agrees, aim for about 150 minutes a week of moderate activity: you can talk while exercising.')}</p><ul>
        <li>${L('مشي يومي 20–30 دقيقة.', 'A daily 20–30 minute walk.')}</li><li>${L('أوزان خفيفة بعدات أكتر، وتنفس طبيعي من غير كتم نفس.', 'Light weights with more reps, normal breathing, no breath-holding.')}</li><li>${L('بعد الشهر الرابع: مفيش تمارين وإنتي نايمة على ضهرك. استخدمي الكرسي أو الجنب.', 'After month 4: no exercises lying flat on your back. Use an incline or side-lying.')}</li><li>${L('تمارين قاع الحوض (كيجل) كل يوم.', 'Pelvic floor (Kegel) exercises daily.')}</li><li>${L('ممنوع: رياضات فيها خبط أو وقوع، والحر الشديد، وتمارين البطن القوية.', 'Avoid: contact or fall-risk sports, overheating, intense ab work.')}</li></ul>
        <p><b>${L('وقّفي فورًا لو', 'Stop at once if')}:</b> ${L('نزيف، دوخة، ألم في الصدر أو البطن، نزول مية، انقباضات، ضيق نفس قبل المجهود، أو صداع شديد.', 'bleeding, dizziness, chest or belly pain, fluid leak, contractions, breathlessness before effort, or severe headache.')}</p></div></div>`;
      if (tab === 'check') t = `<div class="card"><div class="head"><h2>${L('المتابعات المعتادة', 'Usual check-ups')}</h2></div>${PREG_CHECK.map((x, i) => `<label class="tl"><span></span><input type="checkbox" class="tick" data-wchk="c${i}" ${w.chk?.['c' + i] ? 'checked' : ''}><span class="lab">${esc(LANG === 'en' ? x[1] : x[0])}</span></label>`).join('')}<p class="muted small" style="margin:10px 0 0">${L('المواعيد ممكن تختلف حسب الدكتورة وحالتك.', 'Timing can differ by doctor and situation.')}</p></div>`;
      if (tab === 'mind') t = `<div class="card plan"><div class="pc" style="padding-top:6px"><p>${L('تقلب المزاج والقلق شائعين في الحمل. نوم كفاية، مشي، صلاة وذكر، وكلام مع حد قريب بيفرقوا كتير.', 'Mood swings and worry are common in pregnancy. Enough sleep, walking, prayer and dhikr, and talking to someone close make a real difference.')}</p><p>${L('لو الحزن أو القلق مستمر أكتر من أسبوعين، أو مأثر على نومك وأكلك، أو فيه أفكار إيذاء: كلمي الدكتورة على طول. ده علاجه متاح وآمن في الحمل.', 'If sadness or anxiety lasts over two weeks, affects sleep and appetite, or brings thoughts of harm: tell your doctor right away. Safe treatment exists in pregnancy.')}</p></div></div>`;
      if (tab === 'bag') t = `<div class="card"><div class="head"><h2>${L('شنطة الولادة', 'Hospital bag')}</h2><span class="muted small">${L('جهزيها في الأسبوع 36', 'Pack it by week 36')}</span></div>${BAG.map((x, i) => `<label class="tl"><span></span><input type="checkbox" class="tick" data-wchk="b${i}" ${w.chk?.['b' + i] ? 'checked' : ''}><span class="lab">${esc(LANG === 'en' ? x[1] : x[0])}</span></label>`).join('')}</div>`;
      if (tab === 'tools') { const kc = w.kicks?.[todayISO()] || 0, ct = w.contr || []; t = `<div class="two"><div class="card"><div class="head"><h2>${L('عدّاد حركة الجنين', 'Kick counter')}</h2><span class="muted small">${L('من الأسبوع 28', 'From week 28')}</span></div><div class="row"><button class="tap" type="button" id="kick">${kc} ${L('حركة', 'kicks')}</button><button class="link" type="button" id="kickReset">${L('من الأول', 'Reset')}</button></div><p class="muted small" style="margin:10px 0 0">${L('المعتاد إنك تحسي بـ10 حركات خلال ساعتين. لو أقل أو الحركة اختلفت عن العادي: روحي المستشفى.', 'Usually 10 movements within two hours. Fewer, or a change from normal: go to hospital.')}</p></div>
        <div class="card"><div class="head"><h2>${L('مؤقت الانقباضات', 'Contraction timer')}</h2></div><button class="tap" type="button" id="contr">${w.cStart ? L('خلصت الانقباضة', 'Contraction ended') : L('بدأت انقباضة', 'Contraction started')}</button>${ct.length ? `<div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>${L('الوقت', 'Time')}</th><th>${L('المدة', 'Length')}</th><th>${L('الفرق', 'Gap')}</th></tr></thead><tbody>${ct.slice(-8).reverse().map((x, i, a) => `<tr><td>${new Date(x.s).toLocaleTimeString(locale(), {hour: 'numeric', minute: '2-digit'})}</td><td>${Math.round((x.e - x.s) / 1000)} ${L('ث', 's')}</td><td>${a[i + 1] ? Math.round((x.s - a[i + 1].s) / 60000) + L(' د', ' min') : '—'}</td></tr>`).join('')}</tbody></table></div><button class="link" type="button" id="contrClear">${L('امسح', 'Clear')}</button>` : ''}<p class="muted small" style="margin:10px 0 0">${L('انقباضات كل 5 دقايق لمدة دقيقة لمدة ساعة (أو حسب كلام دكتورتك): روحي المستشفى.', 'Every 5 minutes, lasting a minute, for an hour (or as your doctor said): go to hospital.')}</p></div>
        <div class="card"><div class="head"><h2>${L('تذكير الفيتامينات', 'Vitamin reminder')}</h2></div><label class="row"><input type="checkbox" class="tick" id="wVit" ${w.vitamins ? 'checked' : ''}> ${L('فكّريني كل يوم الساعة 9 الصبح', 'Remind me daily at 9 AM')}</label></div>
        <div class="card"><div class="head"><h2>${L('بيانات الحمل', 'Pregnancy details')}</h2></div><div class="fgrid"><label class="f">${L('أول يوم في آخر دورة', 'Last period start')}<input type="date" id="wLmp" value="${w.lmp || ''}"></label><label class="f">${L('وزنك قبل الحمل', 'Pre-pregnancy weight')}<input type="number" step="0.1" id="wPre" value="${w.prePreg || ''}"></label></div><div class="row" style="margin-top:10px"><button class="btn sm" type="button" id="wStart">${L('حدّث', 'Update')}</button><button class="btn ghost sm" type="button" id="wBorn">${L('اتولد البيبي 🎉', 'Baby is born 🎉')}</button></div></div></div>`; }
      body = tseg + t;
    }
  }
  if (mode === 'postpartum') {
    if (!w.birth) body = `<div class="card form"><h2>${L('تاريخ الولادة', 'Birth date')}</h2><div class="fgrid"><label class="f">${L('اتولد يوم', 'Born on')}<input type="date" id="wBirth" value="${todayISO()}"></label><label class="f">${L('نوع الولادة', 'Type of birth')}<select id="wType"><option value="v">${L('طبيعي', 'Vaginal')}</option><option value="c">${L('قيصري', 'Caesarean')}</option></select></label><label class="row"><input type="checkbox" class="tick" id="wBf"> ${L('برضّع رضاعة طبيعية', 'I am breastfeeding')}</label></div><div><button class="btn fire" type="button" id="wPP">${L('ابدئي', 'Start')}</button></div></div>`;
    else {
      const wk = w.ppWeeks, cs = w.btype === 'c', age = daysBetween(w.birth, todayISO());
      const vacc = [[0, L('عند الولادة', 'At birth')], [60, L('شهرين', '2 months')], [120, L('4 شهور', '4 months')], [180, L('6 شهور', '6 months')], [270, L('9 شهور', '9 months')], [365, L('سنة', '12 months')], [540, L('سنة ونص', '18 months')]];
      body = `<div class="card hero"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">${cs ? L('ولادة قيصرية', 'Caesarean birth') : L('ولادة طبيعية', 'Vaginal birth')} · ${w.breastfeeding ? L('رضاعة طبيعية', 'Breastfeeding') : L('من غير رضاعة طبيعية', 'Not breastfeeding')}</div><h2 style="font-size:1.3rem">${L('عمر البيبي', 'Baby’s age')}: ${age < 14 ? age + L(' يوم', ' days') : Math.floor(age / 7) + L(' أسبوع', ' weeks')}</h2></div><button class="btn ghost sm" type="button" id="wReset">${L('غيّري البيانات', 'Edit details')}</button></div></div>
      <div class="card"><div class="head"><h2>${L('علامات النهارده (لو حصل)', 'Today’s warning signs (if any)')}</h2></div>${flags([['bleed', L('نزيف شديد', 'Heavy bleeding')], ['fever', L('حرارة', 'Fever')], ['low', L('حزن أو قلق مستمر', 'Persistent sadness/anxiety')], ['pain', L('ألم شديد', 'Severe pain')]])}</div>
      <div class="card plan">
        <details open><summary>${L('التعافي', 'Recovery')}</summary><div class="pc"><p>${wk < 6 ? L('أول 6 أسابيع: راحة ومشي خفيف بس. النزيف بيقل تدريجيًا.', 'First 6 weeks: rest and gentle walking only. Bleeding fades gradually.') : L('بعد 6 أسابيع وبعد كشف الدكتورة، تقدري ترجعي للتمرين تدريجيًا.', 'After 6 weeks and your doctor’s check, return to exercise gradually.')} ${cs ? L('بعد القيصري: ممنوع شيل حاجة أتقل من البيبي أول 6 أسابيع، وخلي بالك من الجرح (احمرار أو إفرازات أو حرارة = دكتورة).', 'After a C-section: lift nothing heavier than the baby for 6 weeks and watch the wound (redness, discharge or fever = doctor).') : ''}</p></div></details>
        <details><summary>${L('الأكل والرضاعة', 'Food & breastfeeding')}</summary><div class="pc"><p>${w.breastfeeding ? L('الرضاعة محتاجة حوالي 400–500 سعر زيادة ومية كتير. التطبيق زوّدهم وخلّى التنشيف خفيف جدًا. نزول الوزن الآمن مع الرضاعة حوالي نص كيلو في الأسبوع بعد أول 6–8 أسابيع.', 'Breastfeeding needs about 400–500 extra kcal and plenty of water; the app has added them and kept any deficit very gentle. Safe loss while breastfeeding is about 0.5 kg a week after the first 6–8 weeks.') : L('بعد 6 أسابيع تقدري ترجعي لنظام التنشيف العادي تدريجيًا.', 'After 6 weeks you can gradually return to the usual fat-loss plan.')} ${L('كملي الفيتامينات اللي الدكتورة كتبتها.', 'Continue the vitamins your doctor prescribed.')}</p></div></details>
        <details><summary>${L('الحركة', 'Exercise')}</summary><div class="pc"><ul><li>${L('تمارين قاع الحوض والتنفس من الأيام الأولى لو مريحة.', 'Pelvic floor and breathing exercises from the early days if comfortable.')}</li><li>${L('مشي يومي يزيد تدريجيًا.', 'A daily walk that grows gradually.')}</li><li>${L('الأوزان وتمارين البطن بعد كشف الأسبوع 6، وبعد القيصري ممكن تتأخر.', 'Weights and core work after the week-6 check; later after a C-section.')}</li></ul></div></details>
        <details><summary>${L('صحتك النفسية', 'Your mental health')}</summary><div class="pc"><p>${L('"كآبة ما بعد الولادة" البسيطة شائعة أول أسبوعين. لو الحزن أو القلق أو فقدان الاهتمام مستمر أكتر من أسبوعين، أو فيه أفكار إيذاء نفسك أو البيبي: كلمي دكتورة أو حد قريب فورًا. ده مرض ليه علاج.', 'The "baby blues" are common in the first two weeks. If sadness, anxiety or loss of interest lasts beyond two weeks, or there are thoughts of harming yourself or the baby, speak to a doctor or someone close right away. It is an illness with treatment.')}</p></div></details>
        <details><summary>${L('البيبي', 'Your baby')}</summary><div class="pc"><p>${L('الرضاعة عند الطلب، غالبًا 8–12 مرة في اليوم أول أسابيع. نوم البيبي على ضهره في سرير لوحده. حرارة 38 أو أكتر لبيبي أقل من 3 شهور: طوارئ.', 'Feed on demand, usually 8–12 times a day in the early weeks. Baby sleeps on the back in their own cot. A temperature of 38°C or more under 3 months: ER.')}</p><p><b>${L('التطعيمات', 'Vaccinations')}:</b> ${L('حسب جدول وزارة الصحة في مركز الرعاية الأولية. المواعيد المعتادة:', 'Follow the Ministry of Health schedule at your primary care centre. Usual visits:')}</p><ul>${vacc.map(([d, l]) => `<li>${l} · ${dShort(addDays(w.birth, d))}${age >= d ? ' ✓' : ''}</li>`).join('')}</ul></div></details>
      </div>`;
    }
  }
  return topbar(L('صحتي', 'My health'), L('الدورة والحمل وما بعد الولادة', 'Cycle, pregnancy and postpartum'), '', true) + modeSeg + body + `<p class="muted small">${L('البرنامج ده إرشادي ومش بديل عن دكتورة النسا. أي علامة خطر: كلميها أو روحي الطوارئ.', 'This program is guidance and never replaces your obstetrician. Any warning sign: call her or go to the ER.')}</p>`;
}});
on('click', e => {
  const T = e.target, w = S.women ||= {};
  const m = T.closest('[data-wmode]'); if (m) { w.mode = m.dataset.wmode; WTAB = null; store.save(); renderNav(); render(); rescheduleAll(); return true; }
  const t = T.closest('[data-wtab]'); if (t) { WTAB = t.dataset.wtab; render(); return true; }
  const pw = T.closest('[data-pw]'); if (pw) { const d = day(todayISO()); d.pw ||= {}; d.pw[pw.dataset.pw] = !d.pw[pw.dataset.pw]; store.save(); render(); return true; }
  if (T.id === 'perAdd') { const v = $('#perDate').value; if (v) { w.periods = [...new Set([...(w.periods || []), v])]; store.save(); render(); } return true; }
  const pd = T.closest('[data-perdel]'); if (pd) { w.periods = (w.periods || []).filter(x => x !== pd.dataset.perdel); store.save(); render(); return true; }
  if (T.id === 'wStart') { const lmp = $('#wLmp')?.value, due = $('#wDue')?.value, pre = num($('#wPre')?.value); if (!lmp && !due) { toast(L('اكتبي تاريخ آخر دورة أو الولادة المتوقعة.', 'Enter the last period or the due date.')); return true; } w.lmp = lmp || addDays(due, -280); if (pre) w.prePreg = pre; updateWomen(); store.save(); render(); rescheduleAll(); return true; }
  if (T.id === 'wBorn') { w.mode = 'postpartum'; w.birth = todayISO(); WTAB = null; store.save(); render(); return true; }
  if (T.id === 'wPP') { w.birth = $('#wBirth').value || todayISO(); w.btype = $('#wType').value; w.breastfeeding = $('#wBf').checked; store.save(); render(); return true; }
  if (T.id === 'wReset') { delete w.birth; store.save(); render(); return true; }
  if (T.id === 'kick') { w.kicks ||= {}; w.kicks[todayISO()] = (w.kicks[todayISO()] || 0) + 1; if (navigator.vibrate) try { navigator.vibrate(15); } catch (er) {} store.save(); render(); return true; }
  if (T.id === 'kickReset') { (w.kicks ||= {})[todayISO()] = 0; store.save(); render(); return true; }
  if (T.id === 'contr') { if (w.cStart) { (w.contr ||= []).push({s: w.cStart, e: Date.now()}); w.cStart = null; } else w.cStart = Date.now(); store.save(); render(); return true; }
  if (T.id === 'contrClear') { w.contr = []; store.save(); render(); return true; }
});
on('change', e => {
  const T = e.target, w = S.women ||= {};
  if (T.dataset.wchk) { (w.chk ||= {})[T.dataset.wchk] = T.checked; store.save(); return true; }
  if (T.id === 'wVit') { w.vitamins = T.checked; store.save(); rescheduleAll(); return true; }
});
