import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('web, mobile template and Firebase CLI target the original team project', async () => {
  const config = JSON.parse(await readFile(new URL('../config/firebase-client.json', import.meta.url), 'utf8'));
  const mobile = Object.fromEntries((await readFile(new URL('../mobile/.env.example', import.meta.url), 'utf8'))
    .split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
      const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1)];
    }));
  const cli = JSON.parse(await readFile(new URL('../.firebaserc', import.meta.url), 'utf8'));
  assert.equal(config.projectId, 'comerciales-mely');
  assert.equal(cli.projects.default, config.projectId);
  for (const [key, value] of Object.entries(config)) {
    const suffix = key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
    assert.equal(mobile[`EXPO_PUBLIC_FIREBASE_${suffix}`], value, key);
  }
  assert.match(mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, /^945325242075-.*\.apps\.googleusercontent\.com$/);
});
