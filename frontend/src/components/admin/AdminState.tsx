import { ArrowClockwise } from "react-bootstrap-icons";

type Props = { type: "loading" | "error" | "empty"; message?: string | null; retry?: () => void };

export default function AdminState({ type, message, retry }: Props) {
    return <div className="gca-state" role={type === "error" ? "alert" : "status"}>
        <span>{type === "loading" ? "Đang tải..." : type === "error" ? message || "Không thể tải dữ liệu." : "Chưa có dữ liệu"}</span>
        {type === "error" && retry && <button type="button" className="gca-btn gca-btn-outline" onClick={retry}><ArrowClockwise size={14}/> Thử lại</button>}
    </div>;
}
