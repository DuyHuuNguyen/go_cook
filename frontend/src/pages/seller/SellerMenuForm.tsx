import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import {
  categories,
  menuLabels,
  type DemoMenu,
  type MenuStatus,
} from "./sellerMockData";

export function SellerMenuForm({ editing = false }: { editing?: boolean }) {
  const { menus, saveMenu, readFiles } = useSellerDemo();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const existing = menus.find((menu) => menu.id === params.get("id"));
  const [menu, setMenu] = useState<DemoMenu>(() =>
    existing && editing
      ? { ...existing, images: [...existing.images] }
      : {
          id: crypto.randomUUID(),
          name: "",
          category: categories[0],
          price: 150000,
          minGuests: 2,
          maxGuests: 8,
          dishes: "",
          description: "",
          status: "DRAFT",
          images: [],
          coverId: "",
        },
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(() => location.state?.menuSaved === true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(() =>
    location.state?.menuSaved === true
      ? { type: "success", text: "Đã tạo thực đơn mẫu thành công." }
      : null,
  );
  useEffect(() => {
    if (location.state?.menuSaved)
      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
  }, [location.state, location.pathname, location.search, navigate]);
  useEffect(() => {
    if (error) setFeedback({ type: "error", text: error });
  }, [error]);
  const set = <K extends keyof DemoMenu>(key: K, value: DemoMenu[K]) => {
    setMenu((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setFeedback(null);
  };
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      saveMenu({
        ...menu,
        name: menu.name.trim(),
        coverId: menu.coverId || menu.images[0]?.id || "",
      });
      setError("");
      setSaved(true);
      setFeedback({
        type: "success",
        text: "Đã lưu thay đổi thực đơn mẫu thành công.",
      });
      if (!editing)
        navigate(`/seller/product-edit?id=${menu.id}`, {
          state: { menuSaved: true },
        });
    } catch (err) {
      const text = (err as Error).message;
      setError(text);
      setSaved(false);
      setFeedback({ type: "error", text });
    }
  }
  function move(index: number, offset: number) {
    const images = [...menu.images];
    [images[index], images[index + offset]] = [
      images[index + offset],
      images[index],
    ];
    set("images", images);
  }
  if (editing && !existing)
    return (
      <SellerWorkspace
        title="Không tìm thấy thực đơn"
        description="Chọn một thực đơn trong danh sách để chỉnh sửa."
      >
        <Link className="btn" to="/seller/products">
          Về danh sách
        </Link>
      </SellerWorkspace>
    );
  return (
    <SellerWorkspace
      title={editing ? "Chỉnh sửa thực đơn" : "Thêm thực đơn mới"}
      description="Kể câu chuyện món ăn của bạn bằng hương vị và hình ảnh."
    >
      <div className="chef-demo-banner">
        <strong>Bản xem trước</strong>
        <span>Ảnh chỉ được xem trên máy, chưa tải lên Cloudinary.</span>
      </div>
      <Link className="text-link" to="/seller/products">
        ← Trở lại thực đơn của tôi
      </Link>
      {saved && (
        <p className="notice" role="status">
          Đã lưu thực đơn mẫu. Bạn có thể xem trong danh sách.
        </p>
      )}
      {error && (
        <p className="notice warm" role="alert">
          {error}
        </p>
      )}
      {feedback && (
        <div className={`chef-save-toast ${feedback.type}`}>
          <div
            role={feedback.type === "error" ? "alert" : "status"}
            aria-atomic="true"
          >
            <strong>
              {feedback.type === "success" ? "✓ Thành công" : "Chưa lưu được"}
            </strong>
            <p>{feedback.text}</p>
          </div>
          <button
            type="button"
            className="btn secondary sm"
            aria-label="Đóng thông báo"
            onClick={() => setFeedback(null)}
          >
            ×
          </button>
        </div>
      )}
      <form
        className="stack"
        onSubmit={submit}
        onInvalidCapture={() => {
          setSaved(false);
          setFeedback({
            type: "error",
            text: "Vui lòng kiểm tra các trường bắt buộc, giá và số khách trước khi lưu.",
          });
        }}
      >
        <section className="card stack">
          <div>
            <p className="eyebrow">01 · Thông tin cơ bản</p>
            <h2>Một thực đơn thật hấp dẫn</h2>
          </div>
          <label className="field">
            Tên thực đơn
            <input
              required
              maxLength={255}
              value={menu.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ví dụ: Mâm cơm sum vầy"
            />
          </label>
          <div className="grid grid-2">
            <label className="field">
              Danh mục
              <select
                value={menu.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Giá mỗi khách (đ)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={menu.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </label>
          </div>
          <div className="grid grid-2">
            <label className="field">
              Số khách tối thiểu
              <input
                required
                type="number"
                min="1"
                max="100"
                value={menu.minGuests}
                onChange={(e) => set("minGuests", Number(e.target.value))}
              />
            </label>
            <label className="field">
              Số khách tối đa
              <input
                required
                type="number"
                min={menu.minGuests || 1}
                max="100"
                value={menu.maxGuests}
                onChange={(e) => set("maxGuests", Number(e.target.value))}
              />
            </label>
          </div>
          <label className="field">
            Các món trong thực đơn
            <textarea
              required
              rows={5}
              value={menu.dishes}
              onChange={(e) => set("dishes", e.target.value)}
              placeholder={"Mỗi món một dòng\nCá kho tộ\nCanh chua tôm"}
            />
          </label>
          <label className="field">
            Mô tả
            <textarea
              rows={3}
              maxLength={3000}
              value={menu.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Hương vị, nguyên liệu và điều đặc biệt của thực đơn…"
            />
          </label>
        </section>
        <section className="card stack">
          <div>
            <p className="eyebrow">02 · Hình ảnh</p>
            <h2>Cho khách một lời mời ngon mắt</h2>
          </div>
          <label className="chef-upload field">
            + Chọn nhiều ảnh thực đơn
            <span className="small muted">
              JPG, PNG, WebP · tối đa 5 MB/ảnh · 10 ảnh/thực đơn
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                try {
                  const files = Array.from(e.target.files || []);
                  if (menu.images.length + files.length > 10)
                    throw new Error("Tối đa 10 ảnh mỗi thực đơn.");
                  const images = readFiles(files);
                  setMenu((current) => ({
                    ...current,
                    images: [...current.images, ...images],
                    coverId: current.coverId || images[0]?.id || "",
                  }));
                  setSaved(false);
                  setError("");
                } catch (err) {
                  setError((err as Error).message);
                }
                e.target.value = "";
              }}
            />
          </label>
          <div className="chef-image-grid">
            {menu.images.map((image, index) => (
              <article className="chef-image-tile" key={image.id}>
                <img src={image.url} alt={image.name} />
                <p className="small chef-filename">{image.name}</p>
                <div className="row">
                  <label className="small">
                    <input
                      type="radio"
                      name="cover"
                      checked={menu.coverId === image.id}
                      onChange={() => set("coverId", image.id)}
                    />{" "}
                    Ảnh bìa
                  </label>
                  <span className="small muted">#{index + 1}</span>
                </div>
                <div className="row">
                  <button
                    type="button"
                    className="btn secondary sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Đưa ảnh ${index + 1} lên trước`}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn secondary sm"
                    disabled={index === menu.images.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Đưa ảnh ${index + 1} ra sau`}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => {
                      const images = menu.images.filter(
                        (item) => item.id !== image.id,
                      );
                      setMenu((current) => ({
                        ...current,
                        images,
                        coverId:
                          current.coverId === image.id
                            ? images[0]?.id || ""
                            : current.coverId,
                      }));
                      setSaved(false);
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!menu.images.length && (
            <p className="muted">
              Chưa có ảnh. Thêm ít nhất một ảnh trước khi xuất bản.
            </p>
          )}
        </section>
        <section className="card stack-sm">
          <label className="field">
            Trạng thái hiển thị
            <select
              value={menu.status}
              onChange={(e) => set("status", e.target.value as MenuStatus)}
            >
              {Object.entries(menuLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="small muted">
            Bản nháp và thực đơn tạm ẩn không xuất hiện với khách hàng.
          </p>
          <div className="row">
            <button className="btn" type="submit">
              Lưu thực đơn
            </button>
            <Link className="btn secondary" to="/seller/products">
              Về danh sách
            </Link>
          </div>
        </section>
      </form>
    </SellerWorkspace>
  );
}
