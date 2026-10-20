import { Link } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

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
          <form className={"card summary stack"}>
            <p className="notice">
              Bản demo UI: hồ sơ chưa được gửi hoặc lưu vào hệ thống.
            </p>
            <h3>{"Đăng ký trở thành đối tác"}</h3>
            <label className={"field"} htmlFor={"chef-name"}>
              {"Họ và tên"}
              <input
                id={"chef-name"}
                name={"chef-name"}
                type={"text"}
                defaultValue={""}
                placeholder={"Họ và tên của bạn"}
              />
            </label>
            <label className={"field"} htmlFor={"chef-phone"}>
              {"Số điện thoại"}
              <input
                id={"chef-phone"}
                name={"chef-phone"}
                type={"tel"}
                defaultValue={""}
                placeholder={"Số điện thoại liên hệ"}
              />
            </label>
            <label className={"field"} htmlFor={"chef-email"}>
              {"Email"}
              <input
                id={"chef-email"}
                name={"chef-email"}
                type={"email"}
                defaultValue={""}
                placeholder={"Email của bạn"}
              />
            </label>
            <label className={"field"} htmlFor={"chef-area"}>
              {"Khu vực phục vụ"}
              <select id={"chef-area"} name={"chef-area"}>
                <option>{"TP. Hồ Chí Minh"}</option>
                <option>{"Hà Nội"}</option>
              </select>
            </label>
            <label className={"field"} htmlFor={"chef-years"}>
              {"Kinh nghiệm nấu ăn (năm)"}
              <input
                id={"chef-years"}
                name={"chef-years"}
                type={"number"}
                defaultValue={""}
                placeholder={""}
                min={"0"}
              />
            </label>
            <label className={"field"} htmlFor={"chef-specialty"}>
              {"Sở trường của bạn"}
              <textarea
                id={"chef-specialty"}
                name={"chef-specialty"}
                placeholder={
                  "Giới thiệu phong cách nấu ăn và các món sở trường"
                }
              ></textarea>
            </label>
            <label className={"field"} htmlFor={"chef-documents"}>
              {"Hồ sơ / chứng nhận"}
              <input
                id={"chef-documents"}
                name={"chef-documents"}
                type={"file"}
                defaultValue={""}
                placeholder={""}
                accept={".pdf,image/*"}
              />
            </label>
            <button
              className={"btn"}
              type={"button"}
              data-action={"register-seller"}
              disabled
              title={"Chức năng sẽ được tích hợp ở giai đoạn tiếp theo"}
            >
              {"Gửi hồ sơ đăng ký"}
            </button>
            <Link className={"text-link"} to="/seller">
              {"Xem kênh người bán mẫu"}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
