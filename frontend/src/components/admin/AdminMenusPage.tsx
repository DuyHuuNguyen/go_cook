import { useEffect, useMemo, useState } from "react";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import { Link } from "react-router";
import AdminDataTable from "./AdminDataTable";
import {
  adminApiErrorMessage,
  changeAdminMenuVisibility,
  getAdminMenuCategories,
  type AdminMenuFilters,
} from "../../clients/AdminClient";
import type { AdminRow } from "../../types/AdminTypes";
import "../../styles/adminMenus.css";

type FilterForm = {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  diners: string;
};

const emptyFilters: FilterForm = {
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  diners: "",
};

function toFilters(form: FilterForm): AdminMenuFilters {
  return {
    categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    minPrice: form.minPrice ? Number(form.minPrice) : undefined,
    maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
    diners: form.diners ? Number(form.diners) : undefined,
  };
}

function menuImages(record: AdminRow): string[] {
  try {
    const urls: unknown = JSON.parse(record.imageUrls || "[]");
    return Array.isArray(urls)
      ? urls.filter(
          (url): url is string =>
            typeof url === "string" && /^https?:\/\//i.test(url),
        )
      : [];
  } catch {
    return [];
  }
}

function visibilityLabel(status: string): string {
  const labels: Record<string, string> = {
    PUBLIC: "Công khai",
    CHEF_HIDDEN: "Đầu bếp đã ẩn",
    ADMIN_HIDDEN: "Admin đã ẩn",
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Ngừng hoạt động",
  };
  return labels[status] || status || "—";
}

export default function AdminMenusPage() {
  const [draft, setDraft] = useState<FilterForm>({ ...emptyFilters });
  const [applied, setApplied] = useState<FilterForm>({ ...emptyFilters });
  const [filterError, setFilterError] = useState("");
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<AdminRow | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const filters = useMemo(() => toFilters(applied), [applied]);

  useEffect(() => {
    const controller = new AbortController();
    void getAdminMenuCategories(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setCategories(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCategoriesError("Không tải được danh mục.");
      });
    return () => controller.abort();
  }, []);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const min = draft.minPrice ? Number(draft.minPrice) : null;
    const max = draft.maxPrice ? Number(draft.maxPrice) : null;
    if (min !== null && max !== null && min > max) {
      setFilterError("Giá từ không được lớn hơn giá đến.");
      return;
    }
    setFilterError("");
    setApplied({ ...draft });
    setRevision((value) => value + 1);
  }

  function refresh() {
    setActionSuccess("");
    setRevision((value) => value + 1);
  }

  async function updateVisibility(action: "HIDE" | "RESTORE") {
    if (!selected || saving) return;
    if (action === "HIDE" && !reason.trim()) {
      setActionError("Vui lòng nhập lý do ẩn thực đơn.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await changeAdminMenuVisibility(selected.id, action, reason);
      setSelected(null);
      setReason("");
      setActionSuccess(action === "HIDE" ? "Đã ẩn thực đơn." : "Đã khôi phục thực đơn.");
      setRevision((value) => value + 1);
    } catch (error) {
      setActionError(adminApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const images = selected ? menuImages(selected) : [];
  const visibility = selected?.visibility || "";
  const canManage = selected?.source === "admin";
  const canHide = canManage && (visibility === "PUBLIC" || visibility === "CHEF_HIDDEN");
  const canRestore = canManage && visibility === "ADMIN_HIDDEN";

  return (
    <div className="gca-page gca-menu-manager">
      <header className="gca-page-heading">
        <div>
          <h1>Quản lý thực đơn</h1>
          <p>Theo dõi thực đơn, món ăn và thông tin đầu bếp.</p>
        </div>
        <button type="button" className="gca-btn gca-btn-outline" onClick={refresh}>
          <ArrowClockwise size={15} /> Làm mới
        </button>
      </header>

      <form className="gca-menu-filters" onSubmit={applyFilters}>
        <label>
          Danh mục
          <select
            value={draft.categoryId}
            onChange={(event) => setDraft((value) => ({ ...value, categoryId: event.target.value }))}
          >
            <option value="">Tất cả</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          Giá từ (đ)
          <input
            type="number"
            min="0"
            step="1000"
            placeholder="0"
            value={draft.minPrice}
            onChange={(event) => setDraft((value) => ({ ...value, minPrice: event.target.value }))}
          />
        </label>
        <label>
          Giá đến (đ)
          <input
            type="number"
            min="0"
            step="1000"
            placeholder="Không giới hạn"
            value={draft.maxPrice}
            onChange={(event) => setDraft((value) => ({ ...value, maxPrice: event.target.value }))}
          />
        </label>
        <label>
          Số khách
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Tất cả"
            value={draft.diners}
            onChange={(event) => setDraft((value) => ({ ...value, diners: event.target.value }))}
          />
        </label>
        <div className="gca-menu-filter-actions">
          <button className="gca-btn gca-btn-primary" type="submit">Áp dụng</button>
          <button
            className="gca-btn gca-btn-outline"
            type="button"
            onClick={() => {
              setDraft({ ...emptyFilters });
              setApplied({ ...emptyFilters });
              setFilterError("");
              setRevision((value) => value + 1);
            }}
          >
            Xóa lọc
          </button>
        </div>
        {(filterError || categoriesError) && (
          <p className="gca-menu-filter-error" role="alert">{filterError || categoriesError}</p>
        )}
      </form>

      {actionSuccess && <p className="gca-menu-success" role="status">{actionSuccess}</p>}
      <section className="gca-panel">
        <AdminDataTable
          key={`menus-${revision}`}
          resource="menus"
          revision={revision}
          initialSearch=""
          menuFilters={filters}
          onView={(row) => {
            setSelected(row);
            setActionError("");
            setReason("");
          }}
        />
      </section>

      {selected && (
        <div className="gca-dialog-backdrop" role="presentation" onClick={() => !saving && setSelected(null)}>
          <section
            className="gca-detail-drawer gca-menu-detail"
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết thực đơn ${selected.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="gca-drawer-head">
              <h2>{selected.name}</h2>
              <button type="button" aria-label="Đóng" disabled={saving} onClick={() => setSelected(null)}>
                <XLg size={20} />
              </button>
            </header>
            {images.length > 0 && (
              <div className="gca-menu-gallery">
                {images.slice(0, 4).map((url, index) => (
                  <img key={`${url}-${index}`} src={url} alt={`${selected.name} - ảnh ${index + 1}`} loading="lazy" />
                ))}
              </div>
            )}
            <dl>
              <div><dt>Mã thực đơn</dt><dd>#{selected.id}</dd></div>
              <div><dt>Danh mục</dt><dd>{selected.category || "—"}</dd></div>
              <div><dt>Đầu bếp</dt><dd>{selected.chef || "—"}</dd></div>
              <div><dt>Giá dự kiến</dt><dd>{selected.price || "—"}</dd></div>
              <div><dt>Số khách</dt><dd>{selected.guests || "—"}</dd></div>
              <div><dt>Trạng thái</dt><dd>{visibilityLabel(selected.visibility || selected.status || "")}</dd></div>
              <div><dt>Mô tả</dt><dd>{selected.description || "—"}</dd></div>
              <div><dt>Món ăn</dt><dd>{selected.dishes || "—"}</dd></div>
              {selected.reason && <div><dt>Lý do ẩn</dt><dd>{selected.reason}</dd></div>}
            </dl>
            {(canHide || canRestore) && (
              <div className="gca-menu-moderation">
                {canHide && (
                  <label>
                    Lý do ẩn thực đơn
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      disabled={saving}
                    />
                  </label>
                )}
                {actionError && <p className="gca-menu-filter-error" role="alert">{actionError}</p>}
                <button
                  type="button"
                  className="gca-btn gca-btn-primary"
                  disabled={saving}
                  onClick={() => void updateVisibility(canRestore ? "RESTORE" : "HIDE")}
                >
                  {saving ? "Đang lưu..." : canRestore ? "Khôi phục thực đơn" : "Ẩn thực đơn"}
                </button>
              </div>
            )}
            <footer className="gca-menu-detail-footer">
              <Link className="gca-btn gca-btn-outline" to={`/menus/${encodeURIComponent(selected.id)}`}>
                Xem trên website
              </Link>
              <button type="button" className="gca-btn gca-btn-outline" disabled={saving} onClick={() => setSelected(null)}>
                Đóng
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
