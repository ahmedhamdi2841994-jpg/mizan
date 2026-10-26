/* ميزان — core: helpers, language, state, storage, navigation, shared UI */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad2 = n => String(n).padStart(2, '0');
const isoOf = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const todayISO = () => isoOf(new Date());
const D = iso => new Date(iso + 'T12:00:00');
const addDays = (iso, n) => { const d = D(iso); d.setDate(d.getDate() + n); return isoOf(d); };
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 864e5);
const num = v => (v === '' || v === null || v === undefined || isNaN(+v)) ? null : +v;
const avg = a => { const x = a.filter(v => v !== null && v !== undefined && !isNaN(v)); return x.length ? x.reduce((s, v) => s + v, 0) / x.length : null; };
const fmt = (v, d = 1) => v === null || v === undefined || isNaN(v) ? '—' : (+v).toLocaleString('en-US', {maximumFractionDigits: d});
const r50 = v => Math.round(v / 50) * 50, r5 = v => Math.round(v / 5) * 5;
const t2m = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const reduceMotion = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

/* ---------- language ---------- */
let LANG = 'ar';
const L = (ar, en) => LANG === 'en' ? (en ?? ar) : ar;
const LX = o => o == null ? '' : typeof o === 'string' ? o : (LANG === 'en' ? (o.en ?? o.ar) : o.ar);
const WD = () => LANG === 'en' ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] : ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const locale = () => LANG === 'en' ? 'en-GB' : 'ar-EG-u-nu-latn';
const dShort = iso => D(iso).toLocaleDateString(locale(), {day: 'numeric', month: 'short'});
const dLong = iso => D(iso).toLocaleDateString(locale(), {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
const dHijri = iso => { try { return D(iso).toLocaleDateString((LANG === 'en' ? 'en' : 'ar-SA') + '-u-ca-islamic-umalqura-nu-latn', {day: 'numeric', month: 'long', year: 'numeric'}); } catch (e) { return ''; } };
const m2t = m => { m = ((m % 1440) + 1440) % 1440; let h = Math.floor(m / 60); const mm = Math.round(m % 60), ap = h >= 12 ? L('م', 'PM') : L('ص', 'AM'); h = h % 12 || 12; return h + ':' + pad2(mm) + ' ' + ap; };
function applyLang(){
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'en' ? 'ltr' : 'rtl';
  $('#app').dir = document.documentElement.dir;
  renderBrand();
  $('#timerLbl').textContent = L('راحة', 'Rest'); $('#timerStop').textContent = L('تخطّي', 'Skip');
}

/* ---------- brand: زاد with two editions, يحيا (men) and بتول (women) ---------- */
const BRAND = {men: ['#081638', '#1747D8', '#22C3F0', '#7FE3FF'], women: ['#3A1446', '#C2459B', '#FFA9C9', '#FFD6E8']};
const EDN = {men: ['يحيا', 'Yahya'], women: ['بتول', 'Batool']};
const edName = ed => LX({ar: EDN[ed || 'men'][0], en: EDN[ed || 'men'][1]});
function brandMark(size, ed){
  const c = BRAND[ed] || BRAND.men, id = 'bm' + Math.random().toString(36).slice(2, 7);
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient><radialGradient id="${id}h" cx=".62" cy=".38" r=".55"><stop offset="0" stop-color="${c[3]}" stop-opacity=".55"/><stop offset="1" stop-color="${c[3]}" stop-opacity="0"/></radialGradient></defs><rect width="512" height="512" rx="116" fill="url(#${id}g)"/><rect width="512" height="512" rx="116" fill="url(#${id}h)"/><path d="M312 176 L372 160 C 418 234, 408 330, 338 392 C 280 444, 196 456, 116 424 C 210 418, 278 386, 312 330 C 344 278, 346 222, 312 176 Z" fill="#fff"/><path d="M300 66 Q 312 104 350 116 Q 312 128 300 166 Q 288 128 250 116 Q 288 104 300 66 Z" fill="#fff"/></svg>`;
}
function renderBrand(){
  const ed = S?.settings?.edition || 'men', lg = document.getElementById('brandLogo'), sm = document.getElementById('splashMark');
  if (lg) lg.innerHTML = brandMark(38, ed); if (sm && !sm.innerHTML) sm.innerHTML = brandMark(132, ed);
  const sub = document.getElementById('logoSub'); if (sub) sub.textContent = edName(ed) + ' · ' + L('قوة وصحة وإيمان', 'Strength · Health · Faith');
  const se = document.getElementById('splashEd'); if (se) se.textContent = edName(ed);
}
/* four looks: light, dark, the blue Yahya look and the pink Batool look; "auto" follows the edition */
const THEMES = {auto: ['حسب النسخة', 'Match edition'], light: ['فاتح', 'Light'], dark: ['داكن', 'Dark'], yahya: ['أزرق يحيا', 'Yahya blue'], batool: ['بينك بتول', 'Batool pink']};
const themeNow = () => { const t = S.settings.theme; return !t || t === 'auto' ? (S.settings.edition === 'women' ? 'batool' : 'yahya') : t; };

/* ---------- state ---------- */
const DEF_SETTINGS = { lang: 'ar', theme: 'auto', edition: 'men', city: 'riyadh', lat: 24.7136, lng: 46.6753, tz: 3, cityName: 'الرياض', country: 'sa', asr: 1, ishaRamadan: true, workEnd: '16:00', gymTime: '17:00', courseDays: [], courseTime: '20:30', courseName: '',
  notify: { prayer: true, preAdhan: 10, adhkar: true, meals: true, water: true, waterEvery: 90, tea: true, gym: true, sleep: true, weigh: true, prep: true, course: true, adhan: 'default', tasks: true, meds: true, events: true, shop: true, bills: true, habits: true, fasting: true, khatma: true, journal: false }, newsSources: null, sound: true };
const DEF_PROFILE = { name: '', sex: 'm', age: null, height: null, weight: null, goal: null, act: 1.375, gymdays: 3, def: 0, start: todayISO(), conds: [], meds: [], allergies: [], injuries: [], dislikes: [] };
let S = { settings: {...DEF_SETTINGS}, profile: {...DEF_PROFILE}, days: {}, labs: [], games: {}, quran: {}, adhkar: {}, women: {}, onboarded: false };
const LS = 'mizan-app-v1'; /* kept from the Mizan days so existing data carries over */
const store = {
  t: null,
  load(){ try { const r = localStorage.getItem(LS); if (!r) return; const j = JSON.parse(r); S = {...S, ...j, settings: {...DEF_SETTINGS, ...(j.settings || {}), notify: {...DEF_SETTINGS.notify, ...((j.settings || {}).notify || {})}}}; if (!S.settings.themeV4) { if (!S.settings.themeSet) S.settings.theme = 'auto'; S.settings.themeV4 = true; } } catch (e) {} },
  save(){ clearTimeout(this.t); this.t = setTimeout(() => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { toast(L('مساحة التخزين مليانة. صدّر نسخة احتياطية وامسح القديم.', 'Storage is full. Export a backup and clear old data.')); } }, 300); },
  now(){ clearTimeout(this.t); try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
};
const day = iso => (S.days[iso] ||= {});
const dayOf = (iso, src) => (src || S).days[iso] || {};

/* IndexedDB for big files (PDF books, custom adhan audio) */
const idb = {
  db: null,
  open(){ return this.db ? Promise.resolve(this.db) : new Promise((res, rej) => { const r = indexedDB.open('mizan-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('files'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async put(k, v){ const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
  async get(k){ const db = await this.open(); return new Promise((res, rej) => { const r = db.transaction('files').objectStore('files').get(k); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async del(k){ const db = await this.open(); return new Promise(res => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(k); tx.oncomplete = res; }); }
};

/* ---------- shared UI ---------- */
function toast(m){ const t = $('#toast'); t.textContent = m; t.hidden = false; t.setAttribute('role', 'status'); if (typeof voiceToast === 'function') voiceToast(m); clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2600); }
function ring(v, size, sw, color){
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, v || 0)));
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--panel-3)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`;
}
let CUR = todayISO();
function topbar(title, sub, extra, noDate){
  const prev = LANG === 'en' ? '‹' : '›', next = LANG === 'en' ? '›' : '‹';
  return `<div class="topbar"><div class="grow"><div class="eyebrow">${esc(sub || '')}</div><h1>${title}</h1></div>${typeof famChip === 'function' && S.onboarded ? famChip() : ''}${extra || ''}
    ${noDate ? '' : `<div class="datebox"><button type="button" data-shift="-1" aria-label="${L('اليوم اللي قبله','Previous day')}">${prev}</button><input type="date" id="curDate" value="${CUR}" aria-label="${L('التاريخ','Date')}"><button type="button" data-shift="1" aria-label="${L('اليوم اللي بعده','Next day')}">${next}</button></div>`}</div>`;
}
function openSheet(html){ $('#sheetIn').innerHTML = html; $('#sheet').hidden = false; }
function closeSheet(){ $('#sheet').hidden = true; $('#sheet').classList.remove('ai'); }
let timerT = null;
function startTimer(sec){ const el = $('#timer'), v = $('#timerVal'); let left = sec; clearInterval(timerT); el.hidden = false;
  const tick = () => { v.textContent = Math.floor(left / 60) + ':' + pad2(left % 60); if (left-- <= 0) { clearInterval(timerT); el.hidden = true; beep(); toast(L('يلا المجموعة اللي جاية 💪', 'Next set, go 💪')); } }; tick(); timerT = setInterval(tick, 1000); }
let actx = null;
function beep(freq = 880, dur = 0.18, times = 2){
  if (!S.settings.sound) return;
  try { actx ||= new (window.AudioContext || window.webkitAudioContext)(); for (let i = 0; i < times; i++) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = freq; o.connect(g); g.connect(actx.destination); const t = actx.currentTime + i * (dur + 0.08); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02); } } catch (e) {}
}
/* charts */
const CH = {};
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const hexOf = v => { const c = css(v); return /^#[0-9a-f]{6}$/i.test(c) ? c : '#888888'; };
function mk(id, cfg){
  const el = document.getElementById(id); if (!el || !window.Chart) return;
  if (CH[id]) CH[id].destroy();
  const font = {family: css('--font-body'), size: 11}, rtl = LANG !== 'en';
  cfg.options = Object.assign({responsive: true, maintainAspectRatio: false, animation: reduceMotion ? false : {duration: 500}, interaction: {mode: 'index', intersect: false},
    plugins: {legend: {rtl, labels: {color: css('--ink-2'), boxWidth: 8, boxHeight: 8, usePointStyle: true, font}}, tooltip: {rtl, textDirection: rtl ? 'rtl' : 'ltr', backgroundColor: css('--ink'), titleColor: css('--bg'), bodyColor: css('--bg'), padding: 10, cornerRadius: 8, titleFont: font, bodyFont: font}}}, cfg.options || {});
  if (cfg.options.plugins?.legend?.display === false) cfg.options.plugins.legend = {display: false};
  const sc = cfg.options.scales || {x: {}, y: {}};
  Object.values(sc).forEach(s => { s.ticks = Object.assign({color: css('--ink-3'), font, maxRotation: 0, autoSkipPadding: 12}, s.ticks || {}); s.grid = Object.assign({color: css('--line'), drawTicks: false}, s.grid || {}); s.border = {display: false}; });
  if (sc.x && cfg.options.indexAxis !== 'y') sc.x.grid = Object.assign(sc.x.grid, {display: false});
  cfg.options.scales = sc; CH[id] = new Chart(el, cfg);
}
function grad(id, color){ const el = document.getElementById(id); if (!el) return color; const g = el.getContext('2d').createLinearGradient(0, 0, 0, el.parentElement.clientHeight || 300); g.addColorStop(0, color + '55'); g.addColorStop(1, color + '00'); return g; }

/* ---------- icons ---------- */
const IC = {
  today: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  workout: '<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',
  meals: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 6s1 4 3 4v8"/>',
  log: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  insights: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  health: '<path d="M12 21s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
  plan: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5M8 8h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  prayer: '<path d="M12 3c2 2 3 3.5 3 5.5a3 3 0 0 1-6 0C9 6.5 10 5 12 3z"/><path d="M5 21V12h14v9M9 21v-4a3 3 0 0 1 6 0v4"/>',
  adhkar: '<circle cx="12" cy="5" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="17" cy="15" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="7" cy="15" r="2"/><circle cx="7" cy="9" r="2"/>',
  quran: '<path d="M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1z"/><path d="M12 6v14"/>',
  library: '<path d="M4 19V5h4v14M10 19V5h4v14M16 19l2-14 3 .5-2 14"/><path d="M3 19h18"/>',
  news: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h6M7 13h10M7 16h8"/>',
  games: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
  women: '<circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  planner: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/>',
  shop: '<path d="M3 4h2l2.4 11h11l2-8H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  money: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M6 9.5v.01M18 15.5v.01"/>',
  pill: '<rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)"/><path d="M9.5 8.5l5 7"/>',
  events: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  habits: '<path d="M4 12l5 5L20 6"/><path d="M4 6h6M4 20h16"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  zakat: '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  baby: '<circle cx="12" cy="8" r="5"/><path d="M10 7.5h.01M14 7.5h.01M10.5 10a2 2 0 0 0 3 0M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
  pot: '<path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M2 10h20M9 6c0-1 1-2 1-3M14 6c0-1 1-2 1-3"/>',
  calc: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  kb: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5M9 7h7M9 11h5"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  plane: '<path d="M10.5 13.5L3 11l1.5-1.5 8 1 4-4.5c1-1 3-1.5 3.5-1s0 2.5-1 3.5l-4.5 4 1 8L14 22l-2.5-7.5L7 18v3l-1.5 1-1-3.5L1 17.5 2 16h3z"/>',
  scale: '<path d="M12 3v18M5 21h14M4 7h16M4 7l-3 7a3.5 3.5 0 0 0 6 0zM20 7l-3 7a3.5 3.5 0 0 0 6 0z"/>'
};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || IC.more}</svg>`;

/* ---------- router ---------- */
const VIEWS = {};      // id -> {render, title:{ar,en}, icon, group, women?}
let VIEW = 'today';
function registerView(id, def){ VIEWS[id] = def; }
const NAV_GROUPS = [
  {g: {ar: 'يومي', en: 'Daily'}, ids: ['today', 'plan', 'growth', 'workout', 'meals', 'kitchen', 'log']},
  {g: {ar: 'حياتي', en: 'My life'}, ids: ['planner', 'shop', 'money', 'meds', 'events', 'habits']},
  {g: {ar: 'أدوات', en: 'Tools'}, ids: ['kb', 'calc', 'routes', 'travel', 'decide']},
  {g: {ar: 'الإيمان', en: 'Faith'}, ids: ['prayer', 'adhkar', 'tasbeeh', 'quran', 'khatma', 'hijri', 'zakat']},
  {g: {ar: 'المعرفة والتسلية', en: 'Mind & fun'}, ids: ['nasheed', 'library', 'news', 'games']},
  {g: {ar: 'المتابعة', en: 'Tracking'}, ids: ['women', 'insights', 'health', 'notify', 'settings']}
];
const BOTTOM = ['today', 'workout', 'meals', 'prayer'];
function visibleView(id){ const v = VIEWS[id]; if (!v) return false; if (v.when && !v.when()) return false; if (v.women && typeof stageNow === 'function') { const st = stageNow(); if (st.minor && (st.m ?? 999) < 108) return false; } return !v.women || S.settings.edition === 'women' || !!S.settings.showWomen; }
function renderNav(){
  let h = '';
  NAV_GROUPS.forEach(gr => { const ids = gr.ids.filter(visibleView); if (!ids.length) return; h += `<div class="grp">${esc(LX(gr.g))}</div>` + ids.map(id => `<button type="button" data-v="${id}" ${VIEW === id ? 'aria-current="page"' : ''}>${icon(VIEWS[id].icon)}<span>${esc(LX(VIEWS[id].title))}</span></button>`).join(''); });
  $('#nav').innerHTML = h;
  const inBottom = BOTTOM.includes(VIEW);
  $('#bnav').innerHTML = BOTTOM.map(id => `<button type="button" data-v="${id}" ${VIEW === id ? 'aria-current="page"' : ''}>${icon(VIEWS[id].icon)}<span>${esc(LX(VIEWS[id].title))}</span></button>`).join('') +
    `<button type="button" data-more="1" ${!inBottom ? 'aria-current="page"' : ''}>${icon('more')}<span>${L('المزيد', 'More')}</span></button>`;
}
function moreSheet(){
  const ids = NAV_GROUPS.flatMap(g => g.ids).filter(visibleView);
  openSheet(`<div class="head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h2 style="margin:0;font-family:var(--font-display)">${L('كل الأقسام', 'All sections')}</h2><button class="btn ghost sm" type="button" data-close="1">${L('قفل', 'Close')}</button></div><div class="sheet-grid">${ids.map(id => `<button type="button" data-v="${id}">${icon(VIEWS[id].icon)}<span>${esc(LX(VIEWS[id].title))}</span></button>`).join('')}</div>`);
}
const afterRender = [];
function render(){
  const v = VIEWS[VIEW] || VIEWS.today;
  const openD = $$('.plan details').map(d => d.open), y = window.scrollY;
  $('#view').innerHTML = v.render();
  if (openD.length) $$('.plan details').forEach((d, i) => { if (i < openD.length) d.open = openD[i]; });
  v.after && v.after();
  window.scrollTo({top: y});
  if (typeof aiFab === 'function') aiFab();
}
function go(v){ if (!visibleView(v)) v = 'today'; if (VIEWS[VIEW]?.leave) VIEWS[VIEW].leave(); VIEW = v; closeSheet(); try { localStorage.setItem('mizan-view', v); } catch (e) {} renderNav(); render(); window.scrollTo({top: 0}); if (typeof voiceOnGo === 'function') voiceOnGo(v); }

/* global event delegation registry */
const H = { click: [], change: [], input: [], submit: [] };
const on = (type, fn) => H[type].push(fn);
['click', 'change', 'input', 'submit'].forEach(type => document.addEventListener(type, e => { for (const fn of H[type]) { if (fn(e) === true) return; } }));
on('click', e => {
  const t = e.target;
  const v = t.closest('[data-v]'); if (v) { e.preventDefault(); go(v.dataset.v); return true; }
  if (t.closest('[data-more]')) { moreSheet(); return true; }
  if (t.closest('[data-close]') || t.id === 'sheet') { closeSheet(); return true; }
  const sh = t.closest('[data-shift]'); if (sh) { CUR = addDays(CUR, +sh.dataset.shift); render(); return true; }
});
on('change', e => { if (e.target.id === 'curDate' && e.target.value) { CUR = e.target.value; render(); return true; } });

function alertsHTML(list){
  const o = {red: 0, amber: 1}, l = [...list].sort((a, b) => o[a.l] - o[b.l]);
  if (!l.length) return `<div class="alert good"><div class="bar"></div><div class="tx"><b>${L('مفيش تنبيهات', 'No alerts')}</b><span>${L('كل المؤشرات في آخر أسبوع في الحدود الآمنة.', 'Everything in the last week is within safe limits.')}</span></div></div>`;
  return l.map(a => `<div class="alert ${a.l}"><div class="bar"></div><div class="tx"><b>${a.l === 'red' ? L('محتاج طبيب · ', 'See a doctor · ') : ''}${esc(a.t)}</b><span>${esc(a.x)}</span></div></div>`).join('');
}
