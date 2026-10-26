/* ميزان — حياتي: shared helpers, the planner (agenda, month calendar, notes, focus timer),
   occasions & renewals, the "my day" card and every life reminder. */
'use strict';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const LIFE = () => { const l = S.life ||= {}; for (const [k, v] of Object.entries({tasks: [], notes: [], shop: [], shopHist: [], tx: [], budget: {}, fixed: [], meds: [], medLog: {}, events: [], habits: [], habitLog: {}, goals: [], journal: {}, card: {contacts: [], doctors: []}, focus: {log: {}}, currency: 'SAR'})) if (l[k] === undefined) l[k] = JSON.parse(JSON.stringify(v)); return l; };
const money = v => (v === null || v === undefined || isNaN(v)) ? '—' : (+v).toLocaleString('en-US', {maximumFractionDigits: 2}) + ' ' + (LANG === 'en' ? (LIFE().currency || 'SAR') : ({SAR: 'ريال', EGP: 'جنيه', AED: 'درهم', KWD: 'دينار', USD: '$'}[LIFE().currency] || LIFE().currency));
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const monthKey = iso => iso.slice(0, 7);
const sheetHead = t => `<div class="sheet-head"><h2>${t}</h2><button class="btn ghost sm" type="button" data-close="1">${L('قفل', 'Close')}</button></div>`;
const tabSeg = (cur, list, attr) => `<div class="seg tabs">${list.map(([k, l]) => `<button type="button" ${attr}="${k}" aria-pressed="${k === cur}">${l}</button>`).join('')}</div>`;

/* --- fuzzy search (Arabic + English): finds the closest name even with typos --- */
const fnorm = s => String(s || '').toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
const floose = s => fnorm(s).split(' ').map(w => w.replace(/^(وال|بال|فال|كال|لل|ال)(?=.{2,})/, '')).join(' ').replace(/[ثص]/g, 'س').replace(/[ذظ]/g, 'ز').replace(/ض/g, 'د').replace(/ط/g, 'ت').replace(/ق/g, 'ك').replace(/ه\b/g, '').replace(/(.)\1+/g, '$1');
function lev(a, b, max){ if (Math.abs(a.length - b.length) > max) return max + 1; let prev = Array.from({length: b.length + 1}, (_, i) => i); for (let i = 1; i <= a.length; i++) { const cur = [i]; let best = i; for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (cur[j] < best) best = cur[j]; } if (best > max) return max + 1; prev = cur; } return prev[b.length]; }
function fuzzyScore(q, names){
  const qn = fnorm(q), ql = floose(q); if (!qn) return 0; let best = 0;
  for (const nm of names) {
    const n = fnorm(nm), l = floose(nm); if (!n) continue;
    if (n === qn || l === ql) return 1;
    if (n.startsWith(qn) || l.startsWith(ql)) { best = Math.max(best, 0.95 - Math.min(0.2, (n.length - qn.length) * 0.01)); continue; }
    if (n.includes(qn) || (ql.length >= 2 && l.includes(ql))) { best = Math.max(best, 0.85); continue; }
    const qt = ql.split(' ').filter(Boolean), nt = l.split(' ').filter(Boolean); let sum = 0, mx = 0;
    for (const a of qt) { let b = 0; for (const t of nt) { if (t.startsWith(a)) { b = Math.max(b, 0.92); continue; } const thr = a.length <= 3 ? 1 : a.length <= 6 ? 2 : 3, d = lev(a, t.slice(0, Math.max(a.length, Math.min(t.length, a.length + 2))), thr); if (d <= thr) b = Math.max(b, 1 - d / (a.length + 1)); } sum += b; mx = Math.max(mx, a.length >= 3 ? b : 0); }
    best = Math.max(best, qt.length ? sum / qt.length * 0.9 : 0, qt.length > 1 && mx >= 0.85 ? 0.62 : 0);
  }
  return best;
}
function fuzzyFind(q, items, namesOf, limit = 30, min = 0.5){ return items.map(it => ({it, s: fuzzyScore(q, namesOf(it))})).filter(x => x.s >= min).sort((a, b) => b.s - a.s).slice(0, limit).map(x => x.it); }

/* --- month calendar grid --- */
function calGrid(ym, cell, selIso){
  const [y, m] = ym.split('-').map(Number), first = new Date(y, m - 1, 1), start = first.getDay(), days = new Date(y, m, 0).getDate(), today = todayISO();
  const wd = LANG === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
  let h = `<div class="cal">${wd.map(d => `<div class="cal-h">${d}</div>`).join('')}`;
  for (let i = 0; i < start; i++) h += '<div class="cal-e"></div>';
  for (let d = 1; d <= days; d++) { const iso = y + '-' + pad2(m) + '-' + pad2(d), c = cell(iso) || {}; h += `<button type="button" class="cal-d ${iso === today ? 'today' : ''} ${iso === selIso ? 'sel' : ''} ${c.cls || ''}" data-calday="${iso}" ${c.title ? `title="${esc(c.title)}"` : ''}><b>${d}</b>${c.sub ? `<small>${c.sub}</small>` : ''}${c.dots ? `<span class="dots">${c.dots}</span>` : ''}</button>`; }
  return h + '</div>';
}
const monthLabel = ym => D(ym + '-15').toLocaleDateString(locale(), {month: 'long', year: 'numeric'});
const hijriDay = iso => { try { return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {day: 'numeric'}).format(D(iso)); } catch (e) { return ''; } };
const shiftMonth = (ym, n) => { const [y, m] = ym.split('-').map(Number), d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + pad2(d.getMonth() + 1); };

/* ====================== planner ====================== */
const TASK_CATS = {work: ['💼', 'شغل', 'Work'], study: ['📘', 'دراسة وكورسات', 'Study'], personal: ['🙂', 'شخصي', 'Personal'], family: ['👨‍👩‍👧', 'العيلة', 'Family'], faith: ['🕌', 'عبادة', 'Faith'], health: ['❤️', 'صحة', 'Health'], errand: ['🧾', 'مشاوير ومصالح', 'Errands'], home: ['🏠', 'البيت', 'Home']};
const PRIO = {h: ['🔴', 'عالية', 'High'], m: ['🟠', 'متوسطة', 'Medium'], l: ['🟢', 'عادية', 'Low']};
const REPEATS = {none: ['مرة واحدة', 'Once'], daily: ['كل يوم', 'Daily'], weekdays: ['أيام الشغل (أحد–خميس)', 'Workdays (Sun–Thu)'], weekly: ['كل أسبوع', 'Weekly'], monthly: ['كل شهر', 'Monthly'], yearly: ['كل سنة', 'Yearly']};
function occursOn(t, iso){
  if (!t.date) return false; if (iso < t.date) return false; if (t.until && iso > t.until) return false;
  const r = t.repeat || 'none', d = D(iso), s = D(t.date);
  if (r === 'none') return iso === t.date; if (r === 'daily') return true; if (r === 'weekdays') return d.getDay() <= 4;
  if (r === 'weekly') return d.getDay() === s.getDay(); if (r === 'monthly') return d.getDate() === s.getDate(); if (r === 'yearly') return d.getDate() === s.getDate() && d.getMonth() === s.getMonth(); return false;
}
const isDone = (t, iso) => !!(t.done && t.done[t.repeat && t.repeat !== 'none' ? iso : 'x']);
const tasksOn = iso => LIFE().tasks.filter(t => occursOn(t, iso)).sort((a, b) => (a.time || '99') < (b.time || '99') ? -1 : 1);
let PL = {tab: 'agenda', ym: monthKey(todayISO()), sel: todayISO(), filter: 'all', nq: ''};
function taskRow(t, iso, showDate){
  const c = TASK_CATS[t.cat] || TASK_CATS.personal, done = isDone(t, iso), late = !done && iso < todayISO();
  return `<div class="trow ${done ? 'done' : ''} ${late ? 'late' : ''}"><input type="checkbox" class="tick" data-tdone="${t.id}|${iso}" ${done ? 'checked' : ''} aria-label="${L('خلصت', 'Done')}">
    <button type="button" class="tmain" data-tedit="${t.id}"><b>${PRIO[t.prio || 'm'][0]} ${esc(t.title)}</b><small>${c[0]} ${LANG === 'en' ? c[2] : c[1]}${t.project ? ' · ' + esc(t.project) : ''}${showDate ? ' · ' + dShort(iso) : ''}${t.time ? ' · ' + m2t(t2m(t.time)) : ''}${t.repeat && t.repeat !== 'none' ? ' · 🔁' : ''}${t.remind != null && t.remind !== '' && t.time ? ' · 🔔' : ''}</small>${t.notes ? `<span class="tnote">${esc(t.notes).slice(0, 120)}</span>` : ''}</button></div>`;
}
function taskForm(t){
  t ||= {date: PL.sel || todayISO(), cat: 'work', prio: 'm', repeat: 'none', remind: 15};
  return `${sheetHead(t.id ? L('تعديل المهمة', 'Edit task') : L('مهمة جديدة', 'New task'))}<form class="form" id="taskForm" data-id="${t.id || ''}">
    <label class="f">${L('المطلوب', 'What')}<input type="text" id="tf_title" value="${esc(t.title || '')}" required placeholder="${L('مثلًا: تسليم تقرير المشروع', 'e.g. Submit the project report')}"></label>
    <div class="fgrid"><label class="f">${L('اليوم', 'Date')}<input type="date" id="tf_date" value="${t.date || ''}"></label><label class="f">${L('الساعة', 'Time')}<input type="time" id="tf_time" value="${t.time || ''}"></label>
    <label class="f">${L('النوع', 'Category')}<select id="tf_cat">${Object.entries(TASK_CATS).map(([k, v]) => `<option value="${k}" ${t.cat === k ? 'selected' : ''}>${v[0]} ${LANG === 'en' ? v[2] : v[1]}</option>`).join('')}</select></label>
    <label class="f">${L('الأولوية', 'Priority')}<select id="tf_prio">${Object.entries(PRIO).map(([k, v]) => `<option value="${k}" ${t.prio === k ? 'selected' : ''}>${v[0]} ${LANG === 'en' ? v[2] : v[1]}</option>`).join('')}</select></label>
    <label class="f">${L('التكرار', 'Repeat')}<select id="tf_rep">${Object.entries(REPEATS).map(([k, v]) => `<option value="${k}" ${t.repeat === k ? 'selected' : ''}>${LANG === 'en' ? v[1] : v[0]}</option>`).join('')}</select></label>
    <label class="f">${L('فكّرني قبلها', 'Remind me')}<select id="tf_rem">${[['', L('من غير', 'No reminder')], [0, L('في الميعاد', 'At the time')], [5, '5 ' + L('دقايق', 'min')], [15, '15 ' + L('دقيقة', 'min')], [30, '30 ' + L('دقيقة', 'min')], [60, L('ساعة', '1 hour')], [120, L('ساعتين', '2 hours')], [1440, L('يوم', '1 day')]].map(([v, l]) => `<option value="${v}" ${String(t.remind ?? '') === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="f">${L('المشروع (اختياري)', 'Project (optional)')}<input type="text" id="tf_proj" value="${esc(t.project || '')}" list="projList"><datalist id="projList">${[...new Set(LIFE().tasks.map(x => x.project).filter(Boolean))].map(p => `<option value="${esc(p)}">`).join('')}</datalist></label>
    <label class="f">${L('لحد (للمتكرر)', 'Until (repeating)')}<input type="date" id="tf_until" value="${t.until || ''}"></label></div>
    <label class="f">${L('تفاصيل', 'Notes')}<textarea id="tf_notes" rows="3">${esc(t.notes || '')}</textarea></label>
    <div class="row"><button class="btn fire" type="submit">${L('احفظ', 'Save')}</button>${t.id ? `<button class="btn danger" type="button" data-tdel="${t.id}">${L('امسح', 'Delete')}</button>` : ''}</div>
    <p class="muted small" style="margin:0">${L('من غير ساعة: التنبيه الساعة 9 الصبح يوم المهمة.', 'Without a time, the reminder comes at 9 AM that day.')}</p></form>`;
}
function plannerAgenda(){
  const today = todayISO(), all = LIFE().tasks, f = PL.filter, pass = t => f === 'all' || t.cat === f || t.project === f;
  const overdue = all.filter(t => pass(t) && t.date && t.date < today && (!t.repeat || t.repeat === 'none') && !isDone(t, t.date));
  const sec = (title, iso, list) => list.length ? `<div class="card"><div class="head"><h2>${title}</h2><span class="muted small">${list.filter(t => !isDone(t, iso || t.date)).length} ${L('مفتوحة', 'open')}</span></div>${list.map(t => taskRow(t, iso || t.date, !iso)).join('')}</div>` : '';
  const week = []; for (let i = 2; i < 8; i++) { const iso = addDays(today, i); tasksOn(iso).filter(pass).forEach(t => week.push([t, iso])); }
  const undated = all.filter(t => !t.date && pass(t));
  const projects = [...new Set(all.map(t => t.project).filter(Boolean))];
  const todays = tasksOn(today).filter(pass), doneN = todays.filter(t => isDone(t, today)).length;
  return `<div class="card hero"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">${dLong(today)}</div><h2>${todays.length ? L(`${doneN} من ${todays.length} مهام النهارده خلصت`, `${doneN} of ${todays.length} tasks done today`) : L('مفيش مهام النهارده. ضيف أول واحدة.', 'No tasks today. Add one.')}</h2></div><button class="btn fire" type="button" data-tnew="${today}">+ ${L('مهمة', 'Task')}</button></div>${todays.length ? `<div class="bar-prog" style="margin-top:12px"><i style="width:${doneN / todays.length * 100}%"></i></div>` : ''}</div>
    <div class="chips"><button type="button" data-pfilter="all" aria-pressed="${f === 'all'}">${L('الكل', 'All')}</button>${Object.entries(TASK_CATS).map(([k, v]) => `<button type="button" data-pfilter="${k}" aria-pressed="${f === k}">${v[0]} ${LANG === 'en' ? v[2] : v[1]}</button>`).join('')}${projects.map(p => `<button type="button" data-pfilter="${esc(p)}" aria-pressed="${f === p}">📁 ${esc(p)}</button>`).join('')}</div>
    ${overdue.length ? `<div class="card warn-card"><div class="head"><h2>⚠️ ${L('متأخرة', 'Overdue')}</h2></div>${overdue.map(t => taskRow(t, t.date, true)).join('')}</div>` : ''}
    ${sec(L('النهارده', 'Today'), today, todays)}${sec(L('بكرة', 'Tomorrow'), addDays(today, 1), tasksOn(addDays(today, 1)).filter(pass))}
    ${week.length ? `<div class="card"><div class="head"><h2>${L('باقي الأسبوع', 'Rest of the week')}</h2></div>${week.map(([t, iso]) => taskRow(t, iso, true)).join('')}</div>` : ''}
    ${sec(L('من غير ميعاد', 'No date'), 'x', undated)}`;
}
function dayMarks(iso){
  const t = tasksOn(iso).length, ev = typeof eventsOn === 'function' ? eventsOn(iso).length : 0, fast = typeof fastInfo === 'function' ? fastInfo(iso) : null, per = typeof periodMark === 'function' ? periodMark(iso) : '';
  return {dots: '•'.repeat(Math.min(3, t)) + (ev ? '★' : ''), sub: hijriDay(iso), cls: (fast ? 'fast ' : '') + per, title: [t ? t + L(' مهام', ' tasks') : '', ev ? L('مناسبة', 'occasion') : '', fast ? LX(fast.t) : ''].filter(Boolean).join(' · ')};
}
function plannerCal(){
  const sel = PL.sel, list = tasksOn(sel), evs = typeof eventsOn === 'function' ? eventsOn(sel) : [], fast = typeof fastInfo === 'function' ? fastInfo(sel) : null;
  return `<div class="two"><div class="card"><div class="head"><button class="btn ghost sm" type="button" data-plm="-1">${LANG === 'en' ? '‹' : '›'}</button><h2>${monthLabel(PL.ym)}</h2><button class="btn ghost sm" type="button" data-plm="1">${LANG === 'en' ? '›' : '‹'}</button></div>${calGrid(PL.ym, dayMarks, sel)}
    <p class="muted small" style="margin:10px 0 0">• ${L('مهمة', 'task')} · ★ ${L('مناسبة', 'occasion')} · <span class="lg fast"></span> ${L('صيام سُنة', 'sunnah fast')} · ${L('الرقم الصغير = اليوم الهجري', 'small number = Hijri day')}</p></div>
    <div class="card"><div class="head"><div><div class="eyebrow">${dHijri(sel)}</div><h2>${dLong(sel)}</h2></div><button class="btn fire sm" type="button" data-tnew="${sel}">+ ${L('مهمة', 'Task')}</button></div>
    ${fast ? `<div class="banner">🌙 ${esc(LX(fast.t))}</div>` : ''}${evs.map(e => `<div class="banner">★ ${esc(e.title)}</div>`).join('')}
    ${list.length ? list.map(t => taskRow(t, sel)).join('') : `<div class="empty">${L('مفيش مهام اليوم ده.', 'Nothing planned for this day.')}</div>`}</div></div>`;
}
function plannerNotes(){
  const notes = LIFE().notes.slice().sort((a, b) => (b.pin - a.pin) || (b.at - a.at)), q = PL.nq.trim(), list = q ? fuzzyFind(q, notes, n => [n.title, n.body], 50, 0.45) : notes;
  return `<div class="card"><div class="row"><input type="search" id="noteQ" value="${esc(PL.nq)}" placeholder="${L('دوّر في ملاحظاتك', 'Search your notes')}"><button class="btn fire" type="button" data-nnew="1">+ ${L('ملاحظة', 'Note')}</button></div></div>
    <div class="notes">${list.map(n => `<button type="button" class="note ${n.pin ? 'pin' : ''}" data-nedit="${n.id}" style="--nc:${n.color || 'var(--panel)'}"><b>${n.pin ? '📌 ' : ''}${esc(n.title || L('من غير عنوان', 'Untitled'))}</b><span>${esc(n.body || '').slice(0, 220)}</span><small>${dShort(isoOf(new Date(n.at)))}</small></button>`).join('') || `<div class="card empty">${L('مفيش ملاحظات لسه. الملاحظات بتتحفظ على جهازك.', 'No notes yet. Notes stay on your device.')}</div>`}</div>`;
}
function noteForm(n){ n ||= {}; const colors = ['', '#3a2214', '#0f2e29', '#1d2340', '#3d161a', '#2b2a12'];
  return `${sheetHead(n.id ? L('ملاحظة', 'Note') : L('ملاحظة جديدة', 'New note'))}<form class="form" id="noteForm" data-id="${n.id || ''}"><input type="text" id="nf_title" value="${esc(n.title || '')}" placeholder="${L('العنوان', 'Title')}"><textarea id="nf_body" rows="9" placeholder="${L('اكتب هنا…', 'Write here…')}">${esc(n.body || '')}</textarea>
  <div class="row"><label class="row small"><input type="checkbox" class="tick" id="nf_pin" ${n.pin ? 'checked' : ''}> ${L('ثبّتها فوق', 'Pin to top')}</label><span class="grow"></span>${colors.map(c => `<label class="swatch" style="background:${c || 'var(--panel-2)'}"><input type="radio" name="nf_c" value="${c}" ${(n.color || '') === c ? 'checked' : ''}></label>`).join('')}</div>
  <div class="row"><button class="btn fire" type="submit">${L('احفظ', 'Save')}</button>${n.id ? `<button class="btn danger" type="button" data-ndel="${n.id}">${L('امسح', 'Delete')}</button><button class="btn ghost" type="button" data-nshare="${n.id}">${L('شارك', 'Share')}</button>` : ''}</div></form>`; }

/* focus timer (pomodoro) — keeps time from a timestamp, so it survives navigation */
const FOCUS_SUBJ = [['pmp', '📘 PMP'], ['work', L('💼 شغل', '💼 Work')], ['quran', L('📖 قرآن وعلم شرعي', '📖 Quran & study')], ['read', L('📚 قراءة', '📚 Reading')], ['other', L('✨ تاني', '✨ Other')]];
let focusT = null;
function plannerFocus(){
  const F = LIFE().focus, run = F.run, left = run ? Math.max(0, Math.round((run.end - Date.now()) / 1000)) : (F.len || 25) * 60;
  const week = []; for (let i = 6; i >= 0; i--) { const iso = addDays(todayISO(), -i); week.push([iso, Object.values(F.log[iso] || {}).reduce((s, v) => s + v, 0)]); }
  const todayMins = week.at(-1)[1], subj = F.subj || 'pmp', p = run ? 1 - left / (run.len * 60) : 0;
  return `<div class="two"><div class="card tas-card"><div class="eyebrow">${run ? (run.brk ? L('استراحة', 'Break') : L('تركيز', 'Focus')) : L('جاهز', 'Ready')}</div>
    <div class="tas-btn static">${ring(p, 220, 12, run?.brk ? 'var(--teal)' : 'var(--fire)')}<span><b class="num" id="focusClock">${Math.floor(left / 60)}:${pad2(left % 60)}</b><small>${esc((FOCUS_SUBJ.find(s => s[0] === subj) || FOCUS_SUBJ[0])[1])}</small></span></div>
    <div class="row" style="justify-content:center">${run ? `<button class="btn danger" type="button" id="focusStop">${L('وقّف', 'Stop')}</button>` : `<button class="btn fire" type="button" id="focusGo">${L('ابدأ', 'Start')}</button><button class="btn ghost" type="button" id="focusBreak">${L('استراحة', 'Break')} ${F.brk || 5} ${L('د', 'min')}</button>`}</div>
    <div class="seg" style="justify-content:center">${[25, 45, 50, 90].map(m => `<button type="button" data-flen="${m}" aria-pressed="${(F.len || 25) === m}">${m} ${L('د', 'min')}</button>`).join('')}</div>
    <div class="chips" style="justify-content:center">${FOCUS_SUBJ.map(([k, l]) => `<button type="button" data-fsubj="${k}" aria-pressed="${subj === k}">${l}</button>`).join('')}</div></div>
    <div class="card"><div class="head"><h2>${L('وقت التركيز', 'Focus time')}</h2><span class="pill fire">${L('النهارده', 'Today')} ${todayMins} ${L('د', 'min')}</span></div><div class="chart"><canvas id="chFocus"></canvas></div>
    <p class="muted small">${L('25 دقيقة تركيز من غير موبايل، وبعدها 5 دقايق راحة. بعد 4 جلسات خد راحة أطول. ممتاز لمذاكرة PMP.', '25 minutes of focus without the phone, then a 5-minute break; after 4 rounds take a longer break. Great for PMP study.')}</p></div></div>`;
}
function focusTick(){
  clearInterval(focusT); const F = LIFE().focus; if (!F.run) return;
  focusT = setInterval(() => {
    const run = F.run; if (!run) return clearInterval(focusT); const left = Math.max(0, Math.round((run.end - Date.now()) / 1000)), el = $('#focusClock'); if (el) el.textContent = Math.floor(left / 60) + ':' + pad2(left % 60);
    if (left <= 0) { clearInterval(focusT); if (!run.brk) { const iso = todayISO(); (F.log[iso] ||= {})[run.subj] = ((F.log[iso] || {})[run.subj] || 0) + run.len; } F.run = null; store.save(); beep(880, .25, 3); toast(run.brk ? L('الاستراحة خلصت. يلا نكمل 💪', 'Break over. Back to it 💪') : L('جلسة تركيز خلصت ✅ خد 5 دقايق راحة.', 'Focus session done ✅ Take 5.')); if ('Notification' in window && Notification.permission === 'granted' && !isNative()) try { new Notification(L('زاد · التركيز', 'Zad · Focus'), {body: run.brk ? L('الاستراحة خلصت', 'Break over') : L('جلسة خلصت', 'Session done')}); } catch (e) {} if (VIEW === 'planner') render(); }
  }, 1000);
}
async function focusNative(run){ const ln = window.Capacitor?.Plugins?.LocalNotifications; if (!ln) return; try { if (run) await ln.schedule({notifications: [{id: 99001, title: L('زاد · التركيز', 'Zad · Focus'), body: run.brk ? L('الاستراحة خلصت. يلا نكمل', 'Break over') : L('جلسة التركيز خلصت ✅', 'Focus session done ✅'), channelId: 'remind', schedule: {at: new Date(run.end), allowWhileIdle: true}}]}); else await ln.cancel({notifications: [{id: 99001}]}); } catch (e) {} }

registerView('planner', {title: {ar: 'المفكرة', en: 'Planner'}, icon: 'planner', render(){
  const tab = PL.tab;
  const body = tab === 'cal' ? plannerCal() : tab === 'notes' ? plannerNotes() : tab === 'focus' ? plannerFocus() : plannerAgenda();
  return topbar(L('المفكرة', 'Planner'), L('مهامك وشغلك ومواعيدك في مكان واحد، بتنبيهات', 'Tasks, work and appointments in one place, with reminders'), `<button class="btn fire sm" type="button" data-tnew="${PL.sel || todayISO()}">+ ${L('مهمة', 'Task')}</button>`, true) +
    tabSeg(tab, [['agenda', L('المهام', 'Tasks')], ['cal', L('التقويم', 'Calendar')], ['notes', L('ملاحظات', 'Notes')], ['focus', L('تركيز', 'Focus')]], 'data-ptab') + body;
}, after(){ if (PL.tab === 'focus') { focusTick(); const F = LIFE().focus, days = []; for (let i = 6; i >= 0; i--) days.push(addDays(todayISO(), -i)); mk('chFocus', {type: 'bar', data: {labels: days.map(d => WD()[D(d).getDay()].slice(0, LANG === 'en' ? 3 : 10)), datasets: FOCUS_SUBJ.map(([k, l], i) => ({label: l, data: days.map(d => (F.log[d] || {})[k] || 0), backgroundColor: [hexOf('--fire'), hexOf('--blue'), hexOf('--teal'), hexOf('--violet'), hexOf('--ink-3')][i], borderRadius: 4, stack: 's'}))}, options: {scales: {x: {stacked: true}, y: {stacked: true, beginAtZero: true}}}}); } }});

on('click', e => {
  const T = e.target, l = LIFE();
  const tb = T.closest('[data-ptab]'); if (tb) { PL.tab = tb.dataset.ptab; render(); return true; }
  const pf = T.closest('[data-pfilter]'); if (pf) { PL.filter = pf.dataset.pfilter; render(); return true; }
  const nw = T.closest('[data-tnew]'); if (nw) { PL.sel = nw.dataset.tnew; openSheet(taskForm({date: nw.dataset.tnew === 'x' ? '' : nw.dataset.tnew, cat: 'work', prio: 'm', repeat: 'none', remind: 15})); setTimeout(() => $('#tf_title')?.focus(), 50); return true; }
  const ed = T.closest('[data-tedit]'); if (ed) { const t = l.tasks.find(x => x.id === ed.dataset.tedit); if (t) openSheet(taskForm(t)); return true; }
  const dl = T.closest('[data-tdel]'); if (dl) { l.tasks = l.tasks.filter(x => x.id !== dl.dataset.tdel); store.save(); closeSheet(); render(); rescheduleAll(); return true; }
  const cd = T.closest('[data-calday]'); if (cd && VIEW === 'planner') { PL.sel = cd.dataset.calday; render(); return true; }
  const pm = T.closest('[data-plm]'); if (pm) { PL.ym = shiftMonth(PL.ym, +pm.dataset.plm); render(); return true; }
  if (T.closest('[data-nnew]')) { openSheet(noteForm()); return true; }
  const ne = T.closest('[data-nedit]'); if (ne) { openSheet(noteForm(l.notes.find(n => n.id === ne.dataset.nedit))); return true; }
  const nd = T.closest('[data-ndel]'); if (nd) { l.notes = l.notes.filter(n => n.id !== nd.dataset.ndel); store.save(); closeSheet(); render(); return true; }
  const ns = T.closest('[data-nshare]'); if (ns) { const n = l.notes.find(x => x.id === ns.dataset.nshare); shareText((n.title ? n.title + '\n\n' : '') + n.body); return true; }
  if (T.id === 'focusGo' || T.id === 'focusBreak') { const F = l.focus, brk = T.id === 'focusBreak', len = brk ? (F.brk || 5) : (F.len || 25); F.run = {start: Date.now(), end: Date.now() + len * 60000, len, brk, subj: F.subj || 'pmp'}; store.save(); focusNative(F.run); render(); return true; }
  if (T.id === 'focusStop') { const F = l.focus; if (F.run && !F.run.brk) { const mins = Math.floor((Date.now() - F.run.start) / 60000); if (mins >= 1) { const iso = todayISO(); (F.log[iso] ||= {})[F.run.subj] = ((F.log[iso] || {})[F.run.subj] || 0) + mins; } } F.run = null; store.save(); focusNative(null); clearInterval(focusT); render(); return true; }
  const fl = T.closest('[data-flen]'); if (fl) { l.focus.len = +fl.dataset.flen; l.focus.brk = l.focus.len >= 50 ? 10 : 5; store.save(); render(); return true; }
  const fs = T.closest('[data-fsubj]'); if (fs) { l.focus.subj = fs.dataset.fsubj; store.save(); render(); return true; }
});
on('change', e => {
  const T = e.target, l = LIFE();
  if (T.dataset.tdone) { const [id, iso] = T.dataset.tdone.split('|'), t = l.tasks.find(x => x.id === id); if (!t) return true; t.done ||= {}; const k = t.repeat && t.repeat !== 'none' ? iso : 'x'; if (T.checked) { t.done[k] = Date.now(); beep(700, .06, 1); if (navigator.vibrate) try { navigator.vibrate(15); } catch (er) {} } else delete t.done[k]; store.save(); render(); return true; }
});
on('submit', e => {
  const l = LIFE();
  if (e.target.id === 'taskForm') { e.preventDefault(); const id = e.target.dataset.id, v = k => $('#' + k).value; const t = id ? l.tasks.find(x => x.id === id) : {id: uid(), created: Date.now(), done: {}};
    Object.assign(t, {title: v('tf_title').trim(), date: v('tf_date'), time: v('tf_time'), cat: v('tf_cat'), prio: v('tf_prio'), repeat: v('tf_rep'), remind: v('tf_rem') === '' ? null : +v('tf_rem'), project: v('tf_proj').trim(), until: v('tf_until'), notes: v('tf_notes').trim()});
    if (!t.title) return true; if (!id) l.tasks.push(t); store.save(); closeSheet(); toast(L('اتحفظت ✅', 'Saved ✅')); render(); rescheduleAll(); return true; }
  if (e.target.id === 'noteForm') { e.preventDefault(); const id = e.target.dataset.id, n = id ? l.notes.find(x => x.id === id) : {id: uid()}; Object.assign(n, {title: $('#nf_title').value.trim(), body: $('#nf_body').value, pin: $('#nf_pin').checked, color: (document.querySelector('[name=nf_c]:checked') || {}).value || '', at: Date.now()}); if (!n.title && !n.body.trim()) { closeSheet(); return true; } if (!id) l.notes.push(n); store.save(); closeSheet(); render(); return true; }
});
on('input', e => { if (e.target.id === 'noteQ') { PL.nq = e.target.value; clearTimeout(PL.t); PL.t = setTimeout(() => { const pos = e.target.selectionStart; render(); const el = $('#noteQ'); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }, 250); return true; } });
async function shareText(text){ try { if (navigator.share) { await navigator.share({text}); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(text); toast(L('اتنسخ. الصقه في واتساب أو أي مكان.', 'Copied. Paste it anywhere.')); } catch (e) { openSheet(sheetHead(L('انسخ النص', 'Copy the text')) + `<textarea rows="12" readonly>${esc(text)}</textarea>`); } }

/* ====================== occasions & renewals ====================== */
const EV_TYPES = {birthday: ['🎂', 'عيد ميلاد', 'Birthday'], anniv: ['💍', 'ذكرى', 'Anniversary'], renewal: ['🪪', 'تجديد ورق', 'Renewal'], bill: ['🧾', 'فاتورة أو قسط', 'Bill / instalment'], doctor: ['🩺', 'ميعاد دكتور', 'Doctor'], exam: ['📝', 'امتحان', 'Exam'], travel: ['✈️', 'سفر', 'Travel'], islamic: ['🌙', 'مناسبة دينية', 'Islamic occasion'], other: ['📌', 'تاني', 'Other']};
const hParts = iso => { try { const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {day: 'numeric', month: 'numeric', year: 'numeric'}).formatToParts(D(iso)); const g = t => +p.find(x => x.type === t)?.value; return {d: g('day'), m: g('month'), y: g('year')}; } catch (e) { return null; } };
function nextOcc(ev, from){
  from ||= todayISO(); const r = ev.repeat || 'none';
  if (r === 'none') return ev.date >= from ? ev.date : null;
  if (r === 'hijri') { const h0 = hParts(ev.date); if (!h0) return null; for (let i = 0; i < 400; i++) { const iso = addDays(from, i), h = hParts(iso); if (h && h.m === h0.m && h.d === h0.d) return iso; } return null; }
  const s = D(ev.date); let d = D(from > ev.date ? from : ev.date);
  for (let i = 0; i < 400; i++) { const iso = isoOf(d); if (r === 'yearly' ? (d.getMonth() === s.getMonth() && d.getDate() === s.getDate()) : r === 'monthly' ? d.getDate() === Math.min(s.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()) : false) return iso; d.setDate(d.getDate() + 1); }
  return null;
}
function eventsOn(iso){ return LIFE().events.filter(e => nextOcc(e, iso) === iso); }
function evForm(ev){
  ev ||= {type: 'renewal', date: todayISO(), repeat: 'yearly', remind: [30, 7, 1, 0]};
  const rem = ev.remind || [];
  return `${sheetHead(ev.id ? L('تعديل', 'Edit') : L('مناسبة أو تجديد جديد', 'New occasion or renewal'))}<form class="form" id="evForm" data-id="${ev.id || ''}">
    <label class="f">${L('الاسم', 'Title')}<input type="text" id="ef_title" value="${esc(ev.title || '')}" required placeholder="${L('مثلًا: تجديد الإقامة، عيد ميلاد أمي، قسط العربية', 'e.g. Iqama renewal, Mum’s birthday, car instalment')}"></label>
    <div class="fgrid"><label class="f">${L('النوع', 'Type')}<select id="ef_type">${Object.entries(EV_TYPES).map(([k, v]) => `<option value="${k}" ${ev.type === k ? 'selected' : ''}>${v[0]} ${LANG === 'en' ? v[2] : v[1]}</option>`).join('')}</select></label>
    <label class="f">${L('التاريخ', 'Date')}<input type="date" id="ef_date" value="${ev.date || ''}" required></label>
    <label class="f">${L('بيتكرر', 'Repeats')}<select id="ef_rep">${[['none', L('مرة واحدة', 'Once')], ['yearly', L('كل سنة (ميلادي)', 'Yearly (Gregorian)')], ['hijri', L('كل سنة (هجري)', 'Yearly (Hijri)')], ['monthly', L('كل شهر', 'Monthly')]].map(([k, l]) => `<option value="${k}" ${ev.repeat === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="f">${L('المبلغ لو فيه', 'Amount if any')}<input type="number" step="0.01" id="ef_amt" value="${ev.amount ?? ''}"></label></div>
    <div><div class="eyebrow">${L('فكّرني قبلها بـ', 'Remind me before')}</div><div class="chips" style="margin-top:6px">${[60, 30, 14, 7, 3, 1, 0].map(d => `<label class="cb"><input type="checkbox" class="ef_rem" value="${d}" ${rem.includes(d) ? 'checked' : ''}> ${d === 0 ? L('في اليوم نفسه', 'On the day') : d + L(' يوم', ' d')}</label>`).join('')}</div></div>
    <label class="f">${L('ملاحظات', 'Notes')}<textarea id="ef_notes" rows="2">${esc(ev.notes || '')}</textarea></label>
    <div class="row"><button class="btn fire" type="submit">${L('احفظ', 'Save')}</button>${ev.id ? `<button class="btn danger" type="button" data-evdel="${ev.id}">${L('امسح', 'Delete')}</button>` : ''}</div></form>`;
}
const EV_SUGGEST = [['renewal', 'تجديد الإقامة', 'Iqama renewal'], ['renewal', 'تجديد رخصة القيادة', 'Driving licence renewal'], ['renewal', 'تجديد استمارة العربية', 'Vehicle registration renewal'], ['renewal', 'تأمين العربية', 'Car insurance'], ['renewal', 'الفحص الدوري للعربية', 'Vehicle inspection'], ['renewal', 'تجديد جواز السفر', 'Passport renewal'], ['renewal', 'التأمين الطبي', 'Health insurance'], ['bill', 'الإيجار', 'Rent'], ['bill', 'فاتورة النت', 'Internet bill'], ['bill', 'فاتورة الكهربا', 'Electricity bill'], ['exam', 'امتحان PMP', 'PMP exam'], ['doctor', 'متابعة دكتور الجهاز الهضمي', 'Gastroenterologist follow-up'], ['doctor', 'تحاليل كل 3 شهور', 'Labs every 3 months'], ['birthday', 'عيد ميلاد', 'Birthday']];
registerView('events', {title: {ar: 'المناسبات والتجديدات', en: 'Occasions & renewals'}, icon: 'events', render(){
  const list = LIFE().events.map(e => ({e, n: nextOcc(e)})).filter(x => x.n).sort((a, b) => a.n < b.n ? -1 : 1), past = LIFE().events.filter(e => !nextOcc(e));
  const row = ({e, n}) => { const d = daysBetween(todayISO(), n), t = EV_TYPES[e.type] || EV_TYPES.other; return `<button type="button" class="evrow" data-evedit="${e.id}"><span class="evi">${t[0]}</span><span class="grow"><b>${esc(e.title)}</b><small>${dLong(n)} · ${dHijri(n)}${e.amount ? ' · ' + money(e.amount) : ''}</small></span><span class="pill ${d <= 3 ? 'red' : d <= 14 ? 'amber' : 'grey'}">${d === 0 ? L('النهارده', 'Today') : d === 1 ? L('بكرة', 'Tomorrow') : L(`بعد ${d} يوم`, `in ${d} d`)}</span></button>`; };
  return topbar(L('المناسبات والتجديدات', 'Occasions & renewals'), L('الإقامة والرخصة والاستمارة والفواتير وأعياد الميلاد… بتنبيه قبلها', 'Iqama, licence, bills, birthdays… with reminders ahead'), `<button class="btn fire sm" type="button" data-evnew="1">+ ${L('ضيف', 'Add')}</button>`, true) + `
  ${list.length ? `<div class="card">${list.map(row).join('')}</div>` : `<div class="card empty">${L('لسه مفيش حاجة. ابدأ من الاقتراحات تحت.', 'Nothing yet. Start from the suggestions below.')}</div>`}
  <div class="card"><div class="head"><h2>${L('اقتراحات سريعة', 'Quick suggestions')}</h2></div><div class="chips">${EV_SUGGEST.map((s, i) => `<button type="button" data-evsug="${i}">${EV_TYPES[s[0]][0]} ${LANG === 'en' ? s[2] : s[1]}</button>`).join('')}</div></div>
  ${past.length ? `<div class="card"><div class="head"><h2>${L('خلصت', 'Past')}</h2></div>${past.map(e => `<button type="button" class="evrow muted" data-evedit="${e.id}"><span class="evi">${(EV_TYPES[e.type] || EV_TYPES.other)[0]}</span><span class="grow"><b>${esc(e.title)}</b><small>${dLong(e.date)}</small></span></button>`).join('')}</div>` : ''}`;
}});
on('click', e => {
  const T = e.target, l = LIFE();
  if (T.closest('[data-evnew]')) { openSheet(evForm()); return true; }
  const sg = T.closest('[data-evsug]'); if (sg) { const s = EV_SUGGEST[+sg.dataset.evsug]; openSheet(evForm({type: s[0], title: LANG === 'en' ? s[2] : s[1], date: todayISO(), repeat: s[0] === 'exam' || s[0] === 'doctor' ? 'none' : s[0] === 'bill' ? 'monthly' : 'yearly', remind: s[0] === 'renewal' ? [60, 30, 7, 1] : [3, 1, 0]})); return true; }
  const ed = T.closest('[data-evedit]'); if (ed) { openSheet(evForm(l.events.find(x => x.id === ed.dataset.evedit))); return true; }
  const dl = T.closest('[data-evdel]'); if (dl) { l.events = l.events.filter(x => x.id !== dl.dataset.evdel); store.save(); closeSheet(); render(); rescheduleAll(); return true; }
});
on('submit', e => {
  if (e.target.id !== 'evForm') return; e.preventDefault(); const l = LIFE(), id = e.target.dataset.id, ev = id ? l.events.find(x => x.id === id) : {id: uid()};
  Object.assign(ev, {title: $('#ef_title').value.trim(), type: $('#ef_type').value, date: $('#ef_date').value, repeat: $('#ef_rep').value, amount: num($('#ef_amt').value), notes: $('#ef_notes').value.trim(), remind: $$('.ef_rem').filter(x => x.checked).map(x => +x.value)});
  if (!ev.title || !ev.date) return true; if (!id) l.events.push(ev); store.save(); closeSheet(); toast(L('اتحفظ ✅', 'Saved ✅')); render(); rescheduleAll(); return true;
});

/* ====================== my day (on Today) ====================== */
function lifeTodayCard(){
  const iso = todayISO(), l = LIFE(), tasks = tasksOn(iso), open = tasks.filter(t => !isDone(t, iso));
  const meds = typeof medDosesOn === 'function' ? medDosesOn(iso) : [], medsOpen = meds.filter(d => !d.taken);
  const evs = l.events.map(e => ({e, n: nextOcc(e)})).filter(x => x.n && daysBetween(iso, x.n) <= 7).sort((a, b) => a.n < b.n ? -1 : 1);
  const shopN = l.shop.filter(x => !x.bought).length, shopDue = l.shop.filter(x => !x.bought && x.need && x.need <= iso).length;
  const fast = typeof fastInfo === 'function' ? (fastInfo(iso) || fastInfo(addDays(iso, 1)) && {t: {ar: 'بكرة: ' + LX(fastInfo(addDays(iso, 1)).t), en: 'Tomorrow: ' + LX(fastInfo(addDays(iso, 1)).t)}}) : null;
  const hab = typeof habitsToday === 'function' ? habitsToday() : null;
  const kh = typeof khatmaToday === 'function' ? khatmaToday() : null;
  const items = [];
  open.slice(0, 4).forEach(t => items.push(`<label class="tl"><span class="t">${t.time ? m2t(t2m(t.time)) : '—'}</span><input type="checkbox" class="tick" data-tdone="${t.id}|${iso}"><span class="lab">${PRIO[t.prio || 'm'][0]} ${esc(t.title)}</span></label>`));
  medsOpen.slice(0, 3).forEach(d => items.push(`<label class="tl"><span class="t">${m2t(t2m(d.time))}</span><input type="checkbox" class="tick" data-medtake="${d.id}|${d.time}|${iso}"><span class="lab">💊 ${esc(d.name)}${d.dose ? ` <small>${esc(d.dose)}</small>` : ''}</span></label>`));
  const chips = [
    tasks.length ? `<button type="button" class="lchip" data-v="planner">📝 ${L(`${open.length} مهام فاضلة`, `${open.length} tasks left`)}</button>` : '',
    shopN ? `<button type="button" class="lchip ${shopDue ? 'hot' : ''}" data-v="shop">🛒 ${L(`${shopN} في قايمة المشتريات`, `${shopN} on the shopping list`)}${shopDue ? L(` · ${shopDue} مطلوبين النهارده`, ` · ${shopDue} due`) : ''}</button>` : '',
    ...evs.slice(0, 3).map(({e, n}) => `<button type="button" class="lchip ${daysBetween(iso, n) <= 1 ? 'hot' : ''}" data-v="events">${(EV_TYPES[e.type] || EV_TYPES.other)[0]} ${esc(e.title)} · ${daysBetween(iso, n) === 0 ? L('النهارده', 'today') : L(`بعد ${daysBetween(iso, n)} يوم`, `in ${daysBetween(iso, n)} d`)}</button>`),
    fast ? `<button type="button" class="lchip" data-v="hijri">🌙 ${esc(LX(fast.t))}</button>` : '',
    hab && hab.total ? `<button type="button" class="lchip" data-v="habits">✅ ${L(`العادات ${hab.done}/${hab.total}`, `Habits ${hab.done}/${hab.total}`)}</button>` : '',
    kh ? `<button type="button" class="lchip" data-v="khatma">📖 ${esc(kh)}</button>` : ''
  ].filter(Boolean);
  if (!items.length && !chips.length) return `<div class="card"><div class="head"><h2>${L('يومك', 'Your day')}</h2></div><div class="chips"><button type="button" data-v="planner">📝 ${L('ضيف مهمة', 'Add a task')}</button><button type="button" data-v="shop">🛒 ${L('قايمة مشتريات', 'Shopping list')}</button><button type="button" data-v="meds">💊 ${L('أدويتي', 'My medicines')}</button><button type="button" data-v="events">🪪 ${L('تجديدات ومناسبات', 'Renewals & occasions')}</button></div></div>`;
  return `<div class="card"><div class="head"><h2>${L('يومك', 'Your day')}</h2><button class="btn ghost sm" type="button" data-v="planner">${L('المفكرة', 'Planner')}</button></div>${items.length ? `<div class="timeline">${items.join('')}</div>` : ''}${chips.length ? `<div class="lchips">${chips.join('')}</div>` : ''}</div>`;
}

/* ====================== reminders from every life section ====================== */
function lifeReminders(iso, push){
  const n = S.settings.notify, l = LIFE();
  if (n.tasks !== false) tasksOn(iso).forEach(t => { if (isDone(t, iso)) return; if (t.time && t.remind != null) { const m = t2m(t.time) - t.remind; if (t.remind >= 1440) { /* the day before */ } else push('task-' + t.id, m, (PRIO[t.prio || 'm'][0]) + ' ' + t.title, t.remind ? L(`بعد ${t.remind >= 60 ? t.remind / 60 + ' ساعة' : t.remind + ' دقيقة'}`, `In ${t.remind} min`) + (t.notes ? ' · ' + t.notes.slice(0, 60) : '') : (t.notes || L('دلوقتي', 'Now')), 'remind'); } else if (!t.time && t.remind != null) push('task-' + t.id, 9 * 60, '📝 ' + t.title, L('مهمة النهارده', 'Today’s task'), 'remind'); });
  if (n.tasks !== false) tasksOn(addDays(iso, 1)).forEach(t => { if (t.time && t.remind >= 1440 && !isDone(t, addDays(iso, 1))) push('task1d-' + t.id, t2m(t.time), '📝 ' + L('بكرة: ', 'Tomorrow: ') + t.title, m2t(t2m(t.time)), 'remind'); });
  if (n.events !== false) l.events.forEach(e => { const nx = nextOcc(e, iso); if (!nx) return; const d = daysBetween(iso, nx); if ((e.remind || []).includes(d)) push('ev-' + e.id + '-' + d, 9 * 60, (EV_TYPES[e.type] || EV_TYPES.other)[0] + ' ' + e.title, d === 0 ? L('النهارده', 'Today') : d === 1 ? L('بكرة', 'Tomorrow') : L(`فاضل ${d} يوم · ${dShort(nx)}`, `${d} days left · ${dShort(nx)}`), 'remind'); });
  if (typeof shopReminders === 'function' && n.shop !== false) shopReminders(iso, push);
  if (typeof medReminders === 'function' && n.meds !== false) medReminders(iso, push);
  if (typeof billReminders === 'function' && n.bills !== false) billReminders(iso, push);
  if (typeof habitReminders === 'function' && n.habits !== false) habitReminders(iso, push);
  if (typeof islamicReminders === 'function') islamicReminders(iso, push);
}
