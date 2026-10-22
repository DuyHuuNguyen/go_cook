import { useMemo, useState } from "react";
import axios from "axios";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.css";
import "../../styles/adminDataTable.css";
import { ArrowClockwise } from "react-bootstrap-icons";
import { adminSections, type AdminRow, type AdminSection } from "../../types/AdminTypes";
import { getAdminTablePage } from "../../clients/AdminClient";

DataTable.use(DT);

type Props = {
    resource: AdminSection;
    initialSearch: string;
    onView: (row: AdminRow) => void;
    revision: number;
};

type DrawRequest = {
    draw: number;
    start: number;
    length: number;
    search?: { value?: string };
    order?: Array<{ column: number; dir: string }>;
};

type DrawResponse = {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: AdminRow[];
};

function escapeText(value: string | null | undefined): string {
    return String(value || "—")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function errorMessage(reason: unknown): string {
    if (axios.isAxiosError(reason)) {
        if (reason.response?.status === 404) return "Backend chưa có API quản trị cho mục này.";
        if (reason.response?.status === 401 || reason.response?.status === 403) {
            return "Tài khoản chưa có quyền đọc dữ liệu này.";
        }
        return "Không thể tải dữ liệu từ Backend.";
    }
    return reason instanceof Error ? reason.message : "Không thể tải dữ liệu.";
}

export default function AdminDataTable({ resource, initialSearch, onView, revision }: Props) {
    const [error, setError] = useState<string | null>(null);
    const section = adminSections[resource];
    const tableKey = `${resource}-${revision}-${initialSearch}`;

    const columns = useMemo(() => [
        ...section.columns.map((column) => ({
            data: column.key,
            title: column.label,
            defaultContent: "—",
            render: (value: string | null | undefined) => escapeText(value),
        })),
        { data: "id", title: "Thao tác", orderable: false, searchable: false },
    ], [section]);

    const options = useMemo(() => ({
        serverSide: true,
        processing: true,
        pageLength: 10,
        lengthMenu: [10, 20, 50],
        order: [] as Array<[number, "asc" | "desc"]>,
        search: { search: initialSearch },
        searchDelay: 400,
        autoWidth: false,
        language: {
            search: "Tìm kiếm:",
            lengthMenu: "Hiển thị _MENU_ dòng",
            info: "Hiển thị _START_–_END_ / _TOTAL_ bản ghi",
            infoEmpty: "Chưa có dữ liệu",
            infoFiltered: "",
            zeroRecords: "Không tìm thấy kết quả",
            emptyTable: "Chưa có dữ liệu",
            processing: "Đang tải...",
            paginate: { first: "Đầu", last: "Cuối", previous: "Trước", next: "Sau" },
        },
        ajax: (request: DrawRequest, callback: (response: DrawResponse) => void) => {
            const pageSize = request.length > 0 ? request.length : 10;
            const page = Math.floor(request.start / pageSize) + 1;
            const sortColumn = request.order?.[0];
            const sortBy = sortColumn && section.columns[sortColumn.column]
                ? section.columns[sortColumn.column].key : "";
            const direction = sortColumn?.dir === "desc" ? "desc" : "asc";

            void getAdminTablePage(
                resource,
                page,
                pageSize,
                request.search?.value || "",
                sortBy,
                direction,
            ).then((result) => {
                setError(null);
                callback({
                    draw: request.draw,
                    recordsTotal: result.recordsTotal,
                    recordsFiltered: result.recordsFiltered,
                    data: result.rows,
                });
            }).catch((reason: unknown) => {
                setError(errorMessage(reason));
                callback({ draw: request.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
            });
        },
    }), [resource, section, initialSearch]);

    const slots = useMemo(() => ({
        [section.columns.length]: (_value: unknown, row: AdminRow) => (
            <button className="gca-table-action" type="button" onClick={() => onView(row)}>
                Xem
            </button>
        ),
    }), [section, onView]);

    return (
        <div className="gca-datatables">
            {error && (
                <div className="gca-table-error" role="alert">
                    <span>{error}</span>
                    <button className="gca-btn gca-btn-outline" type="button"
                        onClick={() => setError(null)}>
                        <ArrowClockwise size={14} /> Đóng
                    </button>
                </div>
            )}
            <div className="gca-table-wrap">
                <DataTable key={tableKey} className="table table-striped table-hover gca-table"
                    columns={columns} options={options} slots={slots}>
                    <thead>
                        <tr>
                            {section.columns.map((column) => <th key={column.key}>{column.label}</th>)}
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                </DataTable>
            </div>
        </div>
    );
}
