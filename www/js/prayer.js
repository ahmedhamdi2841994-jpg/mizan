/* ميزان — prayer times (Umm al-Qura method), cities, qibla */
'use strict';
const CITIES = [
  ['turaif', 'طريف', 'Turaif', 31.6725, 38.6637, 3], ['arar', 'عرعر', 'Arar', 30.9753, 41.0381, 3], ['qurayyat', 'القريات', 'Al Qurayyat', 31.3318, 37.3428, 3],
  ['sakaka', 'سكاكا', 'Sakaka', 29.9697, 40.2064, 3], ['tabuk', 'تبوك', 'Tabuk', 28.3835, 36.5662, 3], ['hail', 'حائل', 'Hail', 27.5114, 41.7208, 3],
  ['buraydah', 'بريدة', 'Buraydah', 26.3592, 43.9818, 3], ['riyadh', 'الرياض', 'Riyadh', 24.7136, 46.6753, 3], ['makkah', 'مكة المكرمة', 'Makkah', 21.4225, 39.8262, 3],
  ['madinah', 'المدينة المنورة', 'Madinah', 24.4672, 39.6111, 3], ['jeddah', 'جدة', 'Jeddah', 21.4858, 39.1925, 3], ['dammam', 'الدمام', 'Dammam', 26.4207, 50.0888, 3],
  ['abha', 'أبها', 'Abha', 18.2164, 42.5053, 3], ['cairo', 'القاهرة', 'Cairo', 30.0444, 31.2357, 2], ['alex', 'الإسكندرية', 'Alexandria', 31.2001, 29.9187, 2]
];
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
    let t = {fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18};
    for (let i = 0; i < 2; i++) {
      const p = k => t[k] / 24;
      t = {fajr: angleTime(18.5, p('fajr'), true), sunrise: angleTime(0.833, p('sunrise'), true), dhuhr: mid(p('dhuhr')), asr: asrT(opt.asr || 1, p('asr')), maghrib: angleTime(0.833, p('maghrib'))};
    }
    const adj = h => h + tz - lng / 15;
    const out = {}; for (const k in t) out[k] = adj(t[k]) * 60;
    let ramadan = false; try { ramadan = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {month: 'numeric'}).format(D(iso)) === '9'; } catch (e) {}
    out.isha = out.maghrib + ((ramadan && opt.ishaRamadan) ? 120 : 90);
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
function prayerTimes(iso){ const s = S.settings, key = iso + s.lat + s.lng + s.tz + s.asr; return _ptCache[key] ||= P.compute(iso, s.lat, s.lng, s.tz, {asr: s.asr, ishaRamadan: s.ishaRamadan}); }
const mm2hhmm = m => pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);
function cityLabel(){ const c = CITIES.find(c => c[0] === S.settings.city); return c ? (LANG === 'en' ? c[2] : c[1]) : (S.settings.cityName || L('موقع مخصص', 'Custom location')); }
