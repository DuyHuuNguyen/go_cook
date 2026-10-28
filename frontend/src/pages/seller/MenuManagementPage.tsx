import { SellerWorkspace } from "../../components/seller/SellerWorkspace.tsx";
import DataTable from 'datatables.net-react';
import DtCore from 'datatables.net-dt';
import 'datatables.net-dt/css';
import { useEffect, useState } from "react";
import {UploadMenuImageModal} from "../../components/seller/UploadMenuImageModal.tsx";

DataTable.use(DtCore);

type MenuStatus = 'ACTIVE' | 'DISACTIVE';

interface MenuRow {
    id: number;
    name: string;
    description: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    status: MenuStatus;
    createdAt: number;
    category: { id: number; name: string };
    seller: { id: number; username: string; avatarUrl: string };
    dishes: { id: number; name: string }[];
    imageUrls: string[];
}

const STATUS_OPTIONS: MenuStatus[] = ['ACTIVE', 'DISACTIVE'];
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const API_URL = 'http://localhost:8083/api/v1/menus/chef/menus';

const formatPrice = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const formatDate = (ts: number) => new Date(ts).toLocaleDateString('vi-VN');

export function MenuManagementPage() {

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);

    const [rows, setRows] = useState<MenuRow[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<MenuRow | null>(null);
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

    const handleEdit = (row: MenuRow) => console.log('Edit menu:', row);

    const handleImageUploaded = (menuId: number, newUrl: string) => {
        setRows(prev =>
            prev.map(r => (r.id === menuId ? { ...r, imageUrls: [newUrl, ...(r.imageUrls ?? [])] } : r))
        );
    };

    const columns = [
        { title: 'ID', data: 'id', width: '50px' },
        { title: 'Ảnh', data: 'imageUrls', orderable: false, searchable: false, width: '90px' },
        { title: 'Tên menu', data: 'name', width: '180px' },
        // { title: 'Danh mục', data: 'category.name', width: '110px' },
        // { title: 'Người bán', data: 'seller.username', width: '120px' },
        // { title: 'Món ăn', data: 'dishes', orderable: false, width: '200px' },
        { title: 'Giá', data: 'tempPrice', width: '110px' },
        // { title: 'Số khách', data: 'minGuests', width: '80px' },
        { title: 'Trạng thái', data: 'status', width: '110px' },
        // { title: 'Ngày tạo', data: 'createdAt', width: '90px' },
        { title: 'Hành động', data: 'id', orderable: false, searchable: false, width: '190px' },
    ];

    const pageNumbers = (() => {
        const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        const end = Math.min(totalPages, start + 4);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })();

    return (
        <SellerWorkspace>
            <h2>Quản lý Menu</h2>

            {/* Thông báo lỗi nếu gọi API thất bại */}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            {/* ===== Bảng dữ liệu (làm mờ khi đang load) ===== */}
            <div className="menu-table-wrapper" style={{ opacity: loading ? 0.5 : 1 }}>
                <DataTable
                    data={rows}
                    columns={columns}
                    className="display"
                    options={{
                        autoWidth: false,
                        paging: false,    // tắt phân trang của DataTable, mình tự phân trang bằng server
                        info: false,
                        searching: false, // search của DataTable chỉ lọc trong trang hiện tại nên tắt
                    }}
                    slots={{
                        // Cột 1: Ảnh (lấy ảnh đầu tiên)
                        1: (urls: string[]) => (
                            <img
                                src={urls?.[0]}
                                alt="menu"
                                style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 4 }}
                            />
                        ),

                        // Cột 3: Giá
                        3: (price: number) => formatPrice(price),

                        // Cột 4: Trạng thái (select đổi trực tiếp)
                        4: (status: MenuStatus, _: unknown, row: MenuRow) => (
                            <select
                                className="form-select form-select-sm"
                                value={status}
                                onChange={e => handleStatusChange(row.id, e.target.value as MenuStatus)}
                            >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        ),

                        // Cột 5: Hành động (3 nút: xem / thêm ảnh / sửa)
                        5: (_id: number, __: unknown, row: MenuRow) => (
                            <div className="d-flex gap-1">
                                {/* Xem chi tiết */}
                                <button
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                    title="Xem chi tiết"
                                    onClick={() => setSelected(row)}
                                >
                                    <i className="bi bi-eye"></i>
                                    <span>Xem</span>
                                </button>

                                {/* Thêm ảnh */}
                                <button
                                    className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                                    title="Thêm ảnh"
                                    onClick={() => setUploadTarget(row)}
                                >
                                    <i className="bi bi-image"></i>
                                    <span>Ảnh</span>
                                </button>

                                {/* Sửa */}
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

            {/* ===== Thanh phân trang ===== */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                {/* Chọn số dòng mỗi trang */}
                <div className="d-flex align-items-center gap-2">
                    <span>Hiển thị</span>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 80 }}
                        value={pageSize}
                        onChange={e => handleChangePageSize(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="text-muted">/ trang (tổng {totalItems})</span>
                </div>

                {/* Các nút chuyển trang */}
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

            {/* ===== Modal xem chi tiết menu ===== */}
            {selected && (
                <div className="menu-modal-backdrop" onClick={() => setSelected(null)}>
                    {/* stopPropagation để bấm trong modal không bị đóng */}
                    <div className="menu-modal" onClick={e => e.stopPropagation()}>
                        <div className="menu-modal-header">
                            <h5 className="m-0">Chi tiết menu #{selected.id}</h5>
                            <button className="btn-close" onClick={() => setSelected(null)} aria-label="Đóng" />
                        </div>

                        <div className="menu-modal-body">
                            {selected.imageUrls?.[0] && (
                                <img src={selected.imageUrls[0]} alt={selected.name}
                                     style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                            )}
                            <h4 className="mt-3">{selected.name}</h4>
                            <p className="text-muted">{selected.description}</p>

                            <table className="table table-sm">
                                <tbody>
                                <tr><th>Danh mục</th><td>{selected.category.name}</td></tr>
                                <tr><th>Người bán</th><td>{selected.seller.username}</td></tr>
                                <tr><th>Giá tạm tính</th><td>{formatPrice(selected.tempPrice)}</td></tr>
                                <tr><th>Số khách</th><td>{selected.minGuests} - {selected.maxGuests}</td></tr>
                                <tr><th>Trạng thái</th><td>{selected.status}</td></tr>
                                <tr><th>Ngày tạo</th><td>{formatDate(selected.createdAt)}</td></tr>
                                </tbody>
                            </table>

                            <h6>Danh sách món ({selected.dishes.length})</h6>
                            <ul className="mb-0">
                                {selected.dishes.map(d => <li key={d.id}>{d.name}</li>)}
                            </ul>
                        </div>

                        <div className="menu-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Modal upload ảnh ===== */}
            {uploadTarget && (
                <UploadMenuImageModal
                    menuId={uploadTarget.id}
                    menuName={uploadTarget.name}
                    onClose={() => setUploadTarget(null)}
                    onUploaded={handleImageUploaded}
                />
            )}

            {/* ===== CSS ===== */}
            <style>{`
                /* Bọc bảng: cuộn ngang thay vì làm vỡ layout */
                .menu-table-wrapper { width: 100%; max-width: 100%; overflow-x: auto; transition: opacity .15s; }
                .menu-table-wrapper table.dataTable { width: 100% !important; table-layout: fixed; }
                .menu-table-wrapper table.dataTable th,
                .menu-table-wrapper table.dataTable td {
                    overflow: hidden; text-overflow: ellipsis; word-break: break-word; vertical-align: middle;
                }
                /* Cột Hành động: không cho 3 nút xuống dòng */
                .menu-table-wrapper table.dataTable td .d-flex { flex-wrap: nowrap; }

                /* Modal */
                .menu-modal-backdrop {
                    position: fixed; inset: 0; background: rgba(0,0,0,.45);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1050; padding: 16px;
                }
                .menu-modal {
                    background: #fff; border-radius: 10px; width: 100%; max-width: 560px;
                    max-height: 90vh; display: flex; flex-direction: column;
                }
                .menu-modal-header, .menu-modal-footer {
                    padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
                }
                .menu-modal-header { border-bottom: 1px solid #eee; }
                .menu-modal-footer { border-top: 1px solid #eee; justify-content: flex-end; gap: 8px; }
                .menu-modal-body { padding: 16px; overflow-y: auto; }
            `}</style>
        </SellerWorkspace>
    );
}