import { useState } from 'react';
import type { CatalogMenu } from '../../home/catalogData';
import { displayPrice } from '../../home/catalogData';

interface MenuDetailBookingWidgetProps {
    menu: CatalogMenu;
}

const TODAY_LABEL = 'Hôm nay';
const TOMORROW_LABEL = 'Ngày mai';

const TIME_SLOTS = [
    { value: '11:30', label: '11:30', subLabel: 'Bữa trưa', disabled: true },
    { value: '18:30', label: '18:30', subLabel: 'Bữa tối Sum họp', disabled: false },
];

export default function MenuDetailBookingWidget({ menu }: MenuDetailBookingWidgetProps) {
    const [guests, setGuests] = useState(Math.max(menu.minGuests, 4));
    const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'custom'>('today');
    const [selectedTime, setSelectedTime] = useState('18:30');

    const pricePerPerson = menu.referencePrice;
    const total = pricePerPerson * guests;

    function decrement() {
        setGuests((prev) => Math.max(menu.minGuests, prev - 1));
    }

    function increment() {
        setGuests((prev) => Math.min(menu.maxGuests, prev + 1));
    }

    return (
        <div className="mdd-booking">
            {/* Header */}
            <div className="mdd-booking-header">
                <span className="mdd-booking-step-label">Bước 1: Chọn Khẩu phần &amp; Lịch</span>
                <div className="mdd-booking-price-block">
                    <span className="mdd-booking-price">{displayPrice(pricePerPerson)}</span>
                    <span className="mdd-booking-per">/ một người</span>
                </div>
                <h3>Đặt thực đơn này</h3>
            </div>

            {/* Guests */}
            <div className="mdd-booking-guests-row">
                <div>
                    <div className="mdd-booking-guests-title">Số người ăn</div>
                    <div className="mdd-booking-guests-hint">Khuyên dùng {menu.minGuests} - {menu.maxGuests} người</div>
                </div>
                <div className="mdd-booking-stepper">
                    <button type="button" onClick={decrement} disabled={guests <= menu.minGuests} aria-label="Giảm số người">
                        <i className="fa-solid fa-minus" />
                    </button>
                    <span className="mdd-booking-stepper-value">{guests}</span>
                    <button type="button" onClick={increment} disabled={guests >= menu.maxGuests} aria-label="Tăng số người">
                        <i className="fa-solid fa-plus" />
                    </button>
                </div>
            </div>

            {/* Price breakdown */}
            <div className="mdd-booking-breakdown">
                <div className="mdd-booking-row">
                    <span>Giá món ăn &amp; công nấu:</span>
                    <span>{displayPrice(pricePerPerson)} × {guests}</span>
                </div>
                <div className="mdd-booking-row">
                    <span>Đi chợ &amp; thực phẩm tươi sạch:</span>
                    <span className="mdd-breakdown-included">
                        <i className="fa-solid fa-check-circle" /> Đã bao gồm trọn gói
                    </span>
                </div>
                <div className="mdd-booking-row">
                    <span>Dọn dẹp vệ sinh bếp:</span>
                    <span>0đ (Miễn phí đi kèm)</span>
                </div>
            </div>

            <div className="mdd-booking-divider" />

            {/* Total */}
            <div className="mdd-booking-total">
                <span>Tổng cộng tạm tính:</span>
                <span className="mdd-booking-total-price">{displayPrice(total)}</span>
            </div>

            {/* Date selection */}
            <div className="mdd-booking-date-section">
                <label className="mdd-booking-section-label">
                    <i className="fa-regular fa-calendar-check mdd-icon-green" /> Chọn ngày dùng bữa
                </label>
                <div className="mdd-day-grid">
                    {(['today', 'tomorrow', 'custom'] as const).map((day) => (
                        <button
                            key={day}
                            type="button"
                            className={`mdd-day-btn ${selectedDay === day ? 'mdd-day-btn--active' : ''}`}
                            onClick={() => setSelectedDay(day)}
                        >
                            {day === 'today' && <><span>{TODAY_LABEL}</span><small>(Hôm nay)</small></>}
                            {day === 'tomorrow' && <><span>{TOMORROW_LABEL}</span><small>(Ngày mai)</small></>}
                            {day === 'custom' && <><span>Chọn ngày</span><i className="fa-regular fa-calendar" /></>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time selection */}
            <div className="mdd-booking-date-section">
                <label className="mdd-booking-section-label">
                    <i className="fa-regular fa-clock mdd-icon-green" /> Khung giờ bắt đầu ăn
                </label>
                <div className="mdd-time-grid">
                    {TIME_SLOTS.map((slot) => (
                        <button
                            key={slot.value}
                            type="button"
                            disabled={slot.disabled}
                            className={`mdd-time-btn ${!slot.disabled && selectedTime === slot.value ? 'mdd-time-btn--active' : ''} ${slot.disabled ? 'mdd-time-btn--disabled' : ''}`}
                            onClick={() => !slot.disabled && setSelectedTime(slot.value)}
                        >
                            <span>{slot.label}</span>
                            <small>{slot.disabled ? '(Đã qua)' : slot.subLabel}</small>
                        </button>
                    ))}
                </div>
                <p className="mdd-time-hint">
                    <i className="fa-solid fa-circle-info mdd-icon-blue" />
                    Đầu bếp sẽ có mặt sớm 90 phút để chuẩn bị và nấu nướng.
                </p>
            </div>

            {/* Location */}
            <div className="mdd-booking-location">
                <div className="mdd-location-icon-wrap">
                    <i className="fa-solid fa-location-dot" />
                </div>
                <div>
                    <div className="mdd-location-label">Khu vực phục vụ</div>
                    <div className="mdd-location-value">TP. Hồ Chí Minh</div>
                </div>
                <button type="button" className="mdd-location-change">Đổi quận</button>
            </div>

            {/* CTA */}
            <button type="button" className="mdd-booking-cta">
                Tiếp tục: Chọn địa chỉ &amp; Thanh toán <i className="fa-solid fa-arrow-right" />
            </button>
            <p className="mdd-booking-disclaimer">
                <i className="fa-solid fa-shield-cat" />
                Chưa trừ tiền ngay. Chỉ giải ngân sau khi bạn đã hài lòng trọn vẹn với bữa ăn.
            </p>
        </div>
    );
}
