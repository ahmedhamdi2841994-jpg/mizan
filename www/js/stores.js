/* ميزان — المحلات في السعودية ومصر، أزرار الذكاء الاصطناعي، ودفتر الأسعار. */
'use strict';
/* [id, عربي, English, البلد, النوع, دومين للبحث (اختياري)] — النوع: super هايبر/سوبر، pharm صيدلية، elec إلكترونيات، online أونلاين، home بيت، deliv توصيل */
const STORES = [
  ['panda', 'بنده', 'Panda', 'sa', 'super'], ['othaim', 'أسواق العثيم', 'Othaim Markets', 'sa', 'super', 'othaimmarkets.com'], ['danube', 'الدانوب', 'Danube', 'sa', 'super', 'danube.sa'], ['tamimi', 'أسواق التميمي', 'Tamimi Markets', 'sa', 'super', 'tamimimarkets.com'], ['lulu_sa', 'لولو هايبر ماركت', 'LuLu Hypermarket', 'sa', 'super', 'luluhypermarket.com'], ['carrefour_sa', 'كارفور', 'Carrefour', 'sa', 'super', 'carrefourksa.com'], ['nesto', 'نستو', 'Nesto', 'sa', 'super'], ['farm', 'أسواق المزرعة', 'Farm Superstores', 'sa', 'super'], ['bindawood', 'بن داود', 'BinDawood', 'sa', 'super'], ['manuel', 'مانويل', 'Manuel Market', 'sa', 'super'], ['alraya', 'أسواق الراية', 'Al Raya', 'sa', 'super'], ['hyperpanda', 'هايبر بنده', 'HyperPanda', 'sa', 'super'],
  ['nahdi', 'صيدليات النهدي', 'Nahdi Pharmacy', 'sa', 'pharm', 'nahdionline.com'], ['dawaa', 'صيدليات الدواء', 'Al-Dawaa Pharmacy', 'sa', 'pharm', 'al-dawaa.com'], ['whites', 'صيدليات وايتس', 'Whites Pharmacy', 'sa', 'pharm'],
  ['extra', 'إكسترا', 'eXtra', 'sa', 'elec', 'extra.com'], ['jarir', 'مكتبة جرير', 'Jarir Bookstore', 'sa', 'elec', 'jarir.com'], ['ikea_sa', 'ايكيا', 'IKEA', 'sa', 'home', 'ikea.com/sa'], ['saco', 'ساكو', 'SACO', 'sa', 'home'], ['homecentre_sa', 'هوم سنتر', 'Home Centre', 'sa', 'home', 'homecentre.com'],
  ['amazon_sa', 'أمازون السعودية', 'Amazon.sa', 'sa', 'online', 'amazon.sa'], ['noon_sa', 'نون', 'noon', 'sa', 'online', 'noon.com'], ['nana', 'نعناع', 'Nana', 'sa', 'deliv', 'nana.sa'], ['ninja', 'نينجا', 'Ninja', 'sa', 'deliv'], ['hungerstation', 'هنقرستيشن مارت', 'HungerStation Mart', 'sa', 'deliv'],
  ['carrefour_eg', 'كارفور', 'Carrefour', 'eg', 'super', 'carrefouregypt.com'], ['spinneys', 'سبينيس', 'Spinneys', 'eg', 'super'], ['hyperone', 'هايبر وان', 'Hyper One', 'eg', 'super'], ['metro', 'مترو ماركت', 'Metro Market', 'eg', 'super', 'metro-markets.com'], ['kazyon', 'كازيون', 'Kazyon', 'eg', 'super'], ['kheirzaman', 'خير زمان', 'Kheir Zaman', 'eg', 'super'], ['seoudi', 'سعودي ماركت', 'Seoudi Market', 'eg', 'super'], ['gourmet', 'جورميه', 'Gourmet Egypt', 'eg', 'super', 'gourmetegypt.com'], ['oscar', 'أوسكار', 'Oscar Grand Stores', 'eg', 'super'], ['bim', 'بيم', 'BIM', 'eg', 'super'], ['ragab', 'أولاد رجب', 'Ragab Sons', 'eg', 'super'], ['fathalla', 'فتح الله', 'Fathalla Market', 'eg', 'super'], ['lulu_eg', 'لولو هايبر ماركت', 'LuLu Hypermarket', 'eg', 'super', 'luluhypermarket.com'],
  ['ezaby', 'صيدليات العزبي', 'El Ezaby Pharmacy', 'eg', 'pharm'], ['seif', 'صيدليات سيف', 'Seif Pharmacies', 'eg', 'pharm'], ['misr_ph', 'صيدليات مصر', 'Misr Pharmacies', 'eg', 'pharm'], ['19011', 'صيدليات 19011', '19011 Pharmacies', 'eg', 'pharm'],
  ['btech', 'بي تك', 'B.TECH', 'eg', 'elec', 'btech.com'], ['raya', 'راية شوب', 'Raya Shop', 'eg', 'elec', 'rayashop.com'], ['2b', 'تو بي', '2B', 'eg', 'elec', '2b.com.eg'], ['ikea_eg', 'ايكيا', 'IKEA', 'eg', 'home', 'ikea.com/eg'], ['homecentre_eg', 'هوم سنتر', 'Home Centre', 'eg', 'home'],
  ['amazon_eg', 'أمازون مصر', 'Amazon.eg', 'eg', 'online', 'amazon.eg'], ['noon_eg', 'نون', 'noon', 'eg', 'online', 'noon.com'], ['breadfast', 'بريدفاست', 'Breadfast', 'eg', 'deliv', 'breadfast.com'], ['talabat', 'طلبات مارت', 'talabat mart', 'eg', 'deliv', 'talabat.com'], ['instashop', 'إنستاشوب', 'InstaShop', 'eg', 'deliv', 'instashop.com']
];
const STORE_TYPES = {super: ['سوبر وهايبر ماركت', 'Supermarkets', '🛒'], pharm: ['صيدليات', 'Pharmacies', '💊'], elec: ['إلكترونيات ومكتبات', 'Electronics & books', '💻'], home: ['أدوات البيت', 'Home', '🏠'], online: ['أونلاين', 'Online', '🌐'], deliv: ['توصيل سريع', 'Quick delivery', '🛵'], local: ['محلات منطقتي', 'Local shops', '📍']};
const LOCAL_TYPES = {super: 'super', grocer: 'super', butcher: 'super', veg: 'super', bakery: 'super', pharm: 'pharm', home: 'home', elec: 'elec', other: 'local'};
const LOCAL_L = {grocer: ['بقالة', 'Grocery'], butcher: ['جزارة', 'Butcher'], veg: ['خضري وفكهاني', 'Greengrocer'], bakery: ['مخبز', 'Bakery'], super: ['سوبر ماركت', 'Supermarket'], pharm: ['صيدلية', 'Pharmacy'], home: ['أدوات منزلية', 'Homeware'], elec: ['إلكترونيات', 'Electronics'], other: ['تاني', 'Other']};
const myCC = () => S.settings.country || (CITIES.find(c => c[0] === S.settings.city)?.[6]) || 'sa';
const myCity = () => { const c = CITIES.find(x => x[0] === S.settings.city); return c ? (LANG === 'en' ? c[2] : c[1]) : (S.settings.cityName || ''); };
const myCountryName = () => myCC() === 'eg' ? L('مصر', 'Egypt') : L('السعودية', 'Saudi Arabia');
function storeList(){ const l = LIFE(), cc = myCC(), on = l.storesOn?.[cc]; return [...STORES.filter(s => s[3] === cc && (!on || on.includes(s[0]))).map(s => ({id: s[0], n: LANG === 'en' ? s[2] : s[1], ar: s[1], en: s[2], t: s[4], dom: s[5]})), ...(l.localStores || []).filter(s => !s.cc || s.cc === cc).map(s => ({id: s.id, n: s.name, ar: s.name, en: s.name, t: LOCAL_TYPES[s.kind] || 'local', local: 1, area: s.area, kind: s.kind}))]; }
const storeById = id => storeList().find(s => s.id === id) || (() => { const s = STORES.find(x => x[0] === id); if (s) return {id, n: LANG === 'en' ? s[2] : s[1], ar: s[1], en: s[2], t: s[4], dom: s[5]}; const ls = (LIFE().localStores || []).find(x => x.id === id); return ls ? {id, n: ls.name, ar: ls.name, en: ls.name, t: 'local', local: 1, area: ls.area} : null; })();
const storeName = id => storeById(id)?.n || '';
const gq = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);
const mapQ = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
function storeSearchLink(st, item){ return st.dom ? gq(item + ' site:' + st.dom) : gq(item + ' ' + st.n + ' ' + L('سعر', 'price') + ' ' + myCity()); }
function storeMapLink(st){ return mapQ(st.n + ' ' + (st.area ? st.area + ' ' : '') + myCity()); }
/* ---- AI buttons ---- */
function aiButtons(prompt, compact){
  const q = encodeURIComponent(prompt), id = 'ai' + Math.random().toString(36).slice(2, 8); AI_P[id] = prompt;
  return `<div class="aibtns ${compact ? 'sm' : ''}"><a class="btn sm ai claude" href="https://claude.ai/new?q=${q}" target="_blank" rel="noopener">✳️ Claude</a><a class="btn sm ai gpt" href="https://chatgpt.com/?q=${q}" target="_blank" rel="noopener">💬 ChatGPT</a><button class="btn sm ai gem" type="button" data-aigem="${id}">✨ Gemini</button><button class="btn ghost sm" type="button" data-aicopy="${id}">📋 ${L('انسخ السؤال', 'Copy prompt')}</button></div>`;
}
const AI_P = {};
async function copyText(t){ try { await navigator.clipboard.writeText(t); return true; } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (er) {} a.remove(); return ok; } }
on('click', e => {
  const g = e.target.closest('[data-aigem]'); if (g) { const t = AI_P[g.dataset.aigem] || ''; copyText(t).then(ok => toast(ok ? L('السؤال اتنسخ، الصقه في Gemini', 'Prompt copied; paste it into Gemini') : L('انسخ السؤال يدوي', 'Copy the prompt manually'))); window.open('https://gemini.google.com/app', '_blank', 'noopener'); return true; }
  const c = e.target.closest('[data-aicopy]'); if (c) { copyText(AI_P[c.dataset.aicopy] || '').then(ok => toast(ok ? L('اتنسخ ✅', 'Copied ✅') : L('مقدرتش أنسخ', 'Could not copy'))); return true; }
});
/* ---- price book ---- */
function prices(){ return (LIFE().prices ||= []); }
const normName = n => fnorm(n || '');
function priceInfo(name){
  const k = normName(name), by = {};
  prices().filter(p => normName(p.name) === k).forEach(p => { if (!by[p.store] || by[p.store].date <= p.date) by[p.store] = p; });
  return Object.values(by).sort((a, b) => a.price - b.price);
}
function addPrice(name, store, price, unit, date){ if (!name || !store || !(price > 0)) return; const pb = prices(), d = date || todayISO(), k = normName(name); const ex = pb.find(p => normName(p.name) === k && p.store === store && p.date === d); if (ex) { ex.price = price; ex.unit = unit || ex.unit; } else pb.push({id: uid(), name, store, price: +price, unit: unit || 'pc', date: d}); if (pb.length > 3000) pb.splice(0, pb.length - 3000); }
function shopAIPrompt(items){
  const st = storeList().filter(s => !s.local).map(s => s.n).slice(0, 14).join('، '), loc = storeList().filter(s => s.local).map(s => s.n + (s.area ? ' (' + s.area + ')' : '')).join('، ');
  return LANG === 'en'
    ? `I live in ${myCity()}, ${myCountryName()}. Where is the cheapest place to buy the following right now? Compare current prices and offers at these stores where available: ${st}${loc ? '. Local shops near me: ' + loc : ''}.\n\nItems:\n${items.map(x => '- ' + x).join('\n')}\n\nGive me a table: item, best store, approximate price in ${myCC() === 'eg' ? 'EGP' : 'SAR'}, and the source/date of each price. Then suggest the cheapest way to split the trip (one store vs two). Say clearly when a price is uncertain or out of date.`
    : `أنا ساكن في ${myCity()} - ${myCountryName()}. عايز أعرف أرخص مكان أشتري منه الحاجات دي دلوقتي. قارن الأسعار والعروض الحالية في المحلات دي لو متاحة: ${st}${loc ? '. ومحلات قريبة مني: ' + loc : ''}.\n\nالحاجات:\n${items.map(x => '- ' + x).join('\n')}\n\nاعملّي جدول: الحاجة، أرخص محل، السعر التقريبي بال${myCC() === 'eg' ? 'جنيه' : 'ريال'}، ومصدر وتاريخ كل سعر. وبعدين قولّي أوفر طريقة أقسم بيها المشوار (محل واحد ولا اتنين). وقول بوضوح لو السعر مش مؤكد أو قديم.`;
}
