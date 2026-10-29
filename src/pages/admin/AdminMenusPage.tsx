import { useEffect, useMemo, useState } from "react";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import { Link } from "react-router";
import AdminDataTable from "../../components/admin/AdminDataTable";
import {
  getAdminMenuCategories,
  updateAdminMenuStatus,
} from "../../clients/AdminMenuClient";
import type { AdminMenuFilters, AdminMenuRow } from "../../types/AdminMenuTypes";
import "../../styles/adminMenus.css";

type FilterValues = {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  diners: string;
};

const emptyFilters: FilterValues = {
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  diners: "",
};

function toFilters(values: FilterValues): AdminMenuFilters {
  return {
    categoryId: values.categoryId ? Number(values.categoryId) : undefined,
    minPrice: values.minPrice ? Number(values.minPrice) : undefined,
    maxPrice: values.maxPrice ? Number(values.maxPrice) : undefined,
    diners: values.diners ? Number(values.diners) : undefined,
  };
}

function imagesFor(row: AdminMenuRow): string[] {
  try {
    const images: unknown = JSON.parse(row.imageUrls || "[]");
    return Array.isArray(images)
      ? images.filter((value): value is string => typeof value === "string" && /^https?:\/\//i.test(value))
      : [];
  } catch {
    return [];
  }
}

export default function AdminMenusPage() {
  const [draft, setDraft] = useState<FilterValues>({ ...emptyFilters });
  const [applied, setApplied] = useState<FilterValues>({ ...emptyFilters });
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([]);
  const [filterError, setFilterError] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<AdminMenuRow | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const filters = useMemo(() => toFilters(applied), [applied]);

  useEffect(() => {
    const controller = new AbortController();
    void getAdminMenuCategories(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setCategories(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFilterError("Không tải được danh mục.");
      });
    return () => controller.abort();
  }, []);

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setFilterError("Giá từ không được lớn hơn giá đến.");
      return;
    }
    setFilterError("");
    setApplied({ ...draft });
    setRevision((current) => current + 1);
  }

  function refresh() {
    setMessage("");
    setRevision((current) => current + 1);
  }

  async function changeStatus(isActive: boolean) {
    if (!selected || saving || selected.source !== "admin") return;
    const canHide = selected.isActive === "true";
    const canRestore = selected.isActive === "false" && selected.moderationSource === "ADMIN";
    if ((!isActive && !canHide) || (isActive && !canRestore)) return;
    if (!isActive && !reason.trim()) {
      setActionError("Nhập lý do ngừng hiển thị thực đơn.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await updateAdminMenuStatus(selected.id, isActive, reason);
      setSelected(null);
      setReason("");
      setMessage(isActive ? "Đã bật thực đơn." : "Đã ngừng hiển thị thực đơn.");
      setRevision((current) => current + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không cập nhật được thực đơn.");
    } finally {
      setSaving(false);
    }
  }

  const images = selected ? imagesFor(selected) : [];
  const isActive = selected?.isActive === "true";
  const canHide = selected?.source === "admin" && isActive;
  const canRestore = selected?.source === "admin" && selected.isActive === "false" && selected.moderationSource === "ADMIN";
  const isEditable = canHide || canRestore;

  return (
    <div className="gca-page gca-menu-manager">
      <header className="gca-page-heading">
        <div><h1>Quản lý thực đơn</h1></div>
        <button className="gca-btn gca-btn-outline" type="button" onClick={refresh}>
          <ArrowClockwise size={15} /> Làm mới
        </button>
      </header>
      <form className="gca-menu-filters" onSubmit={apply}>
        <label>
          Danh mục
          <select value={draft.categoryId} onChange={(event) => setDraft((value) => ({...value, categoryId: event.target.value}))}>
            <option value="">Tất cả</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          Giá từ (đ)
          <input type="number" min="0" step="1000" value={draft.minPrice} onChange={(event) => setDraft((value) => ({...value, minPrice: event.target.value}))} />
        </label>
        <label>
          Giá đến (đ)
          <input type="number" min="0" step="1000" value={draft.maxPrice} onChange={(event) => setDraft((value) => ({...value, maxPrice: event.target.value}))} />
        </label>
        <label>
          Số khách
          <input type="number" min="1" step="1" value={draft.diners} onChange={(event) => setDraft((value) => ({...value, diners: event.target.value}))} />
        </label>
        <div className="gca-menu-filter-actions">
          <button className="gca-btn gca-btn-primary" type="submit">Lọc</button>
          <button className="gca-btn gca-btn-outline" type="button" onClick={() => {
            setDraft({...emptyFilters});
            setApplied({...emptyFilters});
            setFilterError("");
            setRevision((value) => value + 1);
          }}>Xóa lọc</button>
        </div>
        {filterError && <p className="gca-menu-filter-error" role="alert">{filterError}</p>}
      </form>
      {message && <p className="gca-menu-success" role="status">{message}</p>}
      <section className="gca-panel">
        <AdminDataTable
          key={`menus-${revision}`}
          resource="menus"
          initialSearch=""
          revision={revision}
          menuFilters={filters}
          onView={(row) => {
            setSelected(row as AdminMenuRow);
            setReason("");
            setActionError("");
          }}
        />
      </section>
      {selected && (
        <div className="gca-dialog-backdrop" role="presentation" onClick={() => !saving && setSelected(null)}>
          <section className="gca-detail-drawer gca-menu-detail" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selected.name}`} onClick={(event) => event.stopPropagation()}>
            <div className="gca-drawer-head">
              <h2>{selected.name}</h2>
              <button type="button" aria-label="Đóng" disabled={saving} onClick={() => setSelected(null)}><XLg size={20} /></button>
            </div>
            {images.length > 0 && <div className="gca-menu-gallery">
              {images.slice(0, 4).map((url, index) => <img key={`${index}-${url}`} src={url} alt={`${selected.name} ${index + 1}`} loading="lazy" />)}
            </div>}
            <dl>
              <div><dt>Mã thực đơn</dt><dd>{selected.id}</dd></div>
              <div><dt>Danh mục</dt><dd>{selected.category || "—"}</dd></div>
              <div><dt>Đầu bếp</dt><dd>{selected.chef || "—"}</dd></div>
              <div><dt>Giá dự kiến</dt><dd>{selected.price || "—"}</dd></div>
              <div><dt>Số khách</dt><dd>{selected.guests || "—"}</dd></div>
              <div><dt>Trạng thái</dt><dd>{selected.status || "—"}</dd></div>
              {isEditable && <div><dt>Hoạt động</dt><dd>{isActive ? "Đang hoạt động" : "Đã ẩn"}</dd></div>}
              <div><dt>Mô tả</dt><dd>{selected.description || "—"}</dd></div>
              <div><dt>Món ăn</dt><dd>{selected.dishes || "—"}</dd></div>
              {selected.reason && <div><dt>Lý do</dt><dd>{selected.reason}</dd></div>}
            </dl>
            {isEditable && (
              <div className="gca-menu-moderation">
                {canHide && <label>Lý do ngừng hiển thị
                  <textarea rows={3} maxLength={1000} value={reason} disabled={saving} onChange={(event) => setReason(event.target.value)} />
                </label>}
                {actionError && <p className="gca-menu-filter-error" role="alert">{actionError}</p>}
                <button className="gca-btn gca-btn-primary" type="button" disabled={saving} onClick={() => void changeStatus(!isActive)}>
                  {saving ? "Đang lưu..." : canHide ? "Ngừng hiển thị" : "Gỡ ẩn do Admin"}
                </button>
              </div>
            )}
            <div className="gca-menu-detail-footer">
              <Link className="gca-btn gca-btn-outline" to={`/menus/${encodeURIComponent(selected.id)}`}>Xem trên website</Link>
              <button type="button" className="gca-btn gca-btn-outline" onClick={() => setSelected(null)} disabled={saving}>Đóng</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
