/* ميزان — settings and boot */
'use strict';
registerView('settings', {title: {ar: 'الإعدادات', en: 'Settings'}, icon: 'settings', render(){
  const p = S.profile, s = S.settings;
  const opt = c => `<option value="${c[0]}" ${s.city === c[0] ? 'selected' : ''}>${LANG === 'en' ? c[2] : c[1]}</option>`, city = `<optgroup label="${L('السعودية', 'Saudi Arabia')}">${CITIES.filter(c => c[6] === 'sa').map(opt).join('')}</optgroup><optgroup label="${L('مصر', 'Egypt')}">${CITIES.filter(c => c[6] === 'eg').map(opt).join('')}</optgroup>`;
  return topbar(L('الإعدادات', 'Settings'), L('ملفك وتفضيلاتك وبياناتك', 'Your profile, preferences and data'), '', true) + `
  <div class="two">
    <div class="card form"><h2>${L('التطبيق', 'App')}</h2>
      <div><div class="eyebrow">${L('النسخة', 'Edition')}</div><div class="edpick" style="margin-top:6px"><button type="button" data-ed="men" aria-pressed="${s.edition === 'men'}">${brandMark(34, 'men')}<b>${edName('men')}</b><small>${L('رجالة وولاد', 'Men & boys')}</small></button><button type="button" data-ed="women" aria-pressed="${s.edition === 'women'}">${brandMark(34, 'women')}<b>${edName('women')}</b><small>${L('ستات وبنات', 'Women & girls')}</small></button></div></div>
      <div><div class="eyebrow">${L('اللغة', 'Language')}</div><div class="seg" style="margin-top:6px"><button type="button" data-lang="ar" aria-pressed="${LANG === 'ar'}">العربية</button><button type="button" data-lang="en" aria-pressed="${LANG === 'en'}">English</button></div></div>
      <div><div class="eyebrow">${L('الشكل', 'Theme')}</div><div class="chips" style="margin-top:6px">${Object.entries(THEMES).map(([k, v]) => `<button type="button" data-theme="${k}" aria-pressed="${(s.theme || 'auto') === k}">${LANG === 'en' ? v[1] : v[0]}</button>`).join('')}</div></div>
      <div><div class="eyebrow">${L('سهولة الاستخدام', 'Accessibility')}</div><div class="chips" style="margin-top:6px"><button type="button" data-a11y="big" aria-pressed="${!!s.a11y?.big}">🔠 ${L('خط كبير', 'Large text')}</button><button type="button" data-a11y="hc" aria-pressed="${!!s.a11y?.hc}">◐ ${L('تباين عالي', 'High contrast')}</button></div></div>
      <label class="row"><input type="checkbox" class="tick" id="setSound" ${s.sound ? 'checked' : ''}> ${L('أصوات التطبيق', 'App sounds')}</label>
      ${s.edition === 'men' ? `<label class="row"><input type="checkbox" class="tick" id="setShowW" ${s.showWomen ? 'checked' : ''}> ${L('إظهار قسم صحة المرأة (لمتابعة الدورة أو الحمل للزوجة)', 'Show the women’s health section (to follow your wife’s cycle or pregnancy)')}</label>` : ''}</div>
    <div class="card form"><h2>${L('المكان والمواعيد', 'Location & schedule')}</h2>
      <div class="fgrid"><label class="f">${L('المدينة', 'City')}<select id="setCity">${city}<option value="custom" ${s.city === 'custom' ? 'selected' : ''}>${L('مكان تاني', 'Other')}</option></select></label>
      ${s.city === 'custom' ? `<label class="f">${L('خط العرض', 'Latitude')}<input type="number" step="0.0001" id="setLat" value="${s.lat}"></label><label class="f">${L('خط الطول', 'Longitude')}<input type="number" step="0.0001" id="setLng" value="${s.lng}"></label><label class="f">${L('فرق التوقيت', 'UTC offset')}<input type="number" step="0.5" id="setTz" value="${s.tz}"></label>` : ''}
      <label class="f">${L('ميعاد الجيم', 'Gym time')}<input type="time" id="setGym" value="${s.gymTime}"></label><label class="f">${L('ميعاد الكورس', 'Course time')}<input type="time" id="setCourse" value="${s.courseTime}"></label></div>
      <div><div class="eyebrow">${L('أيام الكورس', 'Course days')}</div><div class="chips" style="margin-top:6px">${[6, 0, 1, 2, 3, 4, 5].map(d => `<button type="button" data-cday="${d}" aria-pressed="${(s.courseDays || []).includes(d)}">${WD()[d]}</button>`).join('')}</div></div></div>
  </div>
  <div class="card"><div class="head"><h2>${L('ملفك وخطتك', 'Profile & plan')}</h2><span class="row"><button class="btn ghost sm" type="button" data-fam="1">👨‍👩‍👧 ${L('أفراد العيلة', 'Family')}</button><button class="btn fire sm" type="button" data-wiz="1">${L('معالج الإعداد', 'Setup wizard')}</button></span></div>
  ${p.age ? `<p style="margin-top:0">${esc(p.name || '')} · ${p.sex === 'f' ? L('أنثى', 'Female') : L('ذكر', 'Male')} · ${p.age} ${L('سنة', 'yrs')} · ${fmt(p.height, 0)} ${L('سم', 'cm')} · ${fmt(p.weight)} ${L('كجم', 'kg')}${p.goal ? ' → ' + fmt(p.goal) : ''}</p>
  <p class="muted small">${typeof GOALS !== 'undefined' && GOALS[p.goalType] ? GOALS[p.goalType][0] + ' ' + (LANG === 'en' ? GOALS[p.goalType][2] : GOALS[p.goalType][1]) + ' · ' : ''}${(p.trainDays || []).length} ${L('أيام تمرين', 'training days')} · ${p.place === 'home' ? L('في البيت', 'at home') : L('في الجيم', 'at the gym')}${(p.conds || []).length ? ' · ' + (p.conds || []).map(k => condBy(k)).filter(Boolean).map(c => LX(c)).join('، ') : ''}</p>` : `<p class="muted">${L('لسه مدخلتش بياناتك. افتح المعالج وهو هيبني لك خطة تمرين وأكل على مقاسك.', 'No details yet. Open the wizard to build a training and meal plan that fits you.')}</p>`}</div>
  <div class="two">
    <div class="card"><div class="head"><h2>${L('نسخة احتياطية', 'Backup')}</h2></div><p class="muted small" style="margin-top:0">${L('بياناتك محفوظة على الجهاز ده بس. انقلها بين الموبايل واللاب بالتصدير والاستيراد.', 'Data lives on this device only. Move it between phone and laptop with export and import.')}</p>
      <div class="row"><button class="btn" type="button" id="expJson">${L('تصدير', 'Export')}</button><label class="btn ghost" for="impFile" style="cursor:pointer">${L('استيراد', 'Import')}</label><input type="file" id="impFile" accept=".json,application/json" hidden></div>
      <textarea id="exportOut" hidden readonly style="margin-top:12px;min-height:120px;direction:ltr;font-family:ui-monospace,monospace;font-size:.75rem"></textarea></div>
    <div class="card"><div class="head"><h2>${L('مسح البيانات', 'Erase data')}</h2></div><p class="muted small" style="margin-top:0">${L('بيمسح كل حاجة. مفيش رجوع.', 'Erases everything. No undo.')}</p>
      <div class="row"><button class="btn danger" type="button" id="wipe">${L('امسح كل البيانات', 'Erase all data')}</button><span id="wipeC" hidden><button class="btn danger" type="button" id="wipeYes">${L('أيوه، امسح', 'Yes, erase')}</button></span></div></div>
  </div>
  <p class="muted small">${L('زاد · الإصدار 4.0 · نص المصحف من QuranEnc عن طريق quran-json (CC BY 4.0) · مواقيت الصلاة بطريقة أم القرى للسعودية والهيئة المصرية لمصر · رسوم التمارين مرسومة داخل التطبيق.', 'Zad · v4.0 · Mushaf text from QuranEnc via quran-json (CC BY 4.0) · Prayer times: Umm al-Qura for Saudi Arabia, Egyptian General Authority for Egypt · Exercise figures drawn in-app.')}</p>`;
}});
function applyTheme(){ const t = themeNow(); document.documentElement.dataset.theme = t; const a = S.settings.a11y || {}; document.documentElement.classList.toggle('a11y-big', !!a.big); document.documentElement.classList.toggle('a11y-hc', !!a.hc); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = {light: '#f3f4f6', dark: '#0b0d10', yahya: '#071026', batool: '#fbf3f7'}[t]; renderBrand(); try { if (window.Capacitor?.Plugins?.StatusBar) window.Capacitor.Plugins.StatusBar.setBackgroundColor({color: m.content}); } catch (e) {} }
on('click', async e => {
  const T = e.target;
  const ed = T.closest('[data-ed]'); if (ed) { S.settings.edition = ed.dataset.ed; applyTheme(); S.profile.sex = ed.dataset.ed === 'women' ? 'f' : 'm'; if (S.plan?.train) rebuildPlan(); store.save(); renderNav(); render(); rescheduleAll(); return true; }
  const ax = T.closest('[data-a11y]'); if (ax) { S.settings.a11y ||= {}; S.settings.a11y[ax.dataset.a11y] = !S.settings.a11y[ax.dataset.a11y]; store.save(); applyTheme(); render(); return true; }
  const lg = T.closest('[data-lang]'); if (lg) { S.settings.lang = LANG = lg.dataset.lang; store.save(); applyLang(); renderNav(); render(); rescheduleAll(); return true; }
  const th = T.closest('[data-theme]'); if (th && th.tagName === 'BUTTON') { S.settings.theme = th.dataset.theme; S.settings.themeSet = th.dataset.theme !== 'auto'; store.save(); applyTheme(); render(); return true; }
  const cd = T.closest('[data-cday]'); if (cd) { const d = +cd.dataset.cday, set = new Set(S.settings.courseDays || []); set.has(d) ? set.delete(d) : set.add(d); S.settings.courseDays = [...set]; store.save(); render(); rescheduleAll(); return true; }
  if (T.id === 'expJson') { const data = JSON.stringify({app: 'mizan', v: 1, S}), name = 'zad-backup-' + todayISO() + '.json';
    try { const f = new File([data], name, {type: 'application/json'}); if (navigator.canShare && navigator.canShare({files: [f]})) { await navigator.share({files: [f], title: name}); return true; } } catch (er) {}
    if (!isNative()) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], {type: 'application/json'})); a.download = name; a.click(); }
    const o = $('#exportOut'); o.value = data; o.hidden = false; o.select(); toast(L('لو الملف منزلش، انسخ النص ده واحفظه.', 'If no file downloaded, copy this text and save it.')); return true; }
  if (T.id === 'wipe') { $('#wipeC').hidden = false; return true; }
  if (T.id === 'wipeYes') { localStorage.removeItem(LS); location.reload(); return true; }
});
on('change', async e => {
  const T = e.target, s = S.settings;
  if (T.id === 'setSound') { s.sound = T.checked; store.save(); return true; }
  if (T.id === 'setShowW') { s.showWomen = T.checked; store.save(); renderNav(); render(); rescheduleAll(); toast(T.checked ? L('قسم صحة المرأة ظهر في القايمة', 'Women’s health is now in the menu') : L('اتخفى', 'Hidden')); return true; }
  if (T.id === 'setCity') { s.city = T.value; const c = CITIES.find(x => x[0] === T.value); if (c) { s.lat = c[3]; s.lng = c[4]; s.tz = c[5]; s.cityName = c[1]; s.country = c[6]; s.method = c[6] === 'eg' ? 'egypt' : 'uq'; } store.save(); render(); rescheduleAll(); return true; }
  if (['setLat', 'setLng', 'setTz'].includes(T.id)) { s[{setLat: 'lat', setLng: 'lng', setTz: 'tz'}[T.id]] = +T.value; store.save(); rescheduleAll(); return true; }
  if (T.id === 'setGym') { s.gymTime = T.value; S.profile.gymTime = T.value; store.save(); rescheduleAll(); return true; }
  if (T.id === 'setCourse') { s.courseTime = T.value; store.save(); rescheduleAll(); return true; }
  if (T.id === 'impFile') { const f = T.files[0]; if (!f) return true; try { const j = JSON.parse(await f.text()); if (j.app !== 'mizan' || !j.S) throw 0; S = {...S, ...j.S}; store.now(); location.reload(); } catch (er) { toast(L('الملف ده مش نسخة احتياطية من زاد.', 'That is not a Zad backup.')); } return true; }
});

/* ---------- boot ---------- */
(function boot(){
  store.load(); try { famInit(); } catch (e) {} LANG = S.settings.lang || 'ar'; applyLang(); applyTheme(); updateWomen(); LIFE(); try { if (S.plan?.train) applyProgram(S.plan.train); } catch (e) {} try { kitchenAutoRefresh(); } catch (e) {} try { womenAutoShop(); } catch (e) {} if (LIFE().focus.run) focusTick();
  try { const v = localStorage.getItem('mizan-view'); if (v && VIEWS[v]) VIEW = v; } catch (e) {}
  if (!visibleView(VIEW)) VIEW = 'today';
  renderNav(); render();
  $('#splashLine').textContent = L('يلا بينا. النهارده يوم جديد.', 'Let’s go. Today is a new day.');
  setTimeout(() => { $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 600); if (S.planV !== 3) wizStart(!S.onboarded); }, reduceMotion ? 200 : 1300);
  $('#timerStop').onclick = () => { clearInterval(timerT); $('#timer').hidden = true; };
  setTimeout(rescheduleAll, 1500);
  const App = window.Capacitor?.Plugins?.App; if (App) { App.addListener('appStateChange', st => { if (st.isActive) { CUR = todayISO(); try { kitchenAutoRefresh(); } catch (e) {} try { womenAutoShop(); } catch (e) {} render(); rescheduleAll(); } }); App.addListener('backButton', () => { if (!$('#sheet').hidden) closeSheet(); else if (VIEW !== 'today') go('today'); else App.exitApp(); }); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && CUR !== todayISO() && daysBetween(CUR, todayISO()) === 1) { CUR = todayISO(); render(); } });
  if ('serviceWorker' in navigator && !isNative() && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
