import { useEffect, useState, type FormEvent } from "react";
import { Container, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Calendar3,
  CheckCircleFill,
  ClipboardCheck,
  Clock,
  EggFried,
  GeoAlt,
  Heart,
  Images,
  People,
  PlusLg,
  ShieldCheck,
  Trash3,
  Wallet2,
} from "react-bootstrap-icons";

import "../../styles/customMenu.css";
import { useCustomMenu } from "../../hooks/useCustomMenu";
import { displayPrice } from "../../components/home/catalogData";
import RequestSummary from "../../components/booking/RequestSummary";
import {
  CreateBookingRequest,
  DishSearchResponse,
  SelectedDish,
} from "../../types/BookingTypes";
import DishPicker from "../../components/booking/DishPicker";
import SelectedDishList from "../../components/booking/SelectedDishList";
import { searchDishes } from "../../clients/DishClient";
import { bookingApi } from "../../clients/BookingClient";
import {
  getWardsByProvince,
  type Province,
  type Ward,
} from "../../clients/LocationClient.tsx";
import getAllProvinces from "../../clients/LocationClient.tsx";

export default function CustomMenu() {
  const form = useCustomMenu();
  const { draft } = form;

  const navigate = useNavigate();

  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProvinces() {
      try {
        setLoadingProvinces(true);
        const response = await getAllProvinces();
        if (active && response.success) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error("Load provinces failed:", error);
      } finally {
        if (active) setLoadingProvinces(false);
      }
    }

    void loadProvinces();
    return () => {
      active = false;
    };
  }, []);

  async function handleProvinceChange(provinceCode: string) {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    form.update("provinceCode", provinceCode);
    form.update(
      "provinceName",
      selectedProvince ? selectedProvince.fullName : "",
    );

    form.update("wardCode", "");
    setWards([]);

    if (!provinceCode) return;

    try {
      setLoadingWards(true);
      const response = await getWardsByProvince(provinceCode);
      if (response.success) {
        setWards(response.data);
      }
    } catch (error) {
      console.error("Load wards failed:", error);
      setSubmitError("Không thể tải danh sách phường/xã. Vui lòng thử lại.");
    } finally {
      setLoadingWards(false);
    }
  }

  const guests = draft.adults;
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  function addDish(dish: DishSearchResponse) {
    setSelectedDishes((current) => {
      // Không thêm trùng món
      if (current.some((item) => item.dishId === dish.id)) {
        return current;
      }

      return [
        ...current,
        {
          dishId: dish.id,
          dishName: dish.name,
          quantity: 1,
        },
      ];
    });
  }

  function changeDishQuantity(dishId: number, quantity: number) {
    if (quantity < 1) return;

    setSelectedDishes((current) =>
      current.map((dish) =>
        dish.dishId === dishId ? { ...dish, quantity } : dish,
      ),
    );
  }

  function removeDish(dishId: number) {
    setSelectedDishes((current) =>
      current.filter((dish) => dish.dishId !== dishId),
    );
  }

  async function handleCreateBooking() {
    if (submitting) return;

    setSubmitError("");

    if (selectedDishes.length === 0) {
      setSubmitError("Vui lòng chọn ít nhất một món ăn.");
      return;
    }

    if (!draft.mealDate || !draft.mealTime) {
      setSubmitError("Vui lòng chọn ngày và giờ dùng bữa.");
      return;
    }

    const scheduledAt = new Date(`${draft.mealDate}T${draft.mealTime}:00`);

    if (
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt.getTime() <= Date.now()
    ) {
      setSubmitError(
        "Thời gian dùng bữa phải là một thời điểm trong tương lai.",
      );
      return;
    }

    // Kiểm tra địa chỉ
    if (!draft.address.trim()) {
      setSubmitError("Vui lòng nhập địa chỉ phục vụ.");
      return;
    }

    if (!draft.provinceCode) {
      setSubmitError("Vui lòng chọn tỉnh/thành phố.");
      return;
    }

    if (!draft.wardCode) {
      setSubmitError("Vui lòng chọn phường/xã.");
      return;
    }

    // Tính tổng số khách
    const guestCount = draft.adults;
    if (guestCount < 1) {
      setSubmitError("Số khách phải lớn hơn 0.");
      return;
    }

    const request: CreateBookingRequest = {
      scheduledAt: scheduledAt.toISOString(),
      serviceAddress: draft.address.trim(),
      customerNote: draft.notes.trim(),
      guestCount,
      dishes: selectedDishes.map((dish) => ({
        dishId: dish.dishId,
        quantity: dish.quantity,
      })),
      provinceCode: draft.provinceCode,
      wardCode: draft.wardCode,
    };

    try {
      setSubmitting(true);

      const booking = await bookingApi.createBooking(request);

      navigate(`/bookings/${booking.id}/matching-chefs`);
    } catch (error) {
      console.error("Create booking failed:", error);
      setSubmitError("Tạo booking thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gcm-page">
      <Container>
        <nav className="gcm-breadcrumb" aria-label="Điều hướng">
          <Link to="/">Trang chủ</Link>
          <span>›</span>
          <span>Tạo yêu cầu theo ngân sách</span>
        </nav>
        <div className="gcm-page-heading">
          <div>
            <span className="gcm-kicker">
              QUY TRÌNH TẠO MÓN RIÊNG · BẠN LÀ NGƯỜI CHỌN
            </span>
            <h1>Tạo Yêu Cầu Nấu Ăn Riêng Theo Khẩu Vị</h1>
            <p>
              Đầu bếp chuẩn bị bữa ăn theo món bạn chọn, số lượng khách và thời
              gian dùng bữa mong muốn.
            </p>
          </div>
        </div>

        <nav className="gcm-steps" aria-label="Các bước tạo yêu cầu">
          <a href="#tao-mon">
            <b>1</b>
            <span>
              <small>BƯỚC 1</small>Chọn món ăn
            </span>
          </a>
          <a href="#so-khach">
            <b>2</b>
            <span>
              <small>BƯỚC 2</small>Chọn số người &amp; Ghi chú
            </span>
          </a>
          <a href="#thoi-gian">
            <b>3</b>
            <span>
              <small>BƯỚC 3</small>Thời gian &amp; Gian bếp
            </span>
          </a>
          <a href="#ngan-sach">
            <b>4</b>
            <span>
              <small>BƯỚC 4</small>Kiểm tra lại yêu cầu &amp; Gửi đơn
            </span>
          </a>
        </nav>

        <div className="gcm-layout">
          <div className="gcm-form-column">
            <section className="gcm-panel" id="tao-mon">
              <div className="gcm-panel-heading">
                <div className="gcm-heading-icon green">
                  <EggFried />
                </div>
                <div>
                  <h2>Chọn món ăn</h2>
                  <p>
                    Tìm món ăn có sẵn trong hệ thống và thêm vào yêu cầu của
                    bạn.
                  </p>
                </div>
              </div>

              <DishPicker
                searchDishes={searchDishes}
                selectedDishIds={selectedDishes.map((dish) => dish.dishId)}
                onAdd={addDish}
              />

              <div className="selected-dishes-section">
                <h3>Món ăn đã chọn ({selectedDishes.length})</h3>

                <SelectedDishList
                  dishes={selectedDishes}
                  onChangeQuantity={changeDishQuantity}
                  onRemove={removeDish}
                />
              </div>
            </section>

            <section className="gcm-panel" id="so-khach">
              <div className="gcm-panel-heading">
                <div className="gcm-heading-icon green">
                  <People />
                </div>
                <div>
                  <h2>Chọn số lượng người ăn &amp; Ghi chú</h2>
                  <p>Đầu bếp tính toán phần ăn theo số khách thực tế.</p>
                </div>
              </div>
              <div className="gcm-guest-grid">
                <div className="gcm-guest-card">
                  <span>Tổng số khách</span>
                  <strong>{guests}</strong>
                  <small>{guests} người sẽ dùng bữa</small>
                </div>
                <div className="gcm-guest-card">
                  <span>Số người ăn</span>
                  <div className="gcm-guest-counter">
                    <button
                      type="button"
                      onClick={() => form.changeGuests(-1)}
                      disabled={draft.adults === 0}
                      aria-label="Giảm số người ăn"
                    >
                      −
                    </button>
                    <strong>{draft.adults}</strong>
                    <button
                      type="button"
                      onClick={() => form.changeGuests(1)}
                      aria-label="Tăng số người ăn"
                    >
                      +
                    </button>
                  </div>
                  <small>
                    Khẩu phần ăn được tính theo tiêu chuẩn người trưởng thành.
                  </small>
                </div>
              </div>
              <label className="gcm-field-label" htmlFor="gcm-notes">
                Ghi chú dị ứng hoặc kiêng khem của gia đình:
              </label>
              <textarea
                id="gcm-notes"
                rows={3}
                maxLength={1200}
                value={draft.notes}
                onChange={(event) => form.update("notes", event.target.value)}
                placeholder="Ví dụ: không ăn đậu phộng, ít cay, dị ứng tôm..."
              />
            </section>

            <section className="gcm-panel" id="thoi-gian">
              <div className="gcm-panel-heading">
                <div className="gcm-heading-icon green">
                  <Calendar3 />
                </div>
                <div>
                  <h2>Thời gian &amp; Cơ sở gian bếp của bạn</h2>
                  <p>Ghi rõ địa điểm để đầu bếp chủ động sắp xếp công việc.</p>
                </div>
              </div>
              <div className="gcm-field-grid">
                <label htmlFor="gcm-meal-date">
                  Ngày dùng bữa
                  <input
                    id="gcm-meal-date"
                    type="date"
                    min={today}
                    value={draft.mealDate}
                    onChange={(event) =>
                      form.update("mealDate", event.target.value)
                    }
                    required
                  />
                </label>

                <label htmlFor="gcm-meal-time">
                  Giờ dùng bữa dự kiến
                  <input
                    id="gcm-meal-time"
                    type="time"
                    step={60}
                    value={draft.mealTime}
                    onChange={(event) =>
                      form.update("mealTime", event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <div className="gcm-location-grid">
                <label htmlFor="gcm-province">
                  Tỉnh/thành phố
                  <select
                    id="gcm-province"
                    value={draft.provinceCode}
                    onChange={(event) =>
                      void handleProvinceChange(event.target.value)
                    }
                    disabled={loadingProvinces}
                    required
                  >
                    <option value="">
                      {loadingProvinces
                        ? "Đang tải tỉnh/thành phố..."
                        : "Chọn tỉnh/thành phố"}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <label htmlFor="gcm-ward">
                  Phường/xã
                  <select
                    id="gcm-ward"
                    value={draft.wardCode}
                    onChange={(event) =>
                      form.update("wardCode", event.target.value)
                    }
                    disabled={!draft.provinceCode || loadingWards}
                    required
                  >
                    <option value="">
                      {loadingWards
                        ? "Đang tải phường/xã..."
                        : "Chọn phường/xã"}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.fullName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="gcm-field-label" htmlFor="gcm-address">
                Địa chỉ cần nấu / nhà riêng:
              </label>

              <div className="gcm-address-input">
                <GeoAlt size={19} />

                <input
                  id="gcm-address"
                  type="text"
                  value={draft.address}
                  maxLength={240}
                  onChange={(event) =>
                    form.update("address", event.target.value)
                  }
                  placeholder="Số nhà, tên đường"
                  required
                />
              </div>
              <p className="gcm-tip">
                <CheckCircleFill /> Đầu bếp sẽ trao đổi thêm về nguyên liệu và
                dụng cụ sau khi nhận được yêu cầu.
              </p>
            </section>

            {form.message && (
              <div className="gcm-mobile-message" role="alert">
                {form.message}
              </div>
            )}
          </div>
          <RequestSummary
            draft={draft}
            selectedDishes={selectedDishes}
            message={submitError || form.message}
            onCreateBooking={handleCreateBooking}
            submitting={submitting}
          />
        </div>
      </Container>
    </div>
  );
}
