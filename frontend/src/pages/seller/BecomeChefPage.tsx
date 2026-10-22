import { Link } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import BecomeChefForm from "../../components/seller/BecomeChefForm.tsx";

/**
 * Route: /become-chef
 * Migrated from the former JSP demo markup into a dedicated React page.
 * Keep future business logic in hooks/clients for this domain, not inside the router.
 */
export function BecomeChefPage() {
  useDocumentTitle("Trở thành đầu bếp đối tác | GO Cook");

  return (
    <div className="seller-module">
      <div className={"container"}>
        <div className={"page-heading"}>
          <nav className={"breadcrumb"} aria-label={"Đường dẫn"}>
            <Link to="/">{"Trang chủ"}</Link>
            <span>{"/"}</span>
            <span>{"Mang tài nấu nướng đến nhiều gia đình"}</span>
          </nav>
          <h1>{"Mang tài nấu nướng đến nhiều gia đình"}</h1>
          <p className={"lead"}>
            {
              "Chủ động lịch làm việc, chia sẻ hương vị và xây dựng gian bếp riêng."
            }
          </p>
        </div>
        <div className={"split"}>
          <div className={"stack"}>
            <img
              className={""}
              src={`${import.meta.env.BASE_URL}assets/chef.png`}
              alt={"Ảnh minh họa đầu bếp nấu ăn tại nhà"}
              loading={"lazy"}
            />
            <section className={"card stack"}>
              <h2>
                {"Bạn nấu ngon."}
                <br />
                {"GO Cook giúp bạn kết nối."}
              </h2>
              <ul className={"check-list"}>
                <li>{"Tạo thực đơn và mức giá của riêng mình"}</li>
                <li>{"Chọn lịch nấu phù hợp với thời gian"}</li>
                <li>{"Quản lý đơn và doanh thu tại một nơi"}</li>
              </ul>
            </section>
          </div>
          <BecomeChefForm/>
        </div>
      </div>
    </div>
  );
}
