/* زاد — المساعد الذكي المجاني. بيشتغل من غير نت: بيفهم أوامر بالمصري والإنجليزي، ويدوّر في كل التطبيق،
   وينفّذ (يضيف مشتريات، يسجّل وزن ومية ووجبات ودوا ومصاريف، يعمل تذكير، يفتح أي قسم، يبدأ المدرب الصوتي) بعد ما تأكّد.
   ولو حطيت مفتاح Gemini المجاني (اختياري) بيرد كمان على الأسئلة المفتوحة. */
'use strict';
const AI = {msgs: [], pending: null, busy: false, btn: {}, n: 0};
try { AI.msgs = JSON.parse(localStorage.getItem('zad-ai-log') || '[]').slice(-30); } catch (e) {}
const aiSave = () => { try { localStorage.setItem('zad-ai-log', JSON.stringify(AI.msgs.slice(-30).map(m => ({who: m.who, t: m.t, g: m.g})))); } catch (e) {} };
const aiCfg = () => (S.settings.ai ||= {key: '', model: '', share: false, fab: true});

/* ---------- تطبيع النص ---------- */
const AR_DIG = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g, '.');
const NUMW = {واحد: 1, واحده: 1, اتنين: 2, اثنين: 2, تنين: 2, تلاته: 3, ثلاثه: 3, تلات: 3, اربعه: 4, اربع: 4, خمسه: 5, خمس: 5, سته: 6, سبعه: 7, سبع: 7, تمانيه: 8, ثمانيه: 8, تسعه: 9, تسع: 9, عشره: 10, عشر: 10, حداشر: 11, اتناشر: 12, عشرين: 20, تلاتين: 30, اربعين: 40, خمسين: 50, ستين: 60, سبعين: 70, تمانين: 80, تسعين: 90, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10};
function norm(s){
  let t = AR_DIG(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[؟?!؛;"«»]/g, ' ').replace(/\s*[،,]\s*/g, ' و ').replace(/(\d)\s*[.]\s*(\d)/g, '$1.$2').replace(/\.(?!\d)/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/(^|\s)(كوبايتين|كوبيتين)(?=\s|$)/g, '$12 كوبايه').replace(/(^|\s)(ساعتين)(?=\s|$)/g, '$12 ساعه').replace(/(^|\s)(دقيقتين)(?=\s|$)/g, '$12 دقيقه');
  return t.split(' ').map(w => NUMW[w] !== undefined ? String(NUMW[w]) : w).join(' ').replace(/(\d+)\s+و\s?نص/g, (m, a) => String(+a + 0.5)).replace(/(\d+)\s+و\s?ربع/g, (m, a) => String(+a + 0.25));
}
const nums = n => (n.match(/\d+(?:\.\d+)?/g) || []).map(Number);
const has = (n, re) => re.test(n);

/* ---------- الأقسام ---------- */
const NAV_SYN = {today: 'الرئيسيه النهارده اليوم البدايه home today', plan: 'خطتي الخطه البرنامج plan', growth: 'النمو الطفل التطور growth', workout: 'التمرين الجيم التمارين الرياضه workout gym', meals: 'الاكل الوجبات الدايت النظام meals food diet', kitchen: 'المطبخ الطبخ الطبيخ kitchen', log: 'السجل القياسات log', planner: 'المهام الاجنده المنظم التاسكات tasks planner', shop: 'المشتريات اللسته السوق الطلبات shopping', money: 'الفلوس المصاريف الميزانيه money budget', meds: 'الادويه الدوا العلاج meds medicine', events: 'المناسبات الاعياد events', habits: 'العادات الاهداف habits goals', kb: 'الموسوعه المعلومات encyclopedia', calc: 'الحاسبه الالة الحاسبه calculator', routes: 'المشاوير الطرق routes', travel: 'السفر الرحلات travel', decide: 'القرار احتار decide', prayer: 'الصلاه المواقيت القبله الاذان prayer', adhkar: 'الاذكار اذكار adhkar', tasbeeh: 'السبحه التسبيح tasbeeh', quran: 'القران المصحف quran', khatma: 'الختمه khatma', hijri: 'الهجري التقويم hijri', zakat: 'الزكاه zakat', nasheed: 'الاناشيد نشيد nasheed', library: 'المكتبه الكتب library books', news: 'الاخبار news', games: 'الالعاب العاب games', women: 'صحه المراه الدوره الحمل women', insights: 'التحليلات الاحصائيات insights stats', health: 'الصحه التحاليل health', notify: 'التنبيهات الاشعارات notifications', settings: 'الاعدادات settings'};
function findView(q){
  q = norm(q).replace(/^(صفحه|قسم|شاشه|page|section)\s+/, ''); if (!q) return null; let best = null, bs = 0;
  Object.keys(VIEWS).forEach(id => { const names = [norm(VIEWS[id].title.ar), VIEWS[id].title.en.toLowerCase(), ...(NAV_SYN[id] || '').split(' ')]; const s = names.includes(q) ? 1 : fuzzyScore(q, names); if (s > bs) { bs = s; best = id; } });
  return bs >= 0.78 ? best : null;
}

/* ---------- الوقت والتاريخ ---------- */
const WDN = [['الاحد', 'الحد', 'sunday'], ['الاتنين', 'الاثنين', 'monday'], ['التلات', 'الثلاثاء', 'التلاتاء', 'tuesday'], ['الاربع', 'الاربعاء', 'wednesday'], ['الخميس', 'thursday'], ['الجمعه', 'friday'], ['السبت', 'saturday']];
const PER_PM = /^(العصر|المغرب|بالليل|ليلا|مساء|مساءا|بليل|العشا|الضهر|الظهر|بعد الضهر|م|pm)$/, PER_AM = /^(الصبح|صباحا|الفجر|ص|am|بدري)$/;
/* بيرجّع {date, time, used:Set(indices)} من كلمات الجملة */
function parseWhen(toks){
  const used = new Set(), now = new Date(); let date = null, time = null;
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i];
    if (/^(النهارده|النهاردا|today)$/.test(w)) { date = todayISO(); used.add(i); }
    else if (/^(بكره|بكرا|tomorrow)$/.test(w)) { if (toks[i - 1] === 'بعد') { date = addDays(todayISO(), 2); used.add(i - 1); } else date = addDays(todayISO(), 1); used.add(i); }
    else if (w === 'يوم' && WDN.some(x => x.includes(toks[i + 1]))) used.add(i);
    else { const wd = WDN.findIndex(x => x.includes(w)); if (wd >= 0) { const diff = (wd - now.getDay() + 7) % 7; date = addDays(todayISO(), diff || 7); used.add(i); } }
    if (w === 'بعد' && /^\d/.test(toks[i + 1] || '') && /^(دقيقه|دقايق|دقيقة|min|minutes|ساعه|ساعات|hour|hours)$/.test(toks[i + 2] || '')) { const n = +toks[i + 1], m = /^(ساعه|ساعات|hour|hours)$/.test(toks[i + 2]) ? n * 60 : n; const d = new Date(Date.now() + m * 60000); date = isoOf(d); time = pad2(d.getHours()) + ':' + pad2(d.getMinutes()); used.add(i); used.add(i + 1); used.add(i + 2); }
    else if (w === 'بعد' && /^(ساعه|نص)$/.test(toks[i + 1] || '')) { const m = toks[i + 1] === 'نص' ? 30 : 60; const d = new Date(Date.now() + m * 60000); date = isoOf(d); time = pad2(d.getHours()) + ':' + pad2(d.getMinutes()); used.add(i); used.add(i + 1); if (toks[i + 2] === 'ساعه') used.add(i + 2); }
    if (/^(الساعه|ساعه|at)$/.test(w) && /^\d/.test(toks[i + 1] || '')) {
      let [h, mm] = toks[i + 1].split(/[:.]/).map(Number); mm = mm || 0; if (toks[i + 1].includes('.') && !toks[i + 1].includes(':')) { const f = +toks[i + 1]; h = Math.floor(f); mm = Math.round((f - h) * 60); }
      used.add(i); used.add(i + 1); let k = i + 2;
      if (toks[k] === 'الا' && toks[k + 1] === 'ربع') { h -= 1; mm = 45; used.add(k); used.add(k + 1); k += 2; }
      const per = toks[k] || ''; if (PER_PM.test(per) || (per === 'بعد' && toks[k + 1] === 'الضهر')) { if (h < 12) h += 12; used.add(k); if (per === 'بعد') used.add(k + 1); } else if (PER_AM.test(per)) { if (h === 12) h = 0; used.add(k); } else if (h < 7) h += 12;
      if (/^(\d+)(pm)$/.test(toks[i + 1])) h = +RegExp.$1 + 12;
      time = pad2(h % 24) + ':' + pad2(mm);
    }
  }
  if (time && !date) { date = todayISO(); if (t2m(time) <= nowMin()) date = addDays(date, 1); }
  return {date, time, used};
}

/* ---------- الإجراءات (بتتأكد الأول) ---------- */
function actShop(items){
  const l = LIFE(), added = [];
  return {label: L('ضيفهم للمشتريات', 'Add to shopping'), run(){ items.forEach(({name, qty}) => { const cands = shopSearch(name), best = cands[0], nn = norm(name); let it = cands.find(c => shopNames(c).some(x => x && norm(x) === nn)) || (best && fuzzyScore(name, shopNames(best)) >= 0.97 ? best : null); if (!it) { it = {id: 'c.' + uid(), ar: name, syn: [], en: name, cat: best ? best.cat : 'other', sub: best ? best.sub : 'gifts', u: best ? best.u : 'pc', custom: true}; customItems().push(it); } const before = l.shop.length; addToShop(it, qty > 1 ? {qty} : null); if (l.shop.length > before) added.push(l.shop.at(-1).id); }); store.save(); if (VIEW === 'shop') render(); return L(`تمام، ضفت ${arN(items.length, ['حاجة واحدة', 'حاجتين', 'حاجات'])} للمشتريات ✅`, `Done, added ${items.length} to shopping ✅`); },
    undo(){ l.shop = l.shop.filter(x => !added.includes(x.id)); store.save(); if (VIEW === 'shop') render(); }};
}
function actSet(label, apply, undoFn, doneTxt){ return {label, run(){ apply(); store.save(); if (['today', 'log', 'meals', 'workout', 'meds', 'planner', 'money', 'shop'].includes(VIEW)) render(); return doneTxt; }, undo(){ undoFn(); store.save(); render(); }}; }

/* ---------- المحرّك ---------- */
const INTENTS = [];
const intent = (k, fn) => INTENTS.push({k, fn});

intent('stop', n => /^(اسكت|بس|كفايه|اوقف الكلام|stop|quiet|shut up)$/.test(n) ? (speakStop(), {say: L('حاضر 🤐', 'OK 🤐'), silent: true}) : null);
intent('help', n => has(n, /^(مساعده|ساعدني|help|بتعمل ايه|تقدر تعمل ايه|تعمل ايه|what can you do|commands|الاوامر)/) ? {say: L('أقدر أساعدك في كل التطبيق. جرّب تقول:', 'I can help across the whole app. Try:'), html: `<ul class="aihelp">${[
  L('«ملخص يومي» أو «إيه اللي فاضلي النهارده»', '“Daily summary” or “what’s left today”'), L('«كام فاضل على المغرب»', '“How long until Maghrib”'), L('«وزني 92 ونص»', '“My weight is 92.5”'), L('«شربت كوبايتين مية»', '“I drank 2 glasses of water”'),
  L('«خلصت الفطار» أو «هاكل إيه النهارده»', '“I finished breakfast” or “what do I eat today”'), L('«ضيف لبن وعيش و2 كيلو طماطم للمشتريات»', '“Add milk, bread and 2 kg tomatoes to shopping”'), L('«فكرني بكرة الساعة 9 الصبح أدفع الفاتورة»', '“Remind me tomorrow at 9 am to pay the bill”'),
  L('«صرفت 50 على مواصلات»', '“I spent 50 on transport”'), L('«خدت دوا الضغط»', '“I took my blood pressure pill”'), L('«ابدأ التمرين» (مدرب صوتي بيعد معاك)', '“Start workout” (voice coach counts with you)'), L('«بدّل تمرين السكوات»', '“Swap the squat”'),
  L('«افتح الأذكار» أو أي قسم', '“Open adhkar” or any section'), L('«اقرا الصفحة» و«شغّل الوضع الصوتي»', '“Read the page” and “turn on voice mode”'), L('أو اكتب أي كلمة وأنا أدوّر في التمارين والأكل والأمراض والأدوية والأذكار', 'Or type anything and I’ll search exercises, foods, conditions, medicines and adhkar')].map(x => `<li>${esc(x)}</li>`).join('')}</ul>`} : null);

intent('chat', n => {
  if (has(n, /^(السلام عليكم|سلام عليكم)/)) return {say: L('وعليكم السلام ورحمة الله وبركاته 🌿 أؤمرني؟', 'Wa alaykum assalam 🌿 How can I help?')};
  if (has(n, /^(ازيك|ازيك عامل ايه|عامل ايه|اخبارك|ازي الحال|how are you)/)) return {say: L('الحمد لله تمام، وإنت؟ 😊 قولي أساعدك في إيه النهارده.', 'All good, thanks! 😊 How can I help today?')};
  if (has(n, /^(اهلا|هاي|هلو|مرحبا|صباح الخير|مساء الخير|hi|hello|hey|good morning|good evening)(\s|$)/)) return {say: L('أهلًا بيك 👋 قولي محتاج إيه، أو قول «ملخص يومي».', 'Hi 👋 What do you need? Or say “daily summary”.')};
  if (has(n, /^(شكرا|متشكر|تسلم|جزاك الله|thanks|thank you)/)) return {say: L('العفو، تحت أمرك دايمًا 🤍', 'You’re welcome 🤍')};
  return null;
});
intent('voice', n => {
  if (has(n, /(اقرا|اقرالي|اقري|read)\s*(لي)?\s*(الصفحه|الشاشه|اللي قدامي|page|screen|this)/) || n === 'اقرا') return {say: '', run(){ closeSheet(); speak(pageSpeech(), {now: true}); }, silent: true, now: L('بقرالك الصفحة…', 'Reading the page…')};
  if (has(n, /(الوضع الصوتي|وضع الصوت|وضع المكفوفين|voice mode)/)) { const off = has(n, /(اقفل|وقف|الغي|بطل|off|disable|stop)/); voiceSet().on = !off; store.save(); render(); return {say: off ? L('قفلت الوضع الصوتي', 'Voice mode is off') : L('شغّلت الوضع الصوتي. هقرالك كل صفحة تفتحها، ودوس على زرار المساعد وقول أمرك.', 'Voice mode is on. I’ll read each page you open; tap the assistant button and say a command.')}; }
  return null;
});
intent('time', n => has(n, /^(الساعه كام|الساعه كام دلوقتي|what time|time now|التاريخ|النهارده كام|النهارده ايه|هجري|التاريخ الهجري|date|today's date)/) ? {say: L(`الساعة ${m2t(nowMin())}. النهارده ${dLong(todayISO())}، ${dHijri(todayISO())}`, `It’s ${m2t(nowMin())}. Today is ${dLong(todayISO())}, ${dHijri(todayISO())}`)} : null);
intent('summary', n => has(n, /(ملخص|يومي|فاضلي|فاضل ايه|ايه اللي فاضل|اخبار النهارده|summary|what.?s left|my day|brief)/) && !has(n, /(صلاه|مغرب|عصر|ظهر|ضهر|فجر|عشا)/) ? {say: todayBrief()} : null);

const PKEY = [['fajr', /فجر|fajr/], ['sunrise', /شروق|sunrise/], ['dhuhr', /ظهر|ضهر|جمعه|dhuhr|zuhr/], ['asr', /عصر|asr/], ['maghrib', /مغرب|فطار رمضان|maghrib/], ['isha', /عشا|isha/]];
intent('prayer', n => {
  if (!has(n, /(صلاه|اذان|فجر|ظهر|ضهر|عصر|مغرب|عشا|شروق|prayer|adhan|fajr|dhuhr|asr|maghrib|isha)/) || !has(n, /(كام|امتي|ميعاد|مواقيت|فاضل|باقي|الجايه|بعد اد ايه|وقت|when|time|next|left|until|how long)/)) return null;
  const k = PKEY.find(([, re]) => re.test(n))?.[0];
  if (has(n, /مواقيت|times/) && !k) return {say: VIEW_SPEECH.prayer()};
  if (!k) { const np = nextPrayer(); return {say: L(`الصلاة الجاية ${pName(np.k)} الساعة ${m2t(np.at)}، فاضل ${durTxt(np.left)}`, `Next prayer is ${pName(np.k)} at ${m2t(np.at)}, in ${durTxt(np.left)}`)}; }
  const pt = prayerTimes(todayISO()), at = pt[k], left = at - nowMin();
  if (left > 0) return {say: L(`${pName(k)} الساعة ${m2t(at)}، فاضل ${durTxt(left)}`, `${pName(k)} is at ${m2t(at)}, in ${durTxt(left)}`)};
  const tm = prayerTimes(addDays(todayISO(), 1))[k]; return {say: L(`${pName(k)} النهارده كان الساعة ${m2t(at)} (من ${durTxt(-left)}). بكرة الساعة ${m2t(tm)}`, `${pName(k)} today was at ${m2t(at)} (${durTxt(-left)} ago). Tomorrow at ${m2t(tm)}`)};
});

intent('weight', n => {
  if (!has(n, /(وزني|الوزن|وزنت|اتوزنت|weight|weigh)/)) return null;
  const v = nums(n).find(x => x >= 2 && x <= 350), t = todayISO(), d = day(t), old = d.weight;
  if (v == null) { const c = calc(); return {say: c ? L(`وزنك الحالي حوالي ${fmt(c.curW)} كجم، ومؤشر الكتلة ${fmt(c.bmi)}. ${c.toGo ? `فاضل ${fmt(Math.abs(c.toGo))} كجم على هدفك.` : ''}`, `Your current weight is about ${fmt(c.curW)} kg, BMI ${fmt(c.bmi)}.`) : L('سجّل بياناتك الأول من المعالج', 'Fill in your profile first')}; }
  return {say: L(`أسجّل وزنك النهارده ${fmt(v)} كجم؟`, `Log today’s weight as ${fmt(v)} kg?`), act: actSet(L('سجّل', 'Log it'), () => { d.weight = v; }, () => { if (old === undefined) delete d.weight; else d.weight = old; }, L(`اتسجل وزنك ${fmt(v)} كجم ✅`, `Weight ${fmt(v)} kg logged ✅`))};
});
intent('water', n => {
  if (!has(n, /(ميه|ميا|مايه|مياه|water)/)) return null;
  const c = calc(), wt = c ? Math.ceil(c.water / 0.25) : 12, t = todayISO(), d = day(t), cur = d.water || 0;
  if (!has(n, /(شربت|اشربت|زود|ضيف|سجل|drank|drink|had|add|log)/) || has(n, /(كام|فاضل|how much|left)/) && !has(n, /شربت|drank/)) return {say: L(`شربت ${cur} من ${wt} كوبايات (${fmt(cur * 0.25)} من ${fmt(c?.water || 3)} لتر)`, `${cur} of ${wt} glasses (${fmt(cur * 0.25)} of ${fmt(c?.water || 3)} L)`)};
  let k = nums(n)[0] || 1; if (has(n, /(لتر|litre|liter)/)) k = Math.round(k * 4); if (has(n, /(ازازه|زجاجه|bottle)/)) k *= 2; k = Math.min(k, 20);
  return {say: L(`أزوّد ${arN(k, ['كوباية', 'كوبايتين', 'كوبايات'])} مية؟ (هيبقوا ${cur + k} من ${wt})`, `Add ${k} glass${k > 1 ? 'es' : ''} of water? (${cur + k} of ${wt})`), act: actSet(L('زوّد', 'Add'), () => { d.water = cur + k; }, () => { d.water = cur; }, L(`تمام، بقوا ${cur + k} من ${wt} 💧`, `Now ${cur + k} of ${wt} 💧`))};
});

const MEAL_W = [[/فطار|فطور|breakfast/, ['فطار', 'breakfast', 'فطور']], [/غدا|lunch/, ['غدا', 'lunch']], [/عشا|dinner|supper/, ['عشا', 'dinner']], [/سناك|snack|تصبيره/, ['سناك', 'snack', 'تصبيرة']], [/سحور|suhoor/, ['سحور', 'suhoor']]];
function findMeal(n, list){
  const ord = n.match(/(?:وجبه|meal)\s*(?:رقم\s*)?(\d)/); if (ord) return list[+ord[1] - 1];
  for (const [re, keys] of MEAL_W) if (re.test(n)) { const m = list.find(x => keys.some(k => norm(x.title).includes(norm(k)))); if (m) return m; }
  const nn = n.split(' '); return list.find(x => nn.some(w => w.length > 2 && norm(x.title).includes(w)));
}
intent('meal', n => {
  const list = mealsFor(todayISO());
  if (has(n, /^(خلصت|اكلت|كلت|خلص|ate|finished|done|had)(?=\s|$)/) && has(n, /(فطار|فطور|غدا|عشا|سناك|سحور|وجبه|تصبيره|breakfast|lunch|dinner|snack|meal)/)) {
    if (!list.length) return {say: L('مفيش نظام أكل متعمل لسه', 'No meal plan yet')};
    const m = findMeal(n, list); if (!m) return {say: L('مش لاقي الوجبة دي في نظام النهارده. وجباتك: ', 'Couldn’t find that meal. Today: ') + list.map(x => x.title).join('، ')};
    const d = day(todayISO()), old = d.meals?.[m.key];
    return {say: L(`أعلّم «${m.title}» (${LX(m.n)}) إنها خلصت؟`, `Mark “${m.title}” (${LX(m.n)}) as eaten?`), act: actSet(L('علّم', 'Mark'), () => { d.meals ||= {}; d.meals[m.key] = {s: 'done', alt: 0}; d.sched ||= {}; d.sched['meal-' + m.key] = true; }, () => { if (old) d.meals[m.key] = old; else delete d.meals[m.key]; if (d.sched) delete d.sched['meal-' + m.key]; }, L('بالهنا والشفا ✅', 'Enjoy ✅'))};
  }
  if (has(n, /(هاكل ايه|اكل ايه|اكلي|الاكل|وجبات|وجباتي|الوجبات|طبخه|طبخة|هطبخ|meals|food|eat)/) && has(n, /(النهارده|ايه|today|what|اكل|طبخه)/) && !has(n, /(سعر|كالوري|calor)/)) {
    if (!list.length) return {say: L('مفيش نظام أكل متعمل لسه. افتح المعالج من «خطتي».', 'No meal plan yet.'), go: 'plan'};
    const c = calc(), dk = typeof kitchenDayDish === 'function' && S.profile?.kitchen ? null : null;
    return {say: L('أكل النهارده: ', 'Today’s meals: ') + list.map(m => `${m.title} ${m2t(t2m(m.t))}: ${LX(m.n)} (${m.k} ${L('سعر', 'kcal')})`).join('. ') + (c ? L(`. الإجمالي حوالي ${list.reduce((s, m) => s + m.k, 0)} سعر و${list.reduce((s, m) => s + m.p, 0)} جم بروتين.`, `. Total about ${list.reduce((s, m) => s + m.k, 0)} kcal.`) : ''), go: 'meals', goLabel: L('افتح الأكل', 'Open meals')};
  }
  return null;
});
intent('targets', n => {
  if (!has(n, /(سعراتي|سعرات|كالوري|calori|بروتين|protein|احتياجي|محتاج اكل اد ايه)/) || has(n, /\s(في|فيه|of|in)\s/)) return null;
  const c = calc(); if (!c) return {say: L('كمّل بياناتك الأول', 'Complete your profile first')};
  return {say: L(`هدفك اليومي: ${fmt(c.kTrain, 0)} سعر يوم التمرين و${fmt(c.kRest, 0)} يوم الراحة، و${fmt(c.protein, 0)} جم بروتين، و${fmt(c.water)} لتر مية.`, `Daily target: ${fmt(c.kTrain, 0)} kcal on training days, ${fmt(c.kRest, 0)} on rest days, ${fmt(c.protein, 0)} g protein, ${fmt(c.water)} L water.`)};
});
intent('foodinfo', n => {
  const m = n.match(/(?:كام سعر|سعرات|كالوري|calories|بروتين|protein)\s+(?:في|فيه|of|in)?\s*(.+)/); if (!m) return null;
  const q = m[1].replace(/^(ال)?(\d+\s*(جرام|جم|g|حبه|رغيف)?\s*)/, '').trim(); const hit = fuzzyFind(q, Object.values(FOOD), f => [f.ar, f.en], 1, 0.6)[0]; if (!hit) return null;
  const per = hit.u === 'pc' ? L(`للحبة (${hit.gpu} جم)`, `per piece (${hit.gpu} g)`) : L('لكل 100 جم', 'per 100 g'), k = x => fmt(hit.u === 'pc' ? x * hit.gpu / 100 : x, 1);
  return {say: L(`${hit.ar} ${per}: ${k(hit.k)} سعر، ${k(hit.p)} جم بروتين، ${k(hit.c)} جم كارب، ${k(hit.f)} جم دهون.`, `${hit.en} ${per}: ${k(hit.k)} kcal, ${k(hit.p)} g protein, ${k(hit.c)} g carbs, ${k(hit.f)} g fat.`)};
});

intent('workout', n => {
  if (has(n, /(ابدا|ابتدي|يلا|شغل|start|begin)\s*(ال)?(تمرين|مدرب|coach|workout|training)/) || has(n, /(المدرب الصوتي|voice coach)/)) return {say: L('يلا بينا 💪 هبدأ المدرب الصوتي.', 'Let’s go 💪 starting the voice coach.'), run(){ closeSheet(); coachStart(); }};
  const sw = n.match(/^(?:بدل|غير|استبدل|swap|replace|change)\s+(?:ال)?(?:تمرين|exercise)?\s*(.+)/);
  if (sw && S.plan?.train) { const iso = todayISO(), p = planFor(iso); const i = p.ex.findIndex(e => fuzzyScore(sw[1], [EX[e.id].ar, EX[e.id].en]) >= 0.6); if (i < 0) return {say: L('مش لاقي التمرين ده في تمرين النهارده. تمارين النهارده: ', 'Not in today’s workout. Today: ') + p.ex.map(e => LANG === 'en' ? EX[e.id].en : EX[e.id].ar).join('، ')};
    return {say: L(`هفتحلك بدائل «${EX[p.ex[i].id].ar}»`, `Opening alternatives for “${EX[p.ex[i].id].en}”`), run(){ WODAY = null; go('workout'); setTimeout(() => $(`[data-swapex="${p.dow}|${i}"]`)?.click(), 80); }}; }
  if (has(n, /(تمرين|تمارين|الجيم|workout|training|gym)/) && has(n, /(النهارده|ايه|today|what)/)) return {say: VIEW_SPEECH.workout() || L('لسه معملتش خطة تمرين', 'No workout plan yet'), go: 'workout', goLabel: L('افتح التمرين', 'Open workout')};
  return null;
});

intent('meds', n => {
  if (has(n, /^(خدت|اخدت|اخذت|شربت|took|taken|had)(?=\s|$)/) && has(n, /(دوا|علاج|حبايه|قرص|برشام|جرعه|حقنه|انسولين|pill|med|dose|tablet|insulin)/) || (has(n, /^(خدت|اخدت|took)(?=\s|$)/) && LIFE().meds.some(m => n.includes(norm(m.name))))) {
    const t = todayISO(), ds = medDosesOn(t).filter(x => !x.taken); if (!ds.length) return {say: L('مفيش جرعات فاضلة النهارده ✅', 'No doses left today ✅')};
    const q = n.replace(/^(خدت|اخدت|اخذت|شربت|took|taken|had)\s*/, '').replace(/(دوا|الدوا|علاج|العلاج|حبايه|الحبايه|قرص|جرعه|my|the|pill|med|dose)\s*/g, '').trim();
    let cand = q ? ds.filter(x => fuzzyScore(q, [x.name]) >= 0.55) : ds; if (!cand.length) cand = ds;
    const now = nowMin(), x = cand.sort((a, b) => Math.abs(t2m(a.time) - now) - Math.abs(t2m(b.time) - now))[0], l = LIFE(), key = x.id + '@' + x.time, m = l.meds.find(z => z.id === x.id), oldStock = m?.stock;
    return {say: L(`أعلّم جرعة «${x.name}» بتاعة ${m2t(t2m(x.time))} إنك خدتها؟`, `Mark the ${m2t(t2m(x.time))} dose of “${x.name}” as taken?`), act: actSet(L('علّم', 'Mark'), () => { (l.medLog[t] ||= {})[key] = Date.now(); if (m && m.stock != null && m.stock !== '') m.stock = Math.max(0, +m.stock - (m.per || 1)); }, () => { delete l.medLog[t][key]; if (m) m.stock = oldStock; }, L('اتسجلت ✅ ربنا يتمم بالشفا', 'Logged ✅'))};
  }
  if (has(n, /(ادويتي|الادويه|الدوا|دوايا|علاجي|my meds|medicines|medications)/) && has(n, /(النهارده|ايه|today|what|فاضل|left)/)) return {say: VIEW_SPEECH.meds(), go: 'meds', goLabel: L('افتح الأدوية', 'Open medicines')};
  return null;
});

const XCAT = [['dining', /مطعم|كافيه|قهوه|كافي|اكل بره|delivery|دليفري|طلبات|restaurant|cafe|coffee/], ['groceries', /بقاله|سوبر ?ماركت|خضار|فاكهه|لحمه|فراخ|عيش|اكل|grocer|food/], ['transport', /بنزين|مواصلات|اوبر|كريم|تاكسي|عربيه|ميكروباص|مترو|fuel|uber|taxi|transport|petrol|gas/], ['bills', /فاتوره|كهربا|كهرباء|ميه|غاز|نت|انترنت|bill|electric|internet/], ['rent', /ايجار|rent/], ['health', /دوا|صيدليه|دكتور|تحليل|اشعه|pharmacy|doctor|medicine/], ['clothes', /هدوم|لبس|جزمه|clothes|shoes/], ['kids', /عيال|اطفال|بيبي|حفاضات|kids|baby/], ['sport', /جيم|نادي|gym|sport/], ['edu', /كورس|كتاب|مدرسه|جامعه|course|school/], ['home', /منظفات|البيت|home|household/]];
intent('money', (n, raw) => {
  const ex = has(n, /^(صرفت|دفعت|اشتريت|spent|paid|bought)(?=\s|$)/), inc = has(n, /^(قبضت|استلمت|جالي|خدت مرتب|received|got paid|earned)(?=\s|$)/);
  if (!ex && !inc) return null; const a = nums(n)[0]; if (!a) return null;
  const cat = inc ? (has(n, /مرتب|راتب|salary/) ? 'salary' : 'extra') : (XCAT.find(([, re]) => re.test(n))?.[0] || 'other');
  const note = AR_DIG(raw).replace(/^\S+\s*/, '').replace(/[\d.]+/g, ' ').replace(/(^|\s)(ريال|جنيه|جنية|درهم|دينار|دولار|sar|egp|riyal|pound|على|علي|عَلى|في|فى|عشان|for|on)(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
  const l = LIFE(), id = uid(), cl = (inc ? ICATS : MCATS)[cat] || MCATS.other;
  return {say: L(`أسجّل ${inc ? 'دخل' : 'مصروف'} ${money(a)} في «${cl[1]}»${note ? ' (' + note + ')' : ''}؟`, `Log ${inc ? 'income' : 'expense'} of ${money(a)} under “${cl[2]}”?`), act: actSet(L('سجّل', 'Log it'), () => { l.tx.push({id, type: inc ? 'inc' : 'exp', amount: a, cat, date: todayISO(), note}); }, () => { l.tx = l.tx.filter(x => x.id !== id); }, L('اتسجل ✅', 'Logged ✅'))};
});

const SHOP_TRIG = /^(ضيف|زود|زوّد|حط|اكتب|سجل|هات|نزل|add|put|buy)\s+/, SHOP_TGT = /\s*(لل|في ال|علي ال|على ال|في|على|علي|to the|to|on the|on)?\s*(مشتريات|المشتريات|لسته|اللسته|لسته الشرا|لسته المشتريات|الطلبات|shopping list|shopping|list)\s*$/;
const QUNIT = /^(كيلو|كيلوات|كجم|كيس|اكياس|علبه|علب|كرتونه|كراتين|ازازه|ازايز|زجاجه|رغيف|ارغفه|حزمه|ربطه|طبق|باكو|بواكي|لتر|kg|pack|packs|box|bottle|bottles|can|cans)$/;
intent('shop', (n, raw) => {
  const trig = SHOP_TRIG.test(n) && SHOP_TGT.test(n), need = has(n, /^(محتاج|محتاجين|عايز اشتري|لازم اشتري|need to buy|i need)\s+/) && SHOP_TGT.test(n);
  const listOnly = has(n, /^(ضيف|add)\s+(للمشتريات|to shopping)/);
  if (!trig && !need) { if (has(n, /(المشتريات|لسته المشتريات|shopping list)/) && has(n, /(فيها ايه|اقرا|ايه|what|read)/)) return {say: VIEW_SPEECH.shop(), go: 'shop', goLabel: L('افتح المشتريات', 'Open shopping')}; return null; }
  if (listOnly) return null;
  const body = n.replace(SHOP_TRIG, '').replace(/^(محتاج|محتاجين|عايز اشتري|لازم اشتري|need to buy|i need)\s+/, '').replace(SHOP_TGT, '');
  const items = splitItems(body).map(s => { const t = s.split(' '); let qty = 1; if (/^\d/.test(t[0])) { qty = Math.max(1, Math.round(+t.shift())); } if (QUNIT.test(t[0] || '')) t.shift(); if (t[0] === 'من' || t[0] === 'of') t.shift(); return {name: t.join(' '), qty}; }).filter(x => x.name.length > 1);
  if (!items.length) return null;
  return {say: L('أضيف دول للمشتريات؟ ', 'Add these to shopping? ') + items.map(x => (x.qty > 1 ? x.qty + ' ' : '') + x.name).join('، '), act: actShop(items)};
});

function splitItems(body){
  /* «لبن وعيش و 2 كيلو طماطم» → [لبن، عيش، 2 كيلو طماطم]. الواو الملزوقة بنفصلها بس لو اللي بعدها صنف معروف (عشان «ورق عنب» متتقسمش) */
  const known = w => shopSearch(w).slice(0, 8).some(c => shopNames(c).some(x => x && norm(x) === w));
  const out = [[]]; body.split(/\s*[،,]\s*|\s+and\s+/).forEach((chunk, ci) => { if (ci) out.push([]); chunk.split(' ').filter(Boolean).forEach(w => { const cur = out.at(-1);
    if (w === 'و') { if (cur.length) out.push([]); return; }
    if (w.length > 3 && w[0] === 'و' && cur.length && !known(w)) { out.push([w.slice(1)]); return; }
    cur.push(w); }); });
  return out.map(t => t.join(' ').trim()).filter(Boolean);
}
intent('task', (n, raw) => {
  const rem = has(n, /^(فكرني|ذكرني|نبهني|فكريني|ذكريني|نبهيني|remind me)(?=\s|$)/), add = has(n, /^(ضيف|اعمل|حط|سجل|add|create|new)\s+(مهمه|تاسك|موعد|ميعاد|task|reminder|appointment)(?=\s|$)/);
  if (!rem && !add) return null;
  const toks = n.split(' '), w = parseWhen(toks), drop = new Set(w.used); let i = 0;
  while (i < toks.length && /^(فكرني|ذكرني|نبهني|فكريني|ذكريني|نبهيني|remind|me|to|ضيف|اعمل|حط|سجل|add|create|new|مهمه|تاسك|موعد|ميعاد|task|reminder|appointment|اني|ان|إن|بان|عشان|that)$/.test(toks[i])) { drop.add(i); i++; }
  /* العنوان من كلام المستخدم الأصلي (بالتاء المربوطة والهمزات) مش من النص المتطبّع */
  const dropW = new Set(toks.filter((_, k) => drop.has(k))), rawT = AR_DIG(raw).replace(/[؟?!،,؛"«»]/g, ' ').split(/\s+/).filter(Boolean);
  let title = rawT.filter(t => { const w = norm(t).split(' '); return !w.every(x => dropW.has(x)); }).join(' ').trim();
  title = title.replace(/^(ب|بـ)(?=\S{3,})/, '').replace(/^(إني|اني|إن|ان|أن|عشان|to|that)\s+/i, '').trim();
  if (!title) return {say: L('تحب أفكرك بإيه؟ قول مثلًا: فكرني بكرة الساعة 5 أكلم الدكتور', 'Remind you of what? e.g. remind me tomorrow at 5 pm to call the doctor')};
  const date = w.date || todayISO(), time = w.time || '', l = LIFE(), id = uid();
  return {say: L(`أعمل تذكير «${title}» ${date === todayISO() ? 'النهارده' : date === addDays(todayISO(), 1) ? 'بكرة' : dLong(date)}${time ? ' الساعة ' + m2t(t2m(time)) : ' (التنبيه 9 الصبح)'}؟`, `Create “${title}” ${dLong(date)}${time ? ' at ' + m2t(t2m(time)) : ''}?`),
    act: actSet(L('اعمله', 'Create'), () => { l.tasks.push({id, created: Date.now(), done: {}, title, date, time, cat: 'personal', prio: 'm', repeat: 'none', remind: 0, project: '', until: '', notes: ''}); rescheduleAll(); }, () => { l.tasks = l.tasks.filter(x => x.id !== id); rescheduleAll(); }, L('اتعمل التذكير ⏰', 'Reminder set ⏰'))};
});

intent('theme', n => {
  if (!has(n, /(ثيم|الشكل|الوان|لون|theme|mode|الوضع)/)) return null;
  const k = has(n, /(ليلي|غامق|اسود|dark|night)/) ? 'dark' : has(n, /(نهاري|فاتح|ابيض|light)/) ? 'light' : has(n, /(يحيا|ازرق|yahya|blue)/) ? 'yahya' : has(n, /(بتول|بينك|وردي|batool|pink)/) ? 'batool' : has(n, /(تلقائي|auto)/) ? 'auto' : null; if (!k) return null;
  S.settings.theme = k; S.settings.themeSet = k !== 'auto'; store.save(); applyTheme(); return {say: L('غيّرت الشكل ✅', 'Theme changed ✅')};
});

intent('nav', n => {
  const m = n.match(/^(?:افتح|افتحلي|روح|روح على|روح ل|وديني|ودني|وديني على|خش|خش على|ادخل|ادخل على|اعرض|وريني|هات|open|go to|go|show|show me)\s+(?:لي\s+)?(?:على\s+)?(.+)$/); const q = m ? m[1] : n;
  const v = findView(q); if (!v) return null; if (!m && n.split(' ').length > 3) return null;
  if (!visibleView(v)) return {say: L('القسم ده مش ظاهر للملف المفتوح دلوقتي', 'That section isn’t available for this profile')};
  return {say: L(`فتحت ${LX(VIEWS[v].title)}`, `Opened ${LX(VIEWS[v].title)}`), run(){ go(v); }};
});

const I_ORDER = ['stop', 'chat', 'help', 'voice', 'time', 'task', 'shop', 'money', 'weight', 'water', 'meds', 'theme', 'meal', 'targets', 'foodinfo', 'workout', 'prayer', 'summary', 'nav'];
INTENTS.sort((a, b) => I_ORDER.indexOf(a.k) - I_ORDER.indexOf(b.k));

/* ---------- البحث في كل التطبيق ---------- */
function aiSearch(q){
  const out = [], add = (ic, title, sub, fn, extra) => { const id = 'b' + (++AI.n); AI.btn[id] = fn; out.push(`<button type="button" class="aires" data-aib="${id}"><span class="ic" aria-hidden="true">${ic}</span><span><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${extra || ''}</button>`); };
  const v = findView(q); if (v && visibleView(v)) add('🧭', LX(VIEWS[v].title), L('افتح القسم', 'Open section'), () => go(v));
  fuzzyFind(q, Object.keys(EX), id => [EX[id].ar, EX[id].en, EX[id].mus[0], EX[id].mus[1]], 3, 0.62).forEach(id => add('🏋️', LX(EX[id]), LX({ar: EX[id].mus[0], en: EX[id].mus[1]}) + ' · ' + LX({ar: EX[id].tip[0], en: EX[id].tip[1]}).slice(0, 90), () => { KB.tab = 'ex'; KB.q = ''; KB.sl = 'all'; KB.eq = 'all'; KB.open = id; go('kb'); setTimeout(() => document.querySelector(`[data-kbopen="${id}"]`)?.scrollIntoView({block: 'center'}), 80); }));
  fuzzyFind(q, Object.values(FOOD), f => [f.ar, f.en], 3, 0.65).forEach(f => { const k = x => fmt(f.u === 'pc' ? x * f.gpu / 100 : x, 0); add('🍽️', LX(f), (f.u === 'pc' ? L('الحبة: ', 'Per piece: ') : L('لكل 100 جم: ', 'Per 100 g: ')) + `${k(f.k)} ${L('سعر', 'kcal')} · ${k(f.p)} ${L('جم بروتين', 'g protein')} · ${k(f.c)} ${L('كارب', 'carbs')} · ${k(f.f)} ${L('دهون', 'fat')}`, () => {}); });
  fuzzyFind(q, CONDS, c => [c.ar, c.en], 2, 0.62).forEach(c => add('🩺', LX(c), (c.rules?.[0] ? LX({ar: c.rules[0][0], en: c.rules[0][1]}) : '').slice(0, 110), () => { KB.tab = 'cond'; KB.q = c.ar; go('kb'); }));
  if (typeof MEDS !== 'undefined') fuzzyFind(q, MEDS, m => [m.ar, m.en], 2, 0.62).forEach(m => add('💊', LX(m), (m.rules?.[0] ? LX({ar: m.rules[0][0], en: m.rules[0][1]}) : '').slice(0, 110), () => { KB.tab = 'med'; KB.q = m.ar; go('kb'); }));
  fuzzyFind(q, Object.entries(ADHKAR), ([k, a]) => [a.t.ar, a.t.en], 2, 0.6).forEach(([k, a]) => add('📿', LX(a.t), LX(a.when), () => go('adhkar')));
  shopSearch(q).filter(it => fuzzyScore(q, shopNames(it)) >= 0.86).slice(0, 2).forEach(it => add('🛒', LANG === 'en' ? it.en : it.ar, L('دوس عشان تضيفه للمشتريات', 'Tap to add to shopping'), () => { addToShop(it); aiPush('bot', L(`ضفت ${it.ar} للمشتريات ✅`, `Added ${it.en} ✅`)); }));
  return out;
}

/* ---------- Gemini (اختياري ومجاني) ---------- */
function aiContext(){
  const p = S.profile || {}, st = typeof stageNow === 'function' ? stageNow() : {}, c = calc(), t = todayISO(), bits = [];
  bits.push(`اليوم ${dLong(t)} الساعة ${m2t(nowMin())}. نسخة التطبيق: ${edName(S.settings.edition)}. القسم المفتوح: ${LX(VIEWS[VIEW]?.title)}.`);
  if (st.label) bits.push(`المرحلة العمرية: ${st.label}${p.age ? '، السن ' + p.age : ''}${p.sex ? '، ' + (p.sex === 'f' ? 'أنثى' : 'ذكر') : ''}.`);
  if (c) bits.push(`الهدف اليومي ${Math.round(c.kTrain)} سعر و${Math.round(c.protein)} جم بروتين.`);
  try { if (S.plan?.train) { const pl = planFor(t); bits.push(`تمرين النهارده: ${pl.title}${pl.ex.length ? ' (' + pl.ex.map(e => EX[e.id].ar).join('، ') + ')' : ''}.`); } } catch (e) {}
  const ms = mealsFor(t); if (ms.length) bits.push('أكل النهارده: ' + ms.map(m => `${m.title}: ${LX(m.n)} ${m.k} سعر`).join('؛ ') + '.');
  if (aiCfg().share) { const cn = (p.conds || []).map(k => CONDS.find(c => c.k === k)?.ar).filter(Boolean); if (cn.length) bits.push('حالات صحية: ' + cn.join('، ') + '.'); if (LIFE().meds.length) bits.push('أدوية: ' + LIFE().meds.map(m => m.name).join('، ') + '.'); if (p.allergies?.length) bits.push('حساسية: ' + p.allergies.join('، ') + '.'); }
  return bits.join('\n');
}
const AI_SYS = () => `أنت "مساعد زاد"، مساعد جوه تطبيق زاد (صحة وتمرين وأكل وعبادة وتنظيم حياة). ${LANG === 'en' ? 'Reply in English.' : 'رد بالعامية المصرية البسيطة.'}
ردودك قصيرة وعملية (أقل من 120 كلمة غالبًا). إنت مش دكتور: في أي حاجة طبية خطيرة انصح بالدكتور. متخترعش أرقام أو فتاوى؛ في الأسئلة الشرعية قول الرأي المشهور بإيجاز وانصح بسؤال أهل العلم.
لو المستخدم عايز ينفّذ حاجة في التطبيق، اكتب في آخر ردك سطر واحد بالشكل ده بالظبط (من غير شرح):
<<ZAD {"do":"shop","items":["لبن","عيش"]}>>  أو  {"do":"task","title":"...","date":"YYYY-MM-DD","time":"HH:MM"}  أو  {"do":"weight","kg":90}  أو  {"do":"water","glasses":2}  أو  {"do":"expense","amount":50,"cat":"transport","note":"..."}  أو  {"do":"nav","view":"workout"}
الأقسام المتاحة: ${Object.keys(VIEWS).filter(visibleView).join(', ')}. فئات المصاريف: ${Object.keys(MCATS).join(', ')}.
معلومات عن المستخدم والنهارده:
${aiContext()}`;
async function gemini(q){
  const cfg = aiCfg(), contents = AI.msgs.filter(m => m.g).slice(-8).map(m => ({role: m.who === 'me' ? 'user' : 'model', parts: [{text: m.t}]}));
  contents.push({role: 'user', parts: [{text: q}]});
  const models = [cfg.model || 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'].filter((x, i, a) => a.indexOf(x) === i);
  let last = '';
  for (const model of models) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 30000);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {method: 'POST', signal: ctl.signal, headers: {'Content-Type': 'application/json', 'x-goog-api-key': cfg.key.trim()}, body: JSON.stringify({systemInstruction: {parts: [{text: AI_SYS()}]}, contents, generationConfig: {temperature: 0.6, maxOutputTokens: 900}})});
      const j = await r.json().catch(() => ({}));
      if (r.ok) { const t = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim(); if (t) return {ok: true, t}; last = L('الرد جه فاضي', 'Empty reply'); continue; }
      if (r.status === 404) { last = 'model'; continue; }
      if (r.status === 429) return {ok: false, t: L('خلصت الحصة المجانية لـ Gemini دلوقتي. استنى شوية وجرب تاني، وأنا شغال من غير نت عادي.', 'Gemini’s free quota is used up for now. Try again later; I still work offline.')};
      if (r.status === 400 || r.status === 403) return {ok: false, t: L('مفتاح Gemini مش شغال. راجعه من الإعدادات.', 'The Gemini key isn’t working. Check it in Settings.') + (j.error?.message ? ' (' + j.error.message.slice(0, 80) + ')' : '')};
      last = j.error?.message || String(r.status);
    } catch (e) { last = e.name === 'AbortError' ? L('النت بطيء', 'Timed out') : L('مفيش نت', 'No connection'); break; }
    finally { clearTimeout(to); }
  }
  return {ok: false, t: L('معرفتش أوصل لـ Gemini', 'Couldn’t reach Gemini') + (last && last !== 'model' ? ' (' + last + ')' : '')};
}
function geminiAction(o){
  const l = LIFE(), id = uid();
  if (o.do === 'shop' && Array.isArray(o.items) && o.items.length) return actShop(o.items.map(x => ({name: String(x), qty: 1})));
  if (o.do === 'task' && o.title) return actSet(L('اعمل التذكير', 'Create reminder'), () => { l.tasks.push({id, created: Date.now(), done: {}, title: String(o.title), date: /^\d{4}-\d\d-\d\d$/.test(o.date) ? o.date : todayISO(), time: /^\d\d:\d\d$/.test(o.time) ? o.time : '', cat: 'personal', prio: 'm', repeat: 'none', remind: 0, project: '', until: '', notes: ''}); rescheduleAll(); }, () => { l.tasks = l.tasks.filter(x => x.id !== id); }, L('اتعمل ⏰', 'Done ⏰'));
  if (o.do === 'weight' && +o.kg > 2 && +o.kg < 350) { const d = day(todayISO()), old = d.weight; return actSet(L('سجّل الوزن', 'Log weight'), () => { d.weight = +o.kg; }, () => { d.weight = old; }, L('اتسجل ✅', 'Logged ✅')); }
  if (o.do === 'water' && +o.glasses > 0) { const d = day(todayISO()), cur = d.water || 0; return actSet(L('زوّد المية', 'Add water'), () => { d.water = cur + Math.min(20, Math.round(+o.glasses)); }, () => { d.water = cur; }, L('تمام 💧', 'Done 💧')); }
  if (o.do === 'expense' && +o.amount > 0) return actSet(L('سجّل المصروف', 'Log expense'), () => { l.tx.push({id, type: 'exp', amount: +o.amount, cat: MCATS[o.cat] ? o.cat : 'other', date: todayISO(), note: String(o.note || '')}); }, () => { l.tx = l.tx.filter(x => x.id !== id); }, L('اتسجل ✅', 'Logged ✅'));
  if (o.do === 'nav' && VIEWS[o.view] && visibleView(o.view)) return {label: L('افتح', 'Open') + ' ' + LX(VIEWS[o.view].title), run(){ go(o.view); return ''; }};
  return null;
}

/* ---------- الواجهة ---------- */
const mdLite = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^\s*[-*•]\s+(.+)$/gm, '• $1').replace(/\n/g, '<br>');
function aiPush(who, t, extra){ AI.msgs.push({who, t, g: !!extra?.g, html: extra?.html || '', act: extra?.act || null, undo: extra?.undo || null}); aiSave(); aiRender(); }
function aiSuggest(){
  const S1 = {today: [L('ملخص يومي', 'Daily summary'), L('الصلاة الجاية', 'Next prayer'), L('شربت كوباية مية', 'I drank a glass of water')], workout: [L('ابدأ التمرين', 'Start workout'), L('تمرين النهارده', 'Today’s workout'), L('اقرا الصفحة', 'Read the page')], meals: [L('هاكل إيه النهارده', 'What do I eat today'), L('خلصت الفطار', 'I finished breakfast'), L('سعراتي كام', 'My calories')], kitchen: [L('هاكل إيه النهارده', 'What do I eat today'), L('كام سعر في الأرز', 'Calories in rice')], shop: [L('ضيف لبن وعيش وبيض للمشتريات', 'Add milk, bread and eggs to shopping'), L('المشتريات فيها إيه', 'What’s on my list')], money: [L('صرفت 50 على مواصلات', 'I spent 50 on transport')], planner: [L('فكرني بكرة الساعة 9 الصبح أدفع الفاتورة', 'Remind me tomorrow at 9 am to pay the bill')], prayer: [L('كام فاضل على المغرب', 'How long until Maghrib'), L('مواقيت الصلاة', 'Prayer times')], meds: [L('خدت الدوا', 'I took my medicine'), L('أدويتي النهارده', 'My medicines today')], log: [L('وزني 90', 'My weight is 90'), L('شربت كوبايتين مية', 'I drank 2 glasses')]};
  return [...(S1[VIEW] || [L('ملخص يومي', 'Daily summary'), L('اقرا الصفحة', 'Read the page')]), L('بتعمل إيه؟', 'What can you do?')];
}
function aiRender(){
  const log = $('#aiLog'); if (!log) return;
  log.innerHTML = AI.msgs.length ? AI.msgs.map((m, i) => `<div class="aimsg ${m.who}"><div class="bub">${m.who === 'bot' ? mdLite(m.t) : esc(m.t)}${m.html || ''}${m.act && i === AI.msgs.length - 1 && AI.pending ? `<div class="aiact"><button type="button" class="btn fire sm" data-aiyes="1">✅ ${esc(m.act)}</button><button type="button" class="btn ghost sm" data-aino="1">${L('لأ', 'No')}</button></div>` : ''}${m.undo && AI.undo && i === AI.msgs.length - 1 ? `<div class="aiact"><button type="button" class="btn ghost sm" data-aiundo="1">↩ ${L('تراجع', 'Undo')}</button></div>` : ''}</div></div>`).join('') : `<div class="aiempty">${brandMark(54, S.settings.edition)}<b>${L('أهلًا! أنا مساعد زاد', 'Hi! I’m the Zad assistant')}</b><p>${L('اكتب أو اتكلم. أقدر أسجّلك وزن ومية ووجبات ومصاريف، أضيف مشتريات، أعمل تذكير، أفتح أي قسم، وأدوّر لك في التمارين والأكل والأمراض.', 'Type or speak. I can log weight, water, meals and expenses, add shopping, set reminders, open any section and search exercises, foods and conditions.')}</p></div>`;
  log.scrollTop = log.scrollHeight;
  if (AI.busy) log.insertAdjacentHTML('beforeend', `<div class="aimsg bot"><div class="bub typing" aria-label="${L('بيفكر', 'Thinking')}"><i></i><i></i><i></i></div></div>`), log.scrollTop = log.scrollHeight;
}
function aiOpen(listenNow){
  openSheet(`<div class="aisheet">${sheetHead('✨ ' + L('مساعد زاد', 'Zad assistant'))}
    <div class="aichat" id="aiLog" role="log" aria-live="polite" aria-label="${L('المحادثة', 'Conversation')}"></div>
    <div class="chips aichips">${aiSuggest().map(s => `<button type="button" data-aisug="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <form class="aibar" id="aiForm"><button type="button" class="aimic" id="aiMic" aria-label="${L('اتكلم', 'Speak')}" ${sttReady() ? '' : 'hidden'}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
      <input type="text" id="aiIn" autocomplete="off" enterkeyhint="send" placeholder="${L('اكتب طلبك أو سؤالك…', 'Type a request or question…')}" aria-label="${L('اكتب للمساعد', 'Message the assistant')}">
      <button type="submit" class="aisend" aria-label="${L('ابعت', 'Send')}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 12h14M12 5l7 7-7 7" transform="${document.documentElement.dir === 'rtl' ? 'rotate(180 12 12)' : ''}"/></svg></button></form>
    <p class="muted small aifoot">${aiCfg().key ? '✨ Gemini ' + L('شغال للأسئلة المفتوحة', 'is on for open questions') : L('شغال من غير نت. تقدر تضيف Gemini المجاني من الإعدادات للأسئلة المفتوحة.', 'Works offline. Add free Gemini in Settings for open questions.')}${AI.msgs.length ? ` · <button type="button" class="link" data-aiclear="1">${L('امسح المحادثة', 'Clear chat')}</button>` : ''}</p></div>`);
  $('#sheet').classList.add('ai'); aiRender();
  if (listenNow) aiListen(); else if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => $('#aiIn')?.focus(), 60);
}
async function aiListen(){
  const mic = $('#aiMic'), inp = $('#aiIn');
  const t = await listen({onState: s => { mic?.classList.toggle('on', s); if (inp) inp.placeholder = s ? L('بسمعك… اتكلم', 'Listening… speak') : L('اكتب طلبك أو سؤالك…', 'Type a request or question…'); if (s) beep(990, .05, 1); }, onPartial: p => { if (inp) inp.value = p; }});
  if (inp) inp.value = '';
  if (t) aiAsk(t, true); else if (voiceOn()) speak(L('مسمعتش حاجة. دوس على المايك وجرب تاني.', 'I didn’t catch that. Tap the mic and try again.'));
}
async function aiAsk(text, byVoice){
  text = String(text || '').trim(); if (!text || AI.busy) return;
  const n = norm(text); aiPush('me', text);
  if (AI.pending) { if (YES_RE.test(n) || /^(نفذ|اعمله|ok|yes)/.test(n)) return aiDo(true); if (NO_RE.test(n)) return aiDo(false); AI.pending = null; }
  AI.undo = null;
  let res = null; for (const it of INTENTS) { try { res = it.fn(n, text); } catch (e) { console.warn('intent', it.k, e); res = null; } if (res) break; }
  const speakIt = t => { if (t && (byVoice || voiceOn())) speak(t, {now: true}); };
  if (res) {
    if (res.now) aiPush('bot', res.now);
    if (res.act) { AI.pending = res.act; aiPush('bot', res.say, {act: res.act.label}); if (byVoice || voiceOn()) { await speak(res.say + ' ' + L('أنفّذ؟', 'Shall I?'), {now: true}); if (byVoice && sttReady() && AI.pending) { const ans = norm(await listen({onState: s => $('#aiMic')?.classList.toggle('on', s)})); if (ans) { aiPush('me', ans); aiDo(YES_RE.test(ans) && !NO_RE.test(ans)); } } } return; }
    if (res.say) aiPush('bot', res.say, {html: res.html || (res.go ? `<div class="aiact"><button type="button" class="btn sm" data-aigo="${res.go}">${esc(res.goLabel || L('افتح', 'Open'))}</button></div>` : '')});
    if (!res.silent) speakIt(res.say);
    if (res.run) setTimeout(() => res.run(), res.say ? 350 : 0);
    return;
  }
  const hits = aiSearch(text), cfg = aiCfg();
  if (cfg.key && navigator.onLine !== false) {
    AI.busy = true; aiRender(); const r = await gemini(text); AI.busy = false;
    let t = r.t, act = null; const m = t.match(/<<ZAD\s*(\{[\s\S]*?\})\s*>>/); if (m) { t = t.replace(m[0], '').trim(); try { act = geminiAction(JSON.parse(m[1])); } catch (e) {} }
    if (act) { AI.pending = act; aiPush('bot', t || L('أنفّذ؟', 'Shall I?'), {g: r.ok, act: act.label}); } else aiPush('bot', t, {g: r.ok, html: hits.length && !r.ok ? `<div class="aires-list">${hits.join('')}</div>` : ''});
    speakIt(t); return;
  }
  if (hits.length) { aiPush('bot', L('ده اللي لقيته في التطبيق:', 'Here’s what I found in the app:'), {html: `<div class="aires-list">${hits.join('')}</div>`}); speakIt(L(`لقيت ${arN(hits.length, ['نتيجة واحدة', 'نتيجتين', 'نتايج'])}. `, `Found ${hits.length} results. `) + $$('#aiLog .aimsg:last-child .aires b').map(b => b.textContent).join('، ')); return; }
  const msg = L('مش متأكد فهمتك 🤔 جرّب تقول الطلب بطريقة تانية، أو قول «بتعمل إيه» تشوف الأوامر. ولو عايز أرد على أي سؤال مفتوح، ضيف مفتاح Gemini المجاني من الإعدادات.', 'Not sure I got that 🤔 Try rephrasing, or say “what can you do”. For open questions, add a free Gemini key in Settings.');
  aiPush('bot', msg); speakIt(msg);
}
function aiDo(yes){
  const a = AI.pending; AI.pending = null; if (!a) return;
  if (!yes) { aiPush('bot', L('تمام، لغيت.', 'OK, cancelled.')); if (voiceOn()) speak(L('لغيت', 'Cancelled')); return; }
  let t = ''; try { t = a.run() || ''; } catch (e) { console.error(e); t = L('حصلت مشكلة ومعرفتش أنفّذ', 'Something went wrong'); }
  AI.undo = a.undo || null; if (t) { aiPush('bot', t, {undo: !!a.undo}); if (voiceOn()) speak(t, {now: true}); }
}

/* ---------- الزرار العايم ---------- */
function aiFab(){
  let b = $('#aiFab'); if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'aiFab'; b.className = 'aifab'; document.body.appendChild(b); }
  b.hidden = !S.onboarded || aiCfg().fab === false && !voiceOn();
  b.classList.toggle('voice', voiceOn());
  b.setAttribute('aria-label', voiceOn() ? L('المساعد الصوتي: دوس واتكلم', 'Voice assistant: tap and speak') : L('مساعد زاد', 'Zad assistant'));
  b.innerHTML = voiceOn() ? `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>` : `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 1.9 1.9.8-1.9.8L19 20.4l-.8-1.9-1.9-.8 1.9-.8zM5 15.5l.6 1.4 1.4.6-1.4.6L5 19.5l-.6-1.4L3 17.5l1.4-.6z"/></svg>`;
}
document.addEventListener('click', e => { if (e.target.closest('#aiFab')) { e.preventDefault(); aiOpen(voiceOn() && sttReady()); } });
on('click', e => {
  const T = e.target;
  if (T.closest('#aiMic')) { if (LISTEN) listenStop(); else aiListen(); return true; }
  const sg = T.closest('[data-aisug]'); if (sg) { aiAsk(sg.dataset.aisug); return true; }
  if (T.closest('[data-aiyes]')) { aiDo(true); return true; }
  if (T.closest('[data-aino]')) { aiDo(false); return true; }
  if (T.closest('[data-aiundo]')) { const u = AI.undo; AI.undo = null; if (u) { try { u(); } catch (er) {} aiPush('bot', L('رجّعت اللي اتعمل ↩', 'Undone ↩')); } return true; }
  if (T.closest('[data-aiclear]')) { AI.msgs = []; AI.pending = null; AI.undo = null; aiSave(); aiOpen(); return true; }
  const g = T.closest('[data-aigo]'); if (g) { go(g.dataset.aigo); return true; }
  const b = T.closest('[data-aib]'); if (b) { const fn = AI.btn[b.dataset.aib]; if (fn) fn(); return true; }
  if (T.closest('[data-close]') || T.id === 'sheet') $('#sheet').classList.remove('ai');
});
on('submit', e => { if (e.target.id !== 'aiForm') return; e.preventDefault(); const i = $('#aiIn'), v = i.value; i.value = ''; aiAsk(v); return true; });

/* ---------- الإعدادات ---------- */
function aiSettingsCard(){
  const v = voiceSet(), a = aiCfg();
  return `<div class="card form" id="aiSettings"><h2>🎙️ ${L('المساعد والصوت', 'Assistant & voice')}</h2>
    <label class="row"><input type="checkbox" class="tick" id="setVoice" ${v.on ? 'checked' : ''}> <span><b>${L('الوضع الصوتي (لفاقدي البصر وضعاف النظر)', 'Voice mode (for blind and low-vision users)')}</b><br><small class="muted">${L('التطبيق يقرا كل صفحة تفتحها، ويقرا الرسايل، وزرار المساعد يبقى مايك كبير: دوس واتكلم.', 'Reads each page and message aloud; the assistant button becomes a big mic: tap and speak.')} ${L('لو شغّال TalkBack ممكن تقفل «اقرا الصفحة أول ما تتفتح» عشان الصوتين ميدخلوش في بعض.', 'If you use TalkBack, you may turn off auto-reading so the two voices don’t overlap.')}</small></span></label>
    <div class="fgrid"><label class="f">${L('سرعة الكلام', 'Speech rate')}<select id="setVRate">${[[0.75, L('بطيء', 'Slow')], [1, L('عادي', 'Normal')], [1.25, L('سريع', 'Fast')], [1.5, L('أسرع', 'Faster')]].map(([k, t]) => `<option value="${k}" ${+v.rate === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="row" style="align-self:end"><input type="checkbox" class="tick" id="setVAuto" ${v.auto !== false ? 'checked' : ''}> ${L('اقرا الصفحة أول ما تتفتح', 'Read pages automatically')}</label></div>
    <label class="row"><input type="checkbox" class="tick" id="setDict" ${v.dict !== false ? 'checked' : ''}> ${L('زرار مايك جنب خانات الكتابة (اكتب بصوتك)', 'Mic button next to text fields (dictation)')}</label>
    <label class="row"><input type="checkbox" class="tick" id="setFab" ${a.fab !== false ? 'checked' : ''}> ${L('إظهار زرار المساعد العايم', 'Show the floating assistant button')}</label>
    <div class="row"><button class="btn sm" type="button" id="vTest">🔊 ${L('جرّب الصوت', 'Test voice')}</button>${sttReady() ? `<button class="btn ghost sm" type="button" id="vTestMic">🎙️ ${L('جرّب المايك', 'Test mic')}</button>` : `<span class="muted small">${L('تعرّف الكلام مش متاح هنا. على اللاب استخدم كروم أو إيدج.', 'Speech recognition isn’t available here. On a laptop use Chrome or Edge.')}</span>`}</div>
    <details${a.key ? ' open' : ''}><summary><b>✨ ${L('Gemini المجاني (اختياري)', 'Free Gemini (optional)')}</b></summary>
      <p class="muted small">${L('المساعد شغال من غير نت ومن غير أي فلوس. لو عايزه يرد كمان على أي سؤال مفتوح، اعمل مفتاح مجاني من Google AI Studio (aistudio.google.com ← Get API key) وحطه هنا. المفتاح بيتحفظ على جهازك بس. الحصة المجانية محدودة في اليوم، وجوجل ممكن تستخدم كلام الخطة المجانية لتحسين خدماتها، فمتكتبش فيه أسرار.', 'The assistant works offline and free. To also answer open questions, create a free key at Google AI Studio (aistudio.google.com → Get API key) and paste it here. It stays on this device. The free tier has daily limits and Google may use free-tier prompts to improve its services, so don’t share secrets.')}</p>
      <label class="f">${L('مفتاح Gemini', 'Gemini key')}<input type="password" id="setGKey" autocomplete="off" value="${esc(a.key || '')}" placeholder="AIza…" dir="ltr"></label>
      <label class="row"><input type="checkbox" class="tick" id="setGShare" ${a.share ? 'checked' : ''}> ${L('ابعت حالتي الصحية وأدويتي مع السؤال (عشان الرد يبقى مناسب ليا)', 'Send my conditions and medicines with questions (for tailored answers)')}</label>
      <div class="row"><button class="btn sm" type="button" id="gTest">${L('احفظ وجرّب', 'Save & test')}</button>${a.key ? `<button class="btn ghost sm" type="button" id="gDel">${L('امسح المفتاح', 'Remove key')}</button>` : ''}<span class="muted small" id="gMsg"></span></div></details></div>`;
}
on('change', e => {
  const T = e.target, v = voiceSet(), a = aiCfg();
  if (T.id === 'setVoice') { v.on = T.checked; store.save(); aiFab(); if (v.on) speak(L('الوضع الصوتي اشتغل. هقرالك كل صفحة. دوس على الزرار الكبير تحت واتكلم.', 'Voice mode on. I’ll read every page. Tap the big button and speak.'), {now: true}); else speakStop(); return true; }
  if (T.id === 'setVRate') { v.rate = +T.value; store.save(); speak(L('دي سرعة الكلام الجديدة', 'This is the new speech rate'), {now: true}); return true; }
  if (T.id === 'setVAuto') { v.auto = T.checked; store.save(); return true; }
  if (T.id === 'setDict') { v.dict = T.checked; store.save(); return true; }
  if (T.id === 'setFab') { a.fab = T.checked; store.save(); aiFab(); return true; }
  if (T.id === 'setGShare') { a.share = T.checked; store.save(); return true; }
});
on('click', async e => {
  const T = e.target;
  if (T.id === 'vTest') { speak(L('أهلًا! أنا صوت زاد. ', 'Hi! This is Zad’s voice. ') + todayBrief(true), {now: true}); return true; }
  if (T.id === 'vTestMic') { const t = await listen({onState: s => T.classList.toggle('on', s)}); toast(t ? L('سمعتك: ', 'Heard: ') + t : L('مسمعتش حاجة', 'Didn’t hear anything')); return true; }
  if (T.id === 'gDel') { aiCfg().key = ''; store.save(); render(); return true; }
  if (T.id === 'gTest') { const a = aiCfg(); a.key = ($('#setGKey')?.value || '').trim(); store.save(); const m = $('#gMsg'); if (!a.key) { m.textContent = L('حط المفتاح الأول', 'Enter the key first'); return true; } m.textContent = L('بجرّب…', 'Testing…'); const r = await gemini(L('قول "تمام" بس', 'Just say "OK"')); m.textContent = r.ok ? '✅ ' + L('شغال', 'Working') : '⚠️ ' + r.t; return true; }
});
