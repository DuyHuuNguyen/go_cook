import {SellerWorkspace} from "../../components/seller/SellerWorkspace.tsx";
import DataTable from 'datatables.net-react';
import DtCore from 'datatables.net-dt';
import 'datatables.net-dt/css';
import {useEffect, useState} from "react";
import {UploadMenuImageModal} from "../../components/seller/UploadMenuImageModal.tsx";
import {useNavigate} from "react-router";

DataTable.use(DtCore);

const API_URL = 'http://localhost:8083/api/v1/menus/chef/menus';
const STATUS_OPTIONS = ['ACTIVE', 'DISACTIVE'] as const;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
const DEFAULT_PAGE_SIZE = 30;

type MenuStatus = typeof STATUS_OPTIONS[number];

interface MenuRow {
    id: number;
    name: string;
    description: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    status: MenuStatus;
    createdAt: number;
    category: {id: number; name: string};
    seller: {id: number; username: string; avatarUrl: string};
    dishes: {id: number; name: string}[];
    imageUrls: string[];
}

const formatPrice = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const formatDate = (ts: number) => new Date(ts).toLocaleDateString('vi-VN');

const MODAL_STYLES = `
    .menu-mgmt-card {
        background: #fff;
        border: 1px solid #e5e6dc;
        border-radius: 16px;
        padding: 20px 24px;
        box-shadow: 0 4px 20px rgba(40, 61, 20, 0.05);
    }
    .menu-mgmt-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid #eef0e8;
    }
    .menu-mgmt-title {
        font-size: 20px;
        font-weight: 700;
        color: #1c1c17;
        margin: 0;
    }
    .menu-mgmt-subtitle {
        font-size: 13px;
        color: #65695e;
        margin-top: 2px;
    }
    .menu-table-wrapper {
        width: 100%;
        overflow-x: hidden;
        transition: opacity .15s;
    }
    @media (max-width: 768px) {
        .menu-table-wrapper {
            overflow-x: auto;
        }
    }
    .menu-table-wrapper .dt-container {
        width: 100%;
    }
    .menu-table-wrapper table.dataTable {
        width: 100% !important;
        min-width: 0 !important;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0;
        margin: 0 !important;
    }
    .menu-table-wrapper table.dataTable thead th {
        background: #f6f3ea;
        color: #4b5046;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 12px 10px !important;
        border-bottom: 1px solid #e5e6dc !important;
        white-space: nowrap;
        vertical-align: middle;
    }
    .menu-table-wrapper table.dataTable thead th:first-child {
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        padding-left: 14px !important;
    }
    .menu-table-wrapper table.dataTable thead th:last-child {
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        text-align: right;
        padding-right: 14px !important;
    }
    .menu-table-wrapper table.dataTable tbody td {
        padding: 12px 10px !important;
        vertical-align: middle;
        border-bottom: 1px solid #f0f1ea !important;
        color: #1c1c17;
        font-size: 13.5px;
        white-space: normal;
        word-break: break-word;
    }
    .menu-table-wrapper table.dataTable tbody td:first-child {
        padding-left: 14px !important;
        font-weight: 600;
        color: #65695e;
    }
    .menu-table-wrapper table.dataTable tbody td:last-child {
        padding-right: 14px !important;
        text-align: right;
    }
    .menu-table-wrapper table.dataTable tbody tr:hover td {
        background-color: #fafbf7 !important;
    }
    .menu-thumb {
        width: 68px;
        height: 46px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #e5e6dc;
        background: #f6f3ea;
        display: block;
    }
    .menu-name-cell {
        font-weight: 600;
        color: #1c1c17;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .menu-price-cell {
        font-weight: 700;
        color: #376412;
        white-space: nowrap;
    }
    .menu-status-select {
        width: 100%;
        max-width: 120px;
        padding: 5px 26px 5px 10px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        border: 1px solid #d5dccb !important;
        height: 32px !important;
        min-height: 32px !important;
        line-height: 1.2 !important;
    }
    .menu-status-select.is-active {
        background-color: #edf5e7;
        color: #296218;
        border-color: #c3e2b8 !important;
    }
    .menu-status-select.is-inactive {
        background-color: #f3f4f6;
        color: #6b7280;
        border-color: #d1d5db !important;
    }
    .menu-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        flex-wrap: nowrap;
    }
    .seller-module .menu-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-height: 32px !important;
        height: 32px;
        padding: 0 10px !important;
        font-size: 12.5px !important;
        font-weight: 600;
        border-radius: 8px !important;
        border: 1px solid transparent;
        transition: all 0.15s ease;
        white-space: nowrap;
        transform: none !important;
    }
    .seller-module .menu-action-btn.btn-view {
        background: #f6f3ea;
        color: #3b4036;
        border-color: #e2e4d8;
    }
    .seller-module .menu-action-btn.btn-view:hover {
        background: #eae6d7;
    }
    .seller-module .menu-action-btn.btn-img {
        background: #edf5e7;
        color: #376412;
        border-color: #cfe3c0;
    }
    .seller-module .menu-action-btn.btn-img:hover {
        background: #dfeed4;
    }
    .seller-module .menu-action-btn.btn-edit {
        background: #376412;
        color: #fff;
        border-color: #376412;
    }
    .seller-module .menu-action-btn.btn-edit:hover {
        background: #294d0c;
    }
    .menu-pagination-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid #eef0e8;
        font-size: 13px;
    }
    .menu-pagesize-select {
        width: 72px !important;
        min-height: 32px !important;
        height: 32px !important;
        padding: 4px 24px 4px 10px !important;
        font-size: 13px !important;
        border-radius: 8px !important;
    }
    .seller-module .menu-page-btn {
        min-height: 32px !important;
        height: 32px;
        min-width: 32px;
        padding: 0 10px !important;
        font-size: 13px !important;
        font-weight: 600;
        border-radius: 8px !important;
        border: 1px solid #dde0d5;
        background: #fff;
        color: #3b4036;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transform: none !important;
    }
    .seller-module .menu-page-btn:hover:not(:disabled) {
        background: #f6f3ea;
        border-color: #c8MRb8;
    }
    .seller-module .menu-page-btn.is-current {
        background: #376412;
        color: #fff;
        border-color: #376412;
    }
    .menu-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        padding: 16px;
    }
    .menu-modal {
        background: #fff;
        border-radius: 14px;
        width: 100%;
        max-width: 560px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 16px 40px rgba(0,0,0,.18);
    }
    .menu-modal-header, .menu-modal-footer {
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .menu-modal-header {
        border-bottom: 1px solid #eee;
    }
    .menu-modal-footer {
        border-top: 1px solid #eee;
        justify-content: flex-end;
        gap: 8px;
    }
    .menu-modal-body {
        padding: 20px;
        overflow-y: auto;
    }
`;

export function MenuManagementPage() {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [rows, setRows] = useState<MenuRow[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMenu, setSelectedMenu] = useState<MenuRow | null>(null);
    const [uploadTarget, setUploadTarget] = useState<MenuRow | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_URL}?currentPage=${currentPage}&pageSize=${pageSize}`,
                    {
                        signal: controller.signal,
                        credentials: "include"
                    }
                );
                if (!res.ok) throw new Error(`Lỗi tải dữ liệu (${res.status})`);
                const json = await res.json();

                const payload = json?.data ?? json;
                const list: MenuRow[] = payload?.data ?? payload?.content ?? payload ?? [];

                setRows(Array.isArray(list) ? list : []);
                setTotalPages(payload?.totalPages ?? payload?.totalPage ?? 1);
                setTotalItems(payload?.totalItems ?? payload?.totalElements ?? list.length);
            } catch (e) {
                if ((e as Error).name === 'AbortError') return;
                setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [currentPage, pageSize]);

    const handleChangePageSize = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleStatusChange = (id: number, status: MenuStatus) => {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    };

    const handleEdit = (row: MenuRow) => {
        navigate('/seller/update-menu', {state: {menu: row}});
    };

    const handleImageUploaded = (menuId: number, newUrl: string) => {
        setRows(prev =>
            prev.map(r => (r.id === menuId ? { ...r, imageUrls: [newUrl, ...(r.imageUrls ?? [])] } : r))
        );
    };

    const columns = [
        {title: 'ID', data: 'id', width: '58px'},
        {title: 'Ảnh', data: 'imageUrls', orderable: false, searchable: false, width: '88px'},
        {title: 'Tên thực đơn', data: 'name'},
        {title: 'Giá', data: 'tempPrice', width: '115px'},
        {title: 'Trạng thái', data: 'status', width: '130px'},
        {title: 'Hành động', data: 'id', orderable: false, searchable: false, width: '210px'},
    ];

    const pageNumbers = (() => {
        const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        const end = Math.min(totalPages, start + 4);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })();

    return (
        <SellerWorkspace>
            <div className="menu-mgmt-card">
                <div className="menu-mgmt-header">
                    <div>
                        <h2 className="menu-mgmt-title">Quản lý Menu</h2>
                        <p className="menu-mgmt-subtitle">
                            Danh sách thực đơn của bạn ({totalItems} thực đơn)
                        </p>
                    </div>
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="menu-table-wrapper" style={{opacity: loading ? 0.5 : 1}}>
                    <DataTable
                        data={rows}
                        columns={columns}
                        className="display"
                        options={{
                            autoWidth: false,
                            paging: false,
                            info: false,
                            searching: false,
                        }}
                        slots={{
                            1: (urls: string[]) => (
                                urls?.[0] ? (
                                    <img
                                        src={urls[0]}
                                        alt="menu"
                                        className="menu-thumb"
                                    />
                                ) : (
                                    <div
                                        className="menu-thumb d-flex align-items-center justify-content-center text-muted"
                                        style={{fontSize: 18}}
                                    >
                                        <i className="bi bi-image"></i>
                                    </div>
                                )
                            ),
                            2: (name: string, _: unknown, row: MenuRow) => (
                                <div>
                                    <div className="menu-name-cell" title={name}>{name}</div>
                                    {row?.category?.name && (
                                        <small className="text-muted">{row.category.name}</small>
                                    )}
                                </div>
                            ),
                            3: (price: number) => (
                                <span className="menu-price-cell">{formatPrice(price)}</span>
                            ),
                            4: (status: MenuStatus, _: unknown, row: MenuRow) => (
                                <select
                                    className={`form-select form-select-sm menu-status-select ${
                                        status === 'ACTIVE' ? 'is-active' : 'is-inactive'
                                    }`}
                                    value={status}
                                    onChange={e => handleStatusChange(row.id, e.target.value as MenuStatus)}
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            ),
                            5: (_id: number, __: unknown, row: MenuRow) => (
                                <div className="menu-actions">
                                    <button
                                        type="button"
                                        className="menu-action-btn btn-view"
                                        title="Xem chi tiết"
                                        onClick={() => setSelectedMenu(row)}
                                    >
                                        <i className="bi bi-eye"></i>
                                        <span>Xem</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="menu-action-btn btn-img"
                                        title="Thêm ảnh"
                                        onClick={() => setUploadTarget(row)}
                                    >
                                        <i className="bi bi-image"></i>
                                        <span>Ảnh</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="menu-action-btn btn-edit"
                                        title="Sửa menu"
                                        onClick={() => handleEdit(row)}
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                        <span>Sửa</span>
                                    </button>
                                </div>
                            ),
                        }}
                    />
                </div>

                <div className="menu-pagination-bar">
                    <div className="d-flex align-items-center gap-2">
                        <span>Hiển thị</span>
                        <select
                            className="form-select form-select-sm menu-pagesize-select"
                            value={pageSize}
                            onChange={e => handleChangePageSize(Number(e.target.value))}
                        >
                            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="text-muted">/ trang (tổng {totalItems})</span>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                        <button
                            type="button"
                            className="menu-page-btn"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage(1)}
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            type="button"
                            className="menu-page-btn"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        {pageNumbers.map(n => (
                            <button
                                key={n}
                                type="button"
                                className={`menu-page-btn ${n === currentPage ? 'is-current' : ''}`}
                                disabled={loading}
                                onClick={() => setCurrentPage(n)}
                            >
                                {n}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="menu-page-btn"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            type="button"
                            className="menu-page-btn"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage(totalPages)}
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {selectedMenu && (
                <div className="menu-modal-backdrop" onClick={() => setSelectedMenu(null)}>
                    <div className="menu-modal" onClick={e => e.stopPropagation()}>
                        <div className="menu-modal-header">
                            <h5 className="m-0">Chi tiết menu #{selectedMenu.id}</h5>
                            <button className="btn-close" onClick={() => setSelectedMenu(null)} aria-label="Đóng"/>
                        </div>

                        <div className="menu-modal-body">
                            {selectedMenu.imageUrls?.[0] && (
                                <img
                                    src={selectedMenu.imageUrls[0]}
                                    alt={selectedMenu.name}
                                    style={{width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8}}
                                />
                            )}
                            <h4 className="mt-3">{selectedMenu.name}</h4>
                            <p className="text-muted">{selectedMenu.description}</p>

                            <table className="table table-sm">
                                <tbody>
                                <tr><th>Danh mục</th><td>{selectedMenu.category.name}</td></tr>
                                <tr><th>Người bán</th><td>{selectedMenu.seller.username}</td></tr>
                                <tr><th>Giá tạm tính</th><td>{formatPrice(selectedMenu.tempPrice)}</td></tr>
                                <tr><th>Số khách</th><td>{selectedMenu.minGuests} - {selectedMenu.maxGuests}</td></tr>
                                <tr><th>Trạng thái</th><td>{selectedMenu.status}</td></tr>
                                <tr><th>Ngày tạo</th><td>{formatDate(selectedMenu.createdAt)}</td></tr>
                                </tbody>
                            </table>

                            <h6>Danh sách món ({selectedMenu.dishes.length})</h6>
                            <ul className="mb-0">
                                {selectedMenu.dishes.map(d => <li key={d.id}>{d.name}</li>)}
                            </ul>
                        </div>

                        <div className="menu-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedMenu(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {uploadTarget && (
                <UploadMenuImageModal
                    menuId={uploadTarget.id}
                    menuName={uploadTarget.name}
                    onClose={() => setUploadTarget(null)}
                    onUploaded={handleImageUploaded}
                />
            )}

            <style>{MODAL_STYLES}</style>
        </SellerWorkspace>
    );
}