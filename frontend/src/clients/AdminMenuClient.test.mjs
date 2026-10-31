import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('./AdminMenuClient.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const output = outputText
  .replace('import axiosClient from "./AxiosClient";', 'const axiosClient = globalThis.__adminMenuTestClient;')
  .replace('import { ENDPOINTS } from "../config/ApiConfig";',
    'const ENDPOINTS = { ADMIN: { MENUS: "/api/v1/admin/menus" }, USER: { CATEGORY: { GET: { V1: "/categories" } } } };');

const calls = [];
let response = null;
let failure = null;
globalThis.__adminMenuTestClient = {
  get: async (url, options) => {
    calls.push({ method: 'GET', url, options });
    if (failure) throw failure;
    return { data: response };
  },
  put: async (url, body) => {
    calls.push({ method: 'PUT', url, body });
    return { data: { success: true, data: {} } };
  },
  patch: async (url, body) => {
    calls.push({ method: 'PATCH', url, body });
    return { data: { success: true, data: {} } };
  },
};
const client = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);

test('Menu admin list reads only the admin endpoint', async () => {
  calls.length = 0;
  failure = null;
  response = { success: true, data: { data: [
    { id: 12, name: 'Thực đơn 12', isActive: true, status: 'PUBLISHED', tempPrice: 350000 }
  ], totalElements: 1 } };
  const result = await client.getAdminMenusPage({ page: 1, size: 10, keyword: '', sortBy: 'name', sortDirection: 'asc' });
  assert.equal(result.recordsTotal, 1);
  assert.equal(result.rows[0].id, '12');
  assert.equal(result.rows[0].source, 'admin');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/v1/admin/menus');
});

test('Admin menu API 404 is reported, never silently switched to public menus', async () => {
  calls.length = 0;
  failure = Object.assign(new Error('Not found'), { response: { status: 404 } });
  await assert.rejects(
    client.getAdminMenusPage({ page: 1, size: 10, keyword: '', sortBy: '', sortDirection: 'asc' }),
    /Not found/,
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/v1/admin/menus');
  failure = null;
});

test('Menu update and moderation use the admin endpoints', async () => {
  calls.length = 0;
  await client.updateAdminMenu('12', {
    name: 'Thực đơn mới', description: 'Chi tiết', categoryId: '3',
    tempPrice: '350000', minGuests: '2', maxGuests: '8',
  });
  await client.updateAdminMenuStatus('12', false, 'Vi phạm');
  assert.deepEqual(calls.map((call) => [call.method, call.url]), [
    ['PUT', '/api/v1/admin/menus/12'],
    ['PATCH', '/api/v1/admin/menus/12/status'],
  ]);
  assert.equal(calls[0].body.categoryId, 3);
  assert.equal(calls[1].body.reason, 'Vi phạm');
});
