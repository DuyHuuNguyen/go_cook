import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('./adminWorkflow.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { workflowActions, workflowState } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const row = (values) => ({ id: 'TEST', name: 'Test record', ...values });

test('USER can only lock or unlock, with a required reason for either action', () => {
  for (const status of ['ACTIVE', 'LOCKED']) {
    const actions = workflowActions('users', row({ status }));
    assert.equal(actions.length, 1);
    assert.equal(actions[0].reasonRequired, true);
    assert.equal(actions[0].id, status === 'ACTIVE' ? 'lock' : 'unlock');
  }
  assert.deepEqual(workflowActions('users', row({ status: 'unknown' })), []);
});
test('Only pending chef applications can be approved or rejected; rejection requires a reason', () => {
  const actions = workflowActions('chefs', row({ status: 'PENDING' }));
  assert.deepEqual(actions.map(action => action.id), ['approve', 'reject']);
  assert.equal(actions.find(action => action.id === 'reject').reasonRequired, true);
  assert.deepEqual(workflowActions('chefs', row({ status: 'REJECTED' })), []);
});
test('Chef suspension and resumption do not change the USER account or existing bookings', () => {
  const chef = row({ reviewStatus: 'APPROVED', serviceStatus: 'SUSPENDED', accountStatus: 'ACTIVE', booking: 'CONFIRMED' });
  const before = JSON.stringify(chef);
  assert.equal(workflowState('chefs', chef), 'SUSPENDED');
  assert.deepEqual(workflowActions('chefs', chef).map(action => action.id), ['resume']);
  assert.equal(JSON.stringify(chef), before);
  assert.equal(workflowActions('chefs', row({ status: 'APPROVED' }))[0].reasonRequired, true);
});
test('Backend ACTIVE/INACTIVE or generic HIDDEN never imply who hid a menu', () => {
  for (const status of ['ACTIVE', 'INACTIVE', 'HIDDEN', 'PENDING']) {
    assert.equal(workflowState('menus', row({ status })), '');
    assert.deepEqual(workflowActions('menus', row({ status })), []);
  }
});
test('Only an explicitly Admin-hidden menu offers restoration; chef-hidden menus cannot be published by Admin', () => {
  assert.deepEqual(workflowActions('menus', row({ visibility: 'ADMIN_HIDDEN' })).map(action => action.id), ['restore']);
  const selfHidden = workflowActions('menus', row({ visibility: 'CHEF_HIDDEN' }));
  assert.deepEqual(selfHidden.map(action => action.id), ['hide']);
  assert.equal(selfHidden[0].reasonRequired, true);
});
