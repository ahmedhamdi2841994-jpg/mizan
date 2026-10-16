/* ميزان — prayer times view, qibla, adhkar with counters, the Mushaf */
'use strict';
let QURAN = null, QURAN_P = null;
function loadQuran(){ return QURAN ? Promise.resolve(QURAN) : (QURAN_P ||= fetch('data/quran.json').then(r => r.json()).then(j => (QURAN = j))); }
const JUZ = [[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
const arDigits = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

/* ---------- prayer view ---------- */
let compassOn = false, heading = null;
registerView('prayer', {title: {ar: 'الصلاة', en: 'Prayer'}, icon: 'prayer', render(){
  const pt = prayerTimes(CUR), isToday = CUR === todayISO(), now = new Date(), nowM = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  let next = isToday ? PRAYER_KEYS.find(k => pt[k] > nowM) : null, nextAt = next ? pt[next] : null;
  if (isToday && !next) { next = 'fajr'; nextAt = prayerTimes(addDays(CUR, 1)).fajr + 1440; }
  const left = nextAt !== null ? Math.max(0, nextAt - nowM) : null;
  const q = P.qibla(S.settings.lat, S.settings.lng), d = dayOf(CUR);
  const month = Array.from({length: 30}, (_, i) => addDays(CUR, i)).map(iso => { const t = prayerTimes(iso); return `<tr><td>${dShort(iso)}</td>${['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => `<td>${m2t(t[k])}</td>`).join('')}</tr>`; }).join('');
  const arrow = compassOn && heading !== null ? (q - heading + 360) % 360 : q;
  return topbar(L('مواقيت الصلاة', 'Prayer times'), `${cityLabel()} · ${dHijri(CUR)}`) + `
  ${isToday ? `<div class="card hero"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">${L('الصلاة الجاية', 'Next prayer')}</div><h2 style="font-size:1.4rem">${pName(next)} · ${m2t(nextAt % 1440)}</h2></div><div class="countdown" id="pCount">${Math.floor(left / 60)}:${pad2(Math.floor(left % 60))}:${pad2(Math.floor((left * 60) % 60))}</div></div></div>` : ''}
  <div class="prayers">${['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => `<div class="prayer ${k === next ? 'next' : ''}"><span class="muted small">${pName(k)}</span><b>${m2t(pt[k])}</b>${k !== 'sunrise' ? `<label class="row small" style="justify-content:center;margin-top:6px;gap:6px"><input type="checkbox" class="tick" data-sched="${k}" ${d.sched?.[k] ? 'checked' : ''}> ${L('صلّيت في وقتها', 'Prayed on time')}</label>` : ''}</div>`).join('')}</div>
  <div class="two">
    <div class="card"><div class="head"><h2>${L('اتجاه القبلة', 'Qibla direction')}</h2><button class="btn ghost sm" type="button" id="compassBtn">${compassOn ? L('وقّف البوصلة', 'Stop compass') : L('شغّل البوصلة', 'Use compass')}</button></div>
      <div class="compass"><svg viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="92" fill="var(--panel-2)" stroke="var(--line)" stroke-width="2"/>${['N', 'E', 'S', 'W'].map((c, i) => `<text x="${100 + 78 * Math.sin(i * Math.PI / 2)}" y="${104 - 78 * Math.cos(i * Math.PI / 2)}" text-anchor="middle" font-size="13" fill="var(--ink-3)">${c}</text>`).join('')}<g transform="rotate(${arrow} 100 100)" id="qArrow"><path d="M100 22 L112 100 L100 92 L88 100 Z" fill="var(--fire)"/><path d="M100 178 L112 100 L100 108 L88 100 Z" fill="var(--panel-3)"/></g><circle cx="100" cy="100" r="6" fill="var(--ink)"/></svg></div>
      <p class="muted small" style="text-align:center;margin:8px 0 0">${L('القبلة', 'Qibla')}: <b class="num">${fmt(q, 0)}°</b> ${L('من الشمال', 'from north')}. ${compassOn ? L('امسك الموبايل مفرود.', 'Hold the phone flat.') : L('من غير البوصلة: السهم محسوب من الشمال الحقيقي.', 'Without the compass the arrow points from true north.')}</p></div>
    <div class="card"><div class="head"><h2>${L('الأذكار', 'Adhkar')}</h2></div><div class="tiles">${ADHKAR_DAILY.map(k => [k, ADHKAR[k]]).map(([k, v]) => `<button class="tile" type="button" data-adhkar="${k}"><b>${esc(LX(v.t))}</b><span>${esc(LX(v.when))}</span></button>`).join('')}</div></div>
  </div>
  <div class="card"><div class="head"><h2>${L('مواقيت 30 يوم', '30-day timetable')}</h2><span class="muted small">${L('طريقة أم القرى', 'Umm al-Qura method')}</span></div><div class="tablewrap"><table class="t"><thead><tr><th>${L('اليوم', 'Day')}</th>${['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => `<th>${LANG === 'en' ? PRAYER_NAMES[k][1] : PRAYER_NAMES[k][0]}</th>`).join('')}</tr></thead><tbody>${month}</tbody></table></div></div>`;
}, after(){ clearInterval(prayerTick); if (CUR === todayISO()) prayerTick = setInterval(() => { if (VIEW !== 'prayer') return clearInterval(prayerTick); const el = $('#pCount'); if (!el) return; const pt = prayerTimes(CUR), n = new Date(), nm = n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60; let at = PRAYER_KEYS.map(k => pt[k]).find(m => m > nm); if (at === undefined) at = prayerTimes(addDays(CUR, 1)).fajr + 1440; const left = at - nm; el.textContent = `${Math.floor(left / 60)}:${pad2(Math.floor(left % 60))}:${pad2(Math.floor((left * 60) % 60))}`; if (left < 0.02) render(); }, 1000); }, leave(){ clearInterval(prayerTick); }});
let prayerTick = null;
function onOrient(e){ const h = e.webkitCompassHeading ?? (e.absolute || e.type === 'deviceorientationabsolute' ? 360 - (e.alpha || 0) : null); if (h === null) return; heading = h; const g = $('#qArrow'); if (g) g.setAttribute('transform', `rotate(${(P.qibla(S.settings.lat, S.settings.lng) - h + 360) % 360} 100 100)`); }
on('click', e => {
  if (e.target.id === 'compassBtn') { compassOn = !compassOn; const ev = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'; if (compassOn) window.addEventListener(ev, onOrient); else { window.removeEventListener(ev, onOrient); heading = null; } render(); return true; }
  const a = e.target.closest('[data-adhkar]'); if (a) { ADHKAR_CAT = a.dataset.adhkar; go('adhkar'); return true; }
});

/* ---------- adhkar view: hub of every category, search, counters ---------- */
let ADHKAR_CAT = null, AQ = '', AFOCUS = null;
function autoCat(){ const pt = prayerTimes(todayISO()), n = new Date(), m = n.getHours() * 60 + n.getMinutes(); if (m >= pt.fajr && m < pt.dhuhr) return 'morning'; if (m >= pt.asr && m < pt.isha + 60) return 'evening'; if (m >= 1260 || m < pt.fajr) return 'sleep'; return 'prayer'; }
const adhNorm = s => String(s || '').replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').toLowerCase();
function dhikrText(it){
  if (!it.q) return it.t || '';
  if (!QURAN) { loadQuran().then(() => (VIEW === 'adhkar') && render()); return '…'; }
  const s = QURAN[it.q[0] - 1], from = (it.q[1] || 1) - 1, to = it.q[2] || s[3].length;
  return (it.q[0] !== 9 && it.q[0] !== 1 && (it.q[1] || 1) === 1 ? 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ' : '') + s[3].slice(from, to).map((v, j) => v + ' ﴾' + arDigits(from + j + 1) + '﴿').join(' ');
}
function adhkarProgress(cat, iso){ const set = ADHKAR[cat], cnt = (S.adhkar[iso || todayISO()] || {})[cat] || {}; const done = set.items.filter((it, i) => (cnt[i] || 0) >= it.n).length; return {done, total: set.items.length, p: done / set.items.length}; }
function adhkarHub(){
  const now = autoCat(), fs = S.settings.adhkarFs || 1;
  const daily = ADHKAR_DAILY.map(k => { const p = adhkarProgress(k); return `<button class="tile adh-day" type="button" data-acat="${k}"><span class="ico">${ring(p.p, 44, 5, p.p >= 1 ? 'var(--good)' : 'var(--fire)')}</span><b>${esc(LX(ADHKAR[k].t))}</b><span dir="ltr">${p.done} / ${p.total}</span></button>`; }).join('');
  let results = '';
  if (AQ.trim().length >= 2) {
    const q = adhNorm(AQ.trim()), hits = [];
    for (const [k, v] of Object.entries(ADHKAR)) v.items.forEach((it, i) => { const hay = adhNorm((it.t || '') + ' ' + LX(it.h) + ' ' + (it.h?.ar || '') + ' ' + LX(v.t) + ' ' + (it.q && QURAN ? dhikrText(it) : '')); if (hay.includes(q)) hits.push({k, i, it}); });
    results = `<div class="card"><div class="head"><h2>${L('نتايج البحث', 'Results')}</h2><span class="muted small">${hits.length}</span></div>${hits.slice(0, 40).map(h => `<button class="adh-hit" type="button" data-afocus="${h.k}|${h.i}"><span class="eyebrow">${esc(LX(ADHKAR[h.k].t))}${h.it.h ? ' · ' + esc(LX(h.it.h)) : ''}</span><span class="adh-hit-t" lang="ar">${esc(dhikrText(h.it).slice(0, 140))}${dhikrText(h.it).length > 140 ? '…' : ''}</span></button>`).join('') || `<div class="empty">${L('مفيش نتايج. جرّب كلمة تانية.', 'No results. Try another word.')}</div>`}</div>`;
  }
  const groups = ADHKAR_GROUPS.filter(g => g.k !== 'day').map(g => `<div class="card"><div class="head"><h2>${esc(LX(g.t))}</h2></div><div class="tiles">${g.cats.map(k => `<button class="tile" type="button" data-acat="${k}"><b>${esc(LX(ADHKAR[k].t))}</b><span>${ADHKAR[k].items.length} ${L('ذكر', 'items')} · ${esc(LX(ADHKAR[k].when)).slice(0, 48)}</span></button>`).join('')}</div></div>`).join('');
  const total = Object.values(ADHKAR).reduce((s, v) => s + v.items.length, 0);
  return topbar(L('الأذكار', 'Adhkar'), L(`${total} ذكر ودعاء على ترتيب حصن المسلم`, `${total} adhkar and duas, arranged as in Hisn al-Muslim`), `<button class="btn fire sm" type="button" data-acat="${now}">${L('أذكار الوقت ده', 'Adhkar for now')}: ${esc(LX(ADHKAR[now].t))}</button>`, true) + `
  <div class="card"><div class="head"><h2>${L('أذكار اليوم والليلة', 'Today’s core adhkar')}</h2><button class="btn ghost sm" type="button" data-v="tasbeeh">${L('السبحة', 'Tasbeeh')}</button></div><div class="tiles">${daily}</div></div>
  <div class="card"><input type="search" id="adhSearch" value="${esc(AQ)}" placeholder="${L('دوّر على ذكر أو دعاء: سفر، مطر، هم، نوم، مريض…', 'Search: travel, rain, worry, sleep, sick…')}"></div>
  ${results}${groups}
  <p class="muted small">${L('النصوص من القرآن والسنة كما في "حصن المسلم" لسعيد بن وهف القحطاني، والآيات من نص المصحف. المصدر مكتوب تحت كل ذكر.', 'Texts from the Quran and Sunnah as in “Hisn al-Muslim” by Saʿid al-Qahtani; verses from the Mushaf text. The source is shown under each item.')}</p>`;
}
registerView('adhkar', {title: {ar: 'الأذكار', en: 'Adhkar'}, icon: 'adhkar', render(){
  if (!ADHKAR_CAT || !ADHKAR[ADHKAR_CAT]) return adhkarHub();
  const cat = ADHKAR_CAT, set = ADHKAR[cat], today = todayISO(), fs = S.settings.adhkarFs || 1;
  const cnt = ((S.adhkar[today] ||= {})[cat] ||= {});
  const items = set.items.map((it, i) => {
    const txt = dhikrText(it), done = cnt[i] || 0, full = done >= it.n;
    return `<div class="card dhikr ${full ? 'is-done' : ''}" id="dk-${i}">${it.h ? `<div class="eyebrow">${esc(LX(it.h))}</div>` : ''}<div class="txt ${it.plain ? 'plain' : ''}" dir="rtl" lang="ar" style="font-size:${fs}em" data-dtap="${i}">${esc(txt)}</div>
      ${it.note ? `<div class="muted small">💡 ${esc(LX(it.note))}</div>` : ''}${it.f ? `<div class="adh-fadl">✨ ${esc(LX(it.f))}</div>` : ''}${LANG === 'en' && it.m ? `<div class="muted small">${esc(it.m)}</div>` : ''}
      <div class="cnt"><button type="button" class="tap ${full ? 'done' : ''}" data-dtap="${i}" dir="ltr">${full ? L('تم ✓', 'Done ✓') : `${done} / ${it.n}`}</button>${done ? `<button type="button" class="link" data-dreset="${i}">${L('من الأول', 'Reset')}</button>` : ''}<span class="muted small">${it.n > 1 ? L('التكرار', 'Repeat') + ': ' + it.n : ''}${it.src ? ` · ${L('المصدر', 'Source')}: ${esc(it.src)}` : ''}</span></div>
      ${!full ? `<div class="bar-prog thin"><i style="width:${Math.min(100, done / it.n * 100)}%"></i></div>` : ''}</div>`;
  }).join('');
  const p = adhkarProgress(cat);
  const others = ADHKAR_GROUPS.find(g => g.cats.includes(cat))?.cats || [];
  return topbar(LX(set.t), LX(set.when), `<span class="pill ${p.done === p.total ? 'green' : 'fire'}" dir="ltr">${p.done} / ${p.total}</span>`, true) + `
  <div class="row adh-tools"><button class="btn ghost sm" type="button" data-ahub="1">${L('→ كل الأذكار', '← All adhkar')}</button><span class="seg">${others.map(k => `<button type="button" data-acat="${k}" aria-pressed="${k === cat}">${esc(LX(ADHKAR[k].t))}</button>`).join('')}</span>
    <span class="grow"></span><button class="btn ghost sm" type="button" data-afs="-1" aria-label="${L('تصغير الخط', 'Smaller text')}">A−</button><button class="btn ghost sm" type="button" data-afs="1" aria-label="${L('تكبير الخط', 'Larger text')}">A+</button><button class="btn ghost sm" type="button" data-aresetall="1">${L('صفّر الكل', 'Reset all')}</button></div>
  <div class="bar-prog" style="margin:4px 0 14px"><i style="width:${p.p * 100}%"></i></div>
  ${p.done === p.total ? `<div class="banner good">🤍 ${L('خلصت ' + LX(set.t) + '. تقبّل الله منك.', 'You completed ' + LX(set.t) + '. May Allah accept it.')}</div>` : ''}
  ${items}
  <p class="muted small">${L('دوس على نص الذكر نفسه أو على العدّاد علشان تعد. الموبايل بيهز مع كل عدة.', 'Tap the text or the counter to count; the phone vibrates with each tap.')}</p>`;
}, leave(){ ADHKAR_CAT = null; AQ = ''; }, after(){ if (AFOCUS !== null) { const el = document.getElementById('dk-' + AFOCUS); AFOCUS = null; if (el) setTimeout(() => el.scrollIntoView({block: 'center'}), 30); } }});
on('click', e => {
  const T = e.target;
  const c = T.closest('[data-acat]'); if (c) { ADHKAR_CAT = c.dataset.acat; if (VIEW !== 'adhkar') go('adhkar'); else { render(); window.scrollTo({top: 0}); } return true; }
  if (T.closest('[data-ahub]')) { ADHKAR_CAT = null; render(); window.scrollTo({top: 0}); return true; }
  const fo = T.closest('[data-afocus]'); if (fo) { const [k, i] = fo.dataset.afocus.split('|'); ADHKAR_CAT = k; AFOCUS = +i; render(); return true; }
  const fs = T.closest('[data-afs]'); if (fs) { S.settings.adhkarFs = Math.min(1.8, Math.max(0.8, (S.settings.adhkarFs || 1) + 0.1 * +fs.dataset.afs)); store.save(); render(); return true; }
  if (T.closest('[data-aresetall]')) { (S.adhkar[todayISO()] ||= {})[ADHKAR_CAT] = {}; store.save(); render(); return true; }
  const tp = T.closest('[data-dtap]'); if (tp && VIEW === 'adhkar' && ADHKAR_CAT) { if (getSelection && String(getSelection()).length > 2) return true; const cat = ADHKAR_CAT, cnt = ((S.adhkar[todayISO()] ||= {})[cat] ||= {}), i = +tp.dataset.dtap, it = ADHKAR[cat].items[i]; if ((cnt[i] || 0) >= it.n) return true; cnt[i] = (cnt[i] || 0) + 1; if (navigator.vibrate) try { navigator.vibrate(cnt[i] >= it.n ? [30, 40, 30] : 12); } catch (er) {} if (cnt[i] >= it.n) beep(740, .06, 1); store.save(); render(); if (cnt[i] >= it.n) { const nx = ADHKAR[cat].items.findIndex((x, j) => j > i && (cnt[j] || 0) < x.n); const el = document.getElementById('dk-' + nx); if (nx > 0 && el) setTimeout(() => el.scrollIntoView({block: 'center', behavior: reduceMotion ? 'auto' : 'smooth'}), 120); } return true; }
  const rs = T.closest('[data-dreset]'); if (rs) { S.adhkar[todayISO()][ADHKAR_CAT][+rs.dataset.dreset] = 0; store.save(); render(); return true; }
});
on('input', e => { if (e.target.id === 'adhSearch') { AQ = e.target.value; clearTimeout(on._aq); on._aq = setTimeout(() => { const pos = e.target.selectionStart; render(); const el = $('#adhSearch'); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }, 300); return true; } });

/* ---------- tasbeeh (electronic prayer beads) ---------- */
const TASBEEH = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'اللَّهُ أَكْبَرُ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'أَسْتَغْفِرُ اللَّهَ', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ'];
registerView('tasbeeh', {title: {ar: 'السبحة', en: 'Tasbeeh'}, icon: 'adhkar', render(){
  const T = S.tasbeeh ||= {sel: 0, target: 33, cur: 0, log: {}, total: 0, custom: []};
  const list = [...TASBEEH, ...(T.custom || [])], phrase = list[T.sel] || list[0], today = T.log[todayISO()] || {}, todaySum = Object.values(today).reduce((s, v) => s + v, 0);
  const tg = T.target || 0, p = tg ? (T.cur % tg) / tg : 0, rounds = tg ? Math.floor(T.cur / tg) : 0;
  return topbar(L('السبحة الإلكترونية', 'Electronic tasbeeh'), L('دوس على الدايرة أو أي مكان فيها', 'Tap the circle'), `<span class="pill fire" dir="ltr">${L('النهارده', 'Today')} ${todaySum}</span>`, true) + `
  <div class="two"><div class="card tas-card">
    <div class="tas-phrase" lang="ar">${esc(phrase)}</div>
    <button type="button" class="tas-btn" id="tasTap" aria-label="${L('سبّح', 'Count')}">${ring(tg ? (T.cur % tg === 0 && T.cur ? 1 : p) : 0, 240, 14, 'var(--fire)')}<span><b class="num">${tg ? (T.cur % tg === 0 && T.cur ? tg : T.cur % tg) : T.cur}</b><small dir="ltr">${tg ? '/ ' + tg : '∞'}${rounds ? ' · ' + L('دورة', 'round') + ' ' + rounds : ''}</small></span></button>
    <div class="row" style="justify-content:center"><button class="btn ghost sm" type="button" id="tasReset">${L('صفّر', 'Reset')}</button><span class="seg">${[33, 99, 100, 1000, 0].map(v => `<button type="button" data-tastg="${v}" aria-pressed="${tg === v}">${v || '∞'}</button>`).join('')}</span></div></div>
  <div class="card"><div class="head"><h2>${L('اختار الذكر', 'Choose the dhikr')}</h2></div><div class="tas-list">${list.map((x, i) => `<button type="button" data-tassel="${i}" aria-pressed="${i === T.sel}" lang="ar"><span>${esc(x)}</span><small class="num">${today[x] || 0}</small></button>`).join('')}</div>
    <div class="row" style="margin-top:12px"><input type="text" id="tasNew" placeholder="${L('ضيف ذكر من عندك', 'Add your own dhikr')}"><button class="btn sm" type="button" id="tasAdd">${L('ضيف', 'Add')}</button></div>
    <div class="kpis" style="margin-top:14px"><div class="kpi"><div class="l">${L('مجموع النهارده', 'Today')}</div><div class="v">${todaySum}</div></div><div class="kpi"><div class="l">${L('المجموع الكلي', 'All time')}</div><div class="v">${fmt(T.total || 0, 0)}</div></div></div></div></div>`;
}});
on('click', e => {
  const T = S.tasbeeh ||= {sel: 0, target: 33, cur: 0, log: {}, total: 0, custom: []}, el = e.target;
  if (el.closest('#tasTap')) { const list = [...TASBEEH, ...(T.custom || [])], ph = list[T.sel] || list[0], d = T.log[todayISO()] ||= {}; T.cur++; d[ph] = (d[ph] || 0) + 1; T.total = (T.total || 0) + 1; const hit = T.target && T.cur % T.target === 0; if (navigator.vibrate) try { navigator.vibrate(hit ? [40, 60, 40] : 10); } catch (er) {} if (hit) beep(760, .08, 2); store.save(); render(); return true; }
  if (el.id === 'tasReset') { T.cur = 0; store.save(); render(); return true; }
  const tg = el.closest('[data-tastg]'); if (tg) { T.target = +tg.dataset.tastg; T.cur = 0; store.save(); render(); return true; }
  const sl = el.closest('[data-tassel]'); if (sl) { T.sel = +sl.dataset.tassel; T.cur = 0; store.save(); render(); return true; }
  if (el.id === 'tasAdd') { const v = $('#tasNew').value.trim(); if (v) { (T.custom ||= []).push(v); T.sel = TASBEEH.length + T.custom.length - 1; T.cur = 0; store.save(); render(); } return true; }
});

/* ---------- Quran ---------- */
let QV = {mode: 'index', s: 1, q: ''};
registerView('quran', {title: {ar: 'المصحف', en: 'Quran'}, icon: 'quran', render(){
  if (!QURAN) { loadQuran().then(() => VIEW === 'quran' && render()); return topbar(L('المصحف الشريف', 'The Noble Quran'), '', '', true) + `<div class="card empty">${L('جاري تحميل المصحف…', 'Loading the Mushaf…')}</div>`; }
  const bm = S.quran.bookmark, wird = S.quran.wird || 5, readToday = S.quran.log?.[todayISO()] || 0;
  if (QV.mode === 'read') return quranReader();
  let list = QURAN.map((s, i) => ({i: i + 1, s}));
  if (QV.q) { const q = QV.q.trim(); list = list.filter(x => x.s[0].includes(q) || x.s[1].toLowerCase().includes(q.toLowerCase()) || String(x.i) === q); }
  const results = QV.q && QV.q.trim().length >= 3 ? searchAyat(QV.q.trim()) : [];
  return topbar(L('المصحف الشريف', 'The Noble Quran'), L('نص المصحف كامل بالرسم العثماني، بيشتغل من غير نت', 'The full Uthmani text, available offline'), '', true) + `
  <div class="kpis">
    <div class="kpi"><div class="l">${L('وقفت عند', 'Last read')}</div><div class="v" style="font-size:1.15rem">${bm ? `${esc(QURAN[bm.s - 1][0])} · ${L('آية', 'v.')} ${bm.a}` : '—'}</div>${bm ? `<button class="btn fire sm" type="button" data-qopen="${bm.s}|${bm.a}" style="margin-top:8px">${L('كمّل القراءة', 'Continue')}</button>` : ''}</div>
    <div class="kpi"><div class="l">${L('ورد اليوم', 'Today’s portion')}</div><div class="v">${readToday} <small>/ ${wird} ${L('صفحات تقريبًا', 'pages approx.')}</small></div><div class="bar-prog" style="margin-top:8px"><i style="width:${Math.min(100, readToday / wird * 100)}%"></i></div></div>
    <div class="kpi"><div class="l">${L('الورد اليومي', 'Daily target')}</div><div class="row" style="margin-top:6px"><span class="counter"><button type="button" data-wird="-1">−</button><b>${wird}</b><button type="button" data-wird="1">+</button></span><span class="muted small">${L('صفحة', 'pages')}</span></div></div>
  </div>
  <div class="card"><div class="head"><h2>${L('الأجزاء', 'Juz')}</h2></div><div class="seg" style="flex-wrap:wrap">${JUZ.map((j, i) => `<button type="button" data-qopen="${j[0]}|${j[1]}">${L('الجزء', 'Juz')} ${i + 1}</button>`).join('')}</div></div>
  <div class="card"><div class="head"><h2>${L('السور', 'Surahs')}</h2><input type="text" id="qSearch" value="${esc(QV.q)}" placeholder="${L('دوّر على سورة أو كلمة في الآيات', 'Search a surah or a word in the verses')}" style="max-width:340px"></div>
    ${results.length ? `<div class="news" style="margin-bottom:14px">${results.slice(0, 40).map(r => `<a class="item" href="#" data-qopen="${r.s}|${r.a}"><span class="src">${esc(QURAN[r.s - 1][0])} · ${r.a}</span><span dir="rtl" lang="ar" style="font-family:'Amiri',serif;font-size:1.1rem">${esc(r.t)}</span></a>`).join('')}${results.length > 40 ? `<span class="muted small">${L('أول 40 نتيجة من', 'First 40 of')} ${results.length}</span>` : ''}</div>` : ''}
    <div class="surah-list">${list.map(x => `<button type="button" data-qopen="${x.i}|1"><i>${x.i}</i><div><b>${esc(x.s[0])}</b><span>${esc(x.s[1])} · ${x.s[3].length} ${L('آية', 'verses')} · ${x.s[2] === 'meccan' ? L('مكية', 'Meccan') : L('مدنية', 'Medinan')}</span></div></button>`).join('')}</div></div>
  <p class="muted small">${L('نص المصحف من موسوعة القرآن الكريم (QuranEnc) عن طريق مشروع quran-json برخصة CC BY 4.0.', 'Mushaf text from The Noble Quran Encyclopedia (QuranEnc) via the quran-json project, CC BY 4.0.')}</p>`;
}});
const stripTashkeel = s => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
let _qIndex = null;
function searchAyat(q){ if (!QURAN) return []; _qIndex ||= QURAN.flatMap((s, i) => s[3].map((v, j) => ({s: i + 1, a: j + 1, t: v, n: stripTashkeel(v)}))); const nq = stripTashkeel(q); return _qIndex.filter(x => x.n.includes(nq)); }
function quranReader(){
  const s = QV.s, su = QURAN[s - 1], bm = S.quran.bookmark;
  const verses = su[3].map((v, j) => `<span class="ayah ${bm && bm.s === s && bm.a === j + 1 ? 'mark' : ''}" data-ayah="${j + 1}" id="ay-${j + 1}">${esc(v)}</span><span class="n">${arDigits(j + 1)}</span> `).join('');
  return `<div class="topbar"><div class="grow"><div class="eyebrow">${L('سورة', 'Surah')} ${s} · ${su[3].length} ${L('آية', 'verses')}</div><h1>${esc(su[0])} <span class="muted" style="font-size:.9rem">${esc(su[1])}</span></h1></div>
    <div class="row"><button class="btn ghost sm" type="button" data-qnav="-1" ${s === 1 ? 'disabled' : ''}>${L('السورة اللي قبلها', 'Previous')}</button><button class="btn ghost sm" type="button" data-qnav="1" ${s === 114 ? 'disabled' : ''}>${L('اللي بعدها', 'Next')}</button><button class="btn sm" type="button" data-qindex="1">${L('الفهرس', 'Index')}</button></div></div>
  <div class="card"><p class="muted small" style="margin:0 0 6px">${L('دوس على أي آية علشان تحطها علامة "وقفت هنا". وكل ما تقرا صفحة، دوس "قريت صفحة".', 'Tap any verse to bookmark it. Tap "Read a page" for each page you finish.')}</p>
    ${s !== 1 && s !== 9 ? `<div class="basmala" lang="ar">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>` : ''}
    <div class="mushaf" dir="rtl" lang="ar">${verses}</div>
    <div class="row" style="margin-top:16px;justify-content:center"><button class="btn fire" type="button" id="readPage">${L('قريت صفحة +1', 'Read a page +1')}</button></div></div>`;
}
on('click', e => {
  const o = e.target.closest('[data-qopen]'); if (o) { e.preventDefault(); const [s, a] = o.dataset.qopen.split('|').map(Number); QV = {...QV, mode: 'read', s}; go('quran'); setTimeout(() => { const el = document.getElementById('ay-' + a); if (el && a > 1) el.scrollIntoView({block: 'center'}); }, 50); return true; }
  const n = e.target.closest('[data-qnav]'); if (n) { QV.s = Math.min(114, Math.max(1, QV.s + +n.dataset.qnav)); render(); window.scrollTo({top: 0}); return true; }
  if (e.target.closest('[data-qindex]')) { QV.mode = 'index'; render(); window.scrollTo({top: 0}); return true; }
  const ay = e.target.closest('[data-ayah]'); if (ay && VIEW === 'quran') { S.quran.bookmark = {s: QV.s, a: +ay.dataset.ayah}; store.save(); $$('.ayah.mark').forEach(x => x.classList.remove('mark')); ay.classList.add('mark'); toast(L('اتحفظت علامة "وقفت هنا"', 'Bookmark saved')); return true; }
  if (e.target.id === 'readPage') { S.quran.log ||= {}; S.quran.log[todayISO()] = (S.quran.log[todayISO()] || 0) + 1; const d = day(todayISO()); d.quran = (num(d.quran) || 0) + 3; store.save(); toast(L(`قريت ${S.quran.log[todayISO()]} صفحة النهارده`, `${S.quran.log[todayISO()]} page(s) today`)); return true; }
  const w = e.target.closest('[data-wird]'); if (w) { S.quran.wird = Math.max(1, (S.quran.wird || 5) + +w.dataset.wird); store.save(); render(); return true; }
});
on('input', e => { if (e.target.id === 'qSearch') { QV.q = e.target.value; clearTimeout(QV.t); QV.t = setTimeout(() => { const pos = e.target.selectionStart; render(); const el = $('#qSearch'); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }, 350); return true; } });
