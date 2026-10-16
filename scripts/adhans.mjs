// Bundles the adhan recordings you put in the /adhan folder into the app (web + Android notification sounds).
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = path.join(root, 'adhan'), web = path.join(root, 'www', 'adhan'), raw = path.join(root, 'android', 'app', 'src', 'main', 'res', 'raw');
fs.mkdirSync(web, {recursive: true});
const list = [];
const files = fs.existsSync(src) ? fs.readdirSync(src).filter(f => /\.(mp3|ogg|wav|m4a)$/i.test(f)).sort() : [];
files.forEach((f, i) => {
  const ext = path.extname(f).toLowerCase(), file = `adhan_${i + 1}${ext}`;
  fs.copyFileSync(path.join(src, f), path.join(web, file));
  if (fs.existsSync(path.dirname(raw))) { fs.mkdirSync(raw, {recursive: true}); fs.copyFileSync(path.join(src, f), path.join(raw, file)); }
  list.push({file, name: path.basename(f, path.extname(f))});
});
fs.writeFileSync(path.join(root, 'www', 'data', 'adhans.json'), JSON.stringify(list, null, 1));
console.log(`${list.length} adhan voice(s) bundled`);
