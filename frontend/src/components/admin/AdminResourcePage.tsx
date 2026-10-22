import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import { adminSections, type AdminRow, type AdminSection } from "../../types/AdminTypes";
import { clearAdminTableCache } from "../../clients/AdminClient";
import AdminDataTable from "./AdminDataTable";
import AdminActionPanel from "./AdminActionPanel";

type Props = { resource: AdminSection };

export default function AdminResourcePage({ resource }: Props) {
    const section = adminSections[resource];
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState<AdminRow | null>(null);
    const [editing, setEditing] = useState<AdminRow | "new" | null>(null);

    useEffect(() => {
        setSelected(null);
        setEditing(null);
    }, [resource]);

    const reload = useCallback(() => {
        clearAdminTableCache(resource);
        setRevision((current) => current + 1);
    }, [resource]);

    return (
        <div className="gca-page">
            <div className="gca-page-heading">
                <h1>{section.title}</h1>
                <div className="gca-heading-buttons">
                    <button type="button" className="gca-btn gca-btn-outline" onClick={reload}>
                        <ArrowClockwise size={15}/> Làm mới
                    </button>
                    {(resource === "categories" || resource === "dishes") && (
                        <button type="button" className="gca-btn gca-btn-primary" onClick={() => setEditing("new")}>Thêm mới</button>
                    )}
                </div>
            </div>
            <section className="gca-panel">
                <AdminDataTable key={`${resource}-${revision}-${query}`} resource={resource}
                    initialSearch={query} revision={revision} onView={setSelected}/>
            </section>
            {selected && (
                <div className="gca-dialog-backdrop" role="presentation" onClick={() => setSelected(null)}>
                    <section className="gca-detail-drawer" role="dialog" aria-modal="true" aria-label="Chi tiết" onClick={(event) => event.stopPropagation()}>
                        <div className="gca-drawer-head">
                            <h2>{selected.name}</h2>
                            <button type="button" onClick={() => setSelected(null)} aria-label="Đóng"><XLg size={20}/></button>
                        </div>
                        <dl>
                            {section.columns.map((column) => (
                                <div key={column.key}>
                                    <dt>{column.label}</dt>
                                    <dd>{selected[column.key] || "—"}</dd>
                                </div>
                            ))}
                            {selected.description && <div><dt>Mô tả</dt><dd>{selected.description}</dd></div>}
                        </dl>
                        <div className="gca-heading-buttons">
                            <button type="button" className="gca-btn gca-btn-outline" onClick={() => setSelected(null)}>Đóng</button>
                            <button type="button" className="gca-btn gca-btn-primary" onClick={() => { setEditing(selected); setSelected(null); }}>Chỉnh sửa</button>
                        </div>
                    </section>
                </div>
            )}
            {editing && (
                <AdminActionPanel key={`${resource}-${editing === "new" ? "new" : editing.id}`}
                    resource={resource} record={editing === "new" ? null : editing}
                    onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }}/>
            )}
        </div>
    );
}
