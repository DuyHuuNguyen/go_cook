import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { bookingApi } from "../../clients/BookingClient";
import { type MatchingChef } from "../../types/BookingTypes";
import { useApp } from "../../contexts/AppContext";
import axios from "axios";

// ─── helpers ────────────────────────────────────────────────────────────────

function matchPercent(chef: MatchingChef): number {
  if (chef.totalRequestedDishCount === 0) return 0;
  return Math.round(
    (chef.matchedDishCount / chef.totalRequestedDishCount) * 100,
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  if (!src || imgError) {
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .slice(-2)
      .join("")
      .toUpperCase();
    return (
      <div className="mc-avatar-fallback" aria-label={name}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="mc-avatar"
      onError={() => setImgError(true)}
    />
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="mc-chef-card mc-skeleton-card" aria-hidden="true">
      <div className="mc-skeleton mc-skeleton-avatar" />
      <div className="mc-skeleton-body">
        <div className="mc-skeleton mc-skeleton-title" />
        <div className="mc-skeleton mc-skeleton-line" />
        <div className="mc-skeleton mc-skeleton-line mc-skeleton-short" />
      </div>
    </div>
  );
}

interface ChefCardProps {
  chef: MatchingChef;
  rank: number;
  onRequest: (chef: MatchingChef) => void;
  requesting: boolean;
}

function ChefCard({ chef, rank, onRequest, requesting }: ChefCardProps) {
  const pct = matchPercent(chef);
  const isBest = rank === 0;

  return (
    <article className={`mc-chef-card`}>
      {/* <article className={`mc-chef-card${isBest ? " mc-chef-card--best" : ""}`}> */
      /* {isBest && (
        <div className="mc-best-banner">
          <i className="fa-solid fa-trophy" /> Phù hợp nhất với yêu cầu của bạn
        </div>
      )} */}

      <div className="mc-chef-profile">
        <div className="mc-avatar-wrapper">
          <Avatar src={chef.avatar} name={chef.fullName} />
        </div>

        <h3 className="mc-chef-name">
          {chef.fullName}
          <span
            className={`mc-match-badge${isBest ? " mc-match-badge--best" : ""}`}
          >
            Match {pct}%
          </span>
        </h3>

        {chef.bio && <p className="mc-chef-bio">{chef.bio}</p>}

        <div className="mc-chef-meta">
          {chef.experience_years && (
            <span>
              <i className="fa-solid fa-briefcase" /> {chef.experience_years}{" "}
              năm kinh nghiệm
            </span>
          )}
        </div>

        <div className="mc-progress-row">
          <div className="mc-progress-label">
            <span>Món khớp</span>
            <strong>
              {chef.matchedDishCount}/{chef.totalRequestedDishCount}
            </strong>
          </div>
          <div className="mc-progress-track">
            <div
              className="mc-progress-fill"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className="mc-chef-detail">
        {chef.matchedDishes.length > 0 && (
          <div className="mc-dish-section">
            <h4 className="mc-dish-section__title mc-dish-section__title--matched">
              <i className="fa-solid fa-circle-check" /> Món có thể nấu (
              {chef.matchedDishes.length})
            </h4>
            <ul className="mc-dish-list">
              {chef.matchedDishes.map((d) => (
                <li
                  key={d.dishId}
                  className="mc-dish-item mc-dish-item--matched"
                >
                  <i className="fa-solid fa-check" />
                  <span>{d.dishName}</span>
                  <span className="mc-dish-qty">×{d.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {chef.unmatchedDishes.length > 0 && (
          <div className="mc-dish-section" style={{ marginTop: "12px" }}>
            <h4 className="mc-dish-section__title mc-dish-section__title--unmatched">
              <i className="fa-solid fa-circle-xmark" /> Chưa có (
              {chef.unmatchedDishes.length})
            </h4>
            <ul className="mc-dish-list">
              {chef.unmatchedDishes.map((d) => (
                <li
                  key={d.dishId}
                  className="mc-dish-item mc-dish-item--unmatched"
                >
                  <i className="fa-solid fa-minus" />
                  <span>{d.dishName}</span>
                  <span className="mc-dish-qty">×{d.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mc-chef-actions">
          <button className="mc-btn mc-btn--outline">
            <i className="fa-solid fa-user" /> Xem hồ sơ
          </button>
          <button
            className="mc-btn mc-btn--primary"
            onClick={() => onRequest(chef)}
            disabled={requesting}
          >
            <i className="fa-solid fa-paper-plane" />{" "}
            {requesting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function MatchingChefPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { notify } = useApp();

  const [chefs, setChefs] = useState<MatchingChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [requestingChefId, setRequestingChefId] = useState<number | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    bookingApi
      .getMatchingChefs(bookingId)
      .then((data) => {
        if (!cancelled) setChefs(data);
      })
      .catch(() => {
        if (!cancelled)
          setError("Không thể tải danh sách đầu bếp. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function handleRequest(chef: MatchingChef) {
    if (!bookingId || requestingChefId !== null) return;

    try {
      setRequestingChefId(chef.chefId);
      await bookingApi.sendChefRequest(bookingId, chef.chefId);
      notify(`Đã gửi yêu cầu thành công đến ${chef.fullName}.`, {
        variant: "success",
        title: "Gửi yêu cầu thành công",
      });
      navigate("/");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;

      notify(
        typeof message === "string"
          ? message
          : "Gửi yêu cầu cho đầu bếp thất bại. Vui lòng thử lại.",
        {
          variant: "danger",
          title: "Gửi yêu cầu thất bại",
          delay: 5000,
        },
      );
    } finally {
      setRequestingChefId(null);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      <div className="mc-page">
        <div className="mc-container">
          {/* Breadcrumb */}
          <nav className="mc-breadcrumb" aria-label="Điều hướng">
            <Link to="/">
              <i className="fa-solid fa-house" /> Trang chủ
            </Link>
            <span className="mc-breadcrumb__sep">›</span>
            <Link to="/create-menu">Tạo yêu cầu</Link>
            <span className="mc-breadcrumb__sep">›</span>
            <strong>Kết quả Matching thông minh</strong>

            <span className="mc-breadcrumb__badge">
              <i className="fa-solid fa-shield-halved" /> Ký quỹ bảo vệ 100%
            </span>
          </nav>

          {/* Booking info card */}
          <section className="mc-info-card" aria-label="Thông tin đặt bếp">
            <div className="mc-info-tags">
              {bookingId && (
                <span className="mc-tag mc-tag--outline">
                  MÃ BOOKING: #{bookingId}
                </span>
              )}
              <span className="mc-tag">
                <i className="fa-solid fa-utensils" /> Đặt bếp theo yêu cầu
              </span>
            </div>

            <div className="mc-info-header">
              <h1 className="mc-info-title">
                Khớp lệnh Đầu Bếp Tại Gia theo Yêu Cầu Riêng
              </h1>
            </div>

            <div className="mc-info-note">
              <i className="fa-solid fa-circle-info mc-info-note__icon" />
              <span>
                Hệ thống đã phân tích yêu cầu của bạn và tìm được{" "}
                <strong>{loading ? "..." : chefs.length}</strong> đầu bếp phù
                hợp. Chọn đầu bếp và gửi yêu cầu để bắt đầu bữa ăn.
              </span>
            </div>
          </section>

          {/* Chef list */}
          <div className="mc-chef-list-header">
            <h2 className="mc-section-title">
              <i className="fa-solid fa-award" />
              {loading
                ? "Đang tìm đầu bếp phù hợp…"
                : `${chefs.length} Đầu Bếp Phù Hợp được Tìm Thấy`}
              {!loading && chefs.length > 0 && (
                <span
                  className="mc-badge mc-badge--green"
                  style={{ fontSize: "12px", fontWeight: "normal" }}
                >
                  Đã sẵn sàng nhận bếp
                </span>
              )}
            </h2>
          </div>

          {/* States */}
          {loading && (
            <div>
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mc-empty-state mc-empty-state--error" role="alert">
              <i className="fa-solid fa-triangle-exclamation" />
              <p>{error}</p>
              <button
                className="mc-btn mc-btn--primary"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && chefs.length === 0 && (
            <div className="mc-empty-state" role="status">
              <i className="fa-solid fa-magnifying-glass" />
              <p>
                Chưa tìm thấy đầu bếp nào phù hợp với yêu cầu của bạn trong khu
                vực.
              </p>
              <Link to="/create-menu" className="mc-btn mc-btn--primary">
                Điều chỉnh yêu cầu
              </Link>
            </div>
          )}

          {!loading && !error && chefs.length > 0 && (
            <div>
              {chefs.map((chef, idx) => (
                <ChefCard
                  key={chef.chefId}
                  chef={chef}
                  rank={idx}
                  onRequest={handleRequest}
                  requesting={requestingChefId === chef.chefId}
                />
              ))}
            </div>
          )}

          {/* Benefits section */}
          <h2
            className="mc-section-title"
            style={{ fontSize: "18px", marginTop: "40px" }}
          >
            Cơ Chế Khớp Lệnh &amp; Bảo Vệ Quyền Lợi Gia Chủ
          </h2>
          <p className="mc-benefits-subtitle">
            GO Cook đóng vai trò trung gian bảo chứng độc lập giữa gia đình và
            người nấu
          </p>

          <div className="mc-benefits-grid">
            {[
              {
                icon: "fa-money-bill-shield",
                iconStyle: {},
                title: "Thanh Toán An Toàn 100%",
                desc: "Khoản tiền thanh toán của bạn được khóa an toàn tại ngân hàng. GO Cook chỉ giải ngân cho đầu bếp sau khi bạn đã dùng bữa ngon miệng.",
                point: "Không sợ mất cọc hay bỏ hẹn",
              },
              {
                icon: "fa-stopwatch",
                iconStyle: {},
                title: "Cam Kết Đổi Đầu Bếp Trong 30 Phút",
                desc: "Nếu sau khi chat trao đổi bạn cảm thấy không phù hợp, điều phối viên GO Cook sẽ lập tức thay thế mà không phát sinh thêm chi phí.",
                point: "Hoàn tiền 100% nếu hủy trước 4h",
              },
              {
                icon: "fa-shield-heart",
                iconStyle: { background: "#fff4e6", color: "#f59e0b" },
                title: "Bảo Hiểm Bữa Ăn 50 Triệu Đồng",
                desc: "Mỗi mâm cơm do đầu bếp GO Cook thực hiện đều được kích hoạt tự động gói bảo hiểm rủi ro an toàn thực phẩm từ Bảo Việt.",
                point: "Hợp đồng bảo hiểm điện tử đính kèm",
              },
            ].map((b) => (
              <div className="mc-benefit-card" key={b.title}>
                <div className="mc-benefit-icon" style={b.iconStyle}>
                  <i className={`fa-solid ${b.icon}`} />
                </div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
                <ul>
                  <li>
                    <i className="fa-solid fa-check" /> {b.point}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── scoped CSS (injected via <style>) ───────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.mc-page {
  font-family: "Inter", sans-serif;
  background: #f8f7f2;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.mc-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}

/* ── Breadcrumb ── */
.mc-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 18px 0 14px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}
.mc-breadcrumb a { color: #6b7280; text-decoration: none; }
.mc-breadcrumb a:hover { color: #297a38; }
.mc-breadcrumb strong { color: #1f2937; }
.mc-breadcrumb__sep { color: #d1d5db; }
.mc-breadcrumb__badge {
  margin-left: auto;
  background: #eef7ee;
  border: 1px solid #c3e2c3;
  color: #297a38;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ── Info card ── */
.mc-info-card {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.mc-info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.mc-tag {
  background: #eef7ee;
  color: #297a38;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.mc-tag--outline {
  background: transparent;
  border: 1px solid #297a38;
}
.mc-info-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}
.mc-info-note {
  background: #fff9e6;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.mc-info-note__icon { color: #f59e0b; margin-top: 2px; }

/* ── Section title ── */
.mc-section-title {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 18px;
}
.mc-chef-list-header { margin-top: 8px; }

.mc-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.mc-badge--green {
  background: #eef7ee;
  color: #297a38;
  border: 1px solid #c3e2c3;
}

/* ── Chef card ── */
.mc-chef-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
  margin-bottom: 18px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 260px 1fr;
}
.mc-chef-card--best {
  border: 2px solid #297a38;
  background: #fcfffc;
}

/* Best banner */
.mc-best-banner {
  grid-column: 1 / -1;
  background: #297a38;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Profile column */
.mc-chef-profile {
  padding: 20px 20px 20px 24px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mc-chef-card--best .mc-chef-profile {
  background: #f4fbf4;
}
.mc-avatar-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
}
.mc-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,.12);
}
.mc-avatar-fallback {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #297a38, #4ade80);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,.12);
  user-select: none;
}
.mc-top-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  background: #297a38;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  border: 2px solid #fff;
  letter-spacing: .5px;
}
.mc-chef-name {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.mc-match-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  color: #374151;
}
.mc-match-badge--best {
  background: #eef7ee;
  color: #297a38;
  border-color: #c3e2c3;
}
.mc-chef-bio {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
  font-style: italic;
}
.mc-chef-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mc-progress-row { margin-top: 4px; }
.mc-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}
.mc-progress-track {
  height: 7px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.mc-progress-fill {
  height: 100%;
  background: #297a38;
  border-radius: 4px;
  transition: width .4s ease;
}

/* Content column */
.mc-chef-detail {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

/* Dish sections */
.mc-dish-section__title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.mc-dish-section__title--matched { color: #297a38; }
.mc-dish-section__title--unmatched { color: #9ca3af; }

.mc-dish-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.mc-dish-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid;
}
.mc-dish-item--matched {
  background: #eef7ee;
  border-color: #c3e2c3;
  color: #1f5c28;
}
.mc-dish-item--matched i { color: #297a38; }
.mc-dish-item--unmatched {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #6b7280;
}
.mc-dish-qty {
  opacity: .7;
  font-weight: 400;
}

/* Actions */
.mc-chef-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 20px;
}

/* Buttons */
.mc-btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: opacity .15s, transform .1s;
  text-decoration: none;
}
.mc-btn:hover { opacity: .88; }
.mc-btn:active { transform: scale(.97); }
.mc-btn--primary {
  background: #297a38;
  color: #fff;
}
.mc-btn--outline {
  background: #fff;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

/* ── Empty / Error states ── */
.mc-empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
}
.mc-empty-state i {
  font-size: 40px;
  color: #9ca3af;
  margin-bottom: 16px;
  display: block;
}
.mc-empty-state p {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 15px;
}
.mc-empty-state--error i { color: #ef4444; }

/* ── Skeleton loader ── */
.mc-skeleton-card {
  display: flex !important;
  grid-template-columns: unset !important;
  gap: 20px;
  padding: 24px;
  pointer-events: none;
}
.mc-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: mc-shimmer 1.3s infinite;
  border-radius: 8px;
}
.mc-skeleton-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mc-skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}
.mc-skeleton-title { height: 18px; width: 60%; }
.mc-skeleton-line  { height: 13px; width: 90%; }
.mc-skeleton-short { width: 40%; }
@keyframes mc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Benefits ── */
.mc-benefits-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
  margin-top: -10px;
}
.mc-benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 40px;
}
.mc-benefit-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
}
.mc-benefit-icon {
  width: 42px;
  height: 42px;
  background: #eef7ee;
  color: #297a38;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 14px;
}
.mc-benefit-card h4 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.mc-benefit-card p {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 14px;
}
.mc-benefit-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #297a38;
  font-weight: 600;
}
.mc-benefit-card ul li {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Responsive ── */
@media (max-width: 720px) {
  .mc-chef-card {
    grid-template-columns: 1fr;
  }
  .mc-chef-profile {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  .mc-benefits-grid {
    grid-template-columns: 1fr;
  }
  .mc-chef-actions {
    flex-direction: column;
  }
  .mc-btn { justify-content: center; }
}
`;
