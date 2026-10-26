/* ميزان — background nasheed player. Tracks come from the /nasheed folder (bundled at build time)
   or are picked from the device and kept in IndexedDB. Playback continues while you browse the app,
   pauses for the adhan and resumes after it. */
'use strict';
let NASHEEDS = [];
fetch('data/nasheeds.json').then(r => r.ok ? r.json() : []).then(j => { NASHEEDS = Array.isArray(j) ? j : []; if (VIEW === 'nasheed') render(); }).catch(() => {});
const MU = {el: null, idx: -1, list: [], url: null, ducked: false, sleepAt: 0, sleepT: null, started: false};
const NS = () => S.nasheed ||= {vol: 0.6, shuffle: true, repeat: 'all', auto: false, local: [], last: null};
function trackList(){ return [...NASHEEDS.map(n => ({key: 'b:' + n.file, name: n.name, src: 'nasheed/' + n.file})), ...(NS().local || []).map(n => ({key: 'l:' + n.id, name: n.name, id: n.id}))]; }
function muEl(){ if (MU.el) return MU.el; const a = MU.el = new Audio(); a.preload = 'auto'; a.volume = NS().vol;
  a.addEventListener('ended', () => muNext(true)); a.addEventListener('play', muUI); a.addEventListener('pause', muUI); a.addEventListener('error', () => { toast(L('الملف ده مش راضي يشتغل، هنشغّل اللي بعده.', 'That file failed to play; skipping.')); setTimeout(() => muNext(true), 400); });
  a.addEventListener('timeupdate', () => { const b = $('#muBar'); if (b && a.duration) b.style.width = (a.currentTime / a.duration * 100) + '%'; }); return a; }
async function muPlay(i){
  const list = MU.list = trackList(); if (!list.length) { toast(L('لسه مفيش أناشيد. ضيف من صفحة الأناشيد.', 'No nasheeds yet. Add some on the Nasheeds page.')); go('nasheed'); return; }
  MU.idx = ((i % list.length) + list.length) % list.length; const t = list[MU.idx], a = muEl();
  if (MU.url) { URL.revokeObjectURL(MU.url); MU.url = null; }
  if (t.id) { const blob = await idb.get('nsh-' + t.id); if (!blob) { toast(L('الملف اتمسح من الجهاز.', 'The file is missing on this device.')); return; } a.src = MU.url = URL.createObjectURL(blob); } else a.src = t.src;
  NS().last = t.key; store.save(); MU.started = true;
  try { await a.play(); } catch (e) { /* needs a tap first */ }
  if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = new MediaMetadata({title: t.name, artist: L('زاد · أناشيد', 'Zad · Nasheeds'), artwork: [{src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png'}]}); ['play', 'pause', 'nexttrack', 'previoustrack'].forEach(act => navigator.mediaSession.setActionHandler(act, () => act === 'play' ? a.play() : act === 'pause' ? a.pause() : act === 'nexttrack' ? muNext() : muPrev())); } catch (e) {} }
  muUI();
}
function muNext(auto){ const n = MU.list.length || trackList().length; if (!n) return; if (auto && NS().repeat === 'one') return muPlay(MU.idx); if (NS().shuffle && n > 1) { let j; do { j = Math.floor(Math.random() * n); } while (j === MU.idx); return muPlay(j); } if (auto && NS().repeat === 'off' && MU.idx === n - 1) { muUI(); return; } muPlay(MU.idx + 1); }
function muPrev(){ const a = muEl(); if (a.currentTime > 4) { a.currentTime = 0; return; } muPlay(MU.idx - 1); }
function muToggle(){ const a = muEl(); if (MU.idx < 0) { const list = trackList(), li = list.findIndex(t => t.key === NS().last); return muPlay(li >= 0 ? li : NS().shuffle ? Math.floor(Math.random() * list.length) : 0); } a.paused ? a.play().catch(() => {}) : a.pause(); }
function muStop(){ const a = muEl(); a.pause(); MU.idx = -1; MU.started = false; clearTimeout(MU.sleepT); MU.sleepAt = 0; muUI(); }
/* adhan takes priority */
function musicDuck(){ if (MU.el && !MU.el.paused) { MU.el.pause(); MU.ducked = true; } }
function musicUnduck(){ if (MU.ducked && MU.el) { MU.ducked = false; MU.el.play().catch(() => {}); } }
(() => { const p = document.getElementById('player'); if (p) { p.addEventListener('ended', musicUnduck); p.addEventListener('pause', () => setTimeout(() => { if (p.paused) musicUnduck(); }, 300)); } })();
/* optional autostart on the first tap (browsers block sound before a tap) */
document.addEventListener('pointerdown', () => { const ns = NS(); if (ns.auto && !MU.started && trackList().length) { MU.started = true; setTimeout(() => muPlay(ns.shuffle ? Math.floor(Math.random() * trackList().length) : Math.max(0, trackList().findIndex(t => t.key === ns.last))), 60); } }, {once: true, capture: true});
function muUI(){
  const box = $('#mini'); if (!box) return; const a = MU.el, t = MU.list[MU.idx];
  if (!t || MU.idx < 0) { box.hidden = true; document.body.classList.remove('has-mini'); if (VIEW === 'nasheed') render(); return; }
  box.hidden = false; document.body.classList.add('has-mini');
  box.innerHTML = `<div class="mini-in"><button type="button" class="mi-b" data-mu="prev" aria-label="${L('اللي قبله', 'Previous')}">${LANG === 'en' ? '⏮' : '⏭'}</button><button type="button" class="mi-b big" data-mu="toggle" aria-label="${a && !a.paused ? L('إيقاف مؤقت', 'Pause') : L('تشغيل', 'Play')}">${a && !a.paused ? '⏸' : '▶'}</button><button type="button" class="mi-b" data-mu="next" aria-label="${L('اللي بعده', 'Next')}">${LANG === 'en' ? '⏭' : '⏮'}</button>
    <button type="button" class="mi-t" data-v="nasheed"><b>${esc(t.name)}</b><small>${MU.sleepAt ? L('هيقف بعد ', 'Stops in ') + Math.max(1, Math.round((MU.sleepAt - Date.now()) / 60000)) + L(' د', ' min') : L('أناشيد في الخلفية', 'Nasheeds in the background')}</small></button>
    <button type="button" class="mi-b" data-mu="stop" aria-label="${L('قفل', 'Close')}">✕</button></div><div class="mi-prog"><i id="muBar"></i></div>`;
  if (VIEW === 'nasheed') { const pl = $$('[data-muplay]'); pl.forEach(b => b.classList.toggle('on', +b.dataset.muplay === MU.idx)); const tg = $('#muBig'); if (tg) tg.textContent = a && !a.paused ? '⏸' : '▶'; }
}
registerView('nasheed', {title: {ar: 'الأناشيد', en: 'Nasheeds'}, icon: 'music', render(){
  const ns = NS(), list = MU.list = trackList(), a = MU.el, playing = a && !a.paused;
  return topbar(L('الأناشيد', 'Nasheeds'), L('بتفضل شغالة وإنت بتتنقل في التطبيق، وبتقف للأذان', 'Keep playing while you browse, pause for the adhan'), '', true) + `
  <div class="two">
    <div class="card"><div class="head"><h2>${L('المشغّل', 'Player')}</h2><span class="muted small">${list.length} ${L('نشيد', 'tracks')}</span></div>
      <div class="mu-ctl"><button class="btn ghost" type="button" data-mu="prev">${LANG === 'en' ? '⏮' : '⏭'}</button><button class="btn fire mu-big" type="button" data-mu="toggle" id="muBig">${playing ? '⏸' : '▶'}</button><button class="btn ghost" type="button" data-mu="next">${LANG === 'en' ? '⏭' : '⏮'}</button></div>
      <label class="f">${L('الصوت', 'Volume')}<input type="range" min="0" max="1" step="0.05" id="muVol" value="${ns.vol}"></label>
      <div class="chips" style="margin-top:10px"><button type="button" data-muopt="shuffle" aria-pressed="${!!ns.shuffle}">🔀 ${L('عشوائي', 'Shuffle')}</button><button type="button" data-muopt="repeat" aria-pressed="${ns.repeat !== 'off'}">🔁 ${ns.repeat === 'one' ? L('كرر نفس النشيد', 'Repeat one') : ns.repeat === 'all' ? L('كرر القايمة', 'Repeat all') : L('من غير تكرار', 'No repeat')}</button><button type="button" data-muopt="auto" aria-pressed="${!!ns.auto}">⚡ ${L('شغّل لما أفتح التطبيق', 'Start when I open the app')}</button></div>
      <div class="row" style="margin-top:12px"><span class="muted small">${L('إيقاف تلقائي بعد', 'Sleep timer')}:</span>${[15, 30, 60].map(m => `<button class="btn ghost sm" type="button" data-musleep="${m}">${m} ${L('د', 'min')}</button>`).join('')}${MU.sleepAt ? `<button class="link" type="button" data-musleep="0">${L('إلغاء', 'Cancel')}</button>` : ''}</div></div>
    <div class="card"><div class="head"><h2>${L('ضيف أناشيد', 'Add nasheeds')}</h2></div>
      <p class="muted small" style="margin-top:0">${L('اختار ملفات صوت (mp3) من موبايلك أو اللاب، وهتتحفظ جوه التطبيق وتشتغل من غير نت. اختار أناشيد من غير موسيقى ومسموح لك بيها.', 'Pick audio files (mp3) from your phone or laptop; they are stored in the app and play offline. Choose music-free nasheeds you are allowed to use.')}</p>
      <label class="btn fire" for="muFile" style="cursor:pointer;display:inline-flex">${L('اختار ملفات', 'Pick files')}</label><input type="file" id="muFile" accept="audio/*" multiple hidden>
      <p class="muted small">${L('أو حطها في فولدر nasheed في المشروع على GitHub، وهتتضاف لكل الأجهزة مع التحديث الجاي.', 'Or put them in the project’s nasheed folder on GitHub and they ship to every device with the next update.')}</p></div>
  </div>
  <div class="card"><div class="head"><h2>${L('قايمة التشغيل', 'Playlist')}</h2></div>
    ${list.length ? `<div class="mu-list">${list.map((t, i) => `<div class="mu-row"><button type="button" data-muplay="${i}" class="${i === MU.idx ? 'on' : ''}"><span class="num">${i + 1}</span><b>${esc(t.name)}</b><small>${t.id ? L('من جهازي', 'On this device') : L('مع التطبيق', 'Bundled')}</small></button>${t.id ? `<button class="link" type="button" data-mudel="${t.id}" aria-label="${L('امسح', 'Delete')}">✕</button>` : ''}</div>`).join('')}</div>` : `<div class="empty">${L('لسه مفيش أناشيد. دوس "اختار ملفات" وضيف اللي تحبه.', 'No nasheeds yet. Tap "Pick files" to add some.')}</div>`}</div>`;
}});
on('click', async e => {
  const T = e.target, ns = NS();
  const m = T.closest('[data-mu]'); if (m) { const k = m.dataset.mu; if (k === 'toggle') muToggle(); else if (k === 'next') muNext(); else if (k === 'prev') muPrev(); else if (k === 'stop') muStop(); return true; }
  const p = T.closest('[data-muplay]'); if (p) { const i = +p.dataset.muplay; if (i === MU.idx && MU.el) { MU.el.paused ? MU.el.play() : MU.el.pause(); } else muPlay(i); return true; }
  const o = T.closest('[data-muopt]'); if (o) { const k = o.dataset.muopt; if (k === 'repeat') ns.repeat = ns.repeat === 'all' ? 'one' : ns.repeat === 'one' ? 'off' : 'all'; else ns[k] = !ns[k]; store.save(); render(); return true; }
  const sl = T.closest('[data-musleep]'); if (sl) { clearTimeout(MU.sleepT); const mins = +sl.dataset.musleep; MU.sleepAt = mins ? Date.now() + mins * 60000 : 0; if (mins) { MU.sleepT = setTimeout(() => { const a = muEl(); let v = a.volume; const f = setInterval(() => { v -= 0.05; if (v <= 0.02) { clearInterval(f); a.pause(); a.volume = ns.vol; MU.sleepAt = 0; muUI(); } else a.volume = v; }, 250); }, mins * 60000); toast(L(`هيقف بعد ${mins} دقيقة`, `Stops in ${mins} min`)); } render(); muUI(); return true; }
  const d = T.closest('[data-mudel]'); if (d) { const id = d.dataset.mudel, cur = MU.list[MU.idx]; if (cur && cur.id === id) muStop(); await idb.del('nsh-' + id); ns.local = (ns.local || []).filter(x => x.id !== id); store.save(); render(); return true; }
});
on('change', async e => {
  if (e.target.id === 'muFile') { const files = [...e.target.files]; if (!files.length) return true; const ns = NS(); ns.local ||= [];
    for (const f of files) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); try { await idb.put('nsh-' + id, f); ns.local.push({id, name: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')}); } catch (er) { toast(L('مساحة الجهاز مش كفاية لملف: ', 'Not enough space for: ') + f.name); } }
    store.save(); toast(L(`اتضاف ${files.length} نشيد`, `${files.length} added`)); render(); return true; }
});
on('input', e => { if (e.target.id === 'muVol') { const v = +e.target.value; NS().vol = v; if (MU.el) MU.el.volume = v; store.save(); return true; } });
