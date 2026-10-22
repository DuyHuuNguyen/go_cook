import { useState } from "react";
import axios from "axios";
import { XLg } from "react-bootstrap-icons";
import { saveAdminRecord } from "../../clients/AdminClient";
import { type AdminRow, type AdminSection } from "../../types/AdminTypes";

type Props = { resource: AdminSection; record: AdminRow | null; onClose: () => void; onSaved: () => void };

type ActionInfo = { title: string; field: string; key: string; options?: string[] };
const actions: Record<AdminSection, ActionInfo> = {
    users: { title: "Phân quyền", field: "Vai trò", key: "role", options: ["ROLE_USER", "ROLE_CHEF", "ROLE_SYSTEM_ADMIN"] },
    chefs: { title: "Duyệt đầu bếp", field: "Trạng thái", key: "status", options: ["PENDING", "APPROVED", "REJECTED"] },
    menus: { title: "Duyệt thực đơn", field: "Trạng thái", key: "status", options: ["PENDING", "ACTIVE", "INACTIVE"] },
    dishes: { title: "Món ăn", field: "Tên món", key: "name" },
    categories: { title: "Danh mục", field: "Tên danh mục", key: "name" },
    bookings: { title: "Cập nhật đơn", field: "Trạng thái", key: "status", options: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
    requests: { title: "Cập nhật yêu cầu", field: "Trạng thái", key: "status", options: ["PENDING", "PROCESSING", "RESPONDED", "CLOSED"] },
    payments: { title: "Đối soát", field: "Trạng thái", key: "status", options: ["PENDING", "RECONCILED", "FAILED"] },
    feedback: { title: "Phản ánh", field: "Trạng thái", key: "status", options: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] },
};

export default function AdminActionPanel({ resource, record, onClose, onSaved }: Props) {
    const info = actions[resource];
    const [value, setValue] = useState(record?.[info.key] || "");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!value.trim()) return;
        setSaving(true);
        setError("");
        const payload: Record<string, string> = { [info.key]: value.trim() };
        if (note.trim()) payload.note = note.trim();
        try {
            await saveAdminRecord(resource, record?.id || null, payload);
            onSaved();
        } catch (reason) {
            if (axios.isAxiosError(reason)) {
                setError(reason.response?.status === 404 ? "Chức năng chưa có API." : reason.response?.status === 403 ? "Không có quyền thực hiện thao tác này." : "Không thể lưu thay đổi.");
            } else {
                setError("Không thể lưu thay đổi.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="gca-dialog-backdrop" role="presentation" onClick={onClose}>
            <section className="gca-detail-drawer" role="dialog" aria-modal="true" aria-label={info.title} onClick={(event) => event.stopPropagation()}>
                <div className="gca-drawer-head"><h2>{info.title}</h2><button onClick={onClose} type="button" aria-label="Đóng"><XLg size={20}/></button></div>
                {record && <p className="gca-action-record">{record.name} · #{record.id}</p>}
                <form className="gca-action-form" onSubmit={(event) => void submit(event)}>
                    <label>{info.field}
                        {info.options ? <select required value={value} onChange={(event) => setValue(event.target.value)}><option value="">Chọn trạng thái</option>{info.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                            : <input required maxLength={255} value={value} onChange={(event) => setValue(event.target.value)}/>}
                    </label>
                    <label>Ghi chú<textarea rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)}/></label>
                    {error && <p role="alert" className="gca-form-error">{error}</p>}
                    <div className="gca-action-controls"><button className="gca-btn gca-btn-outline" type="button" onClick={onClose}>Hủy</button><button className="gca-btn gca-btn-primary" disabled={saving || !value.trim()} type="submit">{saving ? "Đang lưu..." : "Lưu"}</button></div>
                </form>
            </section>
        </div>
    );
}
