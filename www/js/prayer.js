/* ميزان — prayer times (Umm al-Qura method), cities, qibla */
'use strict';
const CITIES = [
  ['riyadh', 'الرياض', 'Riyadh', 24.7136, 46.6753, 3, 'sa'], ['jeddah', 'جدة', 'Jeddah', 21.4858, 39.1925, 3, 'sa'], ['makkah', 'مكة المكرمة', 'Makkah', 21.4225, 39.8262, 3, 'sa'], ['madinah', 'المدينة المنورة', 'Madinah', 24.4672, 39.6111, 3, 'sa'],
  ['dammam', 'الدمام', 'Dammam', 26.4207, 50.0888, 3, 'sa'], ['khobar', 'الخبر', 'Al Khobar', 26.2172, 50.1971, 3, 'sa'], ['dhahran', 'الظهران', 'Dhahran', 26.2361, 50.0393, 3, 'sa'], ['jubail', 'الجبيل', 'Jubail', 27.0046, 49.6460, 3, 'sa'], ['ahsa', 'الأحساء (الهفوف)', 'Al-Ahsa (Hofuf)', 25.3830, 49.5866, 3, 'sa'], ['qatif', 'القطيف', 'Qatif', 26.5652, 50.0099, 3, 'sa'], ['hafr', 'حفر الباطن', 'Hafr Al-Batin', 28.4328, 45.9708, 3, 'sa'],
  ['taif', 'الطائف', 'Taif', 21.2703, 40.4158, 3, 'sa'], ['yanbu', 'ينبع', 'Yanbu', 24.0895, 38.0618, 3, 'sa'], ['ula', 'العلا', 'AlUla', 26.6085, 37.9232, 3, 'sa'], ['qunfudhah', 'القنفذة', 'Al Qunfudhah', 19.1281, 41.0787, 3, 'sa'],
  ['abha', 'أبها', 'Abha', 18.2164, 42.5053, 3, 'sa'], ['khamis', 'خميس مشيط', 'Khamis Mushait', 18.3000, 42.7333, 3, 'sa'], ['bisha', 'بيشة', 'Bisha', 20.0006, 42.6052, 3, 'sa'], ['baha', 'الباحة', 'Al Baha', 20.0129, 41.4677, 3, 'sa'], ['jazan', 'جازان', 'Jazan', 16.8892, 42.5511, 3, 'sa'], ['najran', 'نجران', 'Najran', 17.4924, 44.1277, 3, 'sa'], ['sharurah', 'شرورة', 'Sharurah', 17.4667, 47.1167, 3, 'sa'],
  ['buraydah', 'بريدة', 'Buraydah', 26.3592, 43.9818, 3, 'sa'], ['unaizah', 'عنيزة', 'Unaizah', 26.0843, 43.9935, 3, 'sa'], ['rass', 'الرس', 'Ar Rass', 25.8694, 43.4973, 3, 'sa'], ['majmaah', 'المجمعة', 'Al Majmaah', 25.9039, 45.3456, 3, 'sa'], ['kharj', 'الخرج', 'Al Kharj', 24.1554, 47.3346, 3, 'sa'], ['dawadmi', 'الدوادمي', 'Ad Dawadmi', 24.5077, 44.3924, 3, 'sa'], ['zulfi', 'الزلفي', 'Az Zulfi', 26.2994, 44.8150, 3, 'sa'],
  ['hail', 'حائل', 'Hail', 27.5114, 41.7208, 3, 'sa'], ['tabuk', 'تبوك', 'Tabuk', 28.3835, 36.5662, 3, 'sa'], ['duba', 'ضباء', 'Duba', 27.3513, 35.6901, 3, 'sa'], ['wajh', 'الوجه', 'Al Wajh', 26.2455, 36.4525, 3, 'sa'],
  ['sakaka', 'سكاكا', 'Sakaka', 29.9697, 40.2064, 3, 'sa'], ['dumat', 'دومة الجندل', 'Dumat al-Jandal', 29.8115, 39.8686, 3, 'sa'], ['qurayyat', 'القريات', 'Al Qurayyat', 31.3318, 37.3428, 3, 'sa'], ['tabarjal', 'طبرجل', 'Tabarjal', 30.4999, 38.2162, 3, 'sa'], ['arar', 'عرعر', 'Arar', 30.9753, 41.0381, 3, 'sa'], ['rafha', 'رفحاء', 'Rafha', 29.6202, 43.4948, 3, 'sa'], ['turaif', 'طريف', 'Turaif', 31.6725, 38.6637, 3, 'sa'],
  ['cairo', 'القاهرة', 'Cairo', 30.0444, 31.2357, 2, 'eg'], ['giza', 'الجيزة', 'Giza', 30.0131, 31.2089, 2, 'eg'], ['alex', 'الإسكندرية', 'Alexandria', 31.2001, 29.9187, 2, 'eg'], ['shubra', 'شبرا الخيمة', 'Shubra El Kheima', 30.1286, 31.2422, 2, 'eg'], ['portsaid', 'بورسعيد', 'Port Said', 31.2653, 32.3019, 2, 'eg'], ['suez', 'السويس', 'Suez', 29.9668, 32.5498, 2, 'eg'], ['ismailia', 'الإسماعيلية', 'Ismailia', 30.5965, 32.2715, 2, 'eg'],
  ['mansoura', 'المنصورة', 'Mansoura', 31.0409, 31.3785, 2, 'eg'], ['tanta', 'طنطا', 'Tanta', 30.7865, 31.0004, 2, 'eg'], ['zagazig', 'الزقازيق', 'Zagazig', 30.5877, 31.5020, 2, 'eg'], ['damanhur', 'دمنهور', 'Damanhur', 31.0341, 30.4682, 2, 'eg'], ['kafr', 'كفر الشيخ', 'Kafr El Sheikh', 31.1107, 30.9388, 2, 'eg'], ['damietta', 'دمياط', 'Damietta', 31.4175, 31.8144, 2, 'eg'], ['banha', 'بنها', 'Banha', 30.4660, 31.1848, 2, 'eg'], ['shibin', 'شبين الكوم', 'Shibin El Kom', 30.5527, 31.0090, 2, 'eg'],
  ['fayoum', 'الفيوم', 'Faiyum', 29.3084, 30.8428, 2, 'eg'], ['benisuef', 'بني سويف', 'Beni Suef', 29.0661, 31.0994, 2, 'eg'], ['minya', 'المنيا', 'Minya', 28.1099, 30.7503, 2, 'eg'], ['assiut', 'أسيوط', 'Assiut', 27.1783, 31.1859, 2, 'eg'], ['sohag', 'سوهاج', 'Sohag', 26.5591, 31.6957, 2, 'eg'], ['qena', 'قنا', 'Qena', 26.1551, 32.7160, 2, 'eg'], ['luxor', 'الأقصر', 'Luxor', 25.6872, 32.6396, 2, 'eg'], ['aswan', 'أسوان', 'Aswan', 24.0889, 32.8998, 2, 'eg'],
  ['hurghada', 'الغردقة', 'Hurghada', 27.2579, 33.8116, 2, 'eg'], ['sharm', 'شرم الشيخ', 'Sharm El Sheikh', 27.9158, 34.3299, 2, 'eg'], ['matrouh', 'مرسى مطروح', 'Marsa Matruh', 31.3543, 27.2373, 2, 'eg'], ['arish', 'العريش', 'Arish', 31.1316, 33.7984, 2, 'eg'], ['newcapital', 'العاصمة الإدارية', 'New Administrative Capital', 30.0197, 31.7608, 2, 'eg'], ['october', '6 أكتوبر', '6th of October', 29.9737, 30.9433, 2, 'eg']
];
/* Egypt observes summer time from the last Friday of April to the last Thursday of October */
function egyptTz(iso){ const y = +iso.slice(0, 4), last = (m, wd) => { const d = new Date(y, m + 1, 0); while (d.getDay() !== wd) d.setDate(d.getDate() - 1); return isoOf(d); }; return iso >= last(3, 5) && iso <= last(9, 4) ? 3 : 2; }
const P = (() => {
  const dtr = d => d * Math.PI / 180, rtd = r => r * 180 / Math.PI;
  const sin = d => Math.sin(dtr(d)), cos = d => Math.cos(dtr(d)), tan = d => Math.tan(dtr(d));
  const asin = x => rtd(Math.asin(x)), acos = x => rtd(Math.acos(Math.max(-1, Math.min(1, x)))), atan2 = (y, x) => rtd(Math.atan2(y, x)), acot = x => rtd(Math.atan(1 / x));
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  function julian(y, m, d){ if (m <= 2) { y -= 1; m += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
  function sun(jd){ const D = jd - 2451545.0, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360), Lg = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * D;
    const RA = atan2(cos(e) * sin(Lg), cos(Lg)) / 15, eqt = q / 15 - fix(RA, 24), decl = asin(sin(e) * sin(Lg)); return {decl, eqt}; }
  function compute(iso, lat, lng, tz, opt){
    const [y, m, d] = iso.split('-').map(Number), jd0 = julian(y, m, d) - lng / (15 * 24);
    const mid = t => fix(12 - sun(jd0 + t).eqt, 24);
    const angleTime = (a, t, ccw) => { const dc = sun(jd0 + t).decl, noon = mid(t), T = acos((-sin(a) - sin(dc) * sin(lat)) / (cos(dc) * cos(lat))) / 15; return noon + (ccw ? -T : T); };
    const asrT = (f, t) => { const dc = sun(jd0 + t).decl, a = -acot(f + tan(Math.abs(lat - dc))); return angleTime(a, t); };
    let t = {fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 19.5};
    for (let i = 0; i < 2; i++) {
      const p = k => t[k] / 24;
      t = {fajr: angleTime(opt.method === 'egypt' ? 19.5 : 18.5, p('fajr'), true), isha: angleTime(17.5, p('isha') || 19.5 / 24, false), sunrise: angleTime(0.833, p('sunrise'), true), dhuhr: mid(p('dhuhr')), asr: asrT(opt.asr || 1, p('asr')), maghrib: angleTime(0.833, p('maghrib'))};
    }
    const adj = h => h + tz - lng / 15;
    const out = {}; for (const k in t) out[k] = adj(t[k]) * 60;
    let ramadan = false; try { ramadan = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {month: 'numeric'}).format(D(iso)) === '9'; } catch (e) {}
    if (opt.method === 'egypt') out.dhuhr += 2; else out.isha = out.maghrib + ((ramadan && opt.ishaRamadan) ? 120 : 90);
    for (const k in out) out[k] = Math.round(out[k] + 0.0);
    return out; // minutes after midnight
  }
  function qibla(lat, lng){ const kLat = 21.4225, kLng = 39.8262; const dl = dtr(kLng - lng); return fix(rtd(Math.atan2(Math.sin(dl), Math.cos(dtr(lat)) * Math.tan(dtr(kLat)) - Math.sin(dtr(lat)) * Math.cos(dl))), 360); }
  return {compute, qibla};
})();
const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_NAMES = {fajr: ['الفجر', 'Fajr'], sunrise: ['الشروق', 'Sunrise'], dhuhr: ['الظهر', 'Dhuhr'], asr: ['العصر', 'Asr'], maghrib: ['المغرب', 'Maghrib'], isha: ['العشاء', 'Isha']};
const pName = k => LANG === 'en' ? PRAYER_NAMES[k][1] : (k === 'dhuhr' && D(CUR).getDay() === 5 ? 'الجمعة' : PRAYER_NAMES[k][0]);
const _ptCache = {};
function prayerTimes(iso){ const s = S.settings, eg = s.country === 'eg' && s.city !== 'custom', tz = eg ? egyptTz(iso) : s.tz, method = s.method || (eg ? 'egypt' : 'uq'), key = iso + s.lat + s.lng + tz + s.asr + method; return _ptCache[key] ||= P.compute(iso, s.lat, s.lng, tz, {asr: s.asr, ishaRamadan: s.ishaRamadan, method}); }
const mm2hhmm = m => pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);
function cityLabel(){ const c = CITIES.find(c => c[0] === S.settings.city); return c ? (LANG === 'en' ? c[2] : c[1]) : (S.settings.cityName || L('موقع مخصص', 'Custom location')); }
