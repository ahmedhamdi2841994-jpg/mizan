/* ميزان — news headlines from official RSS feeds, with a link to the full article and one-tap translation */
'use strict';
const NEWS_SOURCES = [
  {id: 'aljazeera', name: 'الجزيرة نت', lang: 'ar', cat: 'arab', url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9'},
  {id: 'alarabiya', name: 'العربية', lang: 'ar', cat: 'local', url: 'https://www.alarabiya.net/feed/rss2/ar.xml'},
  {id: 'skynews', name: 'سكاي نيوز عربية', lang: 'ar', cat: 'arab', url: 'https://www.skynewsarabia.com/web/rss'},
  {id: 'bbcar', name: 'بي بي سي عربي', lang: 'ar', cat: 'world', url: 'https://feeds.bbci.co.uk/arabic/rss.xml'},
  {id: 'dwar', name: 'DW عربية', lang: 'ar', cat: 'world', url: 'https://rss.dw.com/xml/rss-ar-all'},
  {id: 'f24ar', name: 'فرانس 24 عربي', lang: 'ar', cat: 'world', url: 'https://www.france24.com/ar/rss'},
  {id: 'arabnews', name: 'Arab News', lang: 'en', cat: 'local', url: 'https://www.arabnews.com/rss.xml'},
  {id: 'aje', name: 'Al Jazeera English', lang: 'en', cat: 'world', url: 'https://www.aljazeera.com/xml/rss/all.xml'},
  {id: 'bbcworld', name: 'BBC World', lang: 'en', cat: 'world', url: 'https://feeds.bbci.co.uk/news/world/rss.xml'},
  {id: 'bbcbiz', name: 'BBC Business', lang: 'en', cat: 'economy', url: 'https://feeds.bbci.co.uk/news/business/rss.xml'},
  {id: 'bbctech', name: 'BBC Technology', lang: 'en', cat: 'tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml'}
];
const NEWS_CATS = {all: {ar: 'الكل', en: 'All'}, local: {ar: 'محلي', en: 'Saudi & Gulf'}, arab: {ar: 'عربي', en: 'Arab world'}, world: {ar: 'عالمي', en: 'World'}, economy: {ar: 'اقتصاد', en: 'Economy'}, tech: {ar: 'تكنولوجيا', en: 'Technology'}};
let NEWS = {cat: 'all', items: null, loading: false, errors: [], at: null};
const allSources = () => [...NEWS_SOURCES, ...(S.customFeeds || [])];
const enabledSources = () => allSources().filter(s => !(S.settings.newsOff || []).includes(s.id));
function parseFeed(xml, src){
  const doc = new DOMParser().parseFromString(xml, 'text/xml'), items = [...doc.querySelectorAll('item, entry')].slice(0, 25);
  return items.map(it => { const g = sel => it.querySelector(sel)?.textContent?.trim() || ''; const link = g('link') || it.querySelector('link')?.getAttribute('href') || ''; const date = new Date(g('pubDate') || g('updated') || g('published') || Date.now());
    return {title: g('title').replace(/<[^>]+>/g, ''), link, date: isNaN(date) ? new Date() : date, src: src.name, srcId: src.id, cat: src.cat, lang: src.lang}; }).filter(x => x.title && x.link);
}
async function loadNews(){
  NEWS.loading = true; NEWS.errors = []; render();
  const res = await Promise.allSettled(enabledSources().map(async s => { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000); try { const r = await fetch(s.url, {signal: ctl.signal}); if (!r.ok) throw new Error(r.status); return parseFeed(await r.text(), s); } finally { clearTimeout(t); } }));
  const items = []; res.forEach((r, i) => { if (r.status === 'fulfilled') items.push(...r.value); else NEWS.errors.push(enabledSources()[i].name); });
  NEWS.items = items.sort((a, b) => b.date - a.date); NEWS.at = new Date(); NEWS.loading = false;
  try { localStorage.setItem('mizan-news', JSON.stringify({at: NEWS.at, items: NEWS.items.slice(0, 200)})); } catch (e) {}
  if (VIEW === 'news') render();
}
function ago(d){ const m = Math.round((Date.now() - d) / 60000); if (m < 60) return L(`من ${m} دقيقة`, `${m} min ago`); const h = Math.round(m / 60); if (h < 24) return L(`من ${h} ساعة`, `${h} h ago`); return dShort(isoOf(d)); }
registerView('news', {title: {ar: 'الأخبار', en: 'News'}, icon: 'news', render(){
  if (NEWS.items === null && !NEWS.loading) { try { const c = JSON.parse(localStorage.getItem('mizan-news') || 'null'); if (c) { NEWS.items = c.items.map(x => ({...x, date: new Date(x.date)})); NEWS.at = new Date(c.at); } } catch (e) {} setTimeout(loadNews, 0); }
  const list = (NEWS.items || []).filter(x => NEWS.cat === 'all' || x.cat === NEWS.cat);
  const tl = LANG === 'en' ? 'en' : 'ar';
  const seg = Object.entries(NEWS_CATS).map(([k, v]) => `<button type="button" data-ncat="${k}" aria-pressed="${k === NEWS.cat}">${esc(LX(v))}</button>`).join('');
  return topbar(L('آخر الأخبار', 'Latest news'), NEWS.at ? L('آخر تحديث ', 'Updated ') + ago(NEWS.at) : '', `<button class="btn fire sm" type="button" id="newsRefresh" ${NEWS.loading ? 'disabled' : ''}>${NEWS.loading ? L('جاري التحميل…', 'Loading…') : L('حدّث', 'Refresh')}</button>`, true) + `
  <div class="seg">${seg}</div>
  ${NEWS.errors.length && !isNative() ? `<div class="banner"><span>${L('بعض المصادر مش بتسمح بقراءة الأخبار من المتصفح على اللاب. على تطبيق الأندرويد كلها بتشتغل.', 'Some sources block reading from a laptop browser. They all work in the Android app.')} (${esc(NEWS.errors.join('، '))})</span></div>` : ''}
  <div class="card"><div class="news">${list.length ? list.slice(0, 120).map(x => `<a class="item" href="${esc(x.link)}" target="_blank" rel="noopener" dir="${x.lang === 'en' ? 'ltr' : 'rtl'}"><span class="src">${esc(x.src)} · ${ago(x.date)}</span><b style="font-weight:600">${esc(x.title)}</b><span class="small"><span class="link" data-tr="${esc(x.link)}">${x.lang === tl ? '' : L('ترجم للعربي ↗', 'Translate to English ↗')}</span></span></a>`).join('') : `<div class="empty">${NEWS.loading ? L('جاري تحميل الأخبار…', 'Loading news…') : L('مفيش أخبار دلوقتي. اتأكد من النت ودوس حدّث.', 'No news right now. Check your connection and refresh.')}</div>`}</div></div>
  <div class="card"><div class="head"><h2>${L('المصادر', 'Sources')}</h2></div><div class="chips">${allSources().map(s => `<label class="cb"><input type="checkbox" data-nsrc="${s.id}" ${(S.settings.newsOff || []).includes(s.id) ? '' : 'checked'}> ${esc(s.name)}</label>`).join('')}</div>
    <div class="row" style="margin-top:14px"><input type="url" id="feedUrl" placeholder="${L('ضيف رابط RSS لمصدر تاني', 'Add another RSS feed URL')}" style="max-width:420px"><input type="text" id="feedName" placeholder="${L('اسم المصدر', 'Source name')}" style="max-width:200px"><button class="btn ghost sm" type="button" id="feedAdd">${L('ضيف', 'Add')}</button></div></div>`;
}});
on('click', e => {
  const c = e.target.closest('[data-ncat]'); if (c) { NEWS.cat = c.dataset.ncat; render(); return true; }
  if (e.target.id === 'newsRefresh') { loadNews(); return true; }
  const tr = e.target.closest('[data-tr]'); if (tr) { e.preventDefault(); e.stopPropagation(); window.open('https://translate.google.com/translate?sl=auto&tl=' + (LANG === 'en' ? 'en' : 'ar') + '&u=' + encodeURIComponent(tr.dataset.tr), '_blank'); return true; }
  if (e.target.id === 'feedAdd') { const u = $('#feedUrl').value.trim(), n = $('#feedName').value.trim() || u; if (!/^https?:\/\//.test(u)) { toast(L('اكتب رابط صحيح.', 'Enter a valid URL.')); return true; } (S.customFeeds ||= []).push({id: 'c' + Date.now(), name: n, url: u, lang: LANG, cat: 'world'}); store.save(); loadNews(); return true; }
});
on('change', e => { const s = e.target.dataset?.nsrc; if (s) { const off = new Set(S.settings.newsOff || []); e.target.checked ? off.delete(s) : off.add(s); S.settings.newsOff = [...off]; store.save(); loadNews(); return true; } });
