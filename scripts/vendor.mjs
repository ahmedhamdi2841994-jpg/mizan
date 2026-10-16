// Copies third-party files the app needs offline into www/vendor and builds fonts.css.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const nm = p => path.join(root, 'node_modules', p);
const out = p => path.join(root, 'www', p);
fs.mkdirSync(out('vendor/fonts'), { recursive: true });

const copy = (from, to) => fs.copyFileSync(nm(from), out(to));
copy('chart.js/dist/chart.umd.min.js', 'vendor/chart.umd.min.js');
copy('pdfjs-dist/build/pdf.min.mjs', 'vendor/pdf.min.mjs');
copy('pdfjs-dist/build/pdf.worker.min.mjs', 'vendor/pdf.worker.min.mjs');

const faces = [
  ['alexandria', 'Alexandria', [400, 500, 600, 700, 800]],
  ['ibm-plex-sans-arabic', 'IBM Plex Sans Arabic', [400, 500, 600]],
  ['amiri', 'Amiri', [400, 700]],
  ['amiri-quran', 'Amiri Quran', [400]]
];
let css = '';
for (const [pkg, family, weights] of faces) {
  for (const w of weights) {
    for (const subset of ['arabic', 'latin']) {
      const file = `${pkg}-${subset}-${w}-normal.woff2`;
      const src = nm(`@fontsource/${pkg}/files/${file}`);
      if (!fs.existsSync(src)) continue;
      fs.copyFileSync(src, out(`vendor/fonts/${file}`));
      const range = subset === 'arabic'
        ? 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC'
        : 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
      css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${file}) format("woff2");unicode-range:${range}}\n`;
    }
  }
}
fs.writeFileSync(out('vendor/fonts.css'), css);
console.log('vendor ready');
