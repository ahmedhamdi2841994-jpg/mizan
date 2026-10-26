/* ميزان — التقويم الهجري والصيام، الختمة، وحاسبة الزكاة. */
'use strict';
const HMONTHS = [['محرم', 'Muharram'], ['صفر', 'Safar'], ['ربيع الأول', 'Rabiʿ I'], ['ربيع الآخر', 'Rabiʿ II'], ['جمادى الأولى', 'Jumada I'], ['جمادى الآخرة', 'Jumada II'], ['رجب', 'Rajab'], ['شعبان', 'Shaʿban'], ['رمضان', 'Ramadan'], ['شوال', 'Shawwal'], ['ذو القعدة', 'Dhu al-Qaʿdah'], ['ذو الحجة', 'Dhu al-Hijjah']];
const _hc = {};
const hp = iso => _hc[iso] ||= (hParts(iso) || {d: 0, m: 0, y: 0});
const FST = () => S.fast ||= {monThu: true, white: true, major: true, suhoor: true, plan: {}, log: {}};
function fastInfo(iso, all){
  const h = hp(iso), wd = D(iso).getDay(), f = FST();
  if (!h.m) return null;
  if ((h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return null; // Eid & tashreeq: no fasting
  if (h.m === 9) return {k: 'ramadan', t: {ar: `صيام رمضان · يوم ${h.d}`, en: `Ramadan fast · day ${h.d}`}, fard: true};
  if (h.m === 12 && h.d === 9 && (all || f.major)) return {k: 'arafah', t: {ar: 'صيام يوم عرفة (يكفّر سنتين)', en: 'Day of Arafah fast (expiates two years)'}};
  if (h.m === 1 && h.d === 10 && (all || f.major)) return {k: 'ashura', t: {ar: 'صيام عاشوراء (يكفّر سنة)', en: 'Ashura fast (expiates a year)'}};
  if (h.m === 1 && h.d === 9 && (all || f.major)) return {k: 'tasua', t: {ar: 'صيام تاسوعاء مع عاشوراء', en: 'Tasuʿa fast, with Ashura'}};
  if (h.m === 12 && h.d <= 8 && (all || f.major)) return {k: 'dhul', t: {ar: 'صيام من العشر الأوائل من ذي الحجة', en: 'Fast in the first ten days of Dhul-Hijjah'}};
  if ([13, 14, 15].includes(h.d) && (all || f.white)) return {k: 'white', t: {ar: 'صيام الأيام البيض', en: 'The White Days fast'}};
  if ((wd === 1 || wd === 4) && (all || f.monThu)) return {k: 'monthu', t: {ar: wd === 1 ? 'صيام الاثنين' : 'صيام الخميس', en: wd === 1 ? 'Monday fast' : 'Thursday fast'}};
  if (h.m === 10 && h.d >= 2 && all) return {k: 'shawwal', t: {ar: 'ستة من شوال', en: 'Six days of Shawwal'}};
  return null;
}
const forbiddenFast = iso => { const h = hp(iso); return (h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13); };
const ISLAMIC_DAYS = [[1, 1, 'رأس السنة الهجرية', 'Islamic New Year'], [1, 10, 'عاشوراء', 'Ashura'], [9, 1, 'أول رمضان', 'Ramadan begins'], [9, 21, 'العشر الأواخر (ليالي القدر)', 'Last ten nights'], [10, 1, 'عيد الفطر', 'Eid al-Fitr'], [12, 1, 'العشر من ذي الحجة', 'Ten days of Dhul-Hijjah'], [12, 9, 'يوم عرفة', 'Day of Arafah'], [12, 10, 'عيد الأضحى', 'Eid al-Adha']];
function nextHijri(m, d){ for (let i = 0; i < 400; i++) { const iso = addDays(todayISO(), i), h = hp(iso); if (h.m === m && h.d === d) return iso; } return null; }
let HJ = {off: 0, tab: 'cal'};
function hijriMonthDays(off){
  let iso = todayISO(); for (let i = 0; i < 31 && hp(iso).d !== 1; i++) iso = addDays(iso, -1);
  if (off) { for (let k = 0; k < Math.abs(off); k++) { if (off > 0) { iso = addDays(iso, 29); while (hp(iso).d !== 1) iso = addDays(iso, 1); } else { iso = addDays(iso, -1); while (hp(iso).d !== 1) iso = addDays(iso, -1); } } }
  const out = [], h0 = hp(iso); for (let i = 0; i < 31; i++) { const x = addDays(iso, i); if (hp(x).m !== h0.m) break; out.push(x); } return {days: out, h: h0};
}
registerView('hijri', {title: {ar: 'الهجري والصيام', en: 'Hijri & fasting'}, icon: 'moon', render(){
  const f = FST(), {days, h} = hijriMonthDays(HJ.off), wd = LANG === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'], today = todayISO(), th = hp(today);
  let grid = `<div class="cal hijri">${wd.map(d => `<div class="cal-h">${d}</div>`).join('')}`; for (let i = 0; i < D(days[0]).getDay(); i++) grid += '<div class="cal-e"></div>';
  days.forEach(iso => { const fi = fastInfo(iso, true), fb = forbiddenFast(iso), done = f.log[iso], plan = f.plan[iso]; grid += `<button type="button" class="cal-d ${iso === today ? 'today' : ''} ${fi ? 'fast' : ''} ${fb ? 'eid' : ''} ${done ? 'fasted' : ''}" data-fday="${iso}" title="${fi ? esc(LX(fi.t)) : fb ? L('عيد: ممنوع الصيام', 'Eid: no fasting') : ''}"><b>${hp(iso).d}</b><small>${D(iso).getDate()}/${D(iso).getMonth() + 1}</small>${done ? '<span class="dots">✓</span>' : plan ? '<span class="dots">◦</span>' : ''}</button>`; });
  grid += '</div>';
  const up = ISLAMIC_DAYS.map(([m, d, ar, en]) => ({ar, en, iso: nextHijri(m, d)})).filter(x => x.iso).sort((a, b) => a.iso < b.iso ? -1 : 1);
  const next7 = []; for (let i = 0; i < 10; i++) { const iso = addDays(today, i), fi = fastInfo(iso); if (fi) next7.push([iso, fi]); }
  const fastedYear = Object.keys(f.log).filter(d => f.log[d] && d.startsWith(String(new Date().getFullYear()))).length;
  return topbar(L('التقويم الهجري والصيام', 'Hijri calendar & fasting'), `${dHijri(today)} · ${L('تقويم أم القرى', 'Umm al-Qura calendar')}`, '', true) + `
  <div class="two"><div class="card"><div class="head"><button class="btn ghost sm" type="button" data-hjm="-1" aria-label="${L('الشهر اللي فات', 'Previous month')}">${LANG === 'en' ? '‹' : '›'}</button><h2>${LANG === 'en' ? HMONTHS[h.m - 1][1] : HMONTHS[h.m - 1][0]} ${h.y}</h2><button class="btn ghost sm" type="button" data-hjm="1" aria-label="${L('الشهر الجاي', 'Next month')}">${LANG === 'en' ? '›' : '‹'}</button></div>${grid}
    <p class="muted small" style="margin:10px 0 0"><span class="lg fast"></span> ${L('صيام سُنة أو فرض', 'Sunnah or obligatory fast')} · <span class="lg eid"></span> ${L('عيد (ممنوع الصيام)', 'Eid (no fasting)')} · ✓ ${L('صمته', 'fasted')}. ${L('دوس على أي يوم علشان تعلّم إنك صمته أو ناوي تصومه.', 'Tap a day to mark it planned or fasted.')}</p></div>
  <div><div class="card"><div class="head"><h2>${L('الصيام الجاي', 'Upcoming fasts')}</h2><span class="pill fire">${L('صمت السنة دي', 'Fasted this year')} ${fastedYear}</span></div>${next7.length ? next7.map(([iso, fi]) => `<div class="srow ${f.log[iso] ? 'done' : ''}"><span class="evi">🌙</span><span class="smain"><b>${esc(LX(fi.t))}</b><small>${dLong(iso)} · ${dHijri(iso)}</small></span><button type="button" class="btn sm ${f.plan[iso] ? 'fire' : 'ghost'}" data-fplan="${iso}">${f.plan[iso] ? L('ناوي ✓', 'Planned ✓') : L('هصوم', 'I’ll fast')}</button></div>`).join('') : `<div class="empty">—</div>`}
    <div class="chips" style="margin-top:12px"><button type="button" data-fopt="monThu" aria-pressed="${!!f.monThu}">${L('الاثنين والخميس', 'Mon & Thu')}</button><button type="button" data-fopt="white" aria-pressed="${!!f.white}">${L('الأيام البيض', 'White days')}</button><button type="button" data-fopt="major" aria-pressed="${!!f.major}">${L('عرفة وعاشوراء والعشر', 'Arafah, Ashura, the Ten')}</button><button type="button" data-fopt="suhoor" aria-pressed="${!!f.suhoor}">${L('منبّه السحور', 'Suhoor alarm')}</button></div>
    <p class="muted small" style="margin:8px 0 0">${L('هيفكّرك الساعة 9 بالليل قبل يوم الصيام، ولو علّمت "هصوم" هيصحّيك للسحور قبل الفجر بـ45 دقيقة.', 'You’ll be reminded at 9 PM the night before; mark “I’ll fast” for a suhoor alarm 45 min before Fajr.')}</p></div>
    <div class="card"><div class="head"><h2>${L('مناسبات جاية', 'Coming occasions')}</h2></div>${up.map(x => `<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--line)"><span><b>${LANG === 'en' ? x.en : x.ar}</b><br><span class="muted small">${dLong(x.iso)}</span></span><span class="pill grey">${daysBetween(today, x.iso) === 0 ? L('النهارده', 'Today') : L(`بعد ${daysBetween(today, x.iso)} يوم`, `in ${daysBetween(today, x.iso)} d`)}</span></div>`).join('')}</div></div></div>
  <p class="muted small">${L('التقويم محسوب بتقويم أم القرى. بداية رمضان والأعياد بتتحدد رسميًا برؤية الهلال، فممكن تفرق يوم.', 'Dates follow the Umm al-Qura calendar. Ramadan and the Eids are officially set by moon sighting and may differ by a day.')}</p>`;
}});
on('click', e => {
  const T = e.target, f = FST();
  const m = T.closest('[data-hjm]'); if (m) { HJ.off += +m.dataset.hjm; render(); return true; }
  const fd = T.closest('[data-fday]'); if (fd) { const iso = fd.dataset.fday; if (forbiddenFast(iso)) { toast(L('أيام العيد والتشريق ممنوع فيها الصيام.', 'Fasting is not allowed on Eid and tashreeq days.')); return true; } if (iso <= todayISO()) { f.log[iso] = !f.log[iso]; if (f.log[iso]) toast(L('تقبّل الله صيامك 🤍', 'May Allah accept your fast 🤍')); } else { f.plan[iso] = !f.plan[iso]; rescheduleAll(); } store.save(); render(); return true; }
  const fp = T.closest('[data-fplan]'); if (fp) { const iso = fp.dataset.fplan; if (iso === todayISO()) f.log[iso] = !f.log[iso]; f.plan[iso] = !f.plan[iso]; store.save(); render(); rescheduleAll(); return true; }
  const fo = T.closest('[data-fopt]'); if (fo) { f[fo.dataset.fopt] = !f[fo.dataset.fopt]; store.save(); render(); rescheduleAll(); return true; }
});

/* ---------- khatma ---------- */
const SURAH_N = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const SURAH_START = SURAH_N.reduce((a, n, i) => (a.push(i ? a[i - 1] + SURAH_N[i - 1] : 0), a), []);
const gIdx = (s, a) => SURAH_START[s - 1] + a - 1;
const sa = g => { let s = 0; while (s < 113 && SURAH_START[s + 1] <= g) s++; return [s + 1, g - SURAH_START[s] + 1]; };
const KH = () => S.khatma ||= {days: 30, start: null, done: {}, time: '21:30', count: 0};
function khatmaPortion(k){
  const K = KH(), n = K.days, tot = 6236;
  if (30 % n === 0) { const per = 30 / n, a = JUZ[k * per], b = JUZ[(k + 1) * per]; const from = gIdx(a[0], a[1]), to = b ? gIdx(b[0], b[1]) - 1 : tot - 1; return {from, to}; }
  const per = Math.ceil(tot / n); return {from: k * per, to: Math.min(tot - 1, (k + 1) * per - 1)};
}
const sName = s => QURAN ? QURAN[s - 1][0] : L('سورة ', 'Surah ') + s;
function portionLabel(p){ const [s1, a1] = sa(p.from), [s2, a2] = sa(p.to); return `${sName(s1)} ${a1} ${L('←', '→')} ${sName(s2)} ${a2}`; }
function khatmaState(){ const K = KH(); if (!K.start) return null; const dayN = Math.min(K.days - 1, Math.max(0, daysBetween(K.start, todayISO()))), doneN = Object.keys(K.done).length, next = [...Array(K.days).keys()].find(i => !K.done[i]); return {dayN, doneN, next, behind: Math.max(0, dayN + 1 - doneN)}; }
function khatmaToday(){ const st = khatmaState(); if (!st || st.next === undefined) return null; return L('ورد الختمة: ', 'Khatma: ') + portionLabel(khatmaPortion(st.next)); }
registerView('khatma', {title: {ar: 'الختمة', en: 'Khatma'}, icon: 'quran', render(){
  if (!QURAN) loadQuran().then(() => VIEW === 'khatma' && render());
  const K = KH(), st = khatmaState();
  const setup = `<div class="card form"><h2>${st ? L('خطة جديدة', 'New plan') : L('ابدأ ختمة', 'Start a khatma')}</h2><div class="seg">${[3, 7, 10, 15, 20, 30, 60].map(d => `<button type="button" data-khdays="${d}" aria-pressed="${K.days === d}">${d} ${L('يوم', 'days')}</button>`).join('')}</div>
    <div class="fgrid"><label class="f">${L('البداية', 'Start')}<input type="date" id="khStart" value="${K.start || todayISO()}"></label><label class="f">${L('التذكير اليومي', 'Daily reminder')}<input type="time" id="khTime" value="${K.time || '21:30'}"></label></div>
    <p class="muted small" style="margin:0">${30 % K.days === 0 ? L(`كل يوم ${30 / K.days} جزء.`, `${30 / K.days} juz a day.`) : L(`كل يوم حوالي ${Math.ceil(6236 / K.days)} آية.`, `About ${Math.ceil(6236 / K.days)} verses a day.`)}</p><button class="btn fire" type="button" id="khGo">${st ? L('ابدأ من جديد', 'Restart') : L('ابدأ', 'Start')}</button></div>`;
  if (!st) return topbar(L('الختمة', 'Khatma'), L('اختم القرآن بخطة يومية وتذكير', 'Complete the Quran with a daily plan and reminder'), '', true) + setup + (K.count ? `<p class="muted">${L('ختمات قبل كده: ', 'Completed before: ')}${K.count} 🤍</p>` : '');
  const done = st.next === undefined, p = st.doneN / K.days;
  const rows = [...Array(K.days).keys()].map(i => { const pr = khatmaPortion(i), [s, a] = sa(pr.from); return `<div class="srow ${K.done[i] ? 'done' : ''} ${i === st.next ? 'due' : ''}"><input type="checkbox" class="tick" data-khdone="${i}" ${K.done[i] ? 'checked' : ''}><span class="smain"><b>${L('اليوم', 'Day')} ${i + 1}${30 % K.days === 0 && K.days === 30 ? ' · ' + L('الجزء ', 'Juz ') + (i + 1) : ''}</b><small>${esc(portionLabel(pr))} · ${dShort(addDays(K.start, i))}</small></span><button class="btn ghost sm" type="button" data-qopen="${s}|${a}">${L('اقرأ', 'Read')}</button></div>`; }).join('');
  return topbar(L('الختمة', 'Khatma'), L(`ختمة في ${K.days} يوم · بدأت ${dShort(K.start)}`, `${K.days}-day khatma · started ${dShort(K.start)}`), `<span class="pill ${st.behind ? 'amber' : 'green'}">${st.behind ? L(`متأخر ${st.behind} يوم`, `${st.behind} day(s) behind`) : L('ماشي في الميعاد', 'On track')}</span>`, true) + `
  <div class="card hero"><div class="row" style="justify-content:space-between;gap:16px"><div class="ringbig" style="width:120px;height:120px">${ring(p, 120, 10, 'var(--teal)')}<div class="c"><div><b class="num" style="font-size:1.6rem">${fmt(p * 100, 0)}%</b><span>${st.doneN}/${K.days}</span></div></div></div>
    <div class="grow">${done ? `<h2>🤍 ${L('ختمت القرآن! تقبّل الله منك.', 'You completed the Quran! May Allah accept it.')}</h2><p class="muted small">${L('دعاء الختم: ادعُ بما تحب، فهو من أوقات الإجابة.', 'Supplicate as you wish; it is a time of answer.')}</p><button class="btn fire" type="button" id="khFinish">${L('سجّل الختمة وابدأ واحدة جديدة', 'Log it and start a new one')}</button>` : `<div class="eyebrow">${L('ورد النهارده', 'Today’s portion')}</div><h2>${esc(portionLabel(khatmaPortion(st.next)))}</h2><div class="row" style="margin-top:10px"><button class="btn fire" type="button" data-qopen="${sa(khatmaPortion(st.next).from).join('|')}">${L('افتح المصحف', 'Open the Mushaf')}</button><button class="btn ghost" type="button" data-khdone="${st.next}" data-khbtn="1">${L('خلصت الورد ✓', 'Done ✓')}</button></div>`}</div></div></div>
  <div class="card"><div class="head"><h2>${L('الخطة', 'The plan')}</h2></div>${rows}</div>${setup}`;
}});
on('click', e => {
  const T = e.target, K = KH();
  const kd = T.closest('[data-khdays]'); if (kd) { K.days = +kd.dataset.khdays; store.save(); render(); return true; }
  if (T.id === 'khGo') { K.start = $('#khStart').value || todayISO(); K.time = $('#khTime').value || '21:30'; K.done = {}; store.save(); render(); rescheduleAll(); return true; }
  if (T.id === 'khFinish') { K.count = (K.count || 0) + 1; K.start = null; K.done = {}; store.save(); render(); return true; }
  const kb = T.closest('[data-khbtn]'); if (kb) { K.done[+kb.dataset.khdone] = todayISO(); const d = day(todayISO()); d.quran = (num(d.quran) || 0) + 20; store.save(); beep(760, .08, 2); render(); return true; }
});
on('change', e => { const T = e.target; if (T.dataset.khdone !== undefined && T.type === 'checkbox') { const K = KH(); if (T.checked) K.done[+T.dataset.khdone] = todayISO(); else delete K.done[+T.dataset.khdone]; store.save(); render(); return true; } if (T.id === 'khTime') { KH().time = T.value; store.save(); rescheduleAll(); return true; } });

/* ---------- zakat ---------- */
registerView('zakat', {title: {ar: 'الزكاة', en: 'Zakat'}, icon: 'zakat', render(){
  const z = S.zakat ||= {}, v = k => +z[k] || 0;
  const karat = v('g24') + v('g21') * 21 / 24 + v('g18') * 18 / 24, goldVal = karat * v('gp'), silverVal = v('silver') * v('sp');
  const assets = v('cash') + v('bank') + v('invest') + v('trade') + v('recv') + goldVal + silverVal, net = Math.max(0, assets - v('debt'));
  const nisabG = v('gp') ? 85 * v('gp') : null, nisabS = v('sp') ? 595 * v('sp') : null, nisab = nisabG ?? nisabS;
  const due = nisab !== null && net >= nisab ? net * 0.025 : 0;
  const inp = (k, l, sub) => `<label class="f">${l}${sub ? ` <small class="muted">${sub}</small>` : ''}<input type="number" min="0" step="0.01" data-zk="${k}" value="${z[k] ?? ''}" inputmode="decimal"></label>`;
  return topbar(L('حاسبة الزكاة', 'Zakat calculator'), L('زكاة المال والذهب والفضة وعروض التجارة', 'Zakat on money, gold, silver and trade goods'), '', true) + `
  <div class="two"><div class="card form"><h2>${L('أموالك اللي عدّى عليها سنة هجرية', 'Wealth held for a lunar year')}</h2><div class="fgrid">${inp('cash', L('كاش', 'Cash'))}${inp('bank', L('في البنك', 'In the bank'))}${inp('invest', L('أسهم واستثمارات (القيمة الحالية)', 'Shares & investments (current value)'))}${inp('trade', L('بضاعة للبيع', 'Trade goods'))}${inp('recv', L('فلوس ليك عند ناس (مضمونة)', 'Money owed to you (recoverable)'))}${inp('debt', L('ديون عليك مستحقة', 'Debts you owe now'))}</div>
    <h2 style="margin-top:6px">${L('الذهب والفضة', 'Gold & silver')}</h2><div class="fgrid">${inp('g24', L('ذهب عيار 24', '24k gold'), L('جرام', 'g'))}${inp('g21', L('ذهب عيار 21', '21k gold'), L('جرام', 'g'))}${inp('g18', L('ذهب عيار 18', '18k gold'), L('جرام', 'g'))}${inp('gp', L('سعر جرام ذهب 24 النهارده', 'Today’s price of 1 g 24k gold'))}${inp('silver', L('فضة', 'Silver'), L('جرام', 'g'))}${inp('sp', L('سعر جرام الفضة', 'Price of 1 g silver'))}</div>
    <p class="muted small" style="margin:0">${L('اكتب سعر الذهب من محل أو موقع موثوق، لأنه بيتغير كل يوم.', 'Enter today’s gold price from a trusted source; it changes daily.')}</p></div>
  <div><div class="card hero"><div class="eyebrow">${L('الزكاة المستحقة', 'Zakat due')}</div><h2 style="font-size:2rem" class="num">${money(due)}</h2>
    <div class="meter" style="margin-top:12px"><div class="row"><span>${L('صافي المال', 'Net zakatable wealth')}</span><span class="num">${money(net)}</span></div><div class="row"><span>${L('النصاب', 'Nisab')} ${nisabG ? L('(85 جم ذهب)', '(85 g gold)') : nisabS ? L('(595 جم فضة)', '(595 g silver)') : ''}</span><span class="num">${nisab === null ? L('اكتب سعر الذهب', 'Enter the gold price') : money(nisab)}</span></div>${goldVal ? `<div class="row"><span>${L('قيمة الذهب', 'Gold value')}</span><span class="num">${money(goldVal)}</span></div>` : ''}</div>
    <p class="small" style="margin:12px 0 0">${nisab === null ? L('محتاج سعر جرام الذهب علشان نعرف النصاب.', 'Enter the gold price to know the nisab.') : net >= nisab ? L('مالك بلغ النصاب، والزكاة ربع العشر (2.5%).', 'Your wealth reached the nisab; zakat is 2.5%.') : L('مالك لسه مبلغش النصاب، فمفيش زكاة عليه دلوقتي.', 'Below the nisab: no zakat due now.')}</p></div>
    <div class="card form"><h2>${L('موعد الزكاة السنوي', 'Yearly zakat date')}</h2><label class="f">${L('اليوم اللي مالك كمل فيه النصاب', 'The day your wealth reached the nisab')}<input type="date" id="zHawl" value="${z.hawl || ''}"></label><button class="btn sm" type="button" id="zRemind">${L('فكّرني بيه كل سنة هجرية', 'Remind me every Hijri year')}</button></div>
    <div class="card"><div class="head"><h2>${L('زكاة الفطر', 'Zakat al-Fitr')}</h2></div><div class="row"><span>${L('عدد أفراد البيت', 'People in the household')}</span><span class="counter"><button type="button" data-zfit="-1" aria-label="${L('قلّل', 'Decrease')}">−</button><b>${z.people || 1}</b><button type="button" data-zfit="1" aria-label="${L('زوّد', 'Increase')}">+</button></span></div><p class="small">${L(`عليك ${z.people || 1} صاع، يعني حوالي ${fmt((z.people || 1) * 3, 0)} كجم رز (الصاع حوالي 3 كجم)، تطلعها قبل صلاة العيد.`, `${z.people || 1} saʿ, about ${fmt((z.people || 1) * 3, 0)} kg of rice (1 saʿ ≈ 3 kg), given before the Eid prayer.`)}</p></div></div></div>
  <p class="muted small">${L('الحاسبة للتقريب. الحُلي المستعملة وبعض الحالات فيها خلاف بين العلماء، فاسأل أهل العلم لو عندك حالة خاصة.', 'This is an estimate. Worn jewellery and some cases have scholarly differences; ask a scholar about special cases.')}</p>`;
}});
on('input', e => { if (e.target.dataset.zk) { (S.zakat ||= {})[e.target.dataset.zk] = num(e.target.value); store.save(); clearTimeout(on._z); on._z = setTimeout(() => { const k = e.target.dataset.zk, pos = e.target.selectionStart; render(); const el = document.querySelector(`[data-zk="${k}"]`); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (er) {} } }, 500); return true; } });
on('change', e => { if (e.target.id === 'zHawl') { (S.zakat ||= {}).hawl = e.target.value; store.save(); return true; } });
on('click', e => {
  const zf = e.target.closest('[data-zfit]'); if (zf) { const z = S.zakat ||= {}; z.people = Math.max(1, (z.people || 1) + +zf.dataset.zfit); store.save(); render(); return true; }
  if (e.target.id === 'zRemind') { const d = $('#zHawl').value; if (!d) { toast(L('اختار التاريخ الأول', 'Pick the date first')); return true; } const l = LIFE(); l.events = l.events.filter(x => x.zakat !== true); l.events.push({id: uid(), title: L('موعد الزكاة السنوي', 'Yearly zakat'), type: 'islamic', date: d, repeat: 'hijri', remind: [7, 0], zakat: true}); store.save(); rescheduleAll(); toast(L('هيفكّرك كل سنة هجرية ✅', 'You’ll be reminded every Hijri year ✅')); return true; }
});

/* ---------- reminders ---------- */
function islamicReminders(iso, push){
  const n = S.settings.notify, f = FST();
  if (n.fasting !== false) {
    const tmr = addDays(iso, 1), fi = fastInfo(tmr); if (fi && !fi.fard) push('fast-eve', 21 * 60, '🌙 ' + L('بكرة: ', 'Tomorrow: ') + LX(fi.t), L('انوِ من الليل، ودوس "هصوم" علشان منبّه السحور', 'Set your intention; tap “I’ll fast” for a suhoor alarm'), 'remind');
    if (f.suhoor && (f.plan[iso] || fastInfo(iso)?.fard)) { const pt = prayerTimes(iso); push('suhoor', pt.fajr - 45, '🌙 ' + L('السحور', 'Suhoor'), L('"تسحّروا فإن في السحور بركة" · الفجر ', 'Eat suhoor, there is blessing in it · Fajr ') + m2t(pt.fajr), 'remind'); }
  }
  const K = S.khatma; if (K && K.start && n.khatma !== false) { const st = khatmaState(); if (st && st.next !== undefined && st.next <= daysBetween(K.start, iso)) push('khatma', t2m(K.time || '21:30'), '📖 ' + L('ورد الختمة', 'Khatma portion'), portionLabel(khatmaPortion(st.next)), 'remind'); }
  if (D(iso).getDay() === 4 && n.adhkar) push('kahf-eve', 20 * 60, '📖 ' + L('ليلة الجمعة', 'Friday eve'), L('سورة الكهف والصلاة على النبي ﷺ', 'Surat al-Kahf and blessings on the Prophet ﷺ'), 'remind');
  if (D(iso).getDay() === 5 && n.adhkar) push('kahf', 9 * 60 + 30, '📖 ' + L('سورة الكهف', 'Surat al-Kahf'), L('"أضاء له من النور ما بين الجمعتين"', 'Light between the two Fridays'), 'remind');
}
