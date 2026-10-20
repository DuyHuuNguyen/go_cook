import { useState } from "react";
import { Link } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { categories, menuLabels, money } from "./sellerMockData";

export function SellerProductsPage() {
  useDocumentTitle("Thực đơn của tôi | GO Cook");
  const { menus, hideMenu } = useSellerDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [notice, setNotice] = useState("");
  const filtered = menus.filter(
    (menu) =>
      menu.name
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")) &&
      (!status || menu.status === status) &&
      (!category || menu.category === category),
  );
  return (
    <SellerWorkspace
      title="Thực đơn của tôi"
      description="Những món ngon mang dấu ấn riêng của căn bếp bạn."
    >
      <div className="chef-demo-banner">
        <strong>Dữ liệu mẫu · {menus.length} thực đơn</strong>
        <span>Thay đổi được giữ khi chuyển trang và đặt lại khi tải lại.</span>
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <section className="card chef-filters" aria-label="Lọc thực đơn">
        <label className="field">
          Tìm thực đơn
          <input
            type="search"
            placeholder="Nhập tên thực đơn…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="field">
          Trạng thái
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(menuLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Danh mục
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>
      <div className="between">
        <h2>{filtered.length} thực đơn</h2>
        <span className="small muted">
          Ẩn thực đơn vẫn giữ lịch sử đơn đặt nấu.
        </span>
      </div>
      <div className="chef-menu-grid">
        {filtered.map((menu) => (
          <article className="card chef-menu-card" key={menu.id}>
            {menu.images.length ? (
              <img
                className="chef-menu-photo"
                src={
                  (
                    menu.images.find((image) => image.id === menu.coverId) ||
                    menu.images[0]
                  ).url
                }
                alt={menu.name}
              />
            ) : (
              <div className="chef-menu-photo chef-placeholder">
                Chưa có ảnh
              </div>
            )}
            <div className="stack-sm chef-menu-content">
              <div className="between">
                <span className="eyebrow">{menu.category}</span>
                <span
                  className={`badge ${menu.status === "PUBLISHED" ? "" : "gray"}`}
                >
                  {menuLabels[menu.status]}
                </span>
              </div>
              <h2>{menu.name}</h2>
              <p className="muted">{menu.description}</p>
              <p className="small muted">
                {menu.minGuests}–{menu.maxGuests} khách · {menu.images.length}{" "}
                ảnh
              </p>
              <p>
                <strong className="green">{money(menu.price)}</strong>
                <span className="small muted"> / khách</span>
              </p>
              <div className="row">
                <Link
                  className="btn secondary sm"
                  to={`/seller/product-edit?id=${menu.id}`}
                >
                  Chỉnh sửa
                </Link>
                {menu.status !== "HIDDEN" && (
                  <button
                    className="btn ghost sm"
                    onClick={() => {
                      hideMenu(menu.id);
                      setNotice(`Đã ẩn “${menu.name}”.`);
                    }}
                  >
                    Ẩn thực đơn
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="card chef-empty">
          <h2>Chưa tìm thấy thực đơn</h2>
          <p className="muted">Thử từ khóa khác hoặc bỏ bộ lọc.</p>
          <button
            className="btn secondary"
            onClick={() => {
              setQuery("");
              setCategory("");
              setStatus("");
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </SellerWorkspace>
  );
}
