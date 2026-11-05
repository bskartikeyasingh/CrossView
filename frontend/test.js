import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing frontend production build assets...');

const distPath = path.join(__dirname, 'dist');
assert.ok(fs.existsSync(distPath), 'dist/ directory must exist after build');

const indexPath = path.join(distPath, 'index.html');
assert.ok(fs.existsSync(indexPath), 'dist/index.html must exist');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
assert.ok(indexHtml.includes('CrossView'), 'index.html must contain CrossView branding');

const assetsPath = path.join(distPath, 'assets');
assert.ok(fs.existsSync(assetsPath), 'dist/assets directory must exist');

const files = fs.readdirSync(assetsPath);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));

assert.ok(jsFile, 'Production JS bundle must be generated');
assert.ok(cssFile, 'Production CSS bundle must be generated');

console.log(`✓ HTML: dist/index.html (${indexHtml.length} bytes)`);
console.log(`✓ JavaScript: dist/assets/${jsFile}`);
console.log(`✓ CSS: dist/assets/${cssFile}`);
console.log('\nFRONTEND BUILD VERIFICATION PASSED SUCCESSFULLY!');
