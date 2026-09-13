import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (p) => readFile(p, 'utf8');

test('canonical package identity is GRAM 10M Mainnet', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.name, 'gram-10m-mainnet');
  assert.equal(pkg.devDependencies['@ton/tolk-js'], '1.4.0');
});

test('verified source exposes mintability through admin state', async () => {
  const source = await read('verified-source/gram-10m-mainnet/contracts/JettonMinter.tolk');
  assert.match(source, /mintable:\s*storage\.adminAddress\s*!=\s*null/);
  assert.match(source, /storage\.totalSupply \+= internalTransferMsg\.jettonAmount/);
});

test('handover states observed supply and current mintable status', async () => {
  const handover = await read('HANDOVER.md');
  assert.match(handover, /10,000,010 GRAM/);
  assert.match(handover, /mintable:\s*true/);
  assert.doesNotMatch(handover, /fixed supply|hard cap/i);
});

test('exactly eight immutable verifier sources are checksummed', async () => {
  const rows = (await read('verified-source/gram-10m-mainnet/SHA256SUMS')).trim().split(/\r?\n/);
  assert.equal(rows.length, 8);
});
