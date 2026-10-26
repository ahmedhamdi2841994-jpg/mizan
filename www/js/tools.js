/* ميزان — الحاسبات: علمية، الأشكال (مساحات وأحجام وخزانات)، محوّل الوحدات، وحاسبات البيت. */
'use strict';
let CT = {tab: 'sci', expr: '', deg: true, hist: [], shape: 'circle', unit: 'cm', vals: {}, conv: 'length', home: 'paint'};
/* ---- a safe expression parser (no eval) ---- */
const FN = {sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1, sinh: 1, cosh: 1, tanh: 1, ln: 1, log: 1, log2: 1, sqrt: 1, cbrt: 1, abs: 1, exp: 1};
function calcEval(src, deg, ans){
  const s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, '.').replace(/\s+/g, '');
  const toks = []; let i = 0;
  while (i < s.length) { const ch = s[i];
    if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.eE]/.test(s[j])) { if (/[eE]/.test(s[j]) && !/[0-9]/.test(s[j + 1] || '') && !/[+-]/.test(s[j + 1] || '')) break; if (/[eE]/.test(s[j]) && /[+-]/.test(s[j + 1])) j++; j++; } toks.push({t: 'n', v: parseFloat(s.slice(i, j))}); i = j; continue; }
    if (/[a-zA-Z]/.test(ch)) { let j = i; while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++; const w = s.slice(i, j).toLowerCase(); if (w === 'pi') toks.push({t: 'n', v: Math.PI}); else if (w === 'e') toks.push({t: 'n', v: Math.E}); else if (w === 'ans') toks.push({t: 'n', v: ans || 0}); else if (FN[w]) toks.push({t: 'f', v: w}); else throw new Error(L('دالة مش معروفة: ', 'Unknown function: ') + w); i = j; continue; }
    if ('+-*/^%!()'.includes(ch)) { toks.push({t: 'o', v: ch}); i++; continue; }
    throw new Error(L('رمز مش مفهوم: ', 'Unexpected symbol: ') + ch);
  }
  /* implicit multiplication: 2pi, 2(3), )(, 3sin */
  const T = []; toks.forEach((k, j) => { const p = T[T.length - 1]; if (p && ((p.t === 'n' || (p.t === 'o' && (p.v === ')' || p.v === '!' || p.v === '%'))) && (k.t === 'n' || k.t === 'f' || (k.t === 'o' && k.v === '(')))) T.push({t: 'o', v: '*'}); T.push(k); });
  let pos = 0; const peek = () => T[pos], next = () => T[pos++];
  const rad = x => deg ? x * Math.PI / 180 : x, deg_ = x => deg ? x * 180 / Math.PI : x;
  const fact = n => { if (n < 0 || n !== Math.floor(n) || n > 170) throw new Error(L('المضروب للأعداد الصحيحة الموجبة بس', 'Factorial needs a non-negative integer')); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
  const apply = (f, x) => ({sin: () => Math.sin(rad(x)), cos: () => Math.cos(rad(x)), tan: () => Math.tan(rad(x)), asin: () => deg_(Math.asin(x)), acos: () => deg_(Math.acos(x)), atan: () => deg_(Math.atan(x)), sinh: () => Math.sinh(x), cosh: () => Math.cosh(x), tanh: () => Math.tanh(x), ln: () => Math.log(x), log: () => Math.log10(x), log2: () => Math.log2(x), sqrt: () => Math.sqrt(x), cbrt: () => Math.cbrt(x), abs: () => Math.abs(x), exp: () => Math.exp(x)})[f]();
  function primary(){ const k = next(); if (!k) throw new Error(L('العملية ناقصة', 'Incomplete expression'));
    if (k.t === 'n') return k.v;
    if (k.t === 'f') { const p = peek(); if (p && p.t === 'o' && p.v === '(') { next(); const v = expr(); if (!(peek() && peek().v === ')')) throw new Error(L('قوس ناقص', 'Missing bracket')); next(); return apply(k.v, v); } return apply(k.v, unary()); }
    if (k.v === '(') { const v = expr(); if (!(peek() && peek().v === ')')) throw new Error(L('قوس ناقص', 'Missing bracket')); next(); return v; }
    if (k.v === '-') return -unary(); if (k.v === '+') return unary();
    throw new Error(L('العملية مش مظبوطة', 'Invalid expression')); }
  function postfix(){ let v = primary(); while (peek() && peek().t === 'o' && (peek().v === '!' || peek().v === '%')) { const o = next().v; v = o === '!' ? fact(v) : v / 100; } return v; }
  function power(){ const b = postfix(); if (peek() && peek().v === '^') { next(); return Math.pow(b, unary()); } return b; }
  function unary(){ const p = peek(); if (p && p.t === 'o' && (p.v === '-' || p.v === '+')) { next(); const v = unary(); return p.v === '-' ? -v : v; } return power(); }
  function term(){ let v = unary(); while (peek() && (peek().v === '*' || peek().v === '/')) { const o = next().v, r = unary(); if (o === '/' && r === 0) throw new Error(L('مينفعش القسمة على صفر', 'Division by zero')); v = o === '*' ? v * r : v / r; } return v; }
  function expr(){ let v = term(); while (peek() && (peek().v === '+' || peek().v === '-')) { const o = next().v, r = term(); v = o === '+' ? v + r : v - r; } return v; }
  if (!T.length) return 0; const v = expr(); if (pos < T.length) throw new Error(L('العملية مش مظبوطة', 'Invalid expression')); if (!isFinite(v)) throw new Error(L('الناتج مش رقم محدد', 'Result is not a finite number')); return v;
}
const nfmt = v => { if (v === null || v === undefined || isNaN(v)) return '—'; const a = Math.abs(v); if (a !== 0 && (a >= 1e12 || a < 1e-6)) return v.toExponential(6); return (+v.toPrecision(12)).toLocaleString('en-US', {maximumFractionDigits: 8}); };
/* ---- shapes ---- */
const UN = {mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048};
const SHAPES = {
  square: {d: 2, ar: 'مربع', en: 'Square', in: [['a', 'الضلع', 'Side']], out: v => [['A', v.a ** 2, 2], ['P', 4 * v.a, 1], ['d', v.a * Math.SQRT2, 1]]},
  rect: {d: 2, ar: 'مستطيل', en: 'Rectangle', in: [['a', 'الطول', 'Length'], ['b', 'العرض', 'Width']], out: v => [['A', v.a * v.b, 2], ['P', 2 * (v.a + v.b), 1], ['d', Math.hypot(v.a, v.b), 1]]},
  tri: {d: 2, ar: 'مثلث (قاعدة وارتفاع)', en: 'Triangle (base & height)', in: [['b', 'القاعدة', 'Base'], ['h', 'الارتفاع', 'Height']], out: v => [['A', v.b * v.h / 2, 2]]},
  tri3: {d: 2, ar: 'مثلث (3 أضلاع)', en: 'Triangle (3 sides)', in: [['a', 'الضلع الأول', 'Side a'], ['b', 'الضلع التاني', 'Side b'], ['c', 'الضلع التالت', 'Side c']], out: v => { const s = (v.a + v.b + v.c) / 2, q = s * (s - v.a) * (s - v.b) * (s - v.c); if (q <= 0) throw new Error(L('الأضلاع دي متعملش مثلث', 'These sides can’t form a triangle')); return [['A', Math.sqrt(q), 2], ['P', 2 * s, 1]]; }},
  circle: {d: 2, ar: 'دايرة', en: 'Circle', in: [['r', 'نص القطر', 'Radius']], out: v => [['A', Math.PI * v.r ** 2, 2], ['C', 2 * Math.PI * v.r, 1], ['D', 2 * v.r, 1]]},
  trap: {d: 2, ar: 'شبه منحرف', en: 'Trapezoid', in: [['a', 'القاعدة الكبيرة', 'Base a'], ['b', 'القاعدة الصغيرة', 'Base b'], ['h', 'الارتفاع', 'Height']], out: v => [['A', (v.a + v.b) / 2 * v.h, 2]]},
  para: {d: 2, ar: 'متوازي أضلاع', en: 'Parallelogram', in: [['b', 'القاعدة', 'Base'], ['h', 'الارتفاع', 'Height']], out: v => [['A', v.b * v.h, 2]]},
  rhombus: {d: 2, ar: 'معيّن', en: 'Rhombus', in: [['p', 'القطر الأول', 'Diagonal 1'], ['q', 'القطر التاني', 'Diagonal 2']], out: v => { const s = Math.hypot(v.p / 2, v.q / 2); return [['A', v.p * v.q / 2, 2], ['s', s, 1], ['P', 4 * s, 1]]; }},
  ellipse: {d: 2, ar: 'قطع ناقص', en: 'Ellipse', in: [['a', 'نص المحور الكبير', 'Semi-major a'], ['b', 'نص المحور الصغير', 'Semi-minor b']], out: v => { const h = ((v.a - v.b) / (v.a + v.b)) ** 2; return [['A', Math.PI * v.a * v.b, 2], ['P', Math.PI * (v.a + v.b) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h))), 1]]; }},
  sector: {d: 2, ar: 'قطاع دايري', en: 'Circular sector', in: [['r', 'نص القطر', 'Radius'], ['t', 'الزاوية (درجة)', 'Angle (°)', 1]], out: v => [['A', v.t / 360 * Math.PI * v.r ** 2, 2], ['L', v.t / 360 * 2 * Math.PI * v.r, 1]]},
  ring: {d: 2, ar: 'حلقة', en: 'Annulus (ring)', in: [['R', 'نص القطر الخارجي', 'Outer radius'], ['r', 'نص القطر الداخلي', 'Inner radius']], out: v => { if (v.r >= v.R) throw new Error(L('الداخلي لازم أصغر من الخارجي', 'Inner must be smaller than outer')); return [['A', Math.PI * (v.R ** 2 - v.r ** 2), 2]]; }},
  poly: {d: 2, ar: 'مضلع منتظم', en: 'Regular polygon', in: [['n', 'عدد الأضلاع', 'Number of sides', 1], ['s', 'طول الضلع', 'Side length']], out: v => { if (v.n < 3) throw new Error(L('أقل عدد أضلاع 3', 'At least 3 sides')); return [['A', v.n * v.s ** 2 / (4 * Math.tan(Math.PI / v.n)), 2], ['P', v.n * v.s, 1]]; }},
  cube: {d: 3, ar: 'مكعب', en: 'Cube', in: [['a', 'الضلع', 'Edge']], out: v => [['V', v.a ** 3, 3], ['S', 6 * v.a ** 2, 2], ['d', v.a * Math.sqrt(3), 1]]},
  cuboid: {d: 3, ar: 'متوازي مستطيلات', en: 'Cuboid (box)', in: [['l', 'الطول', 'Length'], ['w', 'العرض', 'Width'], ['h', 'الارتفاع', 'Height']], out: v => [['V', v.l * v.w * v.h, 3], ['S', 2 * (v.l * v.w + v.l * v.h + v.w * v.h), 2], ['d', Math.hypot(v.l, v.w, v.h), 1]]},
  cyl: {d: 3, ar: 'أسطوانة', en: 'Cylinder', in: [['r', 'نص القطر', 'Radius'], ['h', 'الارتفاع', 'Height']], out: v => [['V', Math.PI * v.r ** 2 * v.h, 3], ['S', 2 * Math.PI * v.r * (v.r + v.h), 2], ['Sl', 2 * Math.PI * v.r * v.h, 2]]},
  cone: {d: 3, ar: 'مخروط', en: 'Cone', in: [['r', 'نص القطر', 'Radius'], ['h', 'الارتفاع', 'Height']], out: v => { const s = Math.hypot(v.r, v.h); return [['V', Math.PI * v.r ** 2 * v.h / 3, 3], ['S', Math.PI * v.r * (v.r + s), 2], ['l', s, 1]]; }},
  frustum: {d: 3, ar: 'مخروط ناقص', en: 'Frustum', in: [['R', 'نص القطر الكبير', 'Big radius'], ['r', 'نص القطر الصغير', 'Small radius'], ['h', 'الارتفاع', 'Height']], out: v => { const s = Math.hypot(v.R - v.r, v.h); return [['V', Math.PI * v.h / 3 * (v.R ** 2 + v.R * v.r + v.r ** 2), 3], ['S', Math.PI * (v.R + v.r) * s + Math.PI * (v.R ** 2 + v.r ** 2), 2], ['l', s, 1]]; }},
  sphere: {d: 3, ar: 'كرة', en: 'Sphere', in: [['r', 'نص القطر', 'Radius']], out: v => [['V', 4 / 3 * Math.PI * v.r ** 3, 3], ['S', 4 * Math.PI * v.r ** 2, 2]]},
  hemi: {d: 3, ar: 'نص كرة', en: 'Hemisphere', in: [['r', 'نص القطر', 'Radius']], out: v => [['V', 2 / 3 * Math.PI * v.r ** 3, 3], ['S', 3 * Math.PI * v.r ** 2, 2]]},
  pyramid: {d: 3, ar: 'هرم (قاعدة مربعة)', en: 'Square pyramid', in: [['a', 'ضلع القاعدة', 'Base side'], ['h', 'الارتفاع', 'Height']], out: v => { const s = Math.hypot(v.h, v.a / 2); return [['V', v.a ** 2 * v.h / 3, 3], ['S', v.a ** 2 + 2 * v.a * s, 2], ['l', s, 1]]; }},
  prism: {d: 3, ar: 'منشور ثلاثي', en: 'Triangular prism', in: [['b', 'قاعدة المثلث', 'Triangle base'], ['t', 'ارتفاع المثلث', 'Triangle height'], ['L', 'طول المنشور', 'Prism length']], out: v => [['V', v.b * v.t / 2 * v.L, 3], ['B', v.b * v.t / 2, 2]]},
  capsule: {d: 3, ar: 'كبسولة', en: 'Capsule', in: [['r', 'نص القطر', 'Radius'], ['a', 'طول الجزء الأسطواني', 'Cylinder length']], out: v => [['V', Math.PI * v.r ** 2 * (4 / 3 * v.r + v.a), 3], ['S', 2 * Math.PI * v.r * (2 * v.r + v.a), 2]]},
  torus: {d: 3, ar: 'حلقة دونات', en: 'Torus', in: [['R', 'نص القطر الكبير', 'Major radius'], ['r', 'نص قطر الأنبوبة', 'Tube radius']], out: v => [['V', 2 * Math.PI ** 2 * v.R * v.r ** 2, 3], ['S', 4 * Math.PI ** 2 * v.R * v.r, 2]]},
  ellipsoid: {d: 3, ar: 'قطع ناقص مجسّم', en: 'Ellipsoid', in: [['a', 'نص المحور أ', 'Semi-axis a'], ['b', 'نص المحور ب', 'Semi-axis b'], ['c', 'نص المحور ج', 'Semi-axis c']], out: v => { const p = 1.6075, S_ = 4 * Math.PI * (((v.a * v.b) ** p + (v.a * v.c) ** p + (v.b * v.c) ** p) / 3) ** (1 / p); return [['V', 4 / 3 * Math.PI * v.a * v.b * v.c, 3], ['S', S_, 2]]; }},
  tankV: {d: 3, tank: 1, ar: 'خزان أسطواني واقف', en: 'Vertical cylindrical tank', in: [['D', 'القطر', 'Diameter'], ['h', 'الارتفاع', 'Height'], ['f', 'ارتفاع المية (اختياري)', 'Water level (optional)', 0, 1]], out: v => { const A = Math.PI * (v.D / 2) ** 2; return [['V', A * v.h, 3], ['Vf', A * Math.min(v.f || v.h, v.h), 3]]; }},
  tankH: {d: 3, tank: 1, ar: 'خزان أسطواني نايم', en: 'Horizontal cylindrical tank', in: [['D', 'القطر', 'Diameter'], ['L', 'الطول', 'Length'], ['f', 'عمق المية (اختياري)', 'Liquid depth (optional)', 0, 1]], out: v => { const r = v.D / 2, h = Math.min(v.f || v.D, v.D), seg = r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(Math.max(0, 2 * r * h - h * h)); return [['V', Math.PI * r * r * v.L, 3], ['Vf', seg * v.L, 3]]; }},
  tankR: {d: 3, tank: 1, ar: 'خزان مستطيل', en: 'Rectangular tank', in: [['l', 'الطول', 'Length'], ['w', 'العرض', 'Width'], ['h', 'الارتفاع', 'Height'], ['f', 'ارتفاع المية (اختياري)', 'Water level (optional)', 0, 1]], out: v => [['V', v.l * v.w * v.h, 3], ['Vf', v.l * v.w * Math.min(v.f || v.h, v.h), 3]]}
};
const OUTL = {A: ['المساحة', 'Area'], P: ['المحيط', 'Perimeter'], C: ['المحيط', 'Circumference'], D: ['القطر', 'Diameter'], d: ['القطر', 'Diagonal'], s: ['الضلع', 'Side'], L: ['طول القوس', 'Arc length'], V: ['الحجم', 'Volume'], S: ['المساحة الكلية للسطح', 'Total surface area'], Sl: ['المساحة الجانبية', 'Lateral area'], l: ['الارتفاع الجانبي', 'Slant height'], B: ['مساحة القاعدة', 'Base area'], Vf: ['حجم المية', 'Liquid volume']};
function shapeSVG(k){ const c = 'var(--fire)', s = `fill="none" stroke="${c}" stroke-width="3"`, f = `fill="var(--fire-soft)"`;
  const m = {square: `<rect x="30" y="20" width="80" height="80" ${f} ${s}/>`, rect: `<rect x="15" y="30" width="110" height="60" ${f} ${s}/>`, tri: `<path d="M20 100 L120 100 L60 20Z" ${f} ${s}/><line x1="60" y1="20" x2="60" y2="100" stroke="var(--ink-3)" stroke-dasharray="4 3"/>`, tri3: `<path d="M20 100 L120 100 L80 25Z" ${f} ${s}/>`, circle: `<circle cx="70" cy="60" r="45" ${f} ${s}/><line x1="70" y1="60" x2="115" y2="60" stroke="var(--ink-3)"/>`, trap: `<path d="M15 100 L125 100 L95 30 L45 30Z" ${f} ${s}/>`, para: `<path d="M15 100 L105 100 L125 30 L35 30Z" ${f} ${s}/>`, rhombus: `<path d="M70 15 L120 60 L70 105 L20 60Z" ${f} ${s}/>`, ellipse: `<ellipse cx="70" cy="60" rx="55" ry="32" ${f} ${s}/>`, sector: `<path d="M70 95 L20 45 A70 70 0 0 1 120 45Z" ${f} ${s}/>`, ring: `<circle cx="70" cy="60" r="45" ${f} ${s}/><circle cx="70" cy="60" r="22" fill="var(--panel)" ${s}/>`, poly: `<path d="M70 15 L113 46 L97 98 L43 98 L27 46Z" ${f} ${s}/>`,
    cube: `<path d="M30 45 L80 45 L80 100 L30 100Z M30 45 L55 20 L105 20 L80 45 M105 20 L105 75 L80 100" ${f} ${s}/>`, cuboid: `<path d="M15 50 L95 50 L95 100 L15 100Z M15 50 L40 25 L120 25 L95 50 M120 25 L120 75 L95 100" ${f} ${s}/>`, cyl: `<ellipse cx="70" cy="25" rx="40" ry="12" ${f} ${s}/><path d="M30 25 L30 95 A40 12 0 0 0 110 95 L110 25" ${f} ${s}/>`, cone: `<path d="M70 15 L30 95 A40 12 0 0 0 110 95Z" ${f} ${s}/>`, frustum: `<ellipse cx="70" cy="30" rx="25" ry="8" ${f} ${s}/><path d="M45 30 L25 95 A45 12 0 0 0 115 95 L95 30" ${f} ${s}/>`, sphere: `<circle cx="70" cy="60" r="45" ${f} ${s}/><ellipse cx="70" cy="60" rx="45" ry="12" fill="none" stroke="var(--ink-3)" stroke-dasharray="4 3"/>`, hemi: `<path d="M25 80 A45 45 0 0 1 115 80Z" ${f} ${s}/><ellipse cx="70" cy="80" rx="45" ry="10" fill="none" stroke="${c}" stroke-width="2"/>`, pyramid: `<path d="M70 15 L25 95 L95 95Z M70 15 L115 80 L95 95" ${f} ${s}/>`, prism: `<path d="M20 95 L60 95 L40 55Z M40 55 L110 30 L130 70 L60 95 M130 70 L90 70" ${f} ${s}/>`, capsule: `<rect x="20" y="35" width="100" height="50" rx="25" ${f} ${s}/>`, torus: `<ellipse cx="70" cy="60" rx="55" ry="35" ${f} ${s}/><ellipse cx="70" cy="60" rx="22" ry="12" fill="var(--panel)" ${s}/>`, ellipsoid: `<ellipse cx="70" cy="60" rx="55" ry="38" ${f} ${s}/><ellipse cx="70" cy="60" rx="55" ry="10" fill="none" stroke="var(--ink-3)" stroke-dasharray="4 3"/>`,
    tankV: `<ellipse cx="70" cy="20" rx="35" ry="10" fill="none" ${s}/><path d="M35 20 L35 100 A35 10 0 0 0 105 100 L105 20" fill="none" ${s}/><path d="M35 60 L35 100 A35 10 0 0 0 105 100 L105 60 A35 10 0 0 1 35 60Z" fill="var(--blue)" opacity=".35"/>`, tankH: `<rect x="15" y="25" width="110" height="70" rx="35" fill="none" ${s}/><path d="M22 75 L118 75 A35 35 0 0 1 90 95 L50 95 A35 35 0 0 1 22 75Z" fill="var(--blue)" opacity=".35"/>`, tankR: `<path d="M15 45 L95 45 L95 100 L15 100Z M15 45 L40 20 L120 20 L95 45 M120 20 L120 75 L95 100" fill="none" ${s}/><rect x="15" y="72" width="80" height="28" fill="var(--blue)" opacity=".35"/>`};
  return `<svg viewBox="0 0 140 120" width="160" height="137" aria-hidden="true">${m[k] || ''}</svg>`; }
/* ---- converter ---- */
const CONV = {
  length: {ar: 'طول', en: 'Length', u: {mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344}},
  mass: {ar: 'وزن', en: 'Mass', u: {mg: 1e-6, g: 0.001, kg: 1, t: 1000, oz: 0.028349523125, lb: 0.45359237}},
  volume: {ar: 'حجم', en: 'Volume', u: {ml: 0.001, L: 1, 'm³': 1000, 'cm³': 0.001, tsp: 0.00492892, tbsp: 0.0147868, cup: 0.24, 'gal US': 3.785411784, 'fl oz': 0.0295735}},
  area: {ar: 'مساحة', en: 'Area', u: {'cm²': 1e-4, 'm²': 1, 'km²': 1e6, ha: 1e4, 'ft²': 0.09290304, acre: 4046.8564224, 'فدان': 4200.83, 'قيراط': 175.035}},
  temp: {ar: 'حرارة', en: 'Temperature', u: {'°C': 1, '°F': 1, K: 1}},
  speed: {ar: 'سرعة', en: 'Speed', u: {'km/h': 1 / 3.6, 'm/s': 1, mph: 0.44704, knot: 0.514444}},
  energy: {ar: 'طاقة', en: 'Energy', u: {kcal: 4184, kJ: 1000, J: 1, Wh: 3600, kWh: 3.6e6}},
  data: {ar: 'بيانات', en: 'Data', u: {B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4}},
  time: {ar: 'وقت', en: 'Time', u: {s: 1, min: 60, h: 3600, day: 86400, week: 604800}}
};
function convert(cat, v, a, b){ if (cat === 'temp') { const c = a === '°C' ? v : a === '°F' ? (v - 32) * 5 / 9 : v - 273.15; return b === '°C' ? c : b === '°F' ? c * 9 / 5 + 32 : c + 273.15; } const u = CONV[cat].u; return v * u[a] / u[b]; }
/* ---- views ---- */
function sciTab(){
  const keys = [['sin', 'cos', 'tan', 'ln', 'log'], ['asin', 'acos', 'atan', '√', '^'], ['(', ')', '!', '%', 'π'], ['7', '8', '9', '÷', '⌫'], ['4', '5', '6', '×', 'AC'], ['1', '2', '3', '−', 'Ans'], ['0', '.', 'e', '+', '=']];
  let res = '', err = ''; try { res = CT.expr ? nfmt(calcEval(CT.expr, CT.deg, CT.ans)) : ''; } catch (er) { err = er.message; }
  return `<div class="two"><div class="card calc"><input type="text" id="cExpr" dir="ltr" value="${esc(CT.expr)}" placeholder="0" autocomplete="off" inputmode="none"><div class="cres" dir="ltr">${err ? `<span class="muted small">${esc(err)}</span>` : res ? '= ' + res : '&nbsp;'}</div>
    <div class="row" style="justify-content:space-between"><span class="seg"><button type="button" data-cdeg="1" aria-pressed="${CT.deg}">DEG</button><button type="button" data-cdeg="0" aria-pressed="${!CT.deg}">RAD</button></span><span class="muted small">${L('تقدر تكتب بالكيبورد كمان', 'You can type too')}</span></div>
    <div class="ckeys">${keys.flat().map(k => `<button type="button" data-ck="${esc(k)}" ${CK_AR[k] ? `aria-label="${LX(CK_AR[k])}"` : ''} class="${'=AC⌫'.includes(k) && k.length <= 2 ? 'op' : /[÷×−+^]/.test(k) ? 'op2' : /[a-z√π!%()e]/.test(k) || k === 'Ans' ? 'fn' : ''}">${esc(k)}</button>`).join('')}</div></div>
    <div class="card"><div class="head"><h2>${L('السجل', 'History')}</h2>${CT.hist.length ? `<button class="link" type="button" data-chclr="1">${L('امسح', 'Clear')}</button>` : ''}</div>${CT.hist.length ? CT.hist.slice().reverse().map(h => `<button type="button" class="chist" data-chuse="${esc(h[0])}" dir="ltr"><span>${esc(h[0])}</span><b>= ${esc(h[1])}</b></button>`).join('') : `<div class="empty">—</div>`}</div></div>`;
}
function shapeTab(){
  const sh = SHAPES[CT.shape], u = CT.unit, v = {}; let out = [], err = '';
  const vals = CT.vals[CT.shape] ||= {}; let ok = true; sh.in.forEach(([k, , , int, opt]) => { const x = num(vals[k]); if (x === null || x < 0 || (x === 0 && !opt)) { if (!opt) ok = false; v[k] = opt ? 0 : null; } else v[k] = int ? x : x; });
  if (ok) { try { const conv = {}; sh.in.forEach(([k, , , int]) => conv[k] = int ? v[k] : v[k]); out = sh.out(conv); } catch (er) { err = er.message; } }
  const dimU = p => p === 3 ? u + '³' : p === 2 ? u + '²' : u, toM = (x, p) => x * UN[u] ** p;
  return `<div class="chips">${Object.entries(SHAPES).filter(([, s]) => s.d === 2).map(([k, s]) => `<button type="button" data-cshape="${k}" aria-pressed="${CT.shape === k}">${LX(s)}</button>`).join('')}</div>
    <div class="chips">${Object.entries(SHAPES).filter(([, s]) => s.d === 3).map(([k, s]) => `<button type="button" data-cshape="${k}" aria-pressed="${CT.shape === k}">${s.tank ? '🛢️ ' : ''}${LX(s)}</button>`).join('')}</div>
    <div class="two"><div class="card form"><div class="row" style="justify-content:space-between"><h2>${LX(sh)}</h2>${shapeSVG(CT.shape)}</div>
      <label class="f">${L('الوحدة', 'Unit')}<select id="cUnit" style="width:auto">${Object.keys(UN).map(k => `<option ${k === u ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
      <div class="fgrid">${sh.in.map(([k, ar, en, int]) => `<label class="f">${LANG === 'en' ? en : ar}${int ? '' : ` (${u})`}<input type="number" step="any" min="0" inputmode="decimal" data-cv="${k}" value="${vals[k] ?? ''}"></label>`).join('')}</div></div>
    <div class="card"><div class="head"><h2>${L('النتيجة', 'Result')}</h2></div>${err ? `<div class="alert amber"><div class="bar"></div><div class="tx"><b>${esc(err)}</b></div></div>` : !ok ? `<div class="empty">${L('اكتب الأبعاد', 'Enter the dimensions')}</div>` : out.map(([k, x, p]) => `<div class="cout"><span>${LX({ar: OUTL[k][0], en: OUTL[k][1]})}</span><b dir="ltr">${nfmt(x)} ${dimU(p)}</b>${p >= 2 && u !== 'm' ? `<small dir="ltr">= ${nfmt(toM(x, p))} m${p === 3 ? '³' : '²'}</small>` : ''}${p === 3 ? `<small dir="ltr">= ${nfmt(toM(x, 3) * 1000)} ${L('لتر', 'L')} · ${nfmt(toM(x, 3) * 264.172)} gal</small>` : ''}</div>`).join('')}</div></div>`;
}
function convTab(){
  const cat = CONV[CT.conv], units = Object.keys(cat.u), a = CT.ca && cat.u[CT.ca] ? CT.ca : units[0], b = CT.cb && cat.u[CT.cb] ? CT.cb : units[1] || units[0], v = num(CT.cvv) ?? 1;
  return `<div class="chips">${Object.entries(CONV).map(([k, c]) => `<button type="button" data-cconv="${k}" aria-pressed="${CT.conv === k}">${LX(c)}</button>`).join('')}</div>
    <div class="card form"><div class="fgrid"><label class="f">${L('القيمة', 'Value')}<input type="number" step="any" id="cvv" value="${CT.cvv ?? 1}"></label><label class="f">${L('من', 'From')}<select id="cca">${units.map(x => `<option ${x === a ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label class="f">${L('إلى', 'To')}<select id="ccb">${units.map(x => `<option ${x === b ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
      <div class="cres big" dir="ltr">${nfmt(v)} ${a} = <b>${nfmt(convert(CT.conv, v, a, b))}</b> ${b}</div>
      <div class="tablewrap"><table class="t"><tbody>${units.filter(x => x !== a).map(x => `<tr><td dir="ltr">${x}</td><td dir="ltr">${nfmt(convert(CT.conv, v, a, x))}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function homeTab(){
  const H = CT.h ||= {walls: 40, height: 3, doors: 2, windows: 3, coats: 2, cover: 10, fl: 5, fw: 4, ts: 60, waste: 10, perBox: 4, cl: 5, cw: 4, ct: 10};
  const inp = (k, l, step) => `<label class="f">${l}<input type="number" step="${step || 'any'}" min="0" data-ch="${k}" value="${H[k]}"></label>`;
  let body = '';
  if (CT.home === 'paint') { const area = Math.max(0, H.walls * H.height - H.doors * 1.9 - H.windows * 1.5), lit = area * H.coats / H.cover; body = `<div class="fgrid">${inp('walls', L('محيط الأوضة أو طول الحيطان (م)', 'Room perimeter / wall length (m)'))}${inp('height', L('ارتفاع الحيطة (م)', 'Wall height (m)'))}${inp('doors', L('عدد الأبواب', 'Doors'), 1)}${inp('windows', L('عدد الشبابيك', 'Windows'), 1)}${inp('coats', L('عدد الطبقات', 'Coats'), 1)}${inp('cover', L('تغطية اللتر (م²)', 'Coverage per litre (m²)'))}</div>
    <div class="cout"><span>${L('مساحة الدهان', 'Paintable area')}</span><b dir="ltr">${nfmt(area)} m²</b></div><div class="cout"><span>${L('كمية الدهان', 'Paint needed')}</span><b dir="ltr">${nfmt(Math.ceil(lit * 10) / 10)} L</b><small>${L(`حوالي ${Math.ceil(lit / 3.6)} جالون صغير (3.6 لتر) أو ${Math.ceil(lit / 18)} جردل (18 لتر)`, `≈ ${Math.ceil(lit / 3.6)} × 3.6 L or ${Math.ceil(lit / 18)} × 18 L`)}</small></div>
    <p class="muted small">${L('الباب محسوب 1.9 م² والشباك 1.5 م². التغطية بتختلف حسب نوع الدهان، اقرا العلبة.', 'Doors count as 1.9 m², windows 1.5 m². Coverage varies by paint; check the tin.')}</p>`; }
  if (CT.home === 'tiles') { const area = H.fl * H.fw, tile = (H.ts / 100) ** 2, n = Math.ceil(area / tile * (1 + H.waste / 100)); body = `<div class="fgrid">${inp('fl', L('طول الأرضية (م)', 'Floor length (m)'))}${inp('fw', L('عرض الأرضية (م)', 'Floor width (m)'))}${inp('ts', L('مقاس البلاطة (سم، مربعة)', 'Tile size (cm, square)'))}${inp('waste', L('نسبة الهالك %', 'Waste %'))}${inp('perBox', L('عدد البلاط في الكرتونة', 'Tiles per box'), 1)}</div>
    <div class="cout"><span>${L('المساحة', 'Area')}</span><b dir="ltr">${nfmt(area)} m²</b></div><div class="cout"><span>${L('عدد البلاط', 'Tiles')}</span><b dir="ltr">${n}</b><small>${L('كراتين', 'Boxes')}: ${Math.ceil(n / Math.max(1, H.perBox))}</small></div>`; }
  if (CT.home === 'concrete') { const vol = H.cl * H.cw * H.ct / 100; body = `<div class="fgrid">${inp('cl', L('الطول (م)', 'Length (m)'))}${inp('cw', L('العرض (م)', 'Width (m)'))}${inp('ct', L('السُمك (سم)', 'Thickness (cm)'))}</div>
    <div class="cout"><span>${L('حجم الخرسانة', 'Concrete volume')}</span><b dir="ltr">${nfmt(vol)} m³</b><small>${L('زوّد 5–10% احتياطي', 'Add 5–10% extra')}</small></div><div class="cout"><span>${L('أسمنت (خلطة 1:2:4 تقريبًا)', 'Cement (≈1:2:4 mix)')}</span><b dir="ltr">${Math.ceil(vol * 6.5)} × 50 kg</b></div><div class="cout"><span>${L('رمل', 'Sand')}</span><b dir="ltr">${nfmt(Math.round(vol * 0.45 * 100) / 100)} m³</b></div><div class="cout"><span>${L('زلط', 'Gravel')}</span><b dir="ltr">${nfmt(Math.round(vol * 0.9 * 100) / 100)} m³</b></div>
    <p class="muted small">${L('أرقام تقريبية للتخطيط. الكميات الفعلية والخلطة يحددها المهندس.', 'Rough planning figures; your engineer sets the real mix and quantities.')}</p>`; }
  return `<div class="seg tabs">${[['paint', L('الدهان', 'Paint')], ['tiles', L('البلاط', 'Tiles')], ['concrete', L('الخرسانة', 'Concrete')]].map(([k, l]) => `<button type="button" data-chome="${k}" aria-pressed="${CT.home === k}">${l}</button>`).join('')}</div><div class="card form">${body}</div>`;
}
const CK_AR = {'×': {ar: 'ضرب', en: 'times'}, '÷': {ar: 'قسمة', en: 'divided by'}, '−': {ar: 'ناقص', en: 'minus'}, '+': {ar: 'زائد', en: 'plus'}, '=': {ar: 'يساوي', en: 'equals'}, '⌫': {ar: 'امسح رقم', en: 'backspace'}, 'AC': {ar: 'امسح الكل', en: 'clear all'}, '^': {ar: 'أُس', en: 'power'}, '√': {ar: 'جذر', en: 'square root'}, '%': {ar: 'في المية', en: 'percent'}};
registerView('calc', {title: {ar: 'الحاسبات', en: 'Calculators'}, icon: 'calc', render(){
  const body = CT.tab === 'shape' ? shapeTab() : CT.tab === 'conv' ? convTab() : CT.tab === 'home' ? homeTab() : sciTab();
  return topbar(L('الحاسبات', 'Calculators'), L('علمية، والأشكال والأحجام والخزانات، والتحويل، وحسابات البيت', 'Scientific, shapes, volumes & tanks, unit conversion and home projects'), '', true) + tabSeg(CT.tab, [['sci', L('علمية', 'Scientific')], ['shape', L('الأشكال والأحجام', 'Shapes & volumes')], ['conv', L('تحويل الوحدات', 'Unit converter')], ['home', L('حسابات البيت', 'Home projects')]], 'data-ctab') + body;
}});
function ckPress(k){
  if (k === 'AC') CT.expr = ''; else if (k === '⌫') CT.expr = CT.expr.slice(0, -1);
  else if (k === '=') { try { const v = calcEval(CT.expr, CT.deg, CT.ans); CT.ans = v; CT.hist.push([CT.expr, nfmt(v)]); if (CT.hist.length > 30) CT.hist.shift(); CT.expr = String(+v.toPrecision(12)); } catch (er) { toast(er.message); } }
  else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log'].includes(k)) CT.expr += k + '(';
  else if (k === '√') CT.expr += '√('; else CT.expr += k;
}
on('click', e => {
  const T = e.target;
  const tb = T.closest('[data-ctab]'); if (tb) { CT.tab = tb.dataset.ctab; render(); return true; }
  const ck = T.closest('[data-ck]'); if (ck) { ckPress(ck.dataset.ck); render(); return true; }
  const dg = T.closest('[data-cdeg]'); if (dg) { CT.deg = dg.dataset.cdeg === '1'; render(); return true; }
  const hu = T.closest('[data-chuse]'); if (hu) { CT.expr = hu.dataset.chuse; render(); return true; }
  if (T.closest('[data-chclr]')) { CT.hist = []; render(); return true; }
  const sh = T.closest('[data-cshape]'); if (sh) { CT.shape = sh.dataset.cshape; render(); return true; }
  const cv = T.closest('[data-cconv]'); if (cv) { CT.conv = cv.dataset.cconv; CT.ca = CT.cb = null; render(); return true; }
  const hm_ = T.closest('[data-chome]'); if (hm_) { CT.home = hm_.dataset.chome; render(); return true; }
});
const refocus = (sel, e) => { const pos = e.target.selectionStart; render(); const el = document.querySelector(sel); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (er) {} } };
on('input', e => {
  const T = e.target;
  if (T.id === 'cExpr') { CT.expr = T.value; clearTimeout(CT.t); CT.t = setTimeout(() => refocus('#cExpr', e), 200); return true; }
  if (T.dataset.cv) { (CT.vals[CT.shape] ||= {})[T.dataset.cv] = T.value; clearTimeout(CT.t); CT.t = setTimeout(() => refocus(`[data-cv="${T.dataset.cv}"]`, e), 300); return true; }
  if (T.id === 'cvv') { CT.cvv = T.value; clearTimeout(CT.t); CT.t = setTimeout(() => refocus('#cvv', e), 300); return true; }
  if (T.dataset.ch) { CT.h[T.dataset.ch] = num(T.value) ?? 0; clearTimeout(CT.t); CT.t = setTimeout(() => refocus(`[data-ch="${T.dataset.ch}"]`, e), 300); return true; }
});
on('change', e => { const T = e.target; if (T.id === 'cUnit') { CT.unit = T.value; render(); return true; } if (T.id === 'cca') { CT.ca = T.value; render(); return true; } if (T.id === 'ccb') { CT.cb = T.value; render(); return true; } });
document.addEventListener('keydown', e => { if (VIEW !== 'calc' || CT.tab !== 'sci' || e.target.id !== 'cExpr') return; if (e.key === 'Enter') { e.preventDefault(); CT.expr = e.target.value; ckPress('='); render(); const el = $('#cExpr'); if (el) el.focus(); } });
