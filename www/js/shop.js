/* ميزان — المشتريات: كتالوج كامل + بحث ذكي + قايمة + تقرير + تذكير. */
'use strict';
let SH = {tab: 'list', q: '', cat: 'food', open: null};
const shopCat = k => SHOP.find(c => c.k === k) || SHOP.at(-1);
const shopSub = (c, s) => (shopCat(c).subs.find(x => x.k === s)) || shopCat(c).subs[0];
const unitL = u => LX(SHOP_UNITS[u] || SHOP_UNITS.pc);
const SHOP_TO_MONEY = {food: 'groceries', drinks: 'groceries', meds: 'health', care: 'home', clean: 'home', home: 'home', baby: 'kids', clothes: 'clothes', gym: 'sport', car: 'transport', office: 'work', other: 'other'};
function shopNames(it){ return [it.ar, ...(it.syn || []), it.en]; }
function customItems(){ return (LIFE().shopCustom ||= []); }
function shopSearch(q){ const sc = [...customItems(), ...SHOP_ITEMS].map(it => ({it, s: fuzzyScore(q, shopNames(it))})).filter(x => x.s >= 0.55).sort((a, b) => b.s - a.s); const top = sc[0]?.s || 0, cut = top >= 0.9 ? 0.72 : top >= 0.75 ? 0.6 : 0.55; return sc.filter(x => x.s >= cut).slice(0, 24).map(x => x.it); }
function inList(name){ return LIFE().shop.find(x => !x.bought && x.name === name); }
function addToShop(it, extra){
  const l = LIFE(), name = LANG === 'en' && !it.custom ? it.en : it.ar, ex = inList(name);
  if (ex) { ex.qty = (ex.qty || 1) + 1; toast(L(`زوّدت ${name} (${ex.qty})`, `${name} ×${ex.qty}`)); }
  else { const lastP = [...l.shopHist].reverse().find(h => h.name === name && h.price); l.shop.push({id: uid(), name, cat: it.cat, sub: it.sub, qty: 1, unit: it.u || 'pc', price: lastP ? lastP.price / (lastP.qty || 1) : null, need: '', prio: false, note: '', added: todayISO(), ...(extra || {})}); toast(L(`اتضاف: ${name}`, `Added: ${name}`)); }
  store.save();
}
const shopTotal = list => list.reduce((s, x) => s + (x.price ? x.price * (x.qty || 1) : 0), 0);
function shopRow(x){
  const c = shopCat(x.cat), open = SH.open === x.id;
  return `<div class="srow ${x.bought ? 'done' : ''} ${x.need && !x.bought && x.need <= todayISO() ? 'due' : ''}"><input type="checkbox" class="tick" data-sbuy="${x.id}" ${x.bought ? 'checked' : ''} aria-label="${L('اشتريتها', 'Bought')}">
    <button type="button" class="smain" data-sopen="${x.id}"><b>${x.prio ? '⭐ ' : ''}${esc(x.name)}</b><small>${c.ic} <span dir="ltr">${fmt(x.qty || 1, 2)}</span> ${unitL(x.unit)}${x.price ? ' · ' + money(x.price * (x.qty || 1)) : ''}${x.need ? ' · 📅 ' + dShort(x.need) : ''}${x.note ? ' · ' + esc(x.note) : ''}</small></button>
    <span class="counter sm"><button type="button" data-sqty="${x.id}|-1">−</button><button type="button" data-sqty="${x.id}|1">+</button></span></div>
    ${open ? `<div class="sedit fgrid"><label class="f">${L('الكمية', 'Qty')}<input type="number" step="0.25" min="0" data-sset="${x.id}|qty" value="${x.qty || 1}"></label><label class="f">${L('الوحدة', 'Unit')}<select data-sset="${x.id}|unit">${Object.keys(SHOP_UNITS).map(u => `<option value="${u}" ${x.unit === u ? 'selected' : ''}>${unitL(u)}</option>`).join('')}</select></label><label class="f">${L('سعر الوحدة', 'Unit price')}<input type="number" step="0.01" data-sset="${x.id}|price" value="${x.price ?? ''}"></label><label class="f">${L('محتاجها يوم', 'Need by')}<input type="date" data-sset="${x.id}|need" value="${x.need || ''}"></label><label class="f">${L('ملاحظة (ماركة، مقاس…)', 'Note (brand, size…)')}<input type="text" data-sset="${x.id}|note" value="${esc(x.note || '')}"></label><label class="row small"><input type="checkbox" class="tick" data-sset="${x.id}|prio" ${x.prio ? 'checked' : ''}> ${L('مهمة / ضروري', 'Important')}</label><button class="link" type="button" data-sdel="${x.id}">${L('شيلها من القايمة', 'Remove')}</button></div>` : ''}`;
}
function shopListTab(){
  const l = LIFE(), open = l.shop.filter(x => !x.bought), bought = l.shop.filter(x => x.bought);
  const groups = SHOP.map(c => [c, open.filter(x => x.cat === c.k).sort((a, b) => (b.prio - a.prio) || ((a.need || '9') < (b.need || '9') ? -1 : 1))]).filter(([, a]) => a.length);
  const due = open.filter(x => x.need && x.need <= addDays(todayISO(), 1));
  return `<div class="kpis"><div class="kpi"><div class="l">${L('في القايمة', 'On the list')}</div><div class="v">${open.length}</div></div><div class="kpi"><div class="l">${L('التكلفة المتوقعة', 'Estimated cost')}</div><div class="v" style="font-size:1.25rem">${money(shopTotal(open))}</div><div class="s">${open.filter(x => !x.price).length ? L(`${open.filter(x => !x.price).length} من غير سعر`, `${open.filter(x => !x.price).length} without a price`) : ''}</div></div><div class="kpi"><div class="l">${L('مطلوب لحد بكرة', 'Due by tomorrow')}</div><div class="v">${due.length}</div></div></div>
    <div class="row"><button class="btn ghost sm" type="button" id="shShare">📤 ${L('ابعت القايمة', 'Share list')}</button><button class="btn ghost sm" type="button" id="shBasics">🥗 ${L('ضيف مشتريات الأسبوع من خطة الأكل', 'Add this week’s meal-plan basics')}</button>${l.shopHist.length ? `<button class="btn ghost sm" type="button" id="shAgain">🔁 ${L('كرر آخر مرة', 'Repeat last trip')}</button>` : ''}</div>
    ${groups.length ? groups.map(([c, a]) => `<div class="card"><div class="head"><h2>${c.ic} ${LX(c)}</h2><span class="muted small">${a.length} · ${money(shopTotal(a))}</span></div>${a.map(shopRow).join('')}</div>`).join('') : `<div class="card empty">${L('القايمة فاضية. دوّر فوق على أي حاجة، أو افتح الكتالوج.', 'The list is empty. Search above or open the catalogue.')}</div>`}
    ${bought.length ? `<div class="card"><div class="head"><h2>✅ ${L('اتشرت', 'Bought')}</h2><button class="btn ghost sm" type="button" id="shClear">${L('شيلهم من القايمة', 'Clear them')}</button></div>${bought.map(shopRow).join('')}</div>` : ''}`;
}
function shopBrowseTab(){
  const c = shopCat(SH.cat);
  return `<div class="chips">${SHOP.map(x => `<button type="button" data-scat="${x.k}" aria-pressed="${x.k === c.k}">${x.ic} ${LX(x)}</button>`).join('')}</div>
    ${c.subs.map(s => `<div class="card"><div class="head"><h2>${LX(s)}</h2></div><div class="catalog">${SHOP_ITEMS.filter(i => i.cat === c.k && i.sub === s.k).map(i => { const n = LANG === 'en' ? i.en : i.ar, on = inList(n); return `<button type="button" class="${on ? 'on' : ''}" data-sadd="${i.id}">${on ? '✓ ' : '+ '}${esc(n)}${on && on.qty > 1 ? ` <small dir="ltr">×${on.qty}</small>` : ''}</button>`; }).join('')}</div></div>`).join('')}`;
}
function shopReportTab(){
  const l = LIFE(), mk_ = monthKey(todayISO()), month = l.shopHist.filter(h => h.date.startsWith(mk_)), spent = month.reduce((s, h) => s + (h.price || 0), 0);
  const trips = new Set(month.map(h => h.date)).size;
  const freq = {}; l.shopHist.forEach(h => { (freq[h.name] ||= []).push(h.date); });
  const staples = Object.entries(freq).filter(([, d]) => d.length >= 2).map(([name, d]) => { const s = [...new Set(d)].sort(), gaps = s.slice(1).map((x, i) => daysBetween(s[i], x)).filter(g => g > 0), every = gaps.length ? Math.round(avg(gaps)) : null, last = s.at(-1), next = every ? addDays(last, every) : null; return {name, n: d.length, every, last, next}; }).filter(x => x.every).sort((a, b) => a.next < b.next ? -1 : 1);
  const soon = staples.filter(x => x.next <= addDays(todayISO(), 3) && !inList(x.name));
  const top = Object.entries(freq).sort((a, b) => b[1].length - a[1].length).slice(0, 8);
  return `<div class="kpis"><div class="kpi"><div class="l">${L('صرفت على المشتريات الشهر ده', 'Spent on shopping this month')}</div><div class="v" style="font-size:1.25rem">${money(spent)}</div><div class="s">${month.length} ${L('حاجة', 'items')} · ${trips} ${L('مرة', 'trips')}</div></div><div class="kpi"><div class="l">${L('القايمة الحالية', 'Current list')}</div><div class="v" style="font-size:1.25rem">${money(shopTotal(l.shop.filter(x => !x.bought)))}</div></div></div>
    ${soon.length ? `<div class="card"><div class="head"><h2>🔮 ${L('غالبًا هتحتاجهم قريب', 'You’ll probably need these soon')}</h2></div>${soon.map(x => `<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--line)"><span><b>${esc(x.name)}</b> <span class="muted small">${L(`بتشتريه كل ${x.every} يوم تقريبًا، آخر مرة ${dShort(x.last)}`, `Every ~${x.every} days, last ${dShort(x.last)}`)}</span></span><button class="btn sm" type="button" data-sagain="${esc(x.name)}">+ ${L('ضيف', 'Add')}</button></div>`).join('')}</div>` : ''}
    <div class="two"><div class="card"><div class="head"><h2>${L('الصرف حسب القسم (الشهر ده)', 'Spending by section (this month)')}</h2></div><div class="chart"><canvas id="chShopCat"></canvas></div></div>
    <div class="card"><div class="head"><h2>${L('أكتر حاجات بتشتريها', 'Most bought')}</h2></div>${top.length ? top.map(([n, d]) => `<div class="row" style="justify-content:space-between;padding:5px 0"><span>${esc(n)}</span><span class="muted small num">${d.length}×</span></div>`).join('') : `<div class="empty">${L('علّم على الحاجات اللي اشتريتها علشان التقرير يتبني.', 'Tick items as bought to build the report.')}</div>`}</div></div>
    <div class="card"><div class="head"><h2>${L('سجل المشتريات', 'Purchase history')}</h2></div>${l.shopHist.length ? `<div class="tablewrap"><table class="t"><thead><tr><th>${L('اليوم', 'Date')}</th><th>${L('الحاجة', 'Item')}</th><th>${L('الكمية', 'Qty')}</th><th>${L('السعر', 'Price')}</th></tr></thead><tbody>${l.shopHist.slice(-40).reverse().map(h => `<tr><td>${dShort(h.date)}</td><td>${esc(h.name)}</td><td dir="ltr">${fmt(h.qty, 2)} ${unitL(h.unit)}</td><td>${h.price ? money(h.price) : '—'}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">—</div>`}</div>
    <div class="card"><div class="head"><h2>${L('يوم المشتريات الأسبوعي', 'Weekly shopping day')}</h2></div><div class="row"><select id="shDay" style="width:auto"><option value="">${L('من غير', 'None')}</option>${[6, 0, 1, 2, 3, 4, 5].map(d => `<option value="${d}" ${String(l.shopDay?.d) === String(d) ? 'selected' : ''}>${WD()[d]}</option>`).join('')}</select><input type="time" id="shTime" value="${l.shopDay?.t || '18:00'}" style="width:auto"><span class="muted small">${L('هيفكّرك بالقايمة في اليوم ده', 'You’ll get your list as a reminder that day')}</span></div></div>`;
}
registerView('shop', {title: {ar: 'المشتريات', en: 'Shopping'}, icon: 'shop', render(){
  const q = SH.q.trim(), res = q ? shopSearch(q) : [];
  const search = `<div class="card sticky-search"><input type="search" id="shQ" value="${esc(SH.q)}" placeholder="${L('دوّر على أي حاجة: رز، فوط، بنادول، منظف… حتى لو الكتابة مش مظبوطة', 'Search anything: rice, pads, paracetamol… even misspelt')}" autocomplete="off">
    ${q ? `<div class="sres">${res.map(i => { const n = LANG === 'en' && !i.custom ? i.en : i.ar, on = inList(n), c = shopCat(i.cat); return `<button type="button" data-sadd="${i.id}" class="${on ? 'on' : ''}"><span>${c.ic}</span><b>${esc(n)}</b><small>${LX(shopSub(i.cat, i.sub))}${!i.custom && LANG !== 'en' ? ' · ' + esc(i.en) : ''}</small><i>${on ? '✓ ' + (on.qty || 1) : '+'}</i></button>`; }).join('')}
      <button type="button" class="snew" data-snew="1">➕ ${L(`ضيف "${esc(q)}" كحاجة جديدة`, `Add "${esc(q)}" as a new item`)}</button></div>` : ''}</div>`;
  const body = SH.tab === 'browse' ? shopBrowseTab() : SH.tab === 'report' ? shopReportTab() : shopListTab();
  return topbar(L('المشتريات', 'Shopping'), L(`كتالوج فيه ${SHOP_ITEMS.length} حاجة: أكل، شرب، أدوية، منظفات، أغراض البيت وأكتر`, `A catalogue of ${SHOP_ITEMS.length} items: food, drinks, medicine, cleaning, home and more`), '', true) + search + tabSeg(SH.tab, [['list', L('قايمتي', 'My list')], ['browse', L('الكتالوج', 'Catalogue')], ['report', L('التقرير', 'Report')]], 'data-stab') + body;
}, after(){
  if (SH.tab !== 'report') return; const l = LIFE(), mk_ = monthKey(todayISO()), by = {}; l.shopHist.filter(h => h.date.startsWith(mk_)).forEach(h => { by[h.cat] = (by[h.cat] || 0) + (h.price || 0); });
  const ks = Object.keys(by).sort((a, b) => by[b] - by[a]); mk('chShopCat', {type: 'bar', data: {labels: ks.map(k => shopCat(k).ic + ' ' + LX(shopCat(k))), datasets: [{data: ks.map(k => +by[k].toFixed(2)), backgroundColor: hexOf('--fire'), borderRadius: 6}]}, options: {indexAxis: 'y', plugins: {legend: {display: false}}}});
}});
function boughtTx(x, on){
  const l = LIFE(), cost = x.price ? +(x.price * (x.qty || 1)).toFixed(2) : null;
  if (on) { x.bought = todayISO(); x.histId = uid(); l.shopHist.push({id: x.histId, name: x.name, cat: x.cat, qty: x.qty || 1, unit: x.unit, price: cost, date: todayISO()}); if (cost) { x.txId = uid(); l.tx.push({id: x.txId, type: 'exp', amount: cost, cat: SHOP_TO_MONEY[x.cat] || 'other', date: todayISO(), note: '🛒 ' + x.name, src: 'shop'}); } }
  else { l.shopHist = l.shopHist.filter(h => h.id !== x.histId); if (x.txId) l.tx = l.tx.filter(t => t.id !== x.txId); x.bought = null; x.histId = x.txId = null; }
}
on('click', e => {
  const T = e.target, l = LIFE();
  const tb = T.closest('[data-stab]'); if (tb) { SH.tab = tb.dataset.stab; render(); return true; }
  const sc = T.closest('[data-scat]'); if (sc) { SH.cat = sc.dataset.scat; render(); return true; }
  const ad = T.closest('[data-sadd]'); if (ad) { const it = [...customItems(), ...SHOP_ITEMS].find(i => i.id === ad.dataset.sadd); if (it) { addToShop(it); render(); const el = $('#shQ'); if (el && SH.q) el.focus(); } return true; }
  if (T.closest('[data-snew]')) { const name = SH.q.trim(); if (!name) return true; const best = shopSearch(name)[0], it = {id: 'c.' + uid(), ar: name, syn: [], en: name, cat: best ? best.cat : 'other', sub: best ? best.sub : 'gifts', u: best ? best.u : 'pc', custom: true}; customItems().push(it); addToShop(it); SH.q = ''; render(); return true; }
  const op = T.closest('[data-sopen]'); if (op) { SH.open = SH.open === op.dataset.sopen ? null : op.dataset.sopen; render(); return true; }
  const qy = T.closest('[data-sqty]'); if (qy) { const [id, d] = qy.dataset.sqty.split('|'), x = l.shop.find(i => i.id === id); if (x) { const step = ['kg', 'L'].includes(x.unit) ? 0.25 : 1; x.qty = Math.max(0, +((x.qty || 1) + step * +d).toFixed(2)); if (x.qty === 0) l.shop = l.shop.filter(i => i !== x); store.save(); render(); } return true; }
  const dl = T.closest('[data-sdel]'); if (dl) { const x = l.shop.find(i => i.id === dl.dataset.sdel); if (x && x.bought) boughtTx(x, false); l.shop = l.shop.filter(i => i.id !== dl.dataset.sdel); store.save(); render(); return true; }
  if (T.id === 'shClear') { l.shop = l.shop.filter(x => !x.bought); store.save(); render(); return true; }
  if (T.id === 'shShare') { const open = l.shop.filter(x => !x.bought); const txt = L('🛒 قايمة المشتريات', '🛒 Shopping list') + '\n' + SHOP.map(c => { const a = open.filter(x => x.cat === c.k); return a.length ? `\n${c.ic} ${LX(c)}\n` + a.map(x => `▫️ ${x.name} — ${fmt(x.qty || 1, 2)} ${unitL(x.unit)}${x.note ? ' (' + x.note + ')' : ''}`).join('\n') : ''; }).join('') + (shopTotal(open) ? '\n\n' + L('التكلفة المتوقعة: ', 'Estimated: ') + money(shopTotal(open)) : ''); shareText(txt); return true; }
  if (T.id === 'shBasics') { const basics = [['فيليه سمك مجمد', 1.75, 'kg', 'food', 'fish'], ['صدور فراخ', 1.5, 'kg', 'food', 'poultry'], ['ستيك', 0.5, 'kg', 'food', 'meat'], ['كبدة', 0.25, 'kg', 'food', 'meat'], ['تونة بالمية', 8, 'can', 'food', 'canned'], ['رز مصري', 2, 'kg', 'food', 'grains'], ['بطاطس', 3.5, 'kg', 'food', 'veg'], ['كعك أرز', 1, 'pack', 'food', 'bakery'], ['جزر', 1, 'kg', 'food', 'veg'], ['كوسة', 0.5, 'kg', 'food', 'veg'], ['خيار', 1, 'kg', 'food', 'veg'], ['ليمون', 0.5, 'kg', 'food', 'veg'], ['شبت', 1, 'pack', 'food', 'veg'], ['موز', 7, 'pc', 'food', 'fruit'], ['حليب خالي اللاكتوز', 2, 'L', 'food', 'dairy']];
    let n = 0; basics.forEach(([ar, q, u, cat, sub]) => { if (!inList(ar)) { l.shop.push({id: uid(), name: ar, cat, sub, qty: q, unit: u, price: null, need: '', prio: false, note: '', added: todayISO()}); n++; } }); store.save(); toast(L(`اتضاف ${n} حاجة من خطة الأكل`, `${n} meal-plan items added`)); render(); return true; }
  if (T.id === 'shAgain') { const last = l.shopHist.at(-1)?.date, items = l.shopHist.filter(h => h.date === last); items.forEach(h => { if (!inList(h.name)) l.shop.push({id: uid(), name: h.name, cat: h.cat, qty: h.qty, unit: h.unit, price: h.price ? h.price / (h.qty || 1) : null, need: '', prio: false, note: '', added: todayISO()}); }); store.save(); toast(L(`اتضاف ${items.length} حاجة`, `${items.length} items added`)); render(); return true; }
  const ag = T.closest('[data-sagain]'); if (ag) { const h = [...l.shopHist].reverse().find(x => x.name === ag.dataset.sagain); if (h) { l.shop.push({id: uid(), name: h.name, cat: h.cat, qty: h.qty, unit: h.unit, price: h.price ? h.price / (h.qty || 1) : null, need: '', prio: false, note: '', added: todayISO()}); store.save(); render(); } return true; }
});
on('change', e => {
  const T = e.target, l = LIFE();
  if (T.dataset.sbuy) { const x = l.shop.find(i => i.id === T.dataset.sbuy); if (x) { boughtTx(x, T.checked); if (T.checked && !x.price) toast(L('اكتب السعر من التفاصيل علشان يدخل في الميزانية.', 'Add the price in details so it counts in your budget.')); store.save(); render(); } return true; }
  if (T.dataset.sset) { const [id, k] = T.dataset.sset.split('|'), x = l.shop.find(i => i.id === id); if (!x) return true; x[k] = k === 'prio' ? T.checked : ['qty', 'price'].includes(k) ? num(T.value) : T.value; store.save(); if (k === 'need') rescheduleAll(); render(); return true; }
  if (T.id === 'shDay' || T.id === 'shTime') { l.shopDay = $('#shDay').value === '' ? null : {d: +$('#shDay').value, t: $('#shTime').value || '18:00'}; store.save(); rescheduleAll(); toast(L('اتحفظ', 'Saved')); return true; }
});
on('input', e => { if (e.target.id === 'shQ') { SH.q = e.target.value; clearTimeout(SH.t); SH.t = setTimeout(() => { const pos = e.target.selectionStart; render(); const el = $('#shQ'); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }, 220); return true; } });
on('submit', e => { if (e.target.closest && e.target.querySelector('#shQ')) { e.preventDefault(); return true; } });
function shopReminders(iso, push){
  const l = LIFE(), open = l.shop.filter(x => !x.bought);
  open.filter(x => x.need === iso).forEach(x => push('shop-' + x.id, 10 * 60, '🛒 ' + L('محتاج تشتري: ', 'Need to buy: ') + x.name, L('النهارده', 'Today'), 'remind'));
  open.filter(x => x.need === addDays(iso, 1)).forEach(x => push('shop1-' + x.id, 19 * 60, '🛒 ' + L('بكرة محتاج: ', 'Tomorrow you need: ') + x.name, '', 'remind'));
  if (l.shopDay && D(iso).getDay() === l.shopDay.d && open.length) push('shopday', t2m(l.shopDay.t || '18:00'), '🛒 ' + L('يوم المشتريات', 'Shopping day'), L(`عندك ${open.length} حاجة في القايمة`, `${open.length} items on your list`) + (shopTotal(open) ? ' · ~' + money(shopTotal(open)) : ''), 'remind');
}
