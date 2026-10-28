import { useState } from "react";
import { Link } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { categories, menuLabels, money } from "./sellerMockData";
import Dishes from "../../components/seller/Dishes.tsx";
import MenuCard from "../../components/menu/MenuCard.tsx";
import MenuList from "../../components/seller/MenuListManagement.tsx";

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
    >
      <Dishes/>
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
      
      <MenuList />

    </SellerWorkspace>
  );
}
