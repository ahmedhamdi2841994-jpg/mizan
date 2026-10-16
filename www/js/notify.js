/* ميزان — reminders: native Android notifications (works when the app is closed) + in-app reminders on the laptop */
'use strict';
let ADHANS = []; // [{file, name}] bundled at build time from the /adhan folder
fetch('data/adhans.json').then(r => r.ok ? r.json() : []).then(j => { ADHANS = Array.isArray(j) ? j : []; }).catch(() => {});
const LN = () => window.Capacitor?.Plugins?.LocalNotifications;

function reminderPlan(days = 5){
  const n = S.settings.notify, out = [], now = Date.now();
  const at = (iso, min) => { const d = D(iso); d.setHours(0, 0, 0, 0); return new Date(d.getTime() + min * 60000); };
  for (let i = 0; i < days; i++) {
    const iso = addDays(todayISO(), i), sch = scheduleFor(iso), pt = prayerTimes(iso), dow = D(iso).getDay();
    const push = (key, min, title, body, kind) => { const when = at(iso, min); if (when.getTime() > now + 30000) out.push({key: iso + ':' + key, when, title, body, kind}); };
    if (n.prayer) PRAYER_KEYS.forEach(k => {
      const nm = LANG === 'en' ? PRAYER_NAMES[k][1] : (k === 'dhuhr' && dow === 5 ? 'الجمعة' : PRAYER_NAMES[k][0]);
      push('adhan-' + k, pt[k], L(`حان الآن موعد أذان ${nm}`, `It is time for ${nm}`), L('حيّ على الصلاة', 'Come to prayer') + ' · ' + cityLabel(), 'adhan');
      if (n.preAdhan > 0) push('pre-' + k, pt[k] - n.preAdhan, L(`فاضل ${n.preAdhan} دقيقة على ${nm}`, `${n.preAdhan} min until ${nm}`), L('اتوضى وجهّز نفسك', 'Make wudu and get ready'), 'remind');
    });
    if (n.adhkar) { push('adhkar-m', pt.fajr + 25, L('أذكار الصباح', 'Morning adhkar'), L('دقايق بتحميك يومك كله', 'A few minutes that guard your whole day'), 'remind'); push('adhkar-e', pt.asr + 20, L('أذكار المساء', 'Evening adhkar'), L('وقتها دلوقتي', 'It’s time now'), 'remind'); push('adhkar-s', 1385, L('أذكار النوم', 'Sleep adhkar'), L('آية الكرسي والمعوذات قبل ما تنام', 'Ayat al-Kursi and the last three surahs'), 'remind'); }
    sch.forEach(x => {
      if (n.meals && x.c === 'meal') push('meal-' + x.k, x.m, x.n + ' 🍽️', x.s || L('علّم عليها في التطبيق بعد ما تاكل', 'Tick it in the app after you eat'), 'remind');
      if (n.tea && x.k.startsWith('tea')) push(x.k, x.m, x.n + ' ☕', x.s || L('بعيد عن الأكل بساعة', 'An hour away from meals'), 'remind');
      if (n.gym && x.k === 'gym') push('gym', x.m - 15, L('الجيم بعد ربع ساعة 💪', 'Gym in 15 minutes 💪'), x.n, 'remind');
      if (n.sleep && x.k === 'sleep') push('sleep', x.m - 15, L('قرّب ميعاد النوم 🌙', 'Bedtime soon 🌙'), L('قفل الشاشات وأذكار النوم', 'Screens off and sleep adhkar'), 'remind');
      if (n.prep && x.k === 'prep') push('prep', x.m, x.n, '', 'remind');
      if (n.weigh && x.k === 'weigh') push('weigh', x.m, L('وزن الصبح ⚖️', 'Morning weigh-in ⚖️'), L('بعد الحمام وقبل الأكل، وسجّله', 'After the bathroom, before food, then log it'), 'remind');
      if (n.course && x.k === 'course') push('course', x.m - 10, L('الكورس بعد 10 دقايق 📘', 'Course in 10 minutes 📘'), x.s, 'remind');
    });
    if (n.water) for (let m = 8 * 60 + 30; m <= 22 * 60; m += Math.max(30, n.waterEvery || 90)) push('water-' + m, m, L('اشرب كوباية مية 💧', 'Drink a glass of water 💧'), L('ودوس على الكوباية في صفحة الأكل', 'Then tap a glass on the Meals page'), 'water');
    if (typeof womenReminders === 'function') womenReminders(iso, push);
    if (typeof lifeReminders === 'function') lifeReminders(iso, push);
  }
  return out.sort((a, b) => a.when - b.when);
}
const hashId = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) % 2000000000; };
async function scheduleNative(){
  const ln = LN(); if (!ln) return false;
  try {
    const perm = await ln.checkPermissions(); if (perm.display !== 'granted') { const r = await ln.requestPermissions(); if (r.display !== 'granted') return false; }
    try { const ex = await ln.checkExactNotificationSetting?.(); if (ex && ex.exact_alarm !== 'granted' && !S.exactAsked) { S.exactAsked = true; store.save(); await ln.changeExactNotificationSetting?.(); } } catch (e) {}
    const adhan = S.settings.notify.adhan, file = ADHANS.find(a => a.file === adhan)?.file;
    await ln.createChannel({id: 'remind', name: L('تذكيرات', 'Reminders'), importance: 4, vibration: true});
    await ln.createChannel({id: 'water', name: L('المية', 'Water'), importance: 3, vibration: true});
    const adhanCh = file ? 'adhan-' + file.replace(/\W/g, '_') : 'adhan-default';
    await ln.createChannel({id: adhanCh, name: L('الأذان', 'Adhan') + (file ? ' · ' + (ADHANS.find(a => a.file === file)?.name || file) : ''), importance: 5, vibration: true, ...(file ? {sound: file} : {})});
    const pend = await ln.getPending(); if (pend.notifications.length) await ln.cancel({notifications: pend.notifications.map(n => ({id: n.id}))});
    const list = reminderPlan(5).slice(0, 480).map(r => ({id: hashId(r.key), title: r.title, body: r.body || ' ', channelId: r.kind === 'adhan' ? adhanCh : r.kind, schedule: {at: r.when, allowWhileIdle: true}, extra: {kind: r.kind}}));
    if (list.length) await ln.schedule({notifications: list});
    S.lastScheduled = Date.now(); store.save();
    return list.length;
  } catch (e) { console.warn('schedule failed', e); return false; }
}
/* in-app reminders (laptop, or anything not native) */
let webPlan = [], fired = new Set();
function scheduleWeb(){ webPlan = reminderPlan(2); }
setInterval(() => {
  if (isNative() || !webPlan.length) return;
  const now = Date.now();
  webPlan.filter(r => r.when.getTime() <= now && r.when.getTime() > now - 120000 && !fired.has(r.key)).forEach(r => {
    fired.add(r.key);
    if (r.kind === 'adhan') playAdhan(); else beep(r.kind === 'water' ? 520 : 880, .15, 2);
    if ('Notification' in window && Notification.permission === 'granted') { try { new Notification(r.title, {body: r.body, icon: 'icons/icon-192.png', tag: r.key}); } catch (e) {} }
    toast(r.title);
  });
}, 20000);
async function playAdhan(test){
  const a = $('#player'), sel = S.settings.notify.adhan;
  if (typeof musicDuck === 'function') musicDuck();
  try {
    if (sel === 'custom') { const blob = await idb.get('adhan-custom'); if (blob) { a.src = URL.createObjectURL(blob); await a.play(); return; } }
    const f = ADHANS.find(x => x.file === sel); if (f) { a.src = 'adhan/' + f.file; await a.play(); return; }
  } catch (e) {}
  beep(660, .4, 3); if (typeof musicUnduck === 'function') setTimeout(musicUnduck, 2500); if (test) toast(L('مفيش صوت أذان متضاف، فاشتغل صوت تنبيه. ضيف ملف أذان من الإعدادات.', 'No adhan file added, so a tone played. Add an adhan file below.'));
}
async function rescheduleAll(){ if (isNative()) return scheduleNative(); scheduleWeb(); return webPlan.length; }

registerView('notify', {title: {ar: 'التنبيهات', en: 'Reminders'}, icon: 'bell', render(){
  const n = S.settings.notify, perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const tog = (k, l, sub) => `<label class="row" style="justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span>${l}${sub ? `<br><span class="muted small">${sub}</span>` : ''}</span><input type="checkbox" class="tick" data-ntog="${k}" ${n[k] ? 'checked' : ''}></label>`;
  const next = reminderPlan(2).slice(0, 8);
  return topbar(L('التنبيهات', 'Reminders'), isNative() ? L('شغالة حتى والتطبيق مقفول', 'Work even when the app is closed') : L('على اللاب: بتشتغل طول ما التطبيق مفتوح', 'On the laptop: work while the app is open'), '', true) + `
  <div class="two">
    <div class="card"><div class="head"><h2>${L('أنواع التنبيهات', 'What to remind me')}</h2></div>
      ${tog('prayer', L('الأذان في وقت كل صلاة', 'Adhan at each prayer time'))}
      <label class="row" style="justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span>${L('تنبيه قبل الأذان', 'Reminder before adhan')}</span><select data-nnum="preAdhan" style="width:auto">${[0, 5, 10, 15, 20, 30].map(v => `<option value="${v}" ${n.preAdhan === v ? 'selected' : ''}>${v ? v + L(' دقيقة', ' min') : L('من غير', 'Off')}</option>`).join('')}</select></label>
      ${tog('adhkar', L('أذكار الصباح والمساء والنوم', 'Morning, evening and sleep adhkar'))}
      ${tog('meals', L('مواعيد الأكل والسناكس', 'Meals and snacks'))}
      ${tog('water', L('شرب المية', 'Drinking water'))}
      <label class="row" style="justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span>${L('المية كل', 'Water every')}</span><select data-nnum="waterEvery" style="width:auto">${[60, 90, 120].map(v => `<option value="${v}" ${n.waterEvery === v ? 'selected' : ''}>${v} ${L('دقيقة', 'min')}</option>`).join('')}</select></label>
      ${tog('tasks', L('مهام المفكرة', 'Planner tasks'))}${tog('meds', L('مواعيد الأدوية', 'Medicine doses'))}${tog('events', L('المناسبات والتجديدات', 'Occasions & renewals'))}${tog('shop', L('المشتريات', 'Shopping'))}${tog('bills', L('الفواتير الشهرية', 'Monthly bills'))}${tog('habits', L('العادات', 'Habits'))}${tog('fasting', L('الصيام والسحور', 'Fasting & suhoor'))}${tog('khatma', L('ورد الختمة', 'Khatma portion'))}${tog('journal', L('اليوميات (10 بالليل)', 'Journal (10 PM)'))}${tog('tea', L('الشاي', 'Tea'))}${tog('gym', L('الجيم', 'Gym'))}${tog('weigh', L('وزن الصبح', 'Morning weigh-in'))}${tog('course', L('الكورسات', 'Courses'))}${tog('prep', L('تجهيز الأكل', 'Food prep'))}${tog('sleep', L('ميعاد النوم', 'Bedtime'))}
    </div>
    <div class="form">
      <div class="card"><div class="head"><h2>${L('صوت الأذان', 'Adhan voice')}</h2></div>
        <label class="f">${L('اختار المؤذن', 'Choose the voice')}<select id="adhanSel"><option value="default" ${n.adhan === 'default' ? 'selected' : ''}>${L('صوت التنبيه العادي', 'Default notification sound')}</option>${ADHANS.map(a => `<option value="${esc(a.file)}" ${n.adhan === a.file ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}${!isNative() ? `<option value="custom" ${n.adhan === 'custom' ? 'selected' : ''}>${L('ملف من جهازي', 'A file from this device')}</option>` : ''}</select></label>
        <div class="row" style="margin-top:12px"><button class="btn ghost sm" type="button" id="adhanTest">${L('اسمع', 'Preview')}</button>${!isNative() ? `<label class="btn ghost sm" for="adhanFile" style="cursor:pointer">${L('اختار ملف أذان', 'Pick an adhan file')}</label><input type="file" id="adhanFile" accept="audio/*" hidden>` : ''}</div>
        <p class="muted small" style="margin:12px 0 0">${ADHANS.length ? L(`فيه ${ADHANS.length} صوت أذان متضافين للتطبيق.`, `${ADHANS.length} adhan voice(s) are bundled.`) : L('لسه مفيش أصوات أذان متضافة. حط ملفات الأذان (mp3) في فولدر adhan في المشروع على GitHub قبل بناء التطبيق، وهتظهر هنا كل واحد باسمه. استخدم بس تسجيلات مسموح لك باستخدامها.', 'No adhan voices bundled yet. Put mp3 files in the project’s adhan folder on GitHub before building and each appears here by name. Use only recordings you are allowed to use.')}</p></div>
      <div class="card"><div class="head"><h2>${L('الحالة', 'Status')}</h2></div>
        <p class="small" style="margin:0 0 10px">${isNative() ? L('أندرويد: التنبيهات بتتجدول لـ5 أيام قدام، وبتتحدّث كل ما تفتح التطبيق.', 'Android: reminders are scheduled 5 days ahead and refreshed every time you open the app.') : L(`اللاب: إذن الإشعارات ${perm === 'granted' ? 'متاح' : perm === 'denied' ? 'مرفوض من المتصفح' : 'لسه متطلبش'}.`, `Laptop: notification permission is ${perm}.`)}</p>
        <div class="row"><button class="btn fire sm" type="button" id="nApply">${L('فعّل وحدّث التنبيهات', 'Enable & refresh reminders')}</button><button class="btn ghost sm" type="button" id="nTest">${L('جرّب تنبيه دلوقتي', 'Send a test now')}</button></div>
        ${isNative() ? `<p class="muted small" style="margin:10px 0 0">${L('لو التنبيهات بتتأخر: من إعدادات الموبايل، خلي التطبيق "بدون قيود" في البطارية، واسمح له بالمنبهات الدقيقة.', 'If reminders arrive late: set the app to "Unrestricted" battery use and allow exact alarms in Android settings.')}</p>` : ''}</div>
      <div class="card"><div class="head"><h2>${L('اللي جاي', 'Coming up')}</h2></div>${next.map(r => `<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--line)"><span>${esc(r.title)}</span><span class="muted small num">${dShort(isoOf(r.when))} · ${m2t(r.when.getHours() * 60 + r.when.getMinutes())}</span></div>`).join('') || `<div class="empty">—</div>`}</div>
    </div>
  </div>`;
}});
on('change', async e => {
  const T = e.target;
  if (T.dataset.ntog) { S.settings.notify[T.dataset.ntog] = T.checked; store.save(); rescheduleAll(); return true; }
  if (T.dataset.nnum) { S.settings.notify[T.dataset.nnum] = +T.value; store.save(); rescheduleAll(); render(); return true; }
  if (T.id === 'adhanSel') { S.settings.notify.adhan = T.value; store.save(); rescheduleAll(); return true; }
  if (T.id === 'adhanFile') { const f = T.files[0]; if (!f) return true; await idb.put('adhan-custom', f); S.settings.notify.adhan = 'custom'; store.save(); toast(L('اتحفظ صوت الأذان.', 'Adhan sound saved.')); render(); return true; }
});
on('click', async e => {
  const id = e.target.id;
  if (id === 'adhanTest') { playAdhan(true); return true; }
  if (id === 'nApply') {
    if (!isNative() && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (er) {} }
    const r = await rescheduleAll(); toast(r === false ? L('محتاج تسمح بالإشعارات من إعدادات الموبايل.', 'Please allow notifications in system settings.') : L(`اتجدول ${r} تنبيه.`, `${r} reminders scheduled.`)); render(); return true;
  }
  if (id === 'nTest') {
    const ln = LN();
    if (ln) { await ln.schedule({notifications: [{id: 7, title: L('تجربة تنبيه من ميزان', 'Test from Mizan'), body: L('التنبيهات شغالة ✅', 'Reminders work ✅'), channelId: 'remind', schedule: {at: new Date(Date.now() + 5000), allowWhileIdle: true}}]}); toast(L('هيوصلك تنبيه بعد 5 ثواني. اقفل التطبيق لو حابب تجرب.', 'A test arrives in 5 seconds. Close the app to try it.')); }
    else { if ('Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (er) {} } if ('Notification' in window && Notification.permission === 'granted') new Notification(L('تجربة تنبيه من ميزان', 'Test from Mizan'), {body: L('التنبيهات شغالة ✅', 'Reminders work ✅')}); beep(); toast(L('التنبيهات شغالة ✅', 'Reminders work ✅')); }
    return true;
  }
});
