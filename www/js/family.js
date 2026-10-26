/* زاد — أفراد العيلة على نفس الجهاز. الفرد النشط بياناته في S مباشرة (فكل الأقسام شغالة زي ما هي)،
   والباقيين محفوظين في S.family.store. البيانات الشخصية بتتبدّل عند التنقل، والمشتركة (المشتريات والفلوس والمناسبات…) ثابتة للكل. */
'use strict';
const FAM_PERSONAL = ['profile', 'days', 'labs', 'women', 'plan', 'planV', 'onboarded', 'adhkar', 'tasbeeh', 'khatma', 'quran', 'baby'];
const FAM_LIFE = ['meds', 'medLog', 'habits', 'habitLog', 'goals', 'journal', 'card', 'focus'];
const FAM_SET = ['edition', 'theme', 'themeSet', 'gymTime', 'courseDays', 'courseTime', 'courseName', 'showWomen', 'a11y'];
const PROG0 = typeof PROG !== 'undefined' ? JSON.parse(JSON.stringify(PROG)) : null, GYM0 = typeof GYM !== 'undefined' ? [...GYM] : [];
function resetProgram(){ if (PROG0) { PROG = JSON.parse(JSON.stringify(PROG0)); GYM = [...GYM0]; } }
const clone = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
function famInit(){
  if (S.family?.list?.length) return S.family;
  S.family = {active: 'm1', list: [{id: 'm1', name: S.profile?.name || '', ed: S.settings.edition || 'men', rel: 'me'}], store: {}};
  return S.family;
}
function famMe(){ famInit(); return S.family.list.find(m => m.id === S.family.active) || S.family.list[0]; }
function famSnap(){
  const o = {}; FAM_PERSONAL.forEach(k => { if (S[k] !== undefined) o[k] = clone(S[k]); });
  const l = LIFE(); o.life = {}; FAM_LIFE.forEach(k => { o.life[k] = clone(l[k]); }); o.set = {}; FAM_SET.forEach(k => { o.set[k] = clone(S.settings[k]); });
  return o;
}
function famLoad(o){
  FAM_PERSONAL.forEach(k => { delete S[k]; if (o && o[k] !== undefined) S[k] = clone(o[k]); });
  S.profile ||= {...DEF_PROFILE, conds: [], meds: [], allergies: [], injuries: [], dislikes: []}; S.days ||= {}; S.labs ||= []; S.women ||= {}; S.adhkar ||= {}; S.quran ||= {}; S.onboarded ??= false;
  const l = LIFE(); FAM_LIFE.forEach(k => { delete l[k]; if (o?.life?.[k] !== undefined) l[k] = clone(o.life[k]); }); LIFE();
  FAM_SET.forEach(k => { if (o?.set && o.set[k] !== undefined) S.settings[k] = clone(o.set[k]); else if (DEF_SETTINGS[k] !== undefined) S.settings[k] = clone(DEF_SETTINGS[k]); else delete S.settings[k]; });
}
function famSync(){ const m = famMe(); m.name = S.profile?.name || m.name; m.ed = S.settings.edition || m.ed; m.stage = typeof stageOf === 'function' ? stageOf(S.profile).k : m.stage; }
function famSwitch(id, fresh){
  famInit(); if (id === S.family.active && !fresh) return;
  famSync(); S.family.store[S.family.active] = famSnap();
  famLoad(S.family.store[id]); delete S.family.store[id]; S.family.active = id;
  const m = famMe(); if (!S.family.store[id] && fresh) { S.settings.edition = m.ed; S.profile.name = m.name; if (m.ed === 'women') S.profile.sex = 'f'; }
  if (typeof updateWomen === 'function') updateWomen();
  if (S.plan?.train && typeof applyProgram === 'function') applyProgram(S.plan.train); else if (typeof resetProgram === 'function') resetProgram();
  store.now(); applyTheme(); renderNav(); CUR = todayISO(); go('today'); rescheduleAll();
  if (!S.onboarded || S.planV !== 3) setTimeout(() => wizStart(!S.onboarded), 200);
  toast(L('دلوقتي على ملف ', 'Now on ') + (m.name || L('فرد جديد', 'new member')));
}
const FAM_REL = {me: ['أنا', 'Me'], wife: ['زوجتي', 'Wife'], husband: ['زوجي', 'Husband'], son: ['ابني', 'Son'], daughter: ['بنتي', 'Daughter'], father: ['أبويا', 'Father'], mother: ['أمي', 'Mother'], brother: ['أخويا', 'Brother'], sister: ['أختي', 'Sister'], other: ['حد تاني', 'Other']};
const STAGE_EMO = {infant: '👶', baby: '👶', toddler: '🧒', preschool: '🧒', child: '🧒', teen: '🧑', adult: '🧑', senior: '🧓', elder: '🧓', preg: '🤰', post: '🤱'};
function famAvatar(m){ const e = STAGE_EMO[m.stage] || (m.ed === 'women' ? '👩' : '👨'); return e; }
function famChip(){ const m = famMe(); return `<button type="button" class="famchip" data-fam="1" aria-label="${L('تغيير الفرد', 'Switch member')}: ${esc(m.name || '')}"><span>${famAvatar(m)}</span><b>${esc(m.name || L('أنا', 'Me'))}</b><i aria-hidden="true">▾</i></button>`; }
function famSheet(){
  famSync(); const f = S.family;
  openSheet(`${sheetHead('👨‍👩‍👧 ' + L('أفراد العيلة', 'Family'))}
    <p class="muted small" style="margin-top:0">${L('كل فرد ليه خطته وأكله وقياساته وأدويته لوحده. المشتريات والفلوس والمناسبات والمهام مشتركة بين الكل.', 'Each member has their own plan, meals, logs and medicines. Shopping, money, events and tasks are shared.')}</p>
    <div class="famlist">${f.list.map(m => `<div class="famrow ${m.id === f.active ? 'on' : ''}"><button type="button" class="grow" data-famgo="${m.id}"><span class="av">${famAvatar(m)}</span><span><b>${esc(m.name || L('من غير اسم', 'Unnamed'))}</b><small>${edName(m.ed)} · ${LX({ar: (FAM_REL[m.rel] || FAM_REL.other)[0], en: (FAM_REL[m.rel] || FAM_REL.other)[1]})}${m.id === f.active ? ' · ' + L('المفتوح دلوقتي', 'active') : ''}</small></span></button>${m.id !== f.active ? `<button class="link" type="button" data-famdel="${m.id}">${L('امسح', 'Delete')}</button>` : ''}</div>`).join('')}</div>
    <div class="card form" style="margin-top:12px"><h3 style="margin:0">➕ ${L('ضيف فرد', 'Add a member')}</h3>
      <div class="fgrid"><label class="f">${L('الاسم', 'Name')}<input type="text" id="famName"></label><label class="f">${L('صلة القرابة', 'Relation')}<select id="famRel">${Object.entries(FAM_REL).filter(([k]) => k !== 'me').map(([k, v]) => `<option value="${k}">${LANG === 'en' ? v[1] : v[0]}</option>`).join('')}</select></label></div>
      <div class="edpick"><button type="button" data-famed="men" aria-pressed="true">${brandMark(30, 'men')}<b>${edName('men')}</b><small>${L('ولد أو راجل', 'Boy or man')}</small></button><button type="button" data-famed="women" aria-pressed="false">${brandMark(30, 'women')}<b>${edName('women')}</b><small>${L('بنت أو ست', 'Girl or woman')}</small></button></div>
      <button class="btn fire" type="button" id="famAdd">${L('ضيف وافتح ملفه', 'Add and open')}</button></div>`);
}
on('click', e => {
  const T = e.target;
  if (T.closest('[data-fam]')) { famSheet(); return true; }
  const g = T.closest('[data-famgo]'); if (g) { closeSheet(); famSwitch(g.dataset.famgo); return true; }
  const ed = T.closest('[data-famed]'); if (ed) { $$('[data-famed]').forEach(b => b.setAttribute('aria-pressed', b === ed)); const rel = $('#famRel'); if (rel) { const opts = ed.dataset.famed === 'women' ? ['wife', 'daughter', 'mother', 'sister', 'other'] : ['husband', 'son', 'father', 'brother', 'other']; if (!opts.includes(rel.value)) rel.value = opts[0]; } return true; }
  if (T.id === 'famAdd') { const name = $('#famName').value.trim(); if (!name) { toast(L('اكتب الاسم', 'Enter a name')); return true; } const edp = $('[data-famed][aria-pressed="true"]')?.dataset.famed || 'men', rel = $('#famRel').value, id = 'm' + uid(); famInit(); S.family.list.push({id, name, ed: edp, rel}); closeSheet(); famSwitch(id, true); return true; }
  const d = T.closest('[data-famdel]'); if (d) { const m = S.family.list.find(x => x.id === d.dataset.famdel); if (!m) return true; if (d.dataset.sure !== '1') { d.dataset.sure = '1'; d.textContent = L('متأكد؟ دوس تاني', 'Sure? Tap again'); return true; } S.family.list = S.family.list.filter(x => x.id !== m.id); delete S.family.store[m.id]; store.now(); famSheet(); toast(L('اتمسح ملف ', 'Deleted ') + m.name); return true; }
});
/* medicine reminders for the other members too (with their name), so a mum gets her child's doses */
function famReminders(iso, push){
  const f = S.family; if (!f || f.list.length < 2 || typeof medReminders !== 'function' || S.settings.notify?.meds === false) return;
  const l = LIFE(), keep = {meds: l.meds, medLog: l.medLog};
  try { f.list.filter(m => m.id !== f.active).forEach(m => { const st = f.store[m.id]; if (!st?.life?.meds?.length) return; l.meds = st.life.meds; l.medLog = st.life.medLog || {}; medReminders(iso, (key, min, title, body, kind) => push('fam-' + m.id + '-' + key, min, title + ' · ' + m.name, body, kind)); }); }
  finally { l.meds = keep.meds; l.medLog = keep.medLog; }
}
