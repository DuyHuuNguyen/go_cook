import type { AdminMenuUpdate } from "../../types/AdminMenuTypes";

type Props = {
  value: AdminMenuUpdate;
  categories: Array<{ id: number; name: string }>;
  onChange: (value: AdminMenuUpdate) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
};

export default function AdminMenuEditForm({
  value,
  categories,
  onChange,
  onSubmit,
  onCancel,
  saving,
  error,
}: Props) {
  const field = (key: keyof AdminMenuUpdate, next: string) =>
    onChange({ ...value, [key]: next });

  return (
    <form className="gca-menu-edit" onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}>
      <label>
        Tên thực đơn
        <input
          required
          maxLength={255}
          value={value.name}
          disabled={saving}
          onChange={(event) => field("name", event.target.value)}
        />
      </label>
      <label>
        Danh mục
        <select
          required
          value={value.categoryId}
          disabled={saving}
          onChange={(event) => field("categoryId", event.target.value)}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
          {value.categoryId && !categories.some((item) => String(item.id) === value.categoryId) && (
            <option value={value.categoryId}>Danh mục #{value.categoryId}</option>
          )}
        </select>
      </label>
      <label>
        Giá dự kiến (đ)
        <input
          required
          type="number"
          min="0"
          step="1000"
          value={value.tempPrice}
          disabled={saving}
          onChange={(event) => field("tempPrice", event.target.value)}
        />
      </label>
      <div className="gca-menu-edit-grid">
        <label>
          Khách tối thiểu
          <input
            required
            type="number"
            min="1"
            step="1"
            value={value.minGuests}
            disabled={saving}
            onChange={(event) => field("minGuests", event.target.value)}
          />
        </label>
        <label>
          Khách tối đa
          <input
            required
            type="number"
            min="1"
            step="1"
            value={value.maxGuests}
            disabled={saving}
            onChange={(event) => field("maxGuests", event.target.value)}
          />
        </label>
      </div>
      <label>
        Mô tả
        <textarea
          rows={5}
          maxLength={3000}
          value={value.description}
          disabled={saving}
          onChange={(event) => field("description", event.target.value)}
        />
      </label>
      {error && <p className="gca-menu-filter-error" role="alert">{error}</p>}
      <div className="gca-menu-edit-actions">
        <button className="gca-btn gca-btn-outline" type="button" disabled={saving} onClick={onCancel}>
          Hủy
        </button>
        <button className="gca-btn gca-btn-primary" type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
