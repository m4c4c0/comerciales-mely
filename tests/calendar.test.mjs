import test from 'node:test';
import assert from 'node:assert/strict';
import { dailySales, localDay } from '../lib/calendar.mjs';
import { localDay as mobileDay } from '../mobile/src/domain/business.mjs';

test('web and mobile use the same local calendar at evening and midnight', () => {
  for (const date of [new Date(2026, 10, 22, 21, 30), new Date(2026, 10, 23, 0, 1)]) {
    assert.equal(localDay(date.toISOString()), mobileDay(date.toISOString()));
  }
  assert.equal(localDay(new Date(2026, 10, 22, 21, 30)), '2026-11-22');
});

test('reports end today and include evening sales without tomorrow or older days', () => {
  const now = new Date(2026, 10, 22, 21, 30);
  const invoices = [
    { fecha: new Date(2026, 10, 22, 21, 15).toISOString(), total: 11.3 },
    { fecha: new Date(2026, 10, 22, 0, 1).toISOString(), total: 0.1 },
    { fecha: new Date(2026, 10, 23, 0, 1).toISOString(), total: 100 },
    { fecha: new Date(2026, 10, 15, 12).toISOString(), total: 100 },
  ];
  const days = dailySales(invoices, now);
  assert.equal(days.length, 7);
  assert.equal(days[0].fecha, '2026-11-16');
  assert.deepEqual(days.at(-1), { fecha: '2026-11-22', total: 11.4 });
  assert.equal(days.reduce((sum, day) => sum + day.total, 0), 11.4);
});

test('seven day window crosses month boundaries correctly', () => {
  const days = dailySales([], new Date(2026, 10, 2, 21));
  assert.equal(days[0].fecha, '2026-10-27');
  assert.equal(days.at(-1).fecha, '2026-11-02');
});
