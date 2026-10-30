import { useState } from "react";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import AdminDataTable from "../../components/admin/AdminDataTable";
import {
  adminDishError,
  getAdminDish,
  updateAdminDish,
  updateAdminDishStatus,
} from "../../clients/AdminDishClient";
import type { AdminRow } from "../../types/AdminTypes";
import type { AdminDishFilters } from "../../types/AdminDishTypes";
import "../../styles/adminMenus.css";
import "../../styles/adminDishes.css";

type FilterValues = { ownership: string; active: string; chefId: string };
const initialFilters: FilterValues = { ownership: "", active: "", chefId: "" };

function toFilters(input: FilterValues): AdminDishFilters {
  return {
    ownership: input.ownership ? (input.ownership as "SHARED" | "CHEF") : undefined,
    isActive: input.active === "true" ? true : input.active === "false" ? false : undefined,
    chefId: input.chefId ? Number(input.chefId) : undefined,
  };
}

export default function AdminDishesPage() {
  const [draft, setDraft] = useState<FilterValues>({ ...initialFilters });
  const [filters, setFilters] = useState<AdminDishFilters>({});
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<AdminRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function refresh() {
    setNotice("");
    setRevision((value) => value + 1);
  }

  async function openDish(row: AdminRow, edit: boolean) {
    setSelected(row);
    setName(row.name);
    setEditing(edit);
    setError("");
    setReason("");
    setLoading(true);
    try {
      const detail = await getAdminDish(row.id);
      setSelected(detail);
      setName(detail.name);
    } catch (exception) {
      setError(adminDishError(exception));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!selected || saving) return;
    if (!name.trim() || name.trim().length > 255) {
      setError("Tên món phải có từ 1 đến 255 ký tự.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateAdminDish(selected.id, name);
      setSelected(null);
      setEditing(false);
      setNotice("Đã cập nhật món ăn.");
      setRevision((value) => value + 1);
    } catch (exception) {
      setError(adminDishError(exception));
    } finally {
      setSaving(false);
    }
  }

  async function setActive(isActive: boolean) {
    if (!selected || saving) return;
    if (!isActive && !reason.trim()) {
      setError("Vui lòng nhập lý do ẩn món ăn.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateAdminDishStatus(selected.id, isActive, reason);
      setSelected(null);
      setNotice(isActive ? "Đã khôi phục món ăn." : "Đã ẩn món ăn.");
      setRevision((value) => value + 1);
    } catch (exception) {
      setError(adminDishError(exception));
    } finally {
      setSaving(false);
    }
  }

  const canHide = selected?.isActive === "true";
  const canRestore = selected?.isActive === "false" && selected.moderationSource === "ADMIN";

  return (
    <div className="gca-page gca-menu-manager gca-dish-manager">
      <header className="gca-page-heading">
        <div><h1>Quản lý món ăn</h1></div>
        <button type="button" className="gca-btn gca-btn-outline" onClick={refresh}>
          <ArrowClockwise size={15} /> Làm mới
        </button>
      </header>

      <form className="gca-menu-filters gca-dish-filters" onSubmit={(event) => {
        event.preventDefault();
        if (draft.chefId && (!Number.isSafeInteger(Number(draft.chefId)) || Number(draft.chefId) < 1)) {
          setError("Mã đầu bếp không hợp lệ.");
          return;
        }
        setError("");
        setFilters(toFilters(draft));
        setRevision((value) => value + 1);
      }}>
        <label>Nguồn món
          <select value={draft.ownership} onChange={(event) => setDraft((value) => ({ ...value, ownership: event.target.value }))}>
            <option value="">Tất cả</option>
            <option value="SHARED">Món dùng chung</option>
            <option value="CHEF">Món của đầu bếp</option>
          </select>
        </label>
        <label>Trạng thái
          <select value={draft.active} onChange={(event) => setDraft((value) => ({ ...value, active: event.target.value }))}>
            <option value="">Tất cả</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Đã ẩn</option>
          </select>
        </label>
        <label>Mã đầu bếp
          <input type="number" min="1" placeholder="Tất cả" value={draft.chefId}
            onChange={(event) => setDraft((value) => ({ ...value, chefId: event.target.value }))}/>
        </label>
        <div className="gca-menu-filter-actions">
          <button type="submit" className="gca-btn gca-btn-primary">Áp dụng</button>
          <button type="button" className="gca-btn gca-btn-outline" onClick={() => {
            setDraft({ ...initialFilters });
            setFilters({});
            setError("");
            setRevision((value) => value + 1);
          }}>Xóa lọc</button>
        </div>
      </form>

      {notice && <p className="gca-menu-success" role="status">{notice}</p>}
      {!selected && error && <p className="gca-menu-filter-error" role="alert">{error}</p>}
      <section className="gca-panel">
        <AdminDataTable
          key={`dishes-${revision}`}
          resource="dishes"
          revision={revision}
          initialSearch=""
          dishFilters={filters}
          onView={(row) => void openDish(row, false)}
          onEdit={(row) => void openDish(row, true)}
        />
      </section>

      {selected && (
        <div className="gca-dialog-backdrop" role="presentation" onClick={() => !saving && setSelected(null)}>
          <section className="gca-detail-drawer" role="dialog" aria-modal="true"
            aria-label={`Món ăn ${selected.name}`} onClick={(event) => event.stopPropagation()}>
            <header className="gca-drawer-head">
              <h2>{editing ? "Sửa món ăn" : selected.name}</h2>
              <button type="button" aria-label="Đóng" disabled={saving} onClick={() => setSelected(null)}><XLg size={20}/></button>
            </header>
            {loading ? <p>Đang tải...</p> : (
              editing ? (
                <form className="gca-menu-edit" onSubmit={(event) => { event.preventDefault(); void save(); }}>
                  <label>Tên món ăn
                    <input value={name} maxLength={255} required disabled={saving} onChange={(event) => setName(event.target.value)}/>
                  </label>
                  {error && <p className="gca-menu-filter-error" role="alert">{error}</p>}
                  <div className="gca-menu-edit-actions">
                    <button type="button" className="gca-btn gca-btn-outline" disabled={saving} onClick={() => setEditing(false)}>Hủy</button>
                    <button type="submit" className="gca-btn gca-btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                  </div>
                </form>
              ) : (
                <>
                  <dl>
                    <div><dt>Mã món</dt><dd>#{selected.id}</dd></div>
                    <div><dt>Tên món</dt><dd>{selected.name}</dd></div>
                    <div><dt>Nguồn</dt><dd>{selected.ownership === "SHARED" ? "Món dùng chung" : "Món của đầu bếp"}</dd></div>
                    <div><dt>Đầu bếp</dt><dd>{selected.chef}</dd></div>
                    <div><dt>Trạng thái</dt><dd>{selected.status === "ACTIVE" ? "Đang hoạt động" : "Đã ẩn"}</dd></div>
                    {selected.reason && <div><dt>Lý do ẩn</dt><dd>{selected.reason}</dd></div>}
                  </dl>
                  {canHide && <div className="gca-menu-moderation"><label>Lý do ẩn món ăn
                    <textarea rows={3} maxLength={1000} value={reason} disabled={saving}
                      onChange={(event) => setReason(event.target.value)}/></label></div>}
                  {error && <p className="gca-menu-filter-error" role="alert">{error}</p>}
                  <footer className="gca-menu-detail-footer gca-dish-actions">
                    <button type="button" className="gca-btn gca-btn-outline" disabled={saving} onClick={() => setEditing(true)}>Sửa</button>
                    {canHide && <button type="button" className="gca-btn gca-btn-primary" disabled={saving}
                      onClick={() => void setActive(false)}>{saving ? "Đang lưu..." : "Ẩn món"}</button>}
                    {canRestore && <button type="button" className="gca-btn gca-btn-primary" disabled={saving}
                      onClick={() => void setActive(true)}>{saving ? "Đang lưu..." : "Khôi phục"}</button>}
                    <button type="button" className="gca-btn gca-btn-outline" disabled={saving} onClick={() => setSelected(null)}>Đóng</button>
                  </footer>
                </>
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}
