import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import {
  adminSections,
  type AdminRow,
  type AdminSection,
} from "../../types/AdminTypes";
import {
  adminApiErrorMessage,
  clearAdminTableCache,
  getAdminUser,
  getChefApplication,
} from "../../clients/AdminClient";
import AdminDataTable from "./AdminDataTable";
import AdminMenusPage from "../../pages/admin/AdminMenusPage";
import AdminActionPanel from "./AdminActionPanel";

import {
  isWorkflowSection,
  workflowActions,
  workflowDetails,
  workflowFilters,
  workflowLabel,
  workflowState,
} from "./adminWorkflow";

type Props = { resource: AdminSection };

export default function AdminResourcePage({ resource }: Props) {
  if (resource === "menus") return <AdminMenusPage />;
  return <AdminOtherResourcePage resource={resource} />;
}

function AdminOtherResourcePage({ resource }: Props) {
  const section = adminSections[resource];
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [statusFilter, setStatusFilter] = useState("");
  const managed = isWorkflowSection(resource);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<AdminRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRevision, setDetailRevision] = useState(0);
  const [editing, setEditing] = useState<AdminRow | "new" | null>(null);

  useEffect(() => {
    if (!["chefs", "users"].includes(resource) || !selected)
      return;
    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError("");
    void (
      resource === "chefs"
        ? getChefApplication(selected.id, controller.signal)
        : getAdminUser(selected.id, controller.signal)
    )
      .then((detail) => {
        if (!controller.signal.aborted) setSelected(detail);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setDetailError(adminApiErrorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [resource, selected?.id, detailRevision]);

  useEffect(() => {
    setSelected(null);
    setEditing(null);
    setStatusFilter("");
  }, [resource]);

  const reload = useCallback(() => {
    clearAdminTableCache(resource);
    setRevision((current) => current + 1);
  }, [resource]);

  return (
    <div className="gca-page">
      <div className="gca-page-heading">
        <div>
          <span className="gca-eyebrow">{section.eyebrow} · GoCook Admin</span>
          <h1>{section.title}</h1>
          <p>Theo dõi thông tin và xem xét hoạt động trong hệ thống.</p>
        </div>
        <div className="gca-heading-buttons">
          <button
            type="button"
            className="gca-btn gca-btn-outline"
            onClick={reload}
          >
            <ArrowClockwise size={15} /> Làm mới
          </button>
          {(resource === "categories" || resource === "dishes") && (
            <button
              type="button"
              className="gca-btn gca-btn-primary"
              onClick={() => setEditing("new")}
            >
              Thêm mới
            </button>
          )}
        </div>
      </div>
      <section className="gca-panel">
        <div className="gca-list-heading">
          <h2>Danh sách {section.eyebrow.toLocaleLowerCase("vi")}</h2>
          {(resource === "users" || resource === "chefs") && (
            <label className="gca-workflow-filter">
              Lọc trạng thái
              <select
                aria-label="Lọc trạng thái"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setSelected(null);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(workflowFilters[resource]).map(
                  ([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
        </div>
        <AdminDataTable
          key={`${resource}-${revision}-${query}-${statusFilter}`}
          resource={resource}
          initialSearch={resource === "chefs" ? "" : query}
          revision={revision}
          onView={(row) => {
            setDetailLoading(
              resource === "chefs" || resource === "users",
            );
            setDetailError("");
            setSelected(row);
          }}
          statusFilter={
            (resource === "chefs" || resource === "users")
              ? statusFilter
              : ""
          }
        />
      </section>
      {selected && (
        <div
          className="gca-dialog-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <section
            className="gca-detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Chi tiết"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gca-drawer-head">
              <h2>{selected.name}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng"
              >
                <XLg size={20} />
              </button>
            </div>
            {detailLoading &&
              (resource === "chefs" || resource === "users") && <p role="status">Đang tải chi tiết hồ sơ...</p>}
            {detailError &&
              (resource === "chefs" || resource === "users") && (
                <div role="alert" className="gca-form-error">
                  {detailError}{" "}
                  <button
                    type="button"
                    onClick={() => setDetailRevision((value) => value + 1)}
                  >
                    Thử lại
                  </button>
                </div>
              )}
            {!detailLoading && !detailError && (
              <dl>
                {section.columns.map((column) => (
                  <div key={column.key}>
                    <dt>{column.label}</dt>
                    <dd>
                      {column.key === "status" && isWorkflowSection(resource)
                        ? workflowLabel(resource, selected)
                        : selected[column.key] || "—"}
                    </dd>
                  </div>
                ))}
                {isWorkflowSection(resource) &&
                  workflowDetails[resource].map((field) => (
                    <div key={field.key}>
                      <dt>{field.label}</dt>
                      <dd>{selected[field.key] || "Chưa được cung cấp"}</dd>
                    </div>
                  ))}
                {resource !== "chefs" && selected.description && (
                  <div>
                    <dt>Mô tả</dt>
                    <dd>{selected.description}</dd>
                  </div>
                )}
              </dl>
            )}
            <div className="gca-heading-buttons">
              <button
                type="button"
                className="gca-btn gca-btn-outline"
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>
              {!detailLoading &&
                !detailError &&
                (!isWorkflowSection(resource) ||
                  workflowActions(resource, selected).length > 0) && (
                  <button
                    type="button"
                    className="gca-btn gca-btn-primary"
                    onClick={() => {
                      setEditing(selected);
                      setSelected(null);
                    }}
                  >
                    {resource === "chefs"
                      ? "Xét duyệt hồ sơ"
                      : resource === "users"
                        ? "Xử lý tài khoản"
                        : managed
                        ? "Xem thao tác quản trị"
                        : "Chỉnh sửa"}
                  </button>
                )}
              {!detailLoading &&
                !detailError &&
                isWorkflowSection(resource) &&
                !workflowActions(resource, selected).length && (
                  <p className="gca-workflow-notice">
                    {resource === "chefs" &&
                    workflowState(resource, selected) === "REJECTED"
                      ? "Hồ sơ bị từ chối. Người dùng có thể chỉnh sửa và gửi lại."
                      : "Chưa đủ dữ liệu trạng thái để xác định hành động quản trị an toàn."}
                  </p>
                )}
            </div>
          </section>
        </div>
      )}
      {editing && (
        <AdminActionPanel
          key={`${resource}-${editing === "new" ? "new" : editing.id}`}
          resource={resource}
          record={editing === "new" ? null : editing}
          demo={false}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
