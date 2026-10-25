/* ميزان — "مطبخي": الأصناف اللي عندك وطرق طبخها، وطريقة الأكل (متنوع، طبخة اليوم، طبخة تكفي كام يوم، أسبوع ثابت)،
   ومولّد الطبخات اللي بيركّب الأكلة من البروتين وطريقة السوا والنشويات والخضار، ويحسب الكميات على سعراتك وصحتك. */
'use strict';
const KGROUPS = [
  ['red', 'لحوم حمرا', 'Red meat', '🥩', ['beefcube', 'mince', 'beefbone', 'lamb', 'steak', 'liver']],
  ['poultry', 'فراخ', 'Poultry', '🍗', ['chicken', 'thigh', 'chickwhole', 'grilledchk']],
  ['fish', 'سمك وبحري', 'Fish & seafood', '🐟', ['tilapia', 'mullet', 'hamour', 'fishfz', 'salmon', 'shrimp', 'tuna', 'sardine']],
  ['eggdairy', 'بيض وألبان', 'Eggs & dairy', '🥚', ['egg', 'eggw', 'milk', 'lfmilk', 'soymilk', 'yogurt', 'lfyog', 'greek', 'cottage', 'feta', 'halloumi', 'cheddar', 'labneh', 'tofu']],
  ['legume', 'بقوليات', 'Legumes', '🫘', ['ful', 'lentil', 'chickpea', 'hummus']],
  ['carb', 'نشويات', 'Starches', '🍚', ['rice', 'brice', 'potato', 'sweetp', 'pasta', 'bulgur', 'freekeh', 'quinoa', 'oats', 'baladi', 'pita', 'toast', 'gfbread', 'ricecake']],
  ['veg', 'خضار', 'Vegetables', '🥒', ['cucumber', 'tomato', 'salad', 'lettuce', 'carrot', 'zucchini', 'pepper', 'okra', 'beans', 'eggplant', 'spinach', 'molokhia', 'broccoli', 'cauli', 'mixveg', 'onion']],
  ['fruit', 'فاكهة', 'Fruit', '🍌', ['banana', 'apple', 'orange', 'dates', 'guava', 'grapes', 'kiwi', 'melon', 'watermelon', 'straw', 'berries']],
  ['fat', 'دهون ومكسرات وعسل', 'Fats, nuts & honey', '🫒', ['oil', 'vegoil', 'ghee', 'butter', 'tahini', 'pb', 'almond', 'walnut', 'avocado', 'olives', 'honey']]
];
KGROUPS.forEach(g => { g[4] = g[4].filter(id => FOOD[id]); });
const KGRP = {}; KGROUPS.forEach(g => g[4].forEach(id => { KGRP[id] = g[0]; }));
const KBASIC = new Set(['oil', 'vegoil']);
const KMETH = {oven: ['مشوي في الفرن', 'Oven-grilled', 'oven'], tray: ['صينية في الفرن', 'Oven tray bake', 'oven'], boil: ['مسلوق', 'Boiled', 'stove'], pot: ['في الحلة (كبسة أو طاجن)', 'One pot (kabsa / stew)', 'stove'], pan: ['على الطاسة', 'Pan-cooked', 'stove'], fry: ['مقلي', 'Fried', 'stove'], ready: ['جاهز / من غير طبخ', 'Ready / no cooking', '']};
const KPMETH = {beefcube: ['tray', 'pot', 'boil', 'pan'], mince: ['tray', 'oven', 'pan', 'pot'], beefbone: ['boil', 'pot', 'tray'], lamb: ['tray', 'pot', 'boil', 'oven'], steak: ['pan', 'oven'], liver: ['pan', 'fry'], chicken: ['oven', 'tray', 'pan', 'boil', 'pot', 'fry'], thigh: ['oven', 'tray', 'pan', 'pot', 'fry'], chickwhole: ['oven', 'tray', 'boil', 'pot'], grilledchk: ['ready'], tilapia: ['oven', 'tray', 'pan', 'fry'], mullet: ['oven', 'tray', 'fry'], hamour: ['oven', 'tray', 'pan', 'fry'], fishfz: ['oven', 'tray', 'pan', 'fry'], salmon: ['oven', 'pan'], shrimp: ['pan', 'pot', 'tray'], tuna: ['ready'], sardine: ['ready'], egg: ['pan', 'boil'], eggw: ['pan'], ful: ['ready', 'pot'], lentil: ['pot'], chickpea: ['pot', 'ready']};
const KEQ = {oven: ['فرن', 'Oven'], stove: ['بوتاجاز', 'Stove'], micro: ['ميكروويف', 'Microwave'], freezer: ['فريزر', 'Freezer']};
const KPREF = [['red', 'لحمة حمرا', 'Red meat'], ['fish', 'سمك', 'Fish'], ['poultry', 'فراخ', 'Chicken'], ['egg', 'بيض', 'Eggs'], ['legume', 'بقوليات', 'Legumes']];
const KPREF_L = [['لأ', 'No'], ['قليل', 'Less'], ['عادي', 'Normal'], ['أكتر حاجة', 'Most']];
const KMODES = {varied: ['🎲', 'متنوع', 'Varied', 'كل وجبة مختلفة عن التانية.', 'Every meal is different.'], daily: ['🍲', 'طبخة اليوم', 'Dish of the day', 'نفس الطبخة للغدا والعشا، وتتغير كل يوم.', 'Same dish for lunch and dinner, a new one each day.'], batch: ['📦', 'طبخة تكفي كام يوم', 'Batch cooking', 'تطبخ مرة تكفي يومين أو تلاتة.', 'Cook once for two or three days.'], weekly: ['🔁', 'أسبوع ثابت', 'Fixed week', 'نفس منيو الأسبوع بيتكرر كل أسبوع.', 'The same weekly menu every week.']};
const KSHORT = {beefcube: ['لحمة', 'beef'], mince: ['كفتة', 'kofta'], beefbone: ['لحمة بالعضم', 'bone-in beef'], lamb: ['لحمة ضاني', 'lamb'], steak: ['ستيك', 'steak'], liver: ['كبدة', 'liver'], chicken: ['صدور فراخ', 'chicken breast'], thigh: ['أوراك فراخ', 'chicken thighs'], chickwhole: ['فراخ', 'chicken'], grilledchk: ['فراخ مشوية جاهزة', 'ready rotisserie chicken'], tilapia: ['سمك بلطي', 'tilapia'], mullet: ['سمك بوري', 'mullet'], hamour: ['سمك هامور', 'grouper'], fishfz: ['سمك فيليه', 'fish fillet'], salmon: ['سلمون', 'salmon'], shrimp: ['جمبري', 'shrimp'], tuna: ['تونة', 'tuna'], sardine: ['سردين', 'sardines'], egg: ['بيض', 'eggs'], eggw: ['بياض بيض', 'egg whites'], ful: ['فول', 'fava beans'], lentil: ['عدس', 'lentils'], chickpea: ['حمص', 'chickpeas']};
const KFEM = new Set(['beefcube', 'mince', 'beefbone', 'lamb', 'chicken', 'thigh', 'chickwhole', 'liver']);
const KCARB = {rice: ['رز', 'rice', 'بالرز'], brice: ['رز بني', 'brown rice', 'بالرز البني'], potato: ['بطاطس', 'potatoes', 'بالبطاطس'], sweetp: ['بطاطا', 'sweet potato', 'بالبطاطا'], pasta: ['مكرونة', 'pasta', 'بالمكرونة'], bulgur: ['برغل', 'bulgur', 'بالبرغل'], freekeh: ['فريك', 'freekeh', 'بالفريك'], quinoa: ['كينوا', 'quinoa', 'بالكينوا'], baladi: ['عيش بلدي', 'baladi bread'], pita: ['عيش', 'bread'], toast: ['توست', 'toast'], gfbread: ['عيش خالي من الجلوتين', 'gluten-free bread']};
const KBI = {zucchini: 'بالكوسة', carrot: 'بالجزر', okra: 'بالبامية', beans: 'بالفاصوليا الخضرا', eggplant: 'بالباذنجان', pepper: 'بالفلفل', mixveg: 'بالخضار', tomato: 'بالطماطم', cauli: 'بالقرنبيط', broccoli: 'بالبروكلي', spinach: 'بالسبانخ', molokhia: 'بالملوخية', potato: 'بالبطاطس', sweetp: 'بالبطاطا'};
const KMAINC = ['rice', 'potato', 'pasta', 'brice', 'sweetp', 'bulgur', 'freekeh', 'quinoa'], KBREAD = ['baladi', 'pita', 'gfbread', 'toast'];
const KCOOKV = ['zucchini', 'carrot', 'okra', 'beans', 'pepper', 'eggplant', 'mixveg', 'broccoli', 'cauli', 'spinach', 'molokhia', 'tomato'], KSALADV = ['salad', 'cucumber', 'lettuce', 'tomato'];
const KYIELD = {rice: 3, brice: 2.6, pasta: 2.4, bulgur: 2.7, freekeh: 2.5, quinoa: 2.7};
const KCOOKED = {red: 0.7, poultry: 0.75, fish: 0.8};
const KQUICK = new Set(['tuna', 'sardine', 'grilledchk', 'egg', 'eggw', 'ful', 'chickpea']);
const kPrefKey = id => KGRP[id] === 'eggdairy' ? 'egg' : KGRP[id];
function kitchenOf(p){ const k = p?.kitchen || {}; return {have: Array.isArray(k.have) ? new Set(k.have) : null, meth: k.meth || {}, eq: new Set(Array.isArray(k.eq) ? k.eq : ['oven', 'stove', 'micro', 'freezer']), pref: {red: 2, fish: 2, poultry: 2, egg: 1, legume: 1, ...(k.pref || {})}}; }
function kitchenHave(p){ return kitchenOf(p).have; }
/* what the generator may use at all: your ticked items minus protein groups you set to "No" */
function kitchenAllowed(p){ if (!p?.kitchen) return null; const K = kitchenOf(p), out = new Set(), keto = resolveDiet(p) === 'keto'; Object.keys(FOOD).forEach(id => { if (!kHas(K, id)) return; if (keto && !FOOD[id].tags.has('keto') && !KBASIC.has(id)) return; if (KPMETH[id] && (K.pref[kPrefKey(id)] ?? 2) === 0) return; out.add(id); }); KBASIC.forEach(id => out.add(id)); return out; }
const kHas = (K, id) => !K.have || K.have.has(id) || KBASIC.has(id);
/* why an item can't be used (health, allergy, diet) — '' when fine */
function kItemBlock(id, avoid, diet){
  if (!FOOD[id]) return L('مش موجود', 'Unavailable');
  for (const t of avoid) if (foodHas(id, t)) return (FTAG_L[t] ? LX({ar: FTAG_L[t][0], en: FTAG_L[t][1]}) : TAGNAME(t));
  if (diet === 'vegetarian' && MEAT.has(id)) return L('نظامك نباتي', 'Vegetarian diet');
  if (diet === 'keto' && !FOOD[id].tags.has('keto') && !KBASIC.has(id)) return L('مش مناسب للكيتو', 'Not keto');
  return '';
}
function kMethBlock(m, K, hr){
  const need = KMETH[m][2]; if (need && !K.eq.has(need)) return need === 'oven' ? L('محتاج فرن', 'Needs an oven') : L('محتاج بوتاجاز', 'Needs a stove');
  if (m === 'fry' && (hr.avoid.has('fried') || hr.limit.has('fried') || hr.limit.has('highfat'))) return L('المقلي مش مناسب لحالتك', 'Fried food doesn’t suit your health');
  return '';
}
function kMethods(id, K, hr){ const all = KPMETH[id] || [], chosen = K.meth[id] ? K.meth[id].filter(m => all.includes(m)) : all.filter(m => m !== 'fry'); return chosen.filter(m => !kMethBlock(m, K, hr)); }
function kitchenSub(id, role, have, avoid){
  const g = KGRP[id]; if (!g) return null;
  const pool = (KGROUPS.find(x => x[0] === g) || [])[4] || [];
  return pool.find(x => x !== id && have.has(x) && FOOD[x] && ![...avoid].some(t => foodHas(x, t)) && (role !== 'p' || !!KPMETH[x] === !!KPMETH[id])) || null;
}
function kStoreDays(id, meth){ if (meth === 'fry') return 1; if (['tuna', 'sardine', 'egg', 'eggw'].includes(id)) return 1; if (['liver', 'shrimp'].includes(id)) return 2; const g = KGRP[id]; return g === 'fish' ? 2 : 3; }
/* ---------- dish builder ---------- */
function kitchenDish(pid, meth, cid, vid, sv, diet, avoid, hr){
  const g = KGRP[pid], P = KSHORT[pid] || [FOOD[pid].ar, FOOD[pid].en], fem = KFEM.has(pid), C = cid ? KCARB[cid] || [FOOD[cid].ar, FOOD[cid].en.toLowerCase()] : null, V = vid ? [FOOD[vid].ar, FOOD[vid].en.toLowerCase()] : null, SV = sv ? [FOOD[sv].ar, FOOD[sv].en.toLowerCase()] : null;
  const plusC = C ? ' + ' + C[0] : '', plusCe = C ? ' + ' + C[1] : '', plusS = SV ? ' + ' + SV[0] : '', plusSe = SV ? ' + ' + SV[1] : '';
  let ar, en;
  if (meth === 'tray') { if (cid === 'potato' || cid === 'sweetp') { ar = `صينية ${P[0]} ${KCARB[cid][2]}${V ? ' و' + (V[0].includes(' ') || V[0].startsWith('ال') ? V[0] : 'ال' + V[0]) : ''} في الفرن`; en = `${P[1]} tray bake with ${C[1]}${V ? ' & ' + V[1] : ''}`; } else { ar = `صينية ${P[0]} ${V ? KBI[vid] || 'مع ' + V[0] : 'بالخضار'} في الفرن${plusC}`; en = `${P[1]} tray bake with ${V ? V[1] : 'vegetables'}${plusCe}`; } }
  else if (meth === 'oven') { ar = pid === 'mince' ? `كفتة مشوية في الفرن${plusC}` : g === 'fish' ? `${P[0]} مشوي في الفرن على الطريقة المصرية${plusC}` : `${P[0]} ${fem ? 'مشوية' : 'مشوي'} في الفرن${plusC}`; en = `Oven-grilled ${P[1]}${g === 'fish' ? ' (Egyptian style)' : ''}${plusCe}`; ar += plusS; en += plusSe; }
  else if (meth === 'boil') { ar = pid === 'egg' ? `بيض مسلوق${plusC}` : `${P[0]} ${fem ? 'مسلوقة' : 'مسلوق'}${plusC}${cid === 'rice' ? ' بالمرقة' : ''}`; en = `Boiled ${P[1]}${plusCe}${cid === 'rice' ? ' cooked in the broth' : ''}`; ar += plusS; en += plusSe; }
  else if (meth === 'pot') { if (pid === 'lentil') { ar = cid === 'rice' ? 'عدس بالرز (كشري أصفر)' : `شوربة عدس${plusC}`; en = cid === 'rice' ? 'Lentils with rice' : `Lentil soup${plusCe}`; } else if (cid === 'rice' || cid === 'brice') { ar = `كبسة ${P[0]}`; en = `${P[1]} kabsa`; } else { ar = `طاجن ${P[0]} ${V ? KBI[vid] || 'مع ' + V[0] : 'بالخضار'}${plusC}`; en = `${P[1]} stew with ${V ? V[1] : 'vegetables'}${plusCe}`; } ar += plusS; en += plusSe; }
  else if (meth === 'pan') { ar = pid === 'egg' ? `أومليت${plusC}` : pid === 'eggw' ? `أومليت بياض${plusC}` : `${P[0]} على الطاسة${plusC}`; en = `Pan-cooked ${P[1]}${plusCe}`; ar += plusS; en += plusSe; }
  else if (meth === 'fry') { ar = `${P[0]} ${fem ? 'مقلية' : 'مقلي'}${plusC}${plusS}`; en = `Fried ${P[1]}${plusCe}${plusSe}`; }
  else { ar = `${P[0]}${plusC}${plusS || (V ? ' + ' + V[0] : '')}`; en = `${P[1][0].toUpperCase() + P[1].slice(1)}${plusCe}${plusSe || (V ? ' + ' + V[1] : '')}`; }
  const keto = diet === 'keto', fat = KBASIC.has('oil') ? 'oil' : 'vegoil';
  const pBase = {tuna: 120, sardine: 100, grilledchk: 160, egg: 3, eggw: 5, ful: 250, lentil: 250, chickpea: 220}[pid] ?? 160;
  const parts = [[pid, 'p', pBase]];
  if (cid && !keto) parts.push([cid, 'c', FOOD[cid].u === 'pc' ? 1 : 200]);
  if (vid) parts.push([vid, 'v', keto ? 220 : 150]);
  if (sv && sv !== vid) parts.push([sv, 'v', keto ? 150 : 100]);
  parts.push([fat, 'f', meth === 'ready' ? 1 : keto ? 3 : 2]);
  const how = kitchenHow(pid, meth, cid, vid, avoid, hr), store = kStoreDays(pid, meth);
  return {id: ['k', pid, meth, cid || '', vid || '', sv || ''].join('.'), ar, en, how, parts, pen: 0, swaps: [], s: 'l d', c: 'x', k_: {pid, meth, cid, vid, sv, store, ready: meth === 'ready'}};
}
function kitchenHow(pid, meth, cid, vid, avoid, hr){
  const g = KGRP[pid], fod = avoid.has('fodmap') || hr.limit.has('fodmap'), noSpicy = hr.limit.has('spicy') || hr.avoid.has('spicy'), lowSalt = hr.limit.has('salty') || hr.avoid.has('salty');
  const aro = fod ? ['من غير بصل ولا توم (ممكن زيت التوم المصفّى)', 'no onion or garlic (garlic-infused oil is fine)'] : ['مع بصلة وفص توم', 'with an onion and a garlic clove'];
  const t = (a, e) => [a, e];
  const red = g === 'red', fish = g === 'fish', pou = g === 'poultry';
  let step;
  if (meth === 'tray') step = pid === 'mince' ? t('اعمل الكفتة أقراص بالملح والفلفل والكمون، ورصّها في صينية مع الخضار' + (cid === 'potato' || cid === 'sweetp' ? ' والبطاطس شرايح' : '') + ' ونص كوباية مية أو صلصة خفيفة. فرن 200° حوالي 40 دقيقة.', 'Shape the kofta with salt, pepper and cumin, lay it in a tray with the vegetables' + (cid === 'potato' || cid === 'sweetp' ? ' and sliced potatoes' : '') + ' and half a cup of water. Bake at 200 °C for about 40 min.')
    : red ? t('تبّل اللحمة بالملح والفلفل والبهارات، وحطها في صينية مع الخضار' + (cid === 'potato' || cid === 'sweetp' ? ' والبطاطس مكعبات' : '') + ' ومعلقة زيت وكوباية مية. غطّيها بورق ألومنيوم وادخلها فرن 180° ساعة ونص، واكشفها آخر 20 دقيقة.', 'Season the meat, put it in a tray with the vegetables' + (cid === 'potato' || cid === 'sweetp' ? ' and diced potatoes' : '') + ', a spoon of oil and a cup of water. Cover with foil, bake at 180 °C for 1½ h, uncover for the last 20 min.')
    : pou ? t('تبّل الفراخ وحطها في صينية مع الخضار' + (cid === 'potato' ? ' والبطاطس' : '') + ' ومعلقة زيت. فرن 200° حوالي 45 دقيقة.', 'Season the chicken, tray it with the vegetables' + (cid === 'potato' ? ' and potatoes' : '') + ' and a spoon of oil. Bake at 200 °C for about 45 min.')
    : t('تبّل ' + (pid === 'shrimp' ? 'الجمبري' : 'السمك') + ' بالكمون والملح والليمون، وحطه في صينية فوق الخضار' + (cid === 'potato' ? ' والبطاطس شرايح رفيعة' : '') + '. فرن 200° حوالي 25 دقيقة' + (pid === 'shrimp' ? ' (الجمبري 12–15 دقيقة).' : '.'), 'Season the ' + (pid === 'shrimp' ? 'shrimp' : 'fish') + ' with cumin, salt and lemon, lay it over the vegetables' + (cid === 'potato' ? ' and thin potato slices' : '') + '. Bake at 200 °C for about 25 min' + (pid === 'shrimp' ? ' (shrimp 12–15 min).' : '.'));
  else if (meth === 'oven') step = pid === 'mince' ? t('اعمل الكفتة أصابع بالملح والفلفل والكمون، وفرن 220° حوالي 20 دقيقة، وقلّبها في النص.', 'Shape kofta fingers with salt, pepper and cumin; bake at 220 °C for about 20 min, turning halfway.')
    : fish ? t('تبّل السمك بالكمون والملح والفلفل والليمون (الطريقة المصرية)، وحطه في صينية عليها معلقة زيت. فرن 200° حوالي 20–25 دقيقة، وآخر 5 دقايق على الشوّاية.', 'Season the fish Egyptian-style with cumin, salt, pepper and lemon, on a lightly oiled tray. Bake at 200 °C for 20–25 min, last 5 min under the grill.')
    : pou ? t('تبّل الفراخ بالملح والفلفل والبابريكا والليمون، وفرن 200° حوالي 35–45 دقيقة لحد ما العصارة تطلع شفافة.', 'Season the chicken with salt, pepper, paprika and lemon; bake at 200 °C for 35–45 min until the juices run clear.')
    : t('تبّل اللحمة وسيبها ساعة، وبعدين فرن 200° حوالي 40–60 دقيقة حسب السُمك، والستيك 15–20 دقيقة.', 'Season the meat and rest it an hour, then roast at 200 °C for 40–60 min depending on thickness (steak 15–20 min).');
  else if (meth === 'boil') step = pid === 'egg' ? t('اسلق البيض 10 دقايق، وقشّره وهو دافي.', 'Boil the eggs for 10 min and peel while warm.')
    : t('اسلق ' + (red ? 'اللحمة' : 'الفراخ') + ' في مية بملح وورق لورا وحبهان ' + aro[0] + '، ' + (pid === 'beefbone' ? 'ساعتين' : red ? 'ساعة ونص' : '40 دقيقة') + ' لحد ما تستوي. شيل الريم أول ما يغلي، واحتفظ بالمرقة.', 'Simmer the ' + (red ? 'meat' : 'chicken') + ' in salted water with bay leaf and cardamom, ' + aro[1] + ', for ' + (pid === 'beefbone' ? '2 h' : red ? '1½ h' : '40 min') + '. Skim the foam and keep the broth.');
  else if (meth === 'pot') step = pid === 'lentil' ? t('اسلق العدس مع جزرة ' + aro[0] + ' حوالي 30 دقيقة.', 'Simmer the lentils with a carrot, ' + aro[1] + ', for about 30 min.')
    : (cid === 'rice' || cid === 'brice') ? t('حمّر ' + (KSHORT[pid] ? 'ال' + KSHORT[pid][0].replace(/^ال/, '') : '') + ' في معلقة زيت ' + aro[0] + '، وضيف بهارات كبسة ومية تغطيها وسيبها تستوي (' + (red ? 'ساعة ونص' : pou ? '40 دقيقة' : '15 دقيقة') + '). طلّعها وضيف للمرقة الرز المغسول (كوباية رز لكل كوبايتين مرقة) على نار هادية 20 دقيقة، ورجّعها فوقه.', 'Brown the ' + (KSHORT[pid] ? KSHORT[pid][1] : 'protein') + ' in a spoon of oil ' + aro[1] + ', add kabsa spices and water to cover and cook (' + (red ? '1½ h' : pou ? '40 min' : '15 min') + '). Lift it out, cook the washed rice in the broth (1 cup rice : 2 cups broth) on low for 20 min, and return it on top.')
    : t('حمّر البروتين في معلقة زيت ' + aro[0] + '، وضيف الخضار ومية أو صلصة خفيفة، وسيبه على نار هادية ' + (red ? 'ساعة ونص' : pou ? '45 دقيقة' : '20 دقيقة') + '.', 'Brown the protein in a spoon of oil ' + aro[1] + ', add the vegetables and a little water or light sauce, and simmer for ' + (red ? '1½ h' : pou ? '45 min' : '20 min') + '.');
  else if (meth === 'pan') step = ['egg', 'eggw'].includes(pid) ? t('اخفق البيض بالملح واعمله في طاسة بمعلقة زيت 3 دقايق.', 'Whisk the eggs with salt and cook in a lightly oiled pan for 3 min.')
    : t('سخّن الطاسة كويس بمعلقة زيت، واطبخ ' + ({steak: 'الستيك 3–4 دقايق كل ناحية', liver: 'الكبدة 3–4 دقايق بس علشان متنشفش', shrimp: 'الجمبري 3 دقايق', mince: 'اللحمة المفرومة 10 دقايق وهي بتتقلّب', beefcube: 'اللحمة مكعبات صغيرة 12–15 دقيقة'}[pid] || (pou ? 'الفراخ 6–7 دقايق كل ناحية' : 'السمك 3–4 دقايق كل ناحية')) + '.', 'Heat the pan well with a spoon of oil and cook ' + ({steak: 'the steak 3–4 min a side', liver: 'the liver only 3–4 min', shrimp: 'the shrimp for 3 min', mince: 'the mince for 10 min, stirring', beefcube: 'small beef cubes for 12–15 min'}[pid] || (pou ? 'the chicken 6–7 min a side' : 'the fish 3–4 min a side')) + '.');
  else if (meth === 'fry') step = t('اقلي في زيت سخن (' + (pou ? '7–8 دقايق كل ناحية' : pid === 'liver' ? '3 دقايق' : '4–5 دقايق كل ناحية') + ')، وصفّيه على مناديل. المقلي يتاكل في نفس اليوم.', 'Fry in hot oil (' + (pou ? '7–8 min a side' : pid === 'liver' ? '3 min' : '4–5 min a side') + ') and drain on paper. Eat fried food the same day.');
  else step = pid === 'grilledchk' ? t('اشتري الفراخ المشوية، وشيل الجلد، ووزّن الكمية المكتوبة.', 'Buy the rotisserie chicken, remove the skin and weigh the stated amount.')
    : pid === 'tuna' || pid === 'sardine' ? t('افتح العلبة وصفّي الزيت أو المية كويس.', 'Open the can and drain it well.')
    : t('سخّن الفول أو الحمص المعلب على النار مع معلقة زيت ' + (lowSalt ? 'ومن غير ملح زيادة.' : 'وكمون.'), 'Warm the canned beans with a spoon of oil ' + (lowSalt ? 'and no extra salt.' : 'and cumin.'));
  const carb = !cid || cid === 'potato' && meth === 'tray' || cid === 'sweetp' && meth === 'tray' || (meth === 'pot' && (cid === 'rice' || cid === 'brice') && pid !== 'lentil') ? null
    : cid === 'rice' || cid === 'brice' ? (meth === 'boil' ? t('الرز: اطبخه في المرقة، كوباية رز لكل كوبايتين مرقة، 20 دقيقة على نار هادية.', 'Rice: cook it in the broth, 1 cup rice : 2 cups broth, 20 min on low.') : t('الرز: كوباية رز لكل كوبايتين مية، 20 دقيقة على نار هادية.', 'Rice: 1 cup rice to 2 cups water, 20 min on low heat.'))
    : cid === 'potato' || cid === 'sweetp' ? t('البطاطس: اسلقها 20 دقيقة أو حطها في الفرن 40 دقيقة.', 'Potatoes: boil for 20 min or bake for 40 min.')
    : cid === 'pasta' ? t('المكرونة: اسلقها 10 دقايق في مية بملح.', 'Pasta: boil 10 min in salted water.')
    : KBREAD.includes(cid) ? null : t(LX({ar: FOOD[cid].ar, en: FOOD[cid].en}) + ': ' + L('اسلقه حسب العبوة.', 'cook as per the pack.'), '');
  const notes = []; if (noSpicy) notes.push(['من غير شطة', 'no chilli']); if (lowSalt) notes.push(['ملح قليل', 'little salt']); if (fod && meth !== 'boil' && meth !== 'pot') notes.push(['من غير بصل وتوم', 'no onion or garlic']);
  return [[step[0], carb?.[0], notes.length ? 'ملاحظة: ' + notes.map(n => n[0]).join('، ') + '.' : ''].filter(Boolean).join(' '), [step[1], carb?.[1], notes.length ? 'Note: ' + notes.map(n => n[1]).join(', ') + '.' : ''].filter(Boolean).join(' ')];
}
/* ---------- planner ---------- */
function kitchenContext(p){
  const c = calc(), hr = healthRules(p), diet = resolveDiet(p, hr), avoid = dietAvoid(diet, p, hr), K = kitchenOf(p);
  const ok = id => FOOD[id] && kHas(K, id) && !kItemBlock(id, avoid, diet);
  const prots = Object.keys(KPMETH).filter(id => ok(id) && (K.pref[kPrefKey(id)] ?? 2) > 0).map(id => ({id, g: KGRP[id], meths: kMethods(id, K, hr)})).filter(x => x.meths.length);
  const mainC = KMAINC.filter(ok), breads = KBREAD.filter(ok), cookV = KCOOKV.filter(ok), saladV = KSALADV.filter(ok);
  return {c, hr, diet, avoid, K, ok, prots, mainC, breads, cookV, saladV};
}
function kitchenPicker(ctx, seed, budget){
  /* weighted round-robin over protein groups (by your preference), then rotate the items inside the group */
  const groups = {}; ctx.prots.forEach(x => { (groups[kPrefKey(x.id)] ||= []).push(x); });
  Object.values(groups).forEach(list => list.sort((a, b) => (KQUICK.has(a.id) - KQUICK.has(b.id)) || (budget === 1 ? FOOD[a.id].cost - FOOD[b.id].cost : 0)));
  const keys = Object.keys(groups), w = keys.map(k => [0, 1, 2.2, 4.5][ctx.K.pref[k] ?? 2] || 0.5), tot = w.reduce((a, b) => a + b, 0);
  const cur = w.map((x, i) => x * (((seed * 7 + i * 3) % 10) / 10)), gi = {}, used = {};
  let prevG = null;
  return (preferQuick) => {
    if (preferQuick) { const q = ctx.prots.filter(x => KQUICK.has(x.id)); if (q.length) { const x = q[(used.q = (used.q || 0) + 1) % q.length]; return {id: x.id, meth: x.meths.includes('ready') ? 'ready' : x.meths[0], g: x.g}; } }
    keys.forEach((k, i) => { cur[i] += w[i]; });
    let best = -1; keys.forEach((k, i) => { if (keys.length > 1 && k === prevG && w.filter(Boolean).length > 1) return; if (best < 0 || cur[i] > cur[best]) best = i; });
    if (best < 0) best = 0; cur[best] -= tot; prevG = keys[best];
    const list = groups[keys[best]], n = gi[keys[best]] = (gi[keys[best]] || 0) + 1, x = list[(n - 1 + seed) % list.length], u = used[x.id] = (used[x.id] || 0) + 1;
    const meths = x.meths.filter(m => m !== 'fry'), m = (meths.length ? meths : x.meths)[(u - 1 + seed) % (meths.length || x.meths.length)], fry = x.meths.includes('fry') && u % 3 === 0;
    return {id: x.id, meth: fry ? 'fry' : m, g: x.g};
  };
}
function kitchenPickSides(ctx, pick, idx){
  const keto = ctx.diet === 'keto';
  let cid = null; if (!keto) { const quick = pick.meth === 'ready' || ['egg', 'eggw'].includes(pick.id); const list = quick && ctx.breads.length ? [...ctx.breads, ...ctx.mainC] : pick.meth === 'tray' ? [...ctx.mainC.filter(x => x === 'potato' || x === 'sweetp'), ...ctx.mainC] : ctx.mainC.length ? ctx.mainC : ctx.breads; const lst = pick.meth === 'pot' && pick.id === 'mince' ? list.filter(x => x !== 'rice' && x !== 'brice') : list; if (pick.meth === 'pot' && pick.id !== 'mince' && ctx.mainC.includes('rice') && idx % 2 === 0) cid = 'rice'; else if (lst.length) cid = lst[idx % lst.length]; }
  const needCook = ['tray', 'pot'].includes(pick.meth);
  const vid = needCook ? ctx.cookV[idx % (ctx.cookV.length || 1)] || ctx.saladV[0] || null : null;
  const sv = !needCook ? ctx.saladV[idx % (ctx.saladV.length || 1)] || ctx.cookV[idx % (ctx.cookV.length || 1)] || null : (keto ? ctx.saladV[0] || null : null);
  return {cid, vid, sv};
}
const isMainSlot = s => !['b', 'n'].includes(s);
function generateKitchenMeals(p){
  const ctx = kitchenContext(p); const {c, hr, diet, avoid, K} = ctx; if (!c) return null;
  if (!ctx.prots.length) { const r = generateMeals({...p, eatMode: 'varied'}); if (r && !r.kwarn) r.kwarn = 'noprot'; return r; }
  const mode = p.eatMode, budget = +p.budget || 2, L_ = mode === 'batch' ? Math.max(2, Math.min(3, +p.batchDays || 3)) : 1;
  const wk = isoWeekKey(todayISO()), seed = (S.plan?.mealSeed || 0) + (mode === 'daily' ? wk % 97 : 0);
  const order = [6, 0, 1, 2, 3, 4, 5], cds = mode === 'batch' && Array.isArray(p.cookDays) && p.cookDays.length ? order.filter(d => p.cookDays.includes(d)) : null;
  let segs = [order]; if (cds) { const st = order.indexOf(cds[0]), rot = [...order.slice(st), ...order.slice(0, st)]; segs = []; let cur = null; rot.forEach(d => { if (cds.includes(d)) { cur = [d]; segs.push(cur); } else cur.push(d); }); }
  const next = kitchenPicker(ctx, seed, budget), blocks = [];
  segs.forEach(seg => { let i = 0; while (i < seg.length) { const rem = seg.length - i, pick = next(!!cds && i > 0); const st = kStoreDays(pick.id, pick.meth), len = mode === 'batch' ? Math.min(rem, st, L_) : 1; blocks.push({...pick, days: seg.slice(i, i + len)}); i += len; } });
  blocks.forEach((b, i) => { const sd = kitchenPickSides(ctx, b, i + seed); Object.assign(b, sd); b.dish = kitchenDish(b.id, b.meth, sd.cid, sd.vid, sd.sv, diet, avoid, hr); b.i = i; });
  /* breakfast & snacks from the normal dish pool, limited to what you have */
  const have = kitchenAllowed(p), pools = {};
  const poolFor = s => pools[s] ||= DISH.filter(d => d.s.includes(s) && (diet === 'keto' ? (d.keto || s === 'n' && d.parts.every(([id]) => FOOD[id].tags.has('keto'))) : !d.keto || s === 'n')).map(d => adaptDish(d, avoid, hr.limit, budget, have)).filter(Boolean).sort((a, b) => a.pen - b.pen);
  const quickAlts = (b, want) => blocks.filter(x => x !== b && x.dish.k_.pid !== b.dish.k_.pid).slice(0, 2).map(x => scaleDish(x.dish, want));
  const days = {};
  for (let dow = 0; dow < 7; dow++) {
    const b = blocks.find(x => x.days.includes(dow)), gymDay = GYM.includes(dow), slots = mealSlots(p, diet, gymDay); let T = dayTargets(c, gymDay, diet);
    if (diet === 'if52' && (dow === 1 || dow === 4)) T = {k: c.female ? 500 : 600, p: Math.round(c.protein * 0.45), c: 40, f: 15};
    const di = order.indexOf(dow);
    days[dow] = slots.map((sl, si) => {
      const want = {k: T.k * sl.share, p: T.p * sl.share, f: T.f * sl.share, keto: diet === 'keto'};
      if (isMainSlot(sl.s)) return {...sl, ...scaleDish(b.dish, want), alts: quickAlts(b, want), target: Math.round(want.k), batch: b.i};
      const pool = poolFor(sl.s); if (!pool.length) return null;
      const idx = sl.s === 'b' && p.bfFixed !== false ? seed % pool.length : (di * 3 + si + seed) % pool.length, pick = pool[idx];
      return {...sl, ...scaleDish(pick, want), alts: pool.filter(d => d !== pick).slice(0, 3).map(d => scaleDish(d, want)), target: Math.round(want.k)};
    }).filter(Boolean);
    balanceDay(days[dow], T, diet, avoid, have); days[dow].forEach(m => { m.target = Math.round(T.k * (m.share || 0)); });
  }
  const batches = blocks.map(b => ({i: b.i, days: b.days, cook: b.dish.k_.ready ? null : b.days[0], pid: b.id, meth: b.meth, n: {ar: b.dish.ar, en: b.dish.en}, how: {ar: b.dish.how[0], en: b.dish.how[1]}, store: b.dish.k_.store, g: KGRP[b.id]}));
  return {diet, days, created: todayISO(), mode, batches, week: wk};
}
function isoWeekKey(iso){ const d = D(iso); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = (t.getUTCDay() + 1) % 7; t.setUTCDate(t.getUTCDate() - day); return Math.floor(t.getTime() / 604800000); }
/* one composite main dish for a single day (used when the varied pool runs dry) */
function kitchenDayDish(p, dow){ const ctx = kitchenContext(p); if (!ctx.prots.length) return null; const next = kitchenPicker(ctx, dow + (S.plan?.mealSeed || 0), +p.budget || 2); let pick = null; for (let i = 0; i <= dow; i++) pick = next(false); const sd = kitchenPickSides(ctx, pick, dow); return kitchenDish(pick.id, pick.meth, sd.cid, sd.vid, sd.sv, ctx.diet, ctx.avoid, ctx.hr); }
/* the week rolls over for "dish of the day" */
function kitchenAutoRefresh(){ try { const m = S.plan?.meals; if (m && m.mode === 'daily' && m.week !== isoWeekKey(todayISO()) && S.profile?.eatMode === 'daily') { S.plan.meals = generateMeals(S.profile); store.save(); } } catch (e) {} }
/* ---------- buying amounts ---------- */
function kBuy(id, g){
  const f = FOOD[id], grp = KGRP[id];
  if (id === 'tuna') return {q: Math.ceil(g / 120), u: 'can', t: L(`${Math.ceil(g / 120)} علبة تونة (العلبة حوالي 120 جم مصفاة)`, `${Math.ceil(g / 120)} cans of tuna (≈120 g drained each)`)};
  if (id === 'sardine') return {q: Math.ceil(g / 90), u: 'can', t: L(`${Math.ceil(g / 90)} علبة سردين`, `${Math.ceil(g / 90)} cans of sardines`)};
  if (id === 'grilledchk') { const ch = Math.max(0.25, Math.ceil(g / 600 * 4) / 4); return {q: ch, u: 'pc', t: L(`حوالي ${fmt(ch, 2)} فرخة مشوية (الفرخة فيها حوالي 600 جم لحم من غير جلد)`, `about ${fmt(ch, 2)} rotisserie chickens (≈600 g skinless meat each)`)}; }
  if (f.u === 'pc') return {q: Math.ceil(g / f.gpu), u: 'pc', t: `${Math.ceil(g / f.gpu)} ${L('حبة', 'pcs')}`};
  if (f.u === 'tsp' || f.u === 'tbsp') return {q: 1, u: 'bottle', t: L(`حوالي ${Math.ceil(g / 5)} معلقة صغيرة`, `about ${Math.ceil(g / 5)} tsp`)};
  if (KYIELD[id]) { const dry = Math.ceil(g / KYIELD[id] / 50) * 50; return {q: dry / 1000, u: 'kg', t: L(`${fmt(dry / 1000, 2)} كجم نيّ (بيطلع حوالي ${fmt(g / 1000, 1)} كجم مطبوخ)`, `${fmt(dry / 1000, 2)} kg dry (≈${fmt(g / 1000, 1)} kg cooked)`)}; }
  if (id === 'beefbone' || id === 'chickwhole') { const raw = Math.ceil(g / 0.7 / 50) * 50; return {q: raw / 1000, u: 'kg', t: L(`${fmt(raw / 1000, 2)} كجم ${id === 'beefbone' ? 'بالعضم' : 'فرخة كاملة'} (منها حوالي ${fmt(g / 1000, 2)} كجم لحم)`, `${fmt(raw / 1000, 2)} kg ${id === 'beefbone' ? 'bone-in' : 'whole chicken'} (≈${fmt(g / 1000, 2)} kg meat)`)}; }
  const raw = Math.ceil(g * (grp === 'veg' || id === 'potato' || id === 'sweetp' ? 1.1 : 1) / 50) * 50, whole = ['tilapia', 'mullet', 'hamour'].includes(id);
  return {q: raw / 1000, u: 'kg', t: L(`${fmt(raw / 1000, 2)} كجم${whole ? ` (لو سمك كامل: حوالي ${fmt(Math.ceil(raw / 0.55 / 50) * 50 / 1000, 2)} كجم، الرأس والشوك حوالي 45%)` : ''}`, `${fmt(raw / 1000, 2)} kg${whole ? ` (whole fish: about ${fmt(Math.ceil(raw / 0.55 / 50) * 50 / 1000, 2)} kg)` : ''}`)};
}
function batchTotals(b){
  const ms = S.plan?.meals, agg = {}, boxes = [];
  if (!ms) return {agg, boxes};
  b.days.forEach(dw => (ms.days[dw] || []).filter(m => m.batch === b.i).forEach(m => { boxes.push({dw, m}); m.parts.forEach(([id, r, v]) => { agg[id] = (agg[id] || 0) + gOf(id, v); }); }));
  return {agg, boxes};
}
function cookedG(id, g){ const k = KCOOKED[KGRP[id]]; return ['tuna', 'sardine', 'grilledchk'].includes(id) || !k || FOOD[id].u !== 'graw' ? g : g * k; }
function kitchenCard(i){
  const ms = S.plan?.meals, b = ms?.batches?.[i]; if (!b) return '';
  const {agg, boxes} = batchTotals(b), dn = d => WD()[d], last = b.days[b.days.length - 1];
  const buy = Object.entries(agg).map(([id, g]) => [id, kBuy(id, g)]);
  const priced = buy.map(([id, x]) => { const pi = typeof priceInfo === 'function' ? priceInfo(kShopName(id))[0] : null; return pi && x.u === pi.unit ? pi.price * x.q : null; }), cost = priced.filter(x => x != null).reduce((a, b) => a + b, 0);
  const freezer = kitchenOf(S.profile).eq.has('freezer');
  return `${sheetHead((b.cook != null ? '🍳 ' : '🛒 ') + LX(b.n))}
    <p class="muted" style="margin-top:0">${b.cook != null ? L(`تطبخها ${dn(b.cook)}، وتكفي ${b.days.length === 1 ? 'اليوم ده' : 'لحد ' + dn(last)}`, `Cook on ${dn(b.cook)}; it lasts ${b.days.length === 1 ? 'that day' : 'until ' + dn(last)}`) : L(`من غير طبخ: ${b.days.map(dn).join('، ')}`, `No cooking: ${b.days.map(dn).join(', ')}`)} · ${boxes.length} ${L('علبة', 'boxes')}</p>
    <div class="card"><h3>🛒 ${L('هتشتري', 'To buy')}</h3><ul class="tips">${buy.map(([id, x]) => `<li><b>${esc(kShopName(id))}</b>: ${esc(x.t)}</li>`).join('')}</ul>${cost ? `<p class="small">💰 ${L('التكلفة التقريبية من دفتر أسعارك', 'Approximate cost from your price book')}: <b>${money(cost)}</b>${priced.some(x => x == null) ? L(' (فيه حاجات ملهاش سعر متسجل)', ' (some items have no logged price)') : ''}</p>` : `<p class="muted small">${L('سجّل أسعار الحاجات دي في دفتر الأسعار (المشتريات) علشان أحسبلك التكلفة.', 'Log these prices in the price book (Shopping) to get the cost.')}</p>`}
      <button class="btn sm" type="button" data-kshop="${i}">🛒 ${L('ضيفها للمشتريات', 'Add to shopping')}</button></div>
    <div class="card"><h3>👨‍🍳 ${L('الطريقة', 'Method')}</h3><p style="margin:0">${esc(LX(b.how))}</p></div>
    <div class="card"><h3>📦 ${L('التقسيم على العلب', 'Portioning into boxes')}</h3><div class="tablewrap"><table class="t"><thead><tr><th>${L('العلبة', 'Box')}</th><th>${L('فيها', 'Contents')}</th><th>${L('سعر', 'kcal')}</th></tr></thead><tbody>${boxes.map(({dw, m}) => `<tr><td>${dn(dw)}<br><span class="muted small">${esc(LX(m.title))}</span></td><td class="wrap">${m.parts.map(([id, r, v]) => `${esc(kShopName(id))} ${FOOD[id].u === 'graw' ? `<b dir="ltr">${Math.round(cookedG(id, v) / 5) * 5} ${L('جم مطبوخ', 'g cooked')}</b>` : FOOD[id].u === 'pc' ? `<b dir="ltr">${fmt(v, 1)}</b>` : FOOD[id].u === 'tsp' ? `<b dir="ltr">${fmt(v, 1)} ${L('م.ص', 'tsp')}</b>` : `<b dir="ltr">${Math.round(v)} ${L('جم', 'g')}</b>`}`).join(' · ')}</td><td dir="ltr">${m.k}</td></tr>`).join('')}</tbody></table></div>
      <p class="muted small">${L('الأوزان بعد الطبخ تقريبية: اللحمة بتخس حوالي 30% والفراخ 25% والسمك 20%. علب أيام التمرين أكبر.', 'Cooked weights are approximate: meat shrinks ~30%, chicken ~25%, fish ~20%. Training-day boxes are bigger.')}</p></div>
    <div class="card"><h3>🧊 ${L('التخزين', 'Storage')}</h3><p style="margin:0">${b.cook != null ? L(`حط العلب في التلاجة خلال ساعتين من الطبخ بعد ما تبرد شوية، وتتاكل خلال ${b.store} ${b.store === 1 ? 'يوم' : 'أيام'}. سخّن العلبة كويس لحد ما تبقى سخنة جدًا، ومتسخنهاش أكتر من مرة.`, `Refrigerate the boxes within two hours of cooking and eat within ${b.store} day(s). Reheat until piping hot, and only once.`) : L('اشتريها يومها أو يوم قبلها، وخلي الباقي في التلاجة.', 'Buy on the day or the day before and keep leftovers in the fridge.')}${freezer && b.cook != null ? ' ' + L('لو عايز تطوّلها، فرّز العلب الزيادة على طول، وطلّعها للتلاجة الليلة اللي قبلها.', 'To stretch it, freeze extra boxes straight away and move them to the fridge the night before.') : ''}</p></div>`;
}
const KBUYN = {beefcube: ['لحمة بقري مكعبات', 'Diced beef'], mince: ['لحمة مفرومة', 'Minced beef'], beefbone: ['لحمة بالعضم', 'Bone-in beef'], lamb: ['لحم ضاني', 'Lamb'], steak: ['ستيك', 'Steak'], liver: ['كبدة', 'Liver'], chicken: ['صدور فراخ', 'Chicken breast'], thigh: ['أوراك فراخ', 'Chicken thighs'], chickwhole: ['فرخة كاملة', 'Whole chicken'], grilledchk: ['فراخ مشوية', 'Rotisserie chicken'], tilapia: ['سمك بلطي', 'Tilapia'], mullet: ['سمك بوري', 'Mullet'], hamour: ['سمك هامور', 'Grouper'], fishfz: ['فيليه سمك مجمد', 'Frozen fish fillet'], tuna: ['تونة', 'Tuna'], sardine: ['سردين', 'Sardines'], rice: ['رز', 'Rice'], brice: ['رز بني', 'Brown rice'], potato: ['بطاطس', 'Potatoes'], sweetp: ['بطاطا', 'Sweet potatoes'], pasta: ['مكرونة', 'Pasta'], bulgur: ['برغل', 'Bulgur'], freekeh: ['فريك', 'Freekeh'], quinoa: ['كينوا', 'Quinoa'], lentil: ['عدس', 'Lentils'], ful: ['فول', 'Fava beans'], chickpea: ['حمص', 'Chickpeas'], oil: ['زيت زيتون', 'Olive oil']};
const kShopName = id => LX(KBUYN[id] ? {ar: KBUYN[id][0], en: KBUYN[id][1]} : {ar: FOOD[id].ar.replace(/\s*\(.*\)\s*/g, '').replace(/ (مطبوخ|مطبوخة|مسلوق|مسلوقة|مصفاة|مصفى|أو في الفرن)$/g, '').replace(/ (مطبوخ|مطبوخة|مسلوق|مسلوقة) /g, ' '), en: FOOD[id].en.replace(/^(Cooked|Boiled) /i, '').replace(/,.*$/, '')});
function kitchenAddShop(i){
  const b = S.plan?.meals?.batches?.[i]; if (!b) return 0; const {agg} = batchTotals(b), l = LIFE(); let n = 0;
  Object.entries(agg).forEach(([id, g]) => { if (KBASIC.has(id)) return; const f = FOOD[id], name = kShopName(id), x = kBuy(id, g), ex = inList(name), it = typeof shopSearch === 'function' ? shopSearch(name)[0] : null; if (ex) { if (ex.unit === x.u) ex.qty = +((ex.qty || 0) + x.q).toFixed(2); return; } l.shop.push({id: uid(), name, cat: it ? it.cat : 'food', sub: it ? it.sub : 'meat', qty: x.q, unit: x.u, price: null, store: '', need: b.cook != null ? addDays(todayISO(), (b.cook - D(todayISO()).getDay() + 7) % 7) : '', prio: false, note: L('طبخة: ', 'Batch: ') + LX(b.n), added: todayISO()}); n++; });
  store.save(); rescheduleAll(); return n;
}
function kitchenBanner(iso){
  const ms = S.plan?.meals; if (!ms?.batches) return ''; const dw = D(iso).getDay(), b = ms.batches.find(x => x.days.includes(dw)); if (!b) return '';
  const cookToday = b.cook === dw;
  return `<div class="alert ${cookToday ? 'amber' : 'good'}"><div class="bar"></div><div class="tx"><b>${cookToday ? '🍳 ' + L('النهارده يوم طبخ: ', 'Cooking day: ') : b.cook == null ? '🛒 ' + L('النهارده من غير طبخ: ', 'No cooking today: ') : '📦 ' + L('من طبخة ' + WD()[b.cook] + ': ', 'From ' + WD()[b.cook] + '’s batch: ')}${esc(LX(b.n))}</b><span>${cookToday ? L(`تكفي ${b.days.length === 1 ? 'النهارده' : b.days.length + ' أيام'}. الكميات والتقسيم في الكارت.`, `Lasts ${b.days.length} day(s). Amounts and portions are on the card.`) : b.cook == null ? L('الكميات في الكارت.', 'Amounts are on the card.') : L('سخّن علبة الوجبة دي كويس.', 'Reheat this meal’s box well.')}</span><div class="row" style="margin-top:8px"><button class="btn sm" type="button" data-kcard="${b.i}">${L('كارت الطبخة', 'Cooking card')}</button></div></div></div>`;
}
function kitchenPlanSection(){
  const ms = S.plan?.meals; if (!ms) return '';
  if (!ms.batches) return ms.kwarn ? `<div class="alert amber"><div class="bar"></div><div class="tx"><b>⚠️ ${L('الحاجات اللي في "مطبخي" قليلة', 'Too few items in “My kitchen”')}</b><span>${L('مقدرتش أعمل أكل كامل من الحاجات المتعلم عليها مع قواعد صحتك، فاستخدمت كل الأصناف. زوّد حاجات من "مطبخي".', 'I couldn’t build full meals from your ticked items within your health rules, so all foods were used. Add more in “My kitchen”.')}</span></div></div>` : '';
  return `<div class="card"><div class="head"><h2>🍳 ${L('طبخات الأسبوع', 'This week’s cooking')}</h2><span class="muted small">${esc(LX({ar: KMODES[ms.mode]?.[1] || '', en: KMODES[ms.mode]?.[2] || ''}))}</span></div>${ms.batches.map(b => `<button type="button" class="evrow" data-kcard="${b.i}"><span class="evi">${b.cook != null ? '🍳' : '🛒'}</span><span class="grow"><b>${esc(LX(b.n))}</b><small>${b.cook != null ? L('تطبخ ', 'Cook ') + WD()[b.cook] + ' · ' : L('من غير طبخ · ', 'No cooking · ')}${b.days.map(d => WD()[d]).join('، ')}</small></span><span class="pill grey">${b.days.length} ${L('يوم', 'd')}</span></button>`).join('')}
    ${ms.kwarn === 'noprot' ? `<p class="small">⚠️ ${L('مفيش بروتين متاح في "مطبخي" يناسب صحتك، فعملت لك نظام متنوع.', 'No protein in “My kitchen” fits your health, so a varied plan was built.')}</p>` : ''}
    ${(() => { const c = calc(); if (!c) return ''; const low = Object.entries(ms.days).filter(([, d]) => d.reduce((s, m) => s + m.p, 0) < c.protein * 0.9).length, kl = Object.entries(ms.days).filter(([dw, d]) => Math.abs(d.reduce((s, m) => s + m.k, 0) - (GYM.includes(+dw) ? c.kTrain : c.kRest)) > (GYM.includes(+dw) ? c.kTrain : c.kRest) * 0.1).length; return low || kl ? `<p class="small">💡 ${low ? L(`في ${low} أيام البروتين أقل من هدفك بأكتر من 10%، لأن مصادر البروتين المتعلم عليها قليلة. زوّد صنف بروتين في "مطبخي" (زي تونة أو بيض أو زبادي).`, `On ${low} day(s) protein is over 10% below target because few protein sources are ticked. Add one in “My kitchen” (tuna, eggs or yoghurt).`) : ''} ${kl ? L(`وفي ${kl} أيام السعرات بعيدة عن هدفك بأكتر من 10%.`, `On ${kl} day(s) calories are over 10% off target.`) : ''}</p>` : ''; })()}
    <div class="row"><button class="btn ghost sm" type="button" id="kShopAll">🛒 ${L('مشتريات كل الطبخات', 'Shopping for all batches')}</button></div></div>`;
}
function kitchenReminders(iso, push){
  const ms = S.plan?.meals; if (!ms?.batches || !S.settings.notify?.meals) return; const dw = D(iso).getDay(), tm = t2m(S.profile?.cookTime || '17:30');
  ms.batches.forEach(b => {
    if (b.cook === dw) push('cook-' + b.i, tm, '🍳 ' + L('يوم طبخ: ', 'Cooking day: ') + LX(b.n), L(`تكفي ${b.days.length} ${b.days.length === 1 ? 'يوم' : 'أيام'} · الكميات في كارت الطبخة`, `Lasts ${b.days.length} day(s) · amounts on the cooking card`), 'remind');
    if (b.cook === (dw + 1) % 7) push('cookeve-' + b.i, t2m('20:30'), '🛒 ' + L('بكرة يوم طبخ', 'Cooking tomorrow'), LX(b.n) + ' · ' + L('اتأكد إن المكونات عندك', 'make sure you have the ingredients'), 'remind');
  });
}
/* ---------- the editor (used in the wizard and in "My kitchen") ---------- */
function kNorm(o){ o.kitchen ||= {}; const k = o.kitchen; if (!Array.isArray(k.have)) k.have = KGROUPS.flatMap(g => g[4]); k.meth ||= {}; if (!Array.isArray(k.eq)) k.eq = ['oven', 'stove', 'micro', 'freezer']; k.pref = {red: 2, fish: 2, poultry: 2, egg: 1, legume: 1, ...(k.pref || {})}; return k; }
function kitchenEditor(o, ctx){
  const k = o.kitchen || {}, K = kitchenOf(o), hr = healthRules(o), diet = resolveDiet(o, hr), avoid = dietAvoid(diet, o, hr), mode = o.eatMode || 'varied', on = id => !K.have || K.have.has(id);
  const modeH = `<div class="f"><span>${L('طريقة الأكل', 'How you eat')}</span><div class="goalgrid">${Object.entries(KMODES).map(([m, v]) => `<button type="button" class="goal ${mode === m ? 'on' : ''}" data-kt="mode|${m}"><span>${v[0]}</span><b>${LANG === 'en' ? v[2] : v[1]}</b><small>${LANG === 'en' ? v[4] : v[3]}</small></button>`).join('')}</div></div>
    ${mode === 'batch' ? `<div class="f"><span>${L('الطبخة تكفي', 'Each batch lasts')}</span><div class="seg">${[2, 3].map(n => `<button type="button" data-kt="bd|${n}" aria-pressed="${(+o.batchDays || 3) === n}">${n} ${L('أيام', 'days')}</button>`).join('')}</div></div>
      <div class="f"><span>${L('أيام الطبخ (اختياري، لو سيبتها التطبيق يحددها)', 'Cooking days (optional; the app picks if empty)')}</span><div class="chips">${[6, 0, 1, 2, 3, 4, 5].map(d => `<button type="button" data-kt="cd|${d}" aria-pressed="${(o.cookDays || []).includes(d)}">${WD()[d]}</button>`).join('')}</div></div>
      <p class="muted small" style="margin:0">${L('السمك والجمبري بيتاكلوا خلال يومين، والمقلي في نفس اليوم، فالتطبيق بيقصّر الطبخة دي لوحده.', 'Fish and shrimp are eaten within two days and fried food the same day; the app shortens those batches itself.')}</p>` : ''}
    ${mode !== 'varied' ? `<div class="fgrid"><div class="f"><span>${L('الفطار', 'Breakfast')}</span><div class="seg"><button type="button" data-kt="bf|1" aria-pressed="${o.bfFixed !== false}">${L('ثابت', 'Same daily')}</button><button type="button" data-kt="bf|0" aria-pressed="${o.bfFixed === false}">${L('متغير', 'Varied')}</button></div></div><label class="f">${L('ميعاد الطبخ', 'Cooking time')}<input type="time" data-ktt="cookTime" value="${o.cookTime || '17:30'}"></label></div>` : ''}`;
  const eqH = `<div class="f"><span>${L('أدوات المطبخ', 'Kitchen equipment')}</span><div class="chips">${Object.entries(KEQ).map(([e, v]) => `<button type="button" data-kt="eq|${e}" aria-pressed="${K.eq.has(e)}">${LANG === 'en' ? v[1] : v[0]}</button>`).join('')}</div></div>`;
  const prefH = `<div class="f"><span>${L('بتحب إيه أكتر؟', 'What do you like most?')}</span>${KPREF.map(([pk, ar, en]) => `<div class="kpref"><b>${LANG === 'en' ? en : ar}</b><div class="seg">${KPREF_L.map((l, v) => `<button type="button" data-kt="pref|${pk}|${v}" aria-pressed="${(K.pref[pk] ?? 2) === v}">${LANG === 'en' ? l[1] : l[0]}</button>`).join('')}</div></div>`).join('')}</div>`;
  const grpH = KGROUPS.map(([g, ar, en, ic, ids], gi) => {
    const blocked = ids.map(id => [id, kItemBlock(id, avoid, diet)]).filter(x => x[1]);
    return `<details class="kgrp" ${gi < 3 ? 'open' : ''}><summary>${ic} ${LANG === 'en' ? en : ar} <span class="muted small">${ids.filter(id => on(id) && !kItemBlock(id, avoid, diet)).length}/${ids.length}</span></summary>
      <div class="row" style="margin:8px 0"><button class="link" type="button" data-kt="all|${g}|1">${L('علّم على الكل', 'Select all')}</button><button class="link" type="button" data-kt="all|${g}|0">${L('شيل الكل', 'Clear')}</button></div>
      <div class="chips">${ids.map(id => { const bl = kItemBlock(id, avoid, diet); return `<button type="button" data-kt="have|${id}" aria-pressed="${on(id) && !bl}" ${bl ? `disabled class="kblk" title="${esc(bl)}"` : ''}>${esc(LX({ar: FOOD[id].ar, en: FOOD[id].en}))}</button>`; }).join('')}</div>
      ${blocked.length ? `<p class="muted small" style="margin:6px 0 0">🚫 ${blocked.map(([id, r]) => esc(LX({ar: FOOD[id].ar, en: FOOD[id].en})) + ' (' + esc(r) + ')').join('، ')}</p>` : ''}
      ${ids.filter(id => KPMETH[id] && on(id) && !kItemBlock(id, avoid, diet)).map(id => { const sel = k.meth?.[id] || KPMETH[id].filter(m => m !== 'fry'); return `<div class="kmeth"><span>${esc(LX({ar: FOOD[id].ar, en: FOOD[id].en}))}</span><div class="chips">${KPMETH[id].map(m => { const mb = kMethBlock(m, K, hr); return `<button type="button" data-kt="m|${id}|${m}" aria-pressed="${sel.includes(m) && !mb}" ${mb ? `disabled class="kblk" title="${esc(mb)}"` : ''}>${LANG === 'en' ? KMETH[m][1] : KMETH[m][0]}${mb ? ' 🚫' : ''}</button>`; }).join('')}</div></div>`; }).join('')}
    </details>`; }).join('');
  return `<div class="kitchen" data-ktx="${ctx}">${modeH}${eqH}${prefH}<div class="f"><span>${L('إيه اللي عندك أو سهل تجيبه؟ (اللي متعلمش عليه مش هيدخل في الأكل)', 'What do you have or can easily get? (unticked items won’t be used)')}</span>${grpH}</div></div>`;
}
let KV = null;
const kTarget = el => { const c = el.closest('[data-ktx]'); return c?.dataset.ktx === 'wz' ? WZ : c?.dataset.ktx === 'kv' ? KV : null; };
const kRerender = el => { const c = el.closest('[data-ktx]')?.dataset.ktx; if (c === 'wz') { const sc = $('#sheetIn')?.scrollTop; $('#wizBody').innerHTML = wizBody(); if ($('#sheetIn')) $('#sheetIn').scrollTop = sc; } else render(); };
on('click', e => {
  const T = e.target, kt = T.closest('[data-kt]');
  if (kt) { const o = kTarget(kt); if (!o) return true; const [a, b, c] = kt.dataset.kt.split('|'), k = kNorm(o);
    if (a === 'mode') o.eatMode = b; else if (a === 'bd') o.batchDays = +b; else if (a === 'bf') o.bfFixed = b === '1';
    else if (a === 'cd') { const s = new Set(o.cookDays || []); s.has(+b) ? s.delete(+b) : s.add(+b); o.cookDays = [...s]; }
    else if (a === 'eq') { const s = new Set(k.eq); s.has(b) ? s.delete(b) : s.add(b); k.eq = [...s]; }
    else if (a === 'pref') k.pref[b] = +c;
    else if (a === 'have') { const s = new Set(k.have); s.has(b) ? s.delete(b) : s.add(b); k.have = [...s]; }
    else if (a === 'all') { const ids = KGROUPS.find(g => g[0] === b)[4], s = new Set(k.have); ids.forEach(id => c === '1' ? s.add(id) : s.delete(id)); k.have = [...s]; }
    else if (a === 'm') { const cur = new Set(k.meth[b] || KPMETH[b].filter(m => m !== 'fry')); cur.has(c) ? cur.delete(c) : cur.add(c); k.meth[b] = [...cur]; }
    kRerender(kt); return true; }
  const kc = T.closest('[data-kcard]'); if (kc) { openSheet(kitchenCard(+kc.dataset.kcard)); return true; }
  const ks = T.closest('[data-kshop]'); if (ks) { const n = kitchenAddShop(+ks.dataset.kshop); toast(n ? L(`اتضاف ${n} حاجة للمشتريات 🛒`, `${n} items added to shopping 🛒`) : L('الحاجات دي موجودة في القايمة', 'Already on your list')); return true; }
  if (T.id === 'kShopAll') { let n = 0; (S.plan?.meals?.batches || []).forEach(b => { n += kitchenAddShop(b.i); }); toast(L(`اتضاف ${n} حاجة للمشتريات 🛒`, `${n} items added to shopping 🛒`)); return true; }
  if (T.id === 'kvSave') { const p = S.profile; ['kitchen', 'eatMode', 'batchDays', 'cookDays', 'bfFixed', 'cookTime'].forEach(f => { if (KV[f] !== undefined) p[f] = JSON.parse(JSON.stringify(KV[f])); }); KV = null; S.plan ||= {}; if (S.plan.train) { rebuildPlan('meals'); } store.save(); rescheduleAll(); toast(L('اتحفظ واتعمل نظام الأكل من جديد ✅', 'Saved and your meal plan was rebuilt ✅')); go('plan'); return true; }
  if (T.id === 'kvReset') { KV = null; render(); return true; }
});
on('change', e => { const T = e.target; if (T.dataset.ktt) { const o = kTarget(T); if (o) o[T.dataset.ktt] = T.value; return true; } });
registerView('kitchen', {title: {ar: 'مطبخي', en: 'My kitchen'}, icon: 'pot', render(){
  if (!S.profile?.age) return topbar(L('مطبخي', 'My kitchen'), '', '', true) + `<div class="card empty"><p>${L('ابني خطتك الأول من المعالج.', 'Build your plan with the wizard first.')}</p><button class="btn fire" type="button" data-wiz="1">${L('ابدأ', 'Start')}</button></div>`;
  KV ||= JSON.parse(JSON.stringify({...S.profile}));
  return topbar(L('مطبخي', 'My kitchen'), L('اختار اللي عندك وبتطبخه إزاي وطريقة أكلك، والتطبيق يبني الأكل على سعراتك وصحتك', 'Pick what you have, how you cook and how you eat; the app builds meals around your calories and health'), `<button class="btn fire sm" type="button" id="kvSave">💾 ${L('احفظ واعمل الأكل', 'Save & build meals')}</button>`, true) +
    `<div class="card form">${kitchenEditor(KV, 'kv')}</div><div class="row"><button class="btn fire" type="button" id="kvSave">💾 ${L('احفظ واعمل الأكل', 'Save & build meals')}</button><button class="btn ghost" type="button" id="kvReset">${L('ارجع للمحفوظ', 'Discard changes')}</button></div>`;
}, leave(){ KV = null; }});
