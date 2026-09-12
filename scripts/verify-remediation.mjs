import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { getTolkCompilerVersion } from '@ton/tolk-js';

const ROOT = process.cwd();
const VERIFIED = join(ROOT, 'verified-source', 'gram-10m-mainnet');
const EXPECTED_HASH = '6bf8f48ca97d3fd9c8e553344efe7af030c322459e2ee2197a052162f1961bfb';
const EXPECTED_VERSION = '1.4.0';
const EXCLUDED = new Set(['.git', 'node_modules', 'build', 'experimental']);
const FORBIDDEN = ['gram-usdt', 'usdt-gram', 'gram(usdt)', '5m', '6m'];

function fail(message) {
  console.error(`VERIFY_FAIL: ${message}`);
  process.exitCode = 1;
}

const compilerVersion = await getTolkCompilerVersion();
if (compilerVersion !== EXPECTED_VERSION) fail(`compiler ${compilerVersion} != ${EXPECTED_VERSION}`);
else console.log(`compiler=${compilerVersion}`);

const sums = (await readFile(join(VERIFIED, 'SHA256SUMS'), 'utf8'))
  .trim().split(/\r?\n/).filter(Boolean);
if (sums.length !== 8) fail(`expected 8 source checksums, got ${sums.length}`);
for (const row of sums) {
  const [expected, ...parts] = row.trim().split(/\s+/);
  const rel = parts.join(' ');
  const bytes = await readFile(join(VERIFIED, rel));
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) fail(`source checksum mismatch: ${rel}`);
}

const build = JSON.parse(await readFile(join(ROOT, 'build', 'gram-10m-mainnet.json'), 'utf8'));
const actualHash = String(build.codeHashHex || build.hash || '').toLowerCase();
console.log(`code_hash=${actualHash}`);
if (actualHash !== EXPECTED_HASH) fail(`deployed code hash mismatch: ${actualHash} != ${EXPECTED_HASH}`);

async function walk(dir, out = []) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    if (EXCLUDED.has(ent.name)) continue;
    const full = join(dir, ent.name);
    const rel = relative(ROOT, full).replaceAll('\\', '/');
    if (rel.startsWith('docs/archive/')) continue;
    if (ent.isDirectory()) await walk(full, out); else out.push(rel);
  }
  return out;
}

const activeFiles = await walk(ROOT);
for (const file of activeFiles) {
  const lowerPath = file.toLowerCase();
  for (const banned of FORBIDDEN) {
    if (lowerPath.includes(banned)) fail(`forbidden active filename/path '${banned}': ${file}`);
  }
  if (!/\.(md|json|toml|ya?ml|mjs|js|ts|tolk|txt)$/i.test(file)) continue;
  const text = await readFile(join(ROOT, file), 'utf8');
  const lower = text.toLowerCase();
  for (const banned of FORBIDDEN) {
    if (lower.includes(banned)) fail(`forbidden active content '${banned}': ${file}`);
  }
  if (file.endsWith('.md')) {
    const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
    for (const match of text.matchAll(linkRe)) {
      const target = match[1].trim().split('#')[0];
      if (!target || /^(https?:|mailto:)/i.test(target)) continue;
      const resolved = resolve(dirname(join(ROOT, file)), target);
      if (!resolved.startsWith(ROOT)) fail(`unsafe internal link in ${file}: ${target}`);
      else {
        try { await stat(resolved); } catch { fail(`broken internal link in ${file}: ${target}`); }
      }
    }
  }
}

if (!process.exitCode) console.log('verification=PASS');
