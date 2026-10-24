import { useMemo, useState } from "react";
import axios from "axios";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import type { Options, AjaxData, AjaxCallback } from "datatables.net";
import "datatables.net-bs5/css/dataTables.bootstrap5.css";
import "../../styles/adminDataTable.css";
import { Eye, ExclamationTriangle, XLg } from "react-bootstrap-icons";
import {
  adminSections,
  type AdminRow,
  type AdminSection,
} from "../../types/AdminTypes";
import { getAdminTablePage } from "../../clients/AdminClient";

import {
  isWorkflowSection,
  workflowLabel,
  workflowState,
} from "./adminWorkflow";

DataTable.use(DT);

type Props = {
  resource: AdminSection;
  initialSearch: string;
  onView: (row: AdminRow) => void;
  revision: number;
  demoRows?: AdminRow[];
};

function escapeText(value: string | null | undefined): string {
  return String(value || "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function errorMessage(reason: unknown): string {
  if (axios.isAxiosError(reason)) {
    if (reason.response?.status === 404)
      return "Backend chưa có API quản trị cho mục này.";
    if (reason.response?.status === 401 || reason.response?.status === 403) {
      return "Tài khoản chưa có quyền đọc dữ liệu này.";
    }
    return "Không thể tải dữ liệu từ Backend.";
  }
  return reason instanceof Error ? reason.message : "Không thể tải dữ liệu.";
}

function badgeTone(state: string): string {
  if (
    [
      "ACTIVE",
      "APPROVED",
      "PUBLIC",
      "COMPLETED",
      "RESOLVED",
      "RECONCILED",
    ].includes(state)
  )
    return "is-positive";
  if (
    ["LOCKED", "REJECTED", "ADMIN_HIDDEN", "FAILED", "CANCELLED"].includes(
      state,
    )
  )
    return "is-negative";
  if (["PENDING", "SUSPENDED", "OPEN"].includes(state)) return "is-warning";
  if (["IN_PROGRESS", "PROCESSING", "CONFIRMED"].includes(state))
    return "is-info";
  return "";
}

export default function AdminDataTable({
  resource,
  initialSearch,
  onView,
  revision,
  demoRows,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const section = adminSections[resource];
  const tableKey = `${resource}-${revision}-${initialSearch}`;

  const columns = useMemo(
    () => [
      ...section.columns.map((column) => ({
        data: column.key,
        title: column.label,
        defaultContent: "—",
        className:
          column.key === "id"
            ? "gca-id-cell"
            : column.key === "name"
              ? "gca-name-cell"
              : column.key === "status"
                ? "gca-status-cell"
                : "",
        render: (
          value: string | null | undefined,
          type: string,
          row: AdminRow,
        ) => {
          const label =
            column.key === "status" && isWorkflowSection(resource)
              ? workflowLabel(resource, row)
              : value || "—";
          if (type !== "display") return label;
          if (column.key === "status") {
            const state = isWorkflowSection(resource)
              ? workflowState(resource, row)
              : String(value || "").toUpperCase();
            return (
              '<span class="gca-status-badge ' +
              badgeTone(state) +
              '">' +
              escapeText(label) +
              "</span>"
            );
          }
          if (column.key === "name") {
            const secondary = row.description || row.email || row.area;
            return (
              '<strong class="gca-record-name">' +
              escapeText(label) +
              "</strong>" +
              (secondary
                ? '<span class="gca-record-subtitle" title="' +
                  escapeText(secondary) +
                  '">' +
                  escapeText(secondary) +
                  "</span>"
                : "")
            );
          }
          return escapeText(label);
        },
      })),
      { data: "id", title: "Thao tác", orderable: false, searchable: false },
    ],
    [section, resource],
  );

  const options = useMemo<Options>(
    () => ({
      serverSide: demoRows === undefined,
      data: demoRows,
      processing: true,
      pageLength: 10,
      lengthMenu: [10, 20, 50],
      order: [] as Array<[number, "asc" | "desc"]>,
      initComplete: function () {
        if (initialSearch) this.api().search(initialSearch).draw();
      },
      searchDelay: 400,
      autoWidth: false,
      language: {
        search: "Tìm kiếm:",
        lengthMenu: "Hiển thị _MENU_ dòng",
        info: "Hiển thị _START_–_END_ / _TOTAL_ bản ghi",
        infoEmpty: "Chưa có dữ liệu",
        infoFiltered: "",
        zeroRecords:
          '<div class="gca-empty-table"><strong>Không tìm thấy kết quả</strong><span>Thử thay đổi từ khóa hoặc trạng thái lọc.</span></div>',
        emptyTable:
          '<div class="gca-empty-table"><strong>Chưa có bản ghi để hiển thị</strong><span>Dữ liệu sẽ xuất hiện khi nguồn hiện tại có kết quả.</span></div>',
        processing: "Đang tải...",
        paginate: {
          first: "Đầu",
          last: "Cuối",
          previous: "Trước",
          next: "Sau",
        },
      },
      ajax: demoRows
        ? undefined
        : (request: AjaxData, callback: AjaxCallback) => {
            const pageSize =
              request.length && request.length > 0 ? request.length : 10;
            const page = Math.floor((request.start || 0) / pageSize) + 1;
            const sortColumn = request.order?.[0];
            const sortBy =
              sortColumn && section.columns[sortColumn.column]
                ? section.columns[sortColumn.column].key
                : "";
            const direction = sortColumn?.dir === "desc" ? "desc" : "asc";

            void getAdminTablePage(
              resource,
              page,
              pageSize,
              request.search?.value || "",
              sortBy,
              direction,
            )
              .then((result) => {
                setError(null);
                callback({
                  draw: request.draw || 0,
                  recordsTotal: result.recordsTotal,
                  recordsFiltered: result.recordsFiltered,
                  data: result.rows,
                });
              })
              .catch((reason: unknown) => {
                setError(errorMessage(reason));
                callback({
                  draw: request.draw || 0,
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
              });
          },
    }),
    [resource, section, initialSearch, demoRows],
  );

  const slots = useMemo(
    () => ({
      [section.columns.length]: (_value: unknown, row: AdminRow) => (
        <button
          className="gca-table-action"
          type="button"
          onClick={() => onView(row)}
        >
          <Eye size={14} aria-hidden="true" /> Chi tiết
        </button>
      ),
    }),
    [section, onView],
  );

  return (
    <div className="gca-datatables">
      {error && (
        <div className="gca-table-error" role="alert">
          <ExclamationTriangle size={20} aria-hidden="true" />
          <div>
            <strong>Chưa thể tải danh sách</strong>
            <span>{error}</span>
          </div>
          <button
            className="gca-btn gca-btn-outline"
            type="button"
            onClick={() => setError(null)}
          >
            <XLg size={12} aria-hidden="true" /> Đóng
          </button>
        </div>
      )}
      <div className="gca-table-wrap">
        <DataTable
          key={tableKey}
          className="table gca-table"
          columns={columns}
          options={options}
          slots={slots}
        >
          <thead>
            <tr>
              {section.columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Thao tác</th>
            </tr>
          </thead>
        </DataTable>
      </div>
    </div>
  );
}
