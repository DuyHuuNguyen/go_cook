import { useState } from "react";
import axios from "axios";
import { XLg } from "react-bootstrap-icons";
import { saveAdminRecord } from "../../clients/AdminClient";
import { type AdminRow, type AdminSection } from "../../types/AdminTypes";

import {
  isWorkflowSection,
  workflowActions,
  workflowLabel,
  type WorkflowSection,
} from "./adminWorkflow";

type Props = {
  resource: AdminSection;
  record: AdminRow | null;
  onClose: () => void;
  onSaved: () => void;
};

type ActionInfo = {
  title: string;
  field: string;
  key: string;
  options?: string[];
};
const actions: Record<AdminSection, ActionInfo> = {
  users: { title: "Hoạt động tài khoản", field: "Trạng thái", key: "status" },
  chefs: {
    title: "Duyệt đầu bếp",
    field: "Trạng thái",
    key: "status",
    options: ["PENDING", "APPROVED", "REJECTED"],
  },
  menus: { title: "Kiểm soát hiển thị", field: "Trạng thái", key: "status" },
  dishes: { title: "Món ăn", field: "Tên món", key: "name" },
  categories: { title: "Danh mục", field: "Tên danh mục", key: "name" },
  bookings: {
    title: "Cập nhật đơn",
    field: "Trạng thái",
    key: "status",
    options: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
  },
  requests: {
    title: "Cập nhật yêu cầu",
    field: "Trạng thái",
    key: "status",
    options: ["PENDING", "PROCESSING", "RESPONDED", "CLOSED"],
  },
  payments: {
    title: "Đối soát",
    field: "Trạng thái",
    key: "status",
    options: ["PENDING", "RECONCILED", "FAILED"],
  },
  feedback: {
    title: "Phản ánh",
    field: "Trạng thái",
    key: "status",
    options: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
  },
};

export default function AdminActionPanel({
  resource,
  record,
  onClose,
  onSaved,
}: Props) {
  const info = actions[resource];
  const [value, setValue] = useState(record?.[info.key] || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    setError("");
    const payload: Record<string, string> = { [info.key]: value.trim() };
    if (note.trim()) payload.note = note.trim();
    try {
      await saveAdminRecord(resource, record?.id || null, payload);
      onSaved();
    } catch (reason) {
      if (axios.isAxiosError(reason)) {
        setError(
          reason.response?.status === 404
            ? "Chức năng chưa có API."
            : reason.response?.status === 403
              ? "Không có quyền thực hiện thao tác này."
              : "Không thể lưu thay đổi.",
        );
      } else {
        setError("Không thể lưu thay đổi.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (isWorkflowSection(resource) && record)
    return (
      <WorkflowActionPanel
        resource={resource}
        record={record}
        onClose={onClose}
      />
    );

  return (
    <div className="gca-dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="gca-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={info.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gca-drawer-head">
          <h2>{info.title}</h2>
          <button onClick={onClose} type="button" aria-label="Đóng">
            <XLg size={20} />
          </button>
        </div>
        {record && (
          <p className="gca-action-record">
            {record.name} · #{record.id}
          </p>
        )}
        <form
          className="gca-action-form"
          onSubmit={(event) => void submit(event)}
        >
          <label>
            {info.field}
            {info.options ? (
              <select
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
              >
                <option value="">Chọn trạng thái</option>
                {info.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                maxLength={255}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            )}
          </label>
          <label>
            Ghi chú
            <textarea
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="gca-form-error">
              {error}
            </p>
          )}
          <div className="gca-action-controls">
            <button
              className="gca-btn gca-btn-outline"
              type="button"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="gca-btn gca-btn-primary"
              disabled={saving || !value.trim()}
              type="submit"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function WorkflowActionPanel({
  resource,
  record,
  onClose,
}: {
  resource: WorkflowSection;
  record: AdminRow;
  onClose: () => void;
}) {
  const available = workflowActions(resource, record);
  const [actionId, setActionId] = useState(available[0]?.id || "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const action = available.find((item) => item.id === actionId);
  function check(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecked(false);
    if (!action) {
      setError("Chưa có hành động phù hợp với dữ liệu trạng thái này.");
      return;
    }
    if (action.reasonRequired && !reason.trim()) {
      setError("Vui lòng nhập lý do, không chỉ khoảng trắng.");
      return;
    }
    setError("");
    setChecked(true);
  }
  return (
    <div className="gca-dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="gca-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Xem xét thao tác quản trị"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="gca-drawer-head">
          <h2>Xem xét thao tác</h2>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <XLg size={20} />
          </button>
        </div>
        <p className="gca-action-record">
          {record.name} · #{record.id}
          <br />
          {workflowLabel(resource, record)}
        </p>
        <p className="gca-workflow-notice" role="note">
          Chưa khả dụng: backend chưa có API cho quy trình này. Biểu mẫu chỉ
          kiểm tra giao diện, không gửi yêu cầu, lưu dữ liệu hay thay đổi quyền.
        </p>
        <form className="gca-action-form" onSubmit={check}>
          <label>
            Hành động
            <select
              autoFocus
              required
              value={actionId}
              onChange={(event) => {
                setActionId(event.target.value);
                setChecked(false);
                setError("");
              }}
            >
              <option value="" disabled>
                Chọn hành động
              </option>
              {available.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {action && <p>{action.description}</p>}
          <label>
            Lý do {action?.reasonRequired ? "(bắt buộc)" : "(không bắt buộc)"}
            <textarea
              required={action?.reasonRequired}
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setChecked(false);
                setError("");
              }}
            />
          </label>
          {error && (
            <p role="alert" className="gca-form-error">
              {error}
            </p>
          )}
          {checked && (
            <p role="status" className="gca-workflow-notice">
              Biểu mẫu hợp lệ. Chưa gửi hoặc lưu: cần kết nối API backend.
            </p>
          )}
          <div className="gca-action-controls">
            <button
              className="gca-btn gca-btn-outline"
              type="button"
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              className="gca-btn gca-btn-outline"
              type="submit"
              disabled={!action}
            >
              Kiểm tra biểu mẫu
            </button>
            <button
              className="gca-btn gca-btn-primary"
              type="button"
              disabled
              title="Chưa có API backend"
            >
              Áp dụng · Chưa khả dụng
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
