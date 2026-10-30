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
    .menu-table-wrapper {
        width: 100%;
        overflow-x: auto;
        transition: opacity .15s;
    }
    .menu-table-wrapper table.dataTable {
        min-width: 800px;
        width: max-content;
    }
    .menu-table-wrapper table.dataTable th,
    .menu-table-wrapper table.dataTable td {
        white-space: nowrap;
        vertical-align: middle;
        padding: 8px 12px;
    }
    .menu-table-wrapper table.dataTable td .d-flex {
        flex-wrap: nowrap;
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
        border-radius: 10px;
        width: 100%;
        max-width: 560px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    }
    .menu-modal-header, .menu-modal-footer {
        padding: 12px 16px;
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
        padding: 16px;
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
        {title: 'ID', data: 'id', width: '50px'},
        {title: 'Ảnh', data: 'imageUrls', orderable: false, searchable: false, width: '90px'},
        {title: 'Tên menu', data: 'name', width: '180px'},
        {title: 'Giá', data: 'tempPrice', width: '110px'},
        {title: 'Trạng thái', data: 'status', width: '110px'},
        {title: 'Hành động', data: 'id', orderable: false, searchable: false, width: '190px'},
    ];

    const pageNumbers = (() => {
        const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        const end = Math.min(totalPages, start + 4);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })();

    return (
        <SellerWorkspace>
            <h2>Quản lý Menu</h2>

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
                            <img
                                src={urls?.[0]}
                                alt="menu"
                                style={{width: 80, height: 48, objectFit: 'cover', borderRadius: 4}}
                            />
                        ),
                        3: (price: number) => formatPrice(price),
                        4: (status: MenuStatus, _: unknown, row: MenuRow) => (
                            <select
                                className="form-select form-select-sm"
                                value={status}
                                onChange={e => handleStatusChange(row.id, e.target.value as MenuStatus)}
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        ),
                        5: (_id: number, __: unknown, row: MenuRow) => (
                            <div className="d-flex gap-1">
                                <button
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                    title="Xem chi tiết"
                                    onClick={() => setSelectedMenu(row)}
                                >
                                    <i className="bi bi-eye"></i>
                                    <span>Xem</span>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                                    title="Thêm ảnh"
                                    onClick={() => setUploadTarget(row)}
                                >
                                    <i className="bi bi-image"></i>
                                    <span>Ảnh</span>
                                </button>
                                <button
                                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
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

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                <div className="d-flex align-items-center gap-2">
                    <span>Hiển thị</span>
                    <select
                        className="form-select form-select-sm"
                        style={{width: 80}}
                        value={pageSize}
                        onChange={e => handleChangePageSize(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="text-muted">/ trang (tổng {totalItems})</span>
                </div>

                <div className="d-flex align-items-center gap-1">
                    <button className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage(1)}>
                        <i className="bi bi-chevron-double-left"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage(p => p - 1)}>
                        <i className="bi bi-chevron-left"></i>
                    </button>

                    {pageNumbers.map(n => (
                        <button
                            key={n}
                            className={`btn btn-sm ${n === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                            disabled={loading}
                            onClick={() => setCurrentPage(n)}
                        >
                            {n}
                        </button>
                    ))}

                    <button className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage(p => p + 1)}>
                        <i className="bi bi-chevron-right"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage(totalPages)}>
                        <i className="bi bi-chevron-double-right"></i>
                    </button>
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