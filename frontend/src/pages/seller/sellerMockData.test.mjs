import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Run the actual pure demo calculations without installing a test framework.
const source = await readFile(new URL('./sellerMockData.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { initialChefOrders: orders, summarizeRevenue, overlaps, endTime } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('paid/held/earned use the required gross/gross/85% bases', () => {
  const result = summarizeRevenue(orders, '2026-08-01', '2026-10-31');
  assert.equal(result.paid, 9320000);
  assert.equal(result.held, 4820000);
  assert.equal(result.earned, 3825000);
  assert.equal(result.menuCount, 5);
  assert.equal(result.budgetCount, 3);
});
test('finishing cooking leaves earnings unchanged until acceptance', () => {
  const changed = orders.map(order => order.status === 'PENDING' ? { ...order, status: 'AWAITING_ACCEPTANCE' } : order);
  assert.equal(summarizeRevenue(changed, '2026-10-01', '2026-10-31').earned, 850000);
});
test('rejection removes the paid order from paid/held and the pie denominator', () => {
  const before = summarizeRevenue(orders, '2026-10-01', '2026-10-31');
  const changed = orders.map(order => order.id === 'GC-261014-02' ? { ...order, status: 'REJECTED' } : order);
  const after = summarizeRevenue(changed, '2026-10-01', '2026-10-31');
  assert.equal(before.paid - after.paid, 1600000);
  assert.equal(before.held - after.held, 1600000);
  assert.equal(before.budgetCount - after.budgetCount, 1);
  assert.equal(before.earned, after.earned);
});
test('payment and release may belong to different periods; boundaries are inclusive', () => {
  const order = { ...orders[0], status: 'COMPLETED', total: 1000000, paidAt: '2026-09-30', releasedAt: '2026-10-01' };
  const result = summarizeRevenue([order], '2026-10-01', '2026-10-01');
  assert.equal(result.paid, 0);
  assert.equal(result.earned, 850000);
  assert.equal(result.menuCount, 0);
});
test('15% fee rounding preserves the whole amount without deducting receipts', () => {
  const order = { ...orders[0], status: 'COMPLETED', total: 100.01, releasedAt: '2026-10-14', receipts: [{ id: 'r', name: 'bill', url: '/demo', type: 'image/png' }] };
  const result = summarizeRevenue([order], '2026-10-01', '2026-10-31');
  assert.equal(result.earned, 85.01);
});
test('empty revenue is zero, with no fabricated chart percentages', () => {
  const result = summarizeRevenue(orders, '2027-01-01', '2027-01-31');
  assert.deepEqual([result.paid, result.held, result.earned, result.menuCount, result.budgetCount], [0, 0, 0, 0, 0]);
});
test('booking ranges overlap on containment but allow adjacent slots', () => {
  assert.equal(overlaps('11:00', '13:00', '12:30', '14:00'), true);
  assert.equal(overlaps('11:00', '13:00', '09:00', '21:00'), true);
  assert.equal(overlaps('11:00', '13:00', '13:00', '15:00'), false);
  assert.equal(endTime({ ...orders[0], time: '17:30', duration: 120 }), '19:30');
});
