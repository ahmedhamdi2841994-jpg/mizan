/* زاد — الصوت: نطق (TTS) وسماع (STT) والوضع الصوتي الكامل لفاقدي البصر والمدرب الصوتي في التمرين.
   على الموبايل بنستخدم إضافات الأندرويد المجانية (تعرّف الكلام من جوجل على الجهاز)، وعلى اللاب Web Speech في كروم وإيدج. */
'use strict';
const VPL = n => window.Capacitor?.Plugins?.[n];
const voiceSet = () => (S.settings.voice ||= {on: false, rate: 1, auto: true, dict: true});
const voiceOn = () => !!S.settings.voice?.on;
const WEB_SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;

/* ---------- النطق ---------- */
const VO = {q: Promise.resolve(), gen: 0, lang: null, webVoice: null};
function ttsLangs(){ return LANG === 'en' ? ['en-US', 'en-GB', 'en'] : ['ar-EG', 'ar-SA', 'ar']; }
async function ttsLang(){
  if (VO.lang && VO.lang.startsWith(LANG === 'en' ? 'en' : 'ar')) return VO.lang;
  const tts = VPL('TextToSpeech'); let pick = ttsLangs()[0];
  if (tts && isNative()) { for (const l of ttsLangs()) { try { if ((await tts.isLanguageSupported({lang: l})).supported) { pick = l; break; } } catch (e) {} } }
  return (VO.lang = pick);
}
function webVoice(){
  const vs = window.speechSynthesis?.getVoices?.() || [], want = LANG === 'en' ? 'en' : 'ar';
  return vs.find(v => v.lang === 'ar-EG' && want === 'ar') || vs.find(v => v.lang?.toLowerCase().startsWith(want) && /google|natural|online/i.test(v.name)) || vs.find(v => v.lang?.toLowerCase().startsWith(want)) || null;
}
const ttsReady = () => !!((VPL('TextToSpeech') && isNative()) || window.speechSynthesis);
/* speak(text) — يستنى اللي قبله يخلص. speak(text, {now:true}) يقطع اللي شغال ويبدأ فورًا */
function speak(text, o = {}){
  text = String(text || '').replace(/<[^>]+>/g, ' ').replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '').replace(/\s+/g, ' ').trim();
  if (!text || !ttsReady()) return Promise.resolve();
  if (o.now) speakStop();
  const gen = VO.gen, rate = (voiceSet().rate || 1) * (o.rate || 1);
  const job = async () => {
    if (gen !== VO.gen) return;
    const tts = VPL('TextToSpeech');
    if (tts && isNative()) { try { await tts.speak({text, lang: await ttsLang(), rate, pitch: 1, volume: 1, category: 'playback'}); return; } catch (e) {} }
    const ss = window.speechSynthesis; if (!ss) return;
    await new Promise(res => { const u = new SpeechSynthesisUtterance(text); const v = webVoice(); if (v) u.voice = v; u.lang = v?.lang || ttsLangs()[0]; u.rate = rate; u.onend = u.onerror = () => res(); ss.speak(u); setTimeout(res, 2000 + text.length * 140); });
  };
  VO.q = VO.q.then(job, job); return VO.q;
}
function speakStop(){ VO.gen++; VO.q = Promise.resolve(); try { VPL('TextToSpeech')?.stop(); } catch (e) {} try { window.speechSynthesis?.cancel(); } catch (e) {} }
try { window.speechSynthesis?.addEventListener?.('voiceschanged', () => { VO.webVoice = null; }); } catch (e) {}

/* ---------- السماع ---------- */
const sttNative = () => isNative() && !!VPL('SpeechRecognition');
const sttReady = () => sttNative() || !!WEB_SR();
let LISTEN = null;
/* listen() → Promise<string> (أفضل نص اتفهم، أو '' لو مفيش) */
async function listen(o = {}){
  speakStop(); listenStop();
  const lang = LANG === 'en' ? 'en-US' : 'ar-EG';
  if (sttNative()) {
    const sr = VPL('SpeechRecognition');
    try {
      const av = await sr.available(); if (!av.available) throw new Error('na');
      let perm = await sr.checkPermissions().catch(() => ({})); if (perm.speechRecognition !== 'granted') perm = await sr.requestPermissions();
      if (perm.speechRecognition !== 'granted') { toast(L('محتاج إذن المايك عشان أسمعك', 'Microphone permission is needed')); return ''; }
      LISTEN = {native: true}; o.onState?.(true);
      const r = await sr.start({language: lang, maxResults: 3, prompt: L('اتكلم…', 'Speak…'), popup: false, partialResults: false});
      return (r?.matches || [])[0] || '';
    } catch (e) { if (String(e?.message || e).includes('na')) toast(L('تعرّف الكلام مش متاح على الموبايل ده. نزّل تطبيق Google أو استخدم مايك الكيبورد.', 'Speech recognition isn’t available on this phone. Install the Google app or use the keyboard mic.')); return ''; }
    finally { LISTEN = null; o.onState?.(false); }
  }
  const C = WEB_SR(); if (!C) return '';
  return new Promise(res => {
    const r = new C(); r.lang = lang; r.interimResults = !!o.onPartial; r.maxAlternatives = 3; r.continuous = false;
    let best = '', done = false; const fin = () => { if (done) return; done = true; LISTEN = null; o.onState?.(false); res(best); };
    r.onresult = ev => { let t = ''; for (const x of ev.results) t += x[0].transcript; best = t.trim(); o.onPartial?.(best); };
    r.onerror = ev => { if (ev.error === 'not-allowed') toast(L('اسمح للمتصفح يستخدم المايك', 'Allow microphone access')); fin(); };
    r.onend = fin; LISTEN = {rec: r}; o.onState?.(true);
    try { r.start(); } catch (e) { fin(); }
  });
}
function listenStop(){ if (!LISTEN) return; try { if (LISTEN.native) VPL('SpeechRecognition')?.stop(); else LISTEN.rec?.stop(); } catch (e) {} }

/* ---------- أيوه/لأ بالصوت ---------- */
const YES_RE = /^(اه|ايوه|ايوا|أيوه|أيوا|نعم|اكيد|أكيد|تمام|ماشي|نفذ|نفّذ|موافق|يلا|ok|okay|yes|yeah|yep|sure|do it)(?=\s|$)/i;
const NO_RE = /^(لا|لأ|لاء|مش عايز|بلاش|الغي|ألغي|الغاء|إلغاء|no|nope|cancel|stop)(?=\s|$)/i;

/* ---------- قراءة الصفحة ---------- */
const VIEW_SPEECH = {};
function pageSpeech(v){
  v = v || VIEW;
  try { if (VIEW_SPEECH[v]) { const t = VIEW_SPEECH[v](); if (t) return t; } } catch (e) {}
  const root = $('#view'); if (!root) return '';
  const h1 = root.querySelector('h1')?.innerText || LX(VIEWS[v]?.title) || '', bits = [];
  root.querySelectorAll('h2, h3, .banner, .card.empty p').forEach(el => { if (bits.length < 10 && el.offsetParent !== null) { const t = el.innerText.trim(); if (t && !bits.includes(t)) bits.push(t.slice(0, 140)); } });
  return h1 + '. ' + bits.join('. ');
}
function nextPrayer(){
  try { const t = todayISO(), pt = prayerTimes(t), now = nowMin(); for (const k of PRAYER_KEYS) if (pt[k] > now) return {k, at: pt[k], left: pt[k] - now}; const tm = prayerTimes(addDays(t, 1)); return {k: 'fajr', at: tm.fajr, left: tm.fajr + 1440 - now}; } catch (e) { return null; }
}
/* العدد مع المعدود بالمصري: arN(3, ['تمرين','تمرينين','تمارين']) → «3 تمارين»، ومن 11 بيرجع مفرد */
const arN = (n, w) => { n = Math.round(n * 100) / 100; if (n === 1) return w[0]; if (n === 2) return w[1]; if (n >= 3 && n <= 10 && Number.isInteger(n)) return n + ' ' + w[2]; return n + ' ' + w[0]; };
const durTxt = m => { m = Math.round(m); const h = Math.floor(m / 60), mm = m % 60; if (LANG === 'en') return (h ? h + ' h ' : '') + (mm ? mm + ' min' : (h ? '' : 'less than a minute')); return (h ? arN(h, ['ساعة', 'ساعتين', 'ساعات']) + (mm ? ' و' : '') : '') + (mm ? arN(mm, ['دقيقة', 'دقيقتين', 'دقايق']) : (h ? '' : 'أقل من دقيقة')); };
function todayBrief(short){
  const t = todayISO(), out = [], d = dayOf(t);
  out.push(L('النهارده ', 'Today is ') + dLong(t) + (dHijri(t) ? '، ' + dHijri(t) : ''));
  const np = nextPrayer(); if (np) out.push(L(`الصلاة الجاية ${pName(np.k)} الساعة ${m2t(np.at)}، فاضل ${durTxt(np.left)}`, `Next prayer ${pName(np.k)} at ${m2t(np.at)}, in ${durTxt(np.left)}`));
  if (S.plan?.train) { try { const p = planFor(t); out.push(p.k === 'rest' ? L('النهارده راحة من التمرين', 'Rest day today') : L(`تمرين النهارده: ${p.title}، ${arN(p.ex.length, ['تمرين واحد', 'تمرينين', 'تمارين'])}`, `Today’s workout: ${p.title}, ${p.ex.length} exercises`)); } catch (e) {} }
  const ms = typeof mealsFor === 'function' ? mealsFor(t) : []; if (ms.length) { const done = ms.filter(m => ['done', 'swap'].includes(d.meals?.[m.key]?.s)).length; out.push(L(`الوجبات: خلصت ${done} من ${ms.length}`, `Meals: ${done} of ${ms.length} done`)); }
  const c = calc(); if (c) { const wt = Math.ceil(c.water / 0.25); out.push(L(`المية: ${d.water || 0} من ${wt} كوباية`, `Water: ${d.water || 0} of ${wt} glasses`)); }
  if (typeof medDosesOn === 'function') { const md = medDosesOn(t).filter(x => !x.taken); if (md.length) out.push(L(`فاضل ${md.length} جرعة دوا: `, `${md.length} doses left: `) + md.slice(0, 4).map(x => x.name + ' ' + m2t(t2m(x.time))).join('، ')); }
  if (!short && typeof occursOn === 'function') { const ts = LIFE().tasks.filter(x => occursOn(x, t) && !isDone(x, t)); if (ts.length) out.push(L(`مهام النهارده: `, `Tasks today: `) + ts.slice(0, 5).map(x => x.title + (x.time ? ' ' + m2t(t2m(x.time)) : '')).join('، ')); }
  return out.join('. ');
}
VIEW_SPEECH.today = () => todayBrief();
VIEW_SPEECH.prayer = () => { const pt = prayerTimes(todayISO()), np = nextPrayer(); return L('مواقيت الصلاة النهارده في ', 'Prayer times today in ') + cityLabel() + '. ' + ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => pName(k) + ' ' + m2t(pt[k])).join('، ') + (np ? '. ' + L(`الجاية ${pName(np.k)} بعد ${durTxt(np.left)}`, `Next is ${pName(np.k)} in ${durTxt(np.left)}`) : ''); };
VIEW_SPEECH.workout = () => { if (!S.plan?.train) return ''; const iso = woDate(), p = planFor(iso), d = dayOf(iso); if (p.k === 'rest') return L('النهارده راحة. ', 'Rest day. ') + p.title; return L(`تمرين ${WD()[p.dow]}: ${p.title}. `, `${WD()[p.dow]} workout: ${p.title}. `) + p.ex.map((e, i) => { const dn = (d.wo?.[e.id] || []).slice(0, e.sets).filter(s => s?.d).length; return `${i + 1}: ${LANG === 'en' ? EX[e.id].en : EX[e.id].ar}، ${LANG === 'en' ? e.sets + ' sets of' : arN(e.sets, ['مجموعة واحدة', 'مجموعتين', 'مجموعات'])} ${e.reps}${dn ? L(`، خلصت ${dn}`, `, ${dn} done`) : ''}`; }).join('. ') + '. ' + L('عشان تبدأ المدرب الصوتي قول: ابدأ التمرين.', 'To start the voice coach say: start workout.'); };
VIEW_SPEECH.meals = () => { const ms = mealsFor(CUR); if (!ms.length) return ''; const d = dayOf(CUR); return L('وجبات النهارده. ', 'Today’s meals. ') + ms.map(m => `${m.title} ${m2t(t2m(m.t))}: ${LX(m.n)}، ${m.k} ${L('سعر', 'kcal')}${['done', 'swap'].includes(d.meals?.[m.key]?.s) ? L('، خلصتها', ', done') : ''}`).join('. '); };
VIEW_SPEECH.meds = () => { const ds = medDosesOn(todayISO()); if (!ds.length) return L('مفيش أدوية النهارده', 'No medicines today'); return L('أدوية النهارده. ', 'Today’s medicines. ') + ds.map(x => `${x.name} ${m2t(t2m(x.time))}${x.taken ? L('، خدته', ', taken') : ''}`).join('. '); };
VIEW_SPEECH.shop = () => { const l = LIFE().shop.filter(x => !x.bought); return l.length ? L(`في لستة المشتريات ${l.length} حاجة: `, `${l.length} items on the shopping list: `) + l.slice(0, 20).map(x => x.name + ((x.qty || 1) > 1 ? ' ' + x.qty : '')).join('، ') : L('لستة المشتريات فاضية', 'The shopping list is empty'); };
VIEW_SPEECH.planner = () => { const t = todayISO(), ts = LIFE().tasks.filter(x => occursOn(x, t)); return ts.length ? L('مهام النهارده: ', 'Today’s tasks: ') + ts.map(x => x.title + (x.time ? ' ' + m2t(t2m(x.time)) : '') + (isDone(x, t) ? L('، خلصت', ', done') : '')).join('. ') : L('مفيش مهام النهارده', 'No tasks today'); };

/* بعد كل تنقّل: الفوكس على العنوان (لـ TalkBack) وفي الوضع الصوتي نقرا الصفحة */
function voiceOnGo(v){
  setTimeout(() => { const h = $('#view h1'); if (h) { h.tabIndex = -1; try { h.focus({preventScroll: true}); } catch (e) {} } }, 60);
  if (voiceOn() && voiceSet().auto && !COACH.on) setTimeout(() => speak(pageSpeech(v), {now: true}), 250);
}
function voiceToast(m){ if (voiceOn() && !COACH.on) speak(m); }

/* ---------- المدرب الصوتي في التمرين ---------- */
const COACH = {on: false, paused: false, gen: 0, i: 0, j: 0, skip: false};
const csleep = ms => new Promise(r => { const t0 = Date.now(), g = COACH.gen; const tick = () => { if (g !== COACH.gen || COACH.skip) return r(); if (COACH.paused) { setTimeout(tick, 250); return; } if (Date.now() - t0 >= ms) return r(); setTimeout(tick, 100); }; tick(); });
const say = async (t, rate) => { if (COACH.on) await speak(t, {rate}); };
function repsOf(r){ const s = String(r), n = (s.match(/\d+/g) || []).map(Number); const timed = /ث|ثانية|sec|s\b|دقيقة|min/i.test(s); let v = n.length ? (n.length > 1 ? Math.round((n[0] + n[1]) / 2) : n[0]) : 10; if (/دقيقة|min/i.test(s) && v < 30) v *= 60; return {v: Math.min(v, timed ? 600 : 40), timed}; }
const vib = p => { try { navigator.vibrate?.(p); } catch (e) {} };
function coachUI(){
  const iso = woDate(), p = planFor(iso), e = p.ex[COACH.i];
  openSheet(`<div class="coach" role="region" aria-label="${L('المدرب الصوتي', 'Voice coach')}">
    ${sheetHead('🎙️ ' + L('المدرب الصوتي', 'Voice coach'))}
    <div class="coach-now" aria-live="polite" id="coachNow">${e ? `<b>${esc(LANG === 'en' ? EX[e.id].en : EX[e.id].ar)}</b><span>${L('مجموعة', 'Set')} ${COACH.j + 1} / ${e.sets} · ${esc(e.reps)}</span>` : L('خلصت التمرين', 'Workout complete')}</div>
    <div class="coach-big" id="coachBig" aria-live="off">${COACH.big ?? '—'}</div>
    <div class="coach-btns">
      <button type="button" class="btn" data-coach="pause">${COACH.paused ? '▶ ' + L('كمّل', 'Resume') : '⏸ ' + L('وقّف', 'Pause')}</button>
      <button type="button" class="btn fire" data-coach="next">⏭ ${L('خلصت المجموعة', 'Set done')}</button>
      <button type="button" class="btn ghost" data-coach="exit">✖ ${L('اقفل', 'Exit')}</button></div>
    <p class="muted small">${L('المدرب بيقول اسم التمرين وبيعد العدّات والراحة بصوته. لو حسيت بألم أو دوخة وقّف فورًا.', 'The coach announces each exercise and counts reps and rest aloud. Stop at once if you feel pain or dizziness.')}</p></div>`);
}
const coachBig = t => { COACH.big = t; const el = $('#coachBig'); if (el) el.textContent = t; };
async function coachStart(){
  if (!S.plan?.train) { toast(L('اعمل خطتك الأول', 'Build your plan first')); return; }
  if (VIEW !== 'workout') go('workout');
  const iso = woDate(), p = planFor(iso); if (p.k === 'rest') { speak(L('النهارده راحة. امشي نص ساعة لو تقدر.', 'Rest day. Take a 30 minute walk if you can.'), {now: true}); toast(L('النهارده راحة', 'Rest day')); return; }
  const d = day(iso); d.wo ||= {};
  COACH.on = true; COACH.paused = false; COACH.gen++; COACH.big = '—'; const g = COACH.gen;
  COACH.i = p.ex.findIndex(e => (d.wo[e.id] || []).slice(0, e.sets).filter(s => s?.d).length < e.sets); if (COACH.i < 0) COACH.i = p.ex.length;
  speakStop(); coachUI();
  await say(L(`يلا بينا. تمرين النهارده ${p.title}. هنعمل ${arN(p.ex.length, ['تمرين واحد', 'تمرينين', 'تمارين'])}. ابدأ بإحماء خفيف.`, `Let’s go. Today: ${p.title}, ${p.ex.length} exercises. Warm up first.`));
  for (; COACH.i < p.ex.length && g === COACH.gen; COACH.i++) {
    const e = p.ex[COACH.i], X = EX[e.id], sets = (d.wo[e.id] ||= []), R = repsOf(e.reps);
    COACH.j = sets.slice(0, e.sets).filter(s => s?.d).length; coachUI();
    await say(L(`التمرين ${COACH.i + 1}: ${X.ar}. ${arN(e.sets, ['مجموعة واحدة', 'مجموعتين', 'مجموعات'])}، ${e.reps}. ${X.tip[0]}`, `Exercise ${COACH.i + 1}: ${X.en}. ${e.sets} sets of ${e.reps}. ${X.tip[1]}`));
    for (; COACH.j < e.sets && g === COACH.gen; COACH.j++) {
      coachUI(); COACH.skip = false; vib(200);
      await say(L(`المجموعة ${COACH.j + 1}. استعد… ابدأ`, `Set ${COACH.j + 1}. Ready… go`));
      if (R.timed) { for (let s = R.v; s > 0 && g === COACH.gen && !COACH.skip; s--) { coachBig(s); if (s <= 3 || s % 10 === 0) speak(String(s), {rate: 1.2}); await csleep(1000); } }
      else { for (let r = 1; r <= R.v && g === COACH.gen && !COACH.skip; r++) { coachBig(r); await Promise.all([speak(String(r), {rate: 1.15}), csleep(2600)]); } }
      if (g !== COACH.gen) break;
      (sets[COACH.j] ||= {}).d = true; store.save(); vib([120, 80, 120]);
      const last = COACH.j + 1 >= e.sets && COACH.i + 1 >= p.ex.length; if (last) break;
      const rest = e.rest || 60; COACH.skip = false;
      await say(L(`برافو. راحة ${rest} ثانية`, `Well done. Rest ${rest} seconds`));
      for (let s = rest; s > 0 && g === COACH.gen && !COACH.skip; s--) { coachBig('⏱ ' + s); if (s === 10) speak(L('فاضل عشر ثواني', 'Ten seconds')); await csleep(1000); }
    }
  }
  if (g === COACH.gen) { COACH.on = false; coachUI(); beep(880, .2, 3); await speak(L('عاش! خلصت تمرين النهارده. متنساش الإطالة والمية.', 'Great job! Workout complete. Stretch and drink water.')); closeSheet(); render(); }
}
function coachStop(){ COACH.gen++; COACH.on = false; COACH.paused = false; speakStop(); closeSheet(); render(); }
on('click', e => {
  const c = e.target.closest('[data-coach]'); if (!c) return;
  const k = c.dataset.coach;
  if (k === 'start') { coachStart(); return true; }
  if (k === 'exit') { coachStop(); return true; }
  if (k === 'pause') { COACH.paused = !COACH.paused; if (COACH.paused) speakStop(); else speak(L('نكمّل', 'Resuming')); coachUI(); return true; }
  if (k === 'next') { COACH.skip = true; speakStop(); return true; }
  return true;
});

/* ---------- الإملاء بالصوت في أي خانة كتابة ---------- */
let DICT_EL = null;
function dictBtn(){ let b = $('#dictBtn'); if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'dictBtn'; b.className = 'dictbtn'; b.hidden = true; b.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>`; b.setAttribute('aria-label', L('اكتب بصوتك', 'Dictate')); document.body.appendChild(b); b.addEventListener('pointerdown', ev => ev.preventDefault()); } return b; }
document.addEventListener('focusin', e => {
  const el = e.target; if (!el.matches || !el.matches('input[type="text"], input[type="search"], input:not([type]), textarea') || el.id === 'aiIn' || !sttReady() || S.settings.voice?.dict === false) return;
  DICT_EL = el; const b = dictBtn(), r = el.getBoundingClientRect(); b.hidden = false; b.style.top = Math.max(8, r.top + (r.height - 36) / 2) + 'px'; b.style.left = (document.dir === 'rtl' || document.documentElement.dir === 'rtl' ? r.left + 6 : r.right - 42) + 'px';
});
document.addEventListener('focusout', () => setTimeout(() => { if (document.activeElement !== DICT_EL && !LISTEN) { const b = $('#dictBtn'); if (b) b.hidden = true; } }, 150));
window.addEventListener('scroll', () => { const b = $('#dictBtn'); if (b && !b.hidden && !LISTEN) b.hidden = true; }, {passive: true});
document.addEventListener('click', async e => {
  if (!e.target.closest('#dictBtn') || !DICT_EL) return; const el = DICT_EL, b = $('#dictBtn');
  if (LISTEN) { listenStop(); return; }
  const t = await listen({onState: s => b.classList.toggle('on', s)});
  if (t) { const pos = el.selectionStart ?? el.value.length, v = el.value; el.value = v.slice(0, pos) + (pos && !/\s$/.test(v.slice(0, pos)) ? ' ' : '') + t + v.slice(pos); el.dispatchEvent(new Event('input', {bubbles: true})); el.dispatchEvent(new Event('change', {bubbles: true})); el.focus(); }
  b.hidden = true;
});
