import { useState } from 'react';

const ALLERGY_OPTIONS = [
    { id: 'reduce-spicy', label: 'Giảm độ cay cho trẻ nhỏ', defaultChecked: true },
    { id: 'less-sweet', label: 'Ít ngọt đường / Chuẩn vị miền Trung', defaultChecked: false },
    { id: 'no-msg', label: 'Không bột ngọt (Chỉ dùng nước hầm xương)', defaultChecked: false },
    { id: 'alt-fish', label: 'Đổi cá bớp sang cá lóc đồng', defaultChecked: false },
];

export default function MenuDetailNotes() {
    const [checked, setChecked] = useState<Record<string, boolean>>(
        Object.fromEntries(ALLERGY_OPTIONS.map((opt) => [opt.id, opt.defaultChecked]))
    );
    const [note, setNote] = useState('');

    function toggle(id: string) {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    return (
        <div className="mdd-notes-section">
            <h3>
                <i className="fa-solid fa-clipboard-list mdd-icon-yellow" />
                Ghi chú lưu ý &amp; Dị ứng thực phẩm
            </h3>
            <p className="mdd-notes-subtitle">
                Khẩu vị mỗi gia đình là độc nhất. Bạn có thể ghi chú cụ thể cho đầu bếp khi xác nhận đặt lệnh.
            </p>
            <div className="mdd-allergy-grid">
                {ALLERGY_OPTIONS.map((opt) => (
                    <label
                        key={opt.id}
                        className={`mdd-allergy-label ${checked[opt.id] ? 'checked' : ''}`}
                        onClick={() => toggle(opt.id)}
                    >
                        <div className={`mdd-checkbox ${checked[opt.id] ? 'mdd-checkbox--checked' : ''}`}>
                            {checked[opt.id] && <i className="fa-solid fa-check" />}
                        </div>
                        <span>{opt.label}</span>
                    </label>
                ))}
            </div>
            <div className="mdd-notes-textarea-wrap">
                <textarea
                    rows={3}
                    placeholder="Nhập ghi chú khác của bạn (VD: Không hành, dị ứng đậu phộng...)"
                    className="mdd-notes-textarea"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
        </div>
    );
}
