import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("./AdminClient.ts", import.meta.url), "utf8");
let output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
output = output
  .replace('import axios from "axios";',
    'const axios = { isAxiosError: (value) => value?.isAxiosError === true };')
  .replace('import axiosClient from "./AxiosClient";',
    'const axiosClient = globalThis.__chefAdminTestClient;')
  .replace('import { ENDPOINTS } from "../config/ApiConfig";',
    'const ENDPOINTS = { ADMIN: { CHEFS: "/api/v1/admin/chef-applications" } };');

const requests = [];
globalThis.__chefAdminTestClient = {
  get: async (url, options) => {
    requests.push({ method: "GET", url, options });
    return { data: { success: true, data: globalThis.__chefAdminTestResponse } };
  },
  patch: async (url, body) => {
    requests.push({ method: "PATCH", url, body });
    return { data: { success: true, data: globalThis.__chefAdminTestResponse } };
  },
};
const client = await import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);

const chef = {
  id: 17, userId: 42, username: "Đầu bếp An", email: "an@example.invalid",
  phone: "0912345678", provinceCode: "01", wardCode: "00001",
  bio: "Món gia đình", experienceYears: 5, status: "PENDING", reason: null,
  submittedAt: Date.UTC(2026, 9, 24, 2, 30), statusChangedAt: null,
  statusChangedBy: null,
};

test("Chef list sends the backend status and page, maps real fields and total", async () => {
  requests.length = 0;
  globalThis.__chefAdminTestResponse = { data: [chef], totalElements: 21, currentPage: 2 };
  const result = await client.getAdminTablePage("chefs", 2, 20, "", "", "asc", "PENDING");
  assert.deepEqual(requests[0], {
    method: "GET", url: "/api/v1/admin/chef-applications",
    options: { params: { page: 2, size: 20, status: "PENDING" } },
  });
  assert.equal(result.recordsTotal, 21);
  assert.equal(result.recordsFiltered, 21);
  assert.equal(result.rows[0].name, "Đầu bếp An");
  assert.equal(result.rows[0].status, "PENDING");
  assert.equal(result.rows[0].area, "01 / 00001");
  assert.equal(result.rows[0].experience, "5 năm");
  assert.match(result.rows[0].submittedAt, /24\/10\/2026/);
  assert.equal(requests.length, 1);
});

test("Chef client refuses unsupported global search and sorting", async () => {
  requests.length = 0;
  await assert.rejects(
    client.getAdminTablePage("chefs", 1, 10, "An", "", "asc"),
    /chưa hỗ trợ tìm kiếm/,
  );
  await assert.rejects(
    client.getAdminTablePage("chefs", 1, 10, "", "name", "asc"),
    /chưa hỗ trợ tìm kiếm/,
  );
  assert.equal(requests.length, 0);
});

test("An empty backend page remains empty without demo fallback", async () => {
  requests.length = 0;
  globalThis.__chefAdminTestResponse = { data: [], totalElements: 0, currentPage: 1 };
  const result = await client.getAdminTablePage("chefs", 1, 10, "", "", "asc", "SUSPENDED");
  assert.deepEqual(result, { rows: [], recordsTotal: 0, recordsFiltered: 0 });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.params.status, "SUSPENDED");
});

test("The shared collection reader also uses Chef backend pagination", async () => {
  requests.length = 0;
  globalThis.__chefAdminTestResponse = { data: [chef], totalElements: 11, currentPage: 1 };
  const result = await client.getAdminCollection("chefs", 1, "", 0);
  assert.equal(result.rows[0].id, "17");
  assert.equal(result.total, 11);
  assert.equal(result.hasNext, true);
  assert.equal(requests[0].url, "/api/v1/admin/chef-applications");
  await assert.rejects(client.getAdminCollection("chefs", 1, "An", 0), /chưa hỗ trợ tìm kiếm/);
  assert.equal(requests.length, 1);
});

test("Chef detail and review use the existing endpoints and exact request fields", async () => {
  requests.length = 0;
  globalThis.__chefAdminTestResponse = chef;
  const detail = await client.getChefApplication("17");
  assert.equal(detail.email, "an@example.invalid");
  await client.reviewChefApplication("17", "REJECTED", "  Thiếu thông tin  ");
  assert.equal(requests[0].url, "/api/v1/admin/chef-applications/17");
  assert.deepEqual(requests[1], {
    method: "PATCH", url: "/api/v1/admin/chef-applications/17/status",
    body: { status: "REJECTED", reason: "Thiếu thông tin" },
  });
});

test("Error messages distinguish authorization, validation, conflict and network", () => {
  const error = (status, data) => ({
    isAxiosError: true,
    response: status == null ? undefined : { status, data },
  });
  assert.match(client.adminApiErrorMessage(error(401)), /Phiên đăng nhập/);
  assert.match(client.adminApiErrorMessage(error(403)), /không có quyền/);
  assert.equal(
    client.adminApiErrorMessage(error(400, { data: { message: "Lý do bắt buộc" } })),
    "Lý do bắt buộc",
  );
  assert.match(client.adminApiErrorMessage(error(409)), /đã thay đổi/);
  assert.match(client.adminApiErrorMessage(error(null)), /Không kết nối/);
});
