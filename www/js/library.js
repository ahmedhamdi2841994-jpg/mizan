/* ميزان — library: your own PDF books read inside the app + a curated reading list */
'use strict';
const READING = [
  {g: {ar: 'كتب إسلامية أساسية', en: 'Core Islamic books'}, items: [
    ['تفسير القرآن العظيم', 'Tafsir Ibn Kathir', 'ابن كثير', 'Ibn Kathir'], ['تيسير الكريم الرحمن (تفسير السعدي)', 'Tafsir al-Sa’di', 'عبد الرحمن السعدي', 'al-Sa’di'],
    ['قصص الأنبياء', 'Stories of the Prophets', 'ابن كثير', 'Ibn Kathir'], ['رياض الصالحين', 'Riyad as-Salihin', 'النووي', 'al-Nawawi'],
    ['الأربعون النووية', 'The Forty Hadith', 'النووي', 'al-Nawawi'], ['بلوغ المرام', 'Bulugh al-Maram', 'ابن حجر العسقلاني', 'Ibn Hajar'],
    ['ما لا يسع المسلم جهله', 'What a Muslim Must Know', 'عبد الله المصلح وصلاح الصاوي', 'al-Muslih & al-Sawi'], ['حصن المسلم', 'Fortress of the Muslim', 'سعيد القحطاني', 'Sa’id al-Qahtani'],
    ['الرحيق المختوم', 'The Sealed Nectar', 'صفي الرحمن المباركفوري', 'al-Mubarakpuri'], ['زاد المعاد', 'Zad al-Ma’ad', 'ابن القيم', 'Ibn al-Qayyim'],
    ['الفوائد', 'Al-Fawa’id', 'ابن القيم', 'Ibn al-Qayyim'], ['كتاب التوحيد', 'Kitab at-Tawhid', 'محمد بن عبد الوهاب', 'Ibn Abd al-Wahhab'],
    ['فقه السنة', 'Fiqh as-Sunnah', 'سيد سابق', 'Sayyid Sabiq'], ['منهاج المسلم', 'Minhaj al-Muslim', 'أبو بكر الجزائري', 'al-Jaza’iri']]},
  {g: {ar: 'الاقتصاد', en: 'Economics'}, items: [
    ['ثروة الأمم', 'The Wealth of Nations', 'آدم سميث', 'Adam Smith'], ['الاقتصاد في درس واحد', 'Economics in One Lesson', 'هنري هازلت', 'Henry Hazlitt'],
    ['علم الاقتصاد الأساسي', 'Basic Economics', 'توماس سويل', 'Thomas Sowell'], ['التفكير السريع والبطيء', 'Thinking, Fast and Slow', 'دانيال كانمان', 'Daniel Kahneman'],
    ['الأب الغني والأب الفقير', 'Rich Dad Poor Dad', 'روبرت كيوساكي', 'Robert Kiyosaki']]},
  {g: {ar: 'الحوكمة وإدارة المشاريع', en: 'Governance & project management'}, items: [
    ['مبادئ حوكمة الشركات (G20/OECD)', 'G20/OECD Principles of Corporate Governance', 'منظمة OECD', 'OECD'], ['دليل PMBOK', 'PMBOK Guide', 'معهد PMI', 'PMI'],
    ['من جيد إلى عظيم', 'Good to Great', 'جيم كولينز', 'Jim Collins'], ['الهدف', 'The Goal', 'إلياهو جولدرات', 'Eliyahu Goldratt']]},
  {g: {ar: 'الأتمتة والتحول الرقمي', en: 'Automation & digital'}, items: [
    ['أتمتة المهام المملة ببايثون', 'Automate the Boring Stuff with Python', 'آل سويجارت', 'Al Sweigart'], ['مشروع فينيكس', 'The Phoenix Project', 'جين كيم', 'Gene Kim'],
    ['الشركة الناشئة المرنة', 'The Lean Startup', 'إريك ريس', 'Eric Ries'], ['الثورة الصناعية الرابعة', 'The Fourth Industrial Revolution', 'كلاوس شواب', 'Klaus Schwab']]}
];
let LIB = {open: null, page: 1, zoom: 1, doc: null};
let pdfjs = null;
async function loadPdfJs(){ if (pdfjs) return pdfjs; pdfjs = await import('../vendor/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.mjs'; return pdfjs; }
registerView('library', {title: {ar: 'المكتبة', en: 'Library'}, icon: 'library', render(){
  const mine = S.library || [];
  if (LIB.open) { const b = mine.find(x => x.id === LIB.open); return topbar(esc(b?.name || ''), L('صفحة', 'Page') + ` ${LIB.page} / ${b?.pages || '…'}`, '', true) + `
    <div class="card"><div class="row" style="justify-content:space-between"><div class="row"><button class="btn ghost sm" type="button" data-pg="-1">${L('اللي قبلها', 'Prev')}</button><input type="number" id="pgNum" value="${LIB.page}" min="1" style="width:90px"><button class="btn ghost sm" type="button" data-pg="1">${L('اللي بعدها', 'Next')}</button></div>
    <div class="row"><button class="btn ghost sm" type="button" data-zoom="-0.15">−</button><button class="btn ghost sm" type="button" data-zoom="0.15">+</button><button class="btn sm" type="button" id="libClose">${L('رجوع للمكتبة', 'Back to library')}</button></div></div></div>
    <div class="card" style="overflow:auto;text-align:center"><canvas id="pdfCanvas" style="max-width:none;direction:ltr"></canvas></div>`; }
  return topbar(L('المكتبة', 'Library'), L('كتبك جوه التطبيق، ومن غير نت', 'Your books, inside the app and offline'), '', true) + `
  <div class="card hero"><div class="row" style="justify-content:space-between"><div><h2>${L('كتبي', 'My books')}</h2><p class="muted small" style="margin:4px 0 0">${L('ضيف أي كتاب PDF عندك، وهيتحفظ جوه التطبيق مع آخر صفحة وقفت عندها.', 'Add any PDF you own; it is stored in the app with the page you stopped at.')}</p></div><label class="btn fire" for="pdfIn" style="cursor:pointer">${L('ضيف كتاب PDF', 'Add a PDF')}</label><input type="file" id="pdfIn" accept="application/pdf" hidden></div>
    ${mine.length ? `<div class="tiles" style="margin-top:14px">${mine.map(b => `<div class="tile"><b>${esc(b.name)}</b><span>${L('صفحة', 'Page')} ${b.page || 1}${b.pages ? ' / ' + b.pages : ''}</span><div class="bar-prog"><i style="width:${b.pages ? Math.round((b.page || 1) / b.pages * 100) : 0}%"></i></div><div class="row"><button class="btn sm" type="button" data-book="${b.id}">${L('اقرأ', 'Read')}</button><button class="btn ghost sm" type="button" data-bookdel="${b.id}">${L('امسح', 'Remove')}</button></div></div>`).join('')}</div>` : `<div class="empty">${L('لسه مفيش كتب. اختار ملف PDF من جهازك.', 'No books yet. Pick a PDF from your device.')}</div>`}</div>
  ${READING.map(g => `<div class="card"><div class="head"><h2>${esc(LX(g.g))}</h2></div><div class="tiles">${g.items.map(b => `<a class="tile" style="text-decoration:none" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent((LANG === 'en' ? b[1] + ' ' + b[3] : b[0] + ' ' + b[2]))}"><b>${esc(LANG === 'en' ? b[1] : b[0])}</b><span>${esc(LANG === 'en' ? b[3] : b[2])}</span><span class="link">${L('دوّر على مصدره ↗', 'Find a source ↗')}</span></a>`).join('')}</div></div>`).join('')}
  <p class="muted small">${L('الكتب الحديثة ليها حقوق نشر، فالتطبيق مش بيحط نصها. حمّلها من مصادرها الرسمية أو اشتريها، وبعدين ضيفها هنا كـ PDF.', 'Modern books are copyrighted, so the app does not include their text. Get them from official sources, then add the PDF here.')}</p>`;
}, after(){ if (LIB.open) drawPdf(); }, leave(){ LIB.open = null; LIB.doc = null; }});
async function drawPdf(){
  const b = (S.library || []).find(x => x.id === LIB.open); if (!b) return;
  try {
    const lib = await loadPdfJs();
    if (!LIB.doc) { const blob = await idb.get('book-' + b.id); if (!blob) { toast(L('الملف مش موجود على الجهاز ده.', 'The file is not on this device.')); return; } LIB.doc = await lib.getDocument({data: new Uint8Array(await blob.arrayBuffer())}).promise; b.pages = LIB.doc.numPages; store.save(); }
    const page = await LIB.doc.getPage(LIB.page), cv = $('#pdfCanvas'); if (!cv) return;
    const wrapW = cv.parentElement.clientWidth - 40, base = page.getViewport({scale: 1}), scale = (wrapW / base.width) * LIB.zoom * (window.devicePixelRatio || 1);
    const vp = page.getViewport({scale}); cv.width = vp.width; cv.height = vp.height; cv.style.width = (vp.width / (window.devicePixelRatio || 1)) + 'px';
    await page.render({canvasContext: cv.getContext('2d'), viewport: vp}).promise;
  } catch (e) { toast(L('مقدرتش أفتح الملف ده.', 'Could not open this file.')); }
}
on('change', async e => {
  if (e.target.id === 'pdfIn') { const f = e.target.files[0]; if (!f) return true; const id = 'b' + Date.now(); await idb.put('book-' + id, f); (S.library ||= []).push({id, name: f.name.replace(/\.pdf$/i, ''), page: 1}); store.save(); toast(L('اتضاف الكتاب.', 'Book added.')); render(); return true; }
  if (e.target.id === 'pgNum') { const b = (S.library || []).find(x => x.id === LIB.open); LIB.page = Math.max(1, Math.min(b?.pages || 1, +e.target.value || 1)); if (b) b.page = LIB.page; store.save(); render(); return true; }
});
on('click', async e => {
  const bk = e.target.closest('[data-book]'); if (bk) { LIB.open = bk.dataset.book; LIB.doc = null; const b = S.library.find(x => x.id === LIB.open); LIB.page = b?.page || 1; render(); return true; }
  const bd = e.target.closest('[data-bookdel]'); if (bd) { const id = bd.dataset.bookdel; await idb.del('book-' + id); S.library = S.library.filter(x => x.id !== id); store.save(); render(); return true; }
  const pg = e.target.closest('[data-pg]'); if (pg) { const b = S.library.find(x => x.id === LIB.open); LIB.page = Math.max(1, Math.min(b?.pages || 9999, LIB.page + +pg.dataset.pg)); b.page = LIB.page; store.save(); render(); window.scrollTo({top: 0}); return true; }
  const z = e.target.closest('[data-zoom]'); if (z) { LIB.zoom = Math.max(0.5, Math.min(3, LIB.zoom + +z.dataset.zoom)); drawPdf(); return true; }
  if (e.target.id === 'libClose') { LIB.open = null; LIB.doc = null; render(); return true; }
});
