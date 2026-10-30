import {
  ArrowClockwise,
  Inbox,
  ExclamationTriangle,
  HourglassSplit,
} from "react-bootstrap-icons";

type Props = {
  type: "loading" | "error" | "empty";
  message?: string | null;
  retry?: () => void;
};

export default function AdminState({ type, message, retry }: Props) {
  return (
    <div className="gca-state" role={type === "error" ? "alert" : "status"}>
      <span className="gca-state-icon" aria-hidden="true">
        {type === "loading" ? (
          <HourglassSplit size={24} />
        ) : type === "error" ? (
          <ExclamationTriangle size={24} />
        ) : (
          <Inbox size={24} />
        )}
      </span>
      <strong>
        {type === "loading"
          ? "Đang tải dữ liệu"
          : type === "error"
            ? "Chưa thể tải dữ liệu"
            : "Chưa có bản ghi"}
      </strong>
      <p>
        {type === "loading"
          ? "Đang tải..."
          : type === "error"
            ? message || "Không thể tải dữ liệu."
            : "Dữ liệu sẽ hiển thị khi có bản ghi từ nguồn hiện tại."}
      </p>
      {type === "error" && retry && (
        <button
          type="button"
          className="gca-btn gca-btn-outline"
          onClick={retry}
        >
          <ArrowClockwise size={14} /> Thử lại
        </button>
      )}
    </div>
  );
}
