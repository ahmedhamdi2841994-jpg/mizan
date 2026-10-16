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
    <div class="card"><div class="head"><h2>${L('الأذكار', 'Adhkar')}</h2></div><div class="tiles">${Object.entries(ADHKAR).map(([k, v]) => `<button class="tile" type="button" data-adhkar="${k}"><b>${esc(LX(v.t))}</b><span>${esc(LX(v.when))}</span></button>`).join('')}</div></div>
  </div>
  <div class="card"><div class="head"><h2>${L('مواقيت 30 يوم', '30-day timetable')}</h2><span class="muted small">${L('طريقة أم القرى', 'Umm al-Qura method')}</span></div><div class="tablewrap"><table class="t"><thead><tr><th>${L('اليوم', 'Day')}</th>${['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => `<th>${LANG === 'en' ? PRAYER_NAMES[k][1] : PRAYER_NAMES[k][0]}</th>`).join('')}</tr></thead><tbody>${month}</tbody></table></div></div>`;
}, after(){ clearInterval(prayerTick); if (CUR === todayISO()) prayerTick = setInterval(() => { if (VIEW !== 'prayer') return clearInterval(prayerTick); const el = $('#pCount'); if (!el) return; const pt = prayerTimes(CUR), n = new Date(), nm = n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60; let at = PRAYER_KEYS.map(k => pt[k]).find(m => m > nm); if (at === undefined) at = prayerTimes(addDays(CUR, 1)).fajr + 1440; const left = at - nm; el.textContent = `${Math.floor(left / 60)}:${pad2(Math.floor(left % 60))}:${pad2(Math.floor((left * 60) % 60))}`; if (left < 0.02) render(); }, 1000); }, leave(){ clearInterval(prayerTick); }});
let prayerTick = null;
function onOrient(e){ const h = e.webkitCompassHeading ?? (e.absolute || e.type === 'deviceorientationabsolute' ? 360 - (e.alpha || 0) : null); if (h === null) return; heading = h; const g = $('#qArrow'); if (g) g.setAttribute('transform', `rotate(${(P.qibla(S.settings.lat, S.settings.lng) - h + 360) % 360} 100 100)`); }
on('click', e => {
  if (e.target.id === 'compassBtn') { compassOn = !compassOn; const ev = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'; if (compassOn) window.addEventListener(ev, onOrient); else { window.removeEventListener(ev, onOrient); heading = null; } render(); return true; }
  const a = e.target.closest('[data-adhkar]'); if (a) { ADHKAR_CAT = a.dataset.adhkar; go('adhkar'); return true; }
});

/* ---------- adhkar view ---------- */
let ADHKAR_CAT = null;
function autoCat(){ const pt = prayerTimes(todayISO()), n = new Date(), m = n.getHours() * 60 + n.getMinutes(); if (m >= pt.fajr && m < pt.dhuhr) return 'morning'; if (m >= pt.asr && m < pt.isha + 60) return 'evening'; if (m >= 1260 || m < pt.fajr) return 'sleep'; return 'prayer'; }
registerView('adhkar', {title: {ar: 'الأذكار', en: 'Adhkar'}, icon: 'adhkar', render(){
  const cat = ADHKAR_CAT || autoCat(), set = ADHKAR[cat], today = todayISO();
  const cnt = ((S.adhkar[today] ||= {})[cat] ||= {});
  const seg = Object.entries(ADHKAR).map(([k, v]) => `<button type="button" data-acat="${k}" aria-pressed="${k === cat}">${esc(LX(v.t))}</button>`).join('');
  const items = set.items.map((it, i) => {
    let txt = it.t || '';
    if (it.q) { if (!QURAN) { loadQuran().then(() => VIEW === 'adhkar' && render()); txt = '…'; } else { const s = QURAN[it.q[0] - 1], from = (it.q[1] || 1) - 1, to = it.q[2] || s[3].length; txt = (it.q[0] !== 9 && (it.q[1] || 1) === 1 ? 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ' : '') + s[3].slice(from, to).map((v, j) => v + ' \uFD3E' + arDigits(from + j + 1) + '\uFD3F').join(' '); } }
    const done = cnt[i] || 0, full = done >= it.n;
    return `<div class="card dhikr">${it.h ? `<div class="eyebrow">${esc(LX(it.h))}</div>` : ''}<div class="txt" dir="rtl" lang="ar">${esc(txt)}</div>${LANG === 'en' && it.m ? `<div class="muted small">${esc(it.m)}</div>` : ''}
      <div class="cnt"><button type="button" class="tap ${full ? 'done' : ''}" data-dtap="${i}" dir="ltr">${full ? L('تم ✓', 'Done ✓') : `${done} / ${it.n}`}</button>${done ? `<button type="button" class="link" data-dreset="${i}">${L('من الأول', 'Reset')}</button>` : ''}<span class="muted small">${L('العدد', 'Count')}: ${it.n}</span></div></div>`;
  }).join('');
  const total = set.items.length, finished = set.items.filter((it, i) => (cnt[i] || 0) >= it.n).length;
  return topbar(LX(set.t), LX(set.when), `<span class="pill ${finished === total ? 'green' : 'fire'}" dir="ltr">${finished} / ${total}</span>`, true) + `
  <div class="seg">${seg}</div>${items}
  <p class="muted small">${L('النصوص من الأذكار الواردة في القرآن والسنة الصحيحة، والآيات من نص المصحف. للمصادر والفضائل راجع كتاب "حصن المسلم".', 'Texts are adhkar from the Quran and authentic Sunnah; verses come from the Mushaf text. See "Hisn al-Muslim" for sources and virtues.')}</p>`;
}});
on('click', e => {
  const c = e.target.closest('[data-acat]'); if (c) { ADHKAR_CAT = c.dataset.acat; render(); return true; }
  const tp = e.target.closest('[data-dtap]'); if (tp) { const cat = ADHKAR_CAT || autoCat(), cnt = S.adhkar[todayISO()][cat], i = +tp.dataset.dtap, it = ADHKAR[cat].items[i]; cnt[i] = Math.min(it.n, (cnt[i] || 0) + 1); if (navigator.vibrate) try { navigator.vibrate(cnt[i] >= it.n ? [30, 40, 30] : 12); } catch (er) {} if (cnt[i] >= it.n) beep(740, .06, 1); store.save(); render(); return true; }
  const rs = e.target.closest('[data-dreset]'); if (rs) { const cat = ADHKAR_CAT || autoCat(); S.adhkar[todayISO()][cat][+rs.dataset.dreset] = 0; store.save(); render(); return true; }
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
