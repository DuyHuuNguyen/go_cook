import { useEffect, useState } from "react";
import axios from "axios";
import { getAdminRoles, getAdminSettings, updateAdminSettings } from "../../clients/AdminClient";
import AdminState from "../../components/admin/AdminState";

type Settings = { siteName: string; supportEmail: string; commissionRate: string; maintenanceMode: boolean };
const blank: Settings = { siteName: "", supportEmail: "", commissionRate: "", maintenanceMode: false };

export default function AdminSettings() {
    const [tab, setTab] = useState<"general" | "roles">("general");
    const [settings, setSettings] = useState<Settings>(blank);
    const [hasSettings, setHasSettings] = useState(false);
    const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setNotice("");
        if (tab === "roles") {
            getAdminRoles(controller.signal)
                .then((data) => { if (!controller.signal.aborted) setRoles(data); })
                .catch((reason: unknown) => { if (!controller.signal.aborted && !(axios.isAxiosError(reason) && reason.response?.status === 404)) setError("Không thể tải vai trò."); })
                .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        } else {
            getAdminSettings(controller.signal)
                .then((data) => {
                    if (controller.signal.aborted) return;
                    setSettings({
                        siteName: String(data.siteName ?? ""),
                        supportEmail: String(data.supportEmail ?? ""),
                        commissionRate: data.commissionRate == null ? "" : String(data.commissionRate),
                        maintenanceMode: data.maintenanceMode === true,
                    });
                    setHasSettings(true);
                })
                .catch((reason: unknown) => { if (!controller.signal.aborted && !(axios.isAxiosError(reason) && reason.response?.status === 404)) setError("Không thể tải cài đặt."); })
                .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        }
        return () => controller.abort();
    }, [tab]);

    async function save(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");
        try {
            await updateAdminSettings({
                siteName: settings.siteName.trim(),
                supportEmail: settings.supportEmail.trim(),
                commissionRate: settings.commissionRate ? Number(settings.commissionRate) : null,
                maintenanceMode: settings.maintenanceMode,
            });
            setNotice("Đã lưu cài đặt.");
        } catch (reason) {
            setError(axios.isAxiosError(reason) && reason.response?.status === 404 ? "Chức năng chưa có API." : "Không thể lưu cài đặt.");
        } finally {
            setSaving(false);
        }
    }

    return <div className="gca-page">
        <div className="gca-page-heading"><h1>Cài đặt hệ thống</h1></div>
        <div className="gca-settings-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "general"} className={tab === "general" ? "is-active" : ""} onClick={() => setTab("general")}>Cài đặt chung</button>
            <button type="button" role="tab" aria-selected={tab === "roles"} className={tab === "roles" ? "is-active" : ""} onClick={() => setTab("roles")}>Vai trò</button>
        </div>
        <section className="gca-panel gca-settings-panel">
            {tab === "roles" ? <>
                <div className="gca-panel-title"><h2>Danh sách vai trò</h2></div>
                {loading || error || !roles.length ? <AdminState type={loading ? "loading" : error ? "error" : "empty"} message={error}/> :
                    <div className="gca-table-wrap"><table className="gca-table"><thead><tr><th>Mã</th><th>Tên vai trò</th></tr></thead><tbody>{roles.map((role) => <tr key={role.id}><td>{role.id}</td><td>{role.name}</td></tr>)}</tbody></table></div>}
            </> : <>
                <div className="gca-panel-title"><h2>Thông tin hệ thống</h2></div>
                {loading || (!hasSettings && !error) ? <AdminState type={loading ? "loading" : "empty"}/> : hasSettings ? (
                    <form className="gca-settings-form" onSubmit={(event) => void save(event)}>
                        <div className="gca-field-grid">
                            <label>Tên hệ thống<input value={settings.siteName} onChange={(event) => setSettings((current) => ({...current, siteName: event.target.value}))} required/></label>
                            <label>Email hỗ trợ<input type="email" value={settings.supportEmail} onChange={(event) => setSettings((current) => ({...current, supportEmail: event.target.value}))}/></label>
                            <label>Phí dịch vụ (%)<input type="number" min={0} max={100} step={0.1} value={settings.commissionRate} onChange={(event) => setSettings((current) => ({...current, commissionRate: event.target.value}))}/></label>
                            <label className="gca-checkbox-label"><input type="checkbox" checked={settings.maintenanceMode} onChange={(event) => setSettings((current) => ({...current, maintenanceMode: event.target.checked}))}/> Bảo trì hệ thống</label>
                        </div>
                        {error && <p className="gca-form-error" role="alert">{error}</p>}
                        {notice && <p className="gca-form-success" role="status">{notice}</p>}
                        <button className="gca-btn gca-btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                    </form>
                ) : <AdminState type="error" message={error}/>}
            </>}
        </section>
    </div>;
}
