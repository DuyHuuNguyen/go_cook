import { useCallback, useEffect, useRef, useState } from 'react';
import {MenuRow} from "../menu/MenuCardManagement.tsx";
import MenuCard from "../menu/MenuCardManagement.tsx";


const API_URL = 'http://localhost:8083/api/v1/menus/chef/menus';
const PAGE_SIZE = 6; // số menu mỗi lần load

export default function MenuList() {
    const [items, setItems] = useState<MenuRow[]>([]);
    const [lastId, setLastId] = useState(0);          // keyset cursor, 0 = trang đầu
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<MenuRow | null>(null); // menu đang xem chi tiết

    const loadingRef = useRef(false); // chặn bấm liên tục / gọi trùng
    const startedRef = useRef(false); // chặn StrictMode gọi 2 lần ở lần load đầu

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/${lastId}?pageSize=${PAGE_SIZE}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Lỗi tải dữ liệu (${res.status})`);
            const json = await res.json();

            // TODO: chỉnh theo response thật của BE (console.log(json) để xem)
            const payload = json?.data ?? json;
            const list: MenuRow[] = Array.isArray(payload) ? payload : payload?.data ?? payload?.content ?? [];

            setItems(prev => {
                const ids = new Set(prev.map(m => m.id));
                return [...prev, ...list.filter(m => !ids.has(m.id))]; // lọc trùng
            });
            if (list.length > 0) setLastId(list[list.length - 1].id);
            setHasMore(payload?.hasNext ?? list.length >= PAGE_SIZE);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [lastId, hasMore]);

    // Load lần đầu
    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        loadMore();
    }, [loadMore]);

    return (
        <section>
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="ml-grid">
                {items.map(menu => (
                    <MenuCard
                        key={menu.id}
                        menu={menu}
                        onView={setSelected}
                        onSelect={m => console.log('Chọn thực đơn:', m)}
                    />
                ))}
            </div>

            {!loading && items.length === 0 && !error && (
                <p className="text-muted text-center my-4">Chưa có thực đơn nào.</p>
            )}

            <div className="text-center my-4">
                {hasMore ? (
                    <button className="btn btn-outline-secondary px-4" onClick={loadMore} disabled={loading}>
                        {loading ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                ) : (
                    items.length > 0 && <span className="text-muted">Đã hiển thị hết thực đơn</span>
                )}
            </div>

            {/* Modal chi tiết đơn giản */}
            {selected && (
                <div className="ml-backdrop" onClick={() => setSelected(null)}>
                    <div className="ml-modal" onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="m-0">{selected.name}</h5>
                            <button className="btn-close" onClick={() => setSelected(null)} aria-label="Đóng" />
                        </div>
                        {selected.imageUrls?.[0] && (
                            <img src={selected.imageUrls[0]} alt={selected.name}
                                 style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                        )}
                        <p className="text-muted mt-2">{selected.description}</p>
                        <h6>Danh sách món ({selected.dishes.length})</h6>
                        <ul>{selected.dishes.map(d => <li key={d.id}>{d.name}</li>)}</ul>
                    </div>
                </div>
            )}

            <style>{`
                .ml-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px; }
                .ml-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1050;
                               display:flex; align-items:center; justify-content:center; padding:16px; }
                .ml-modal { background:#fff; border-radius:12px; padding:16px; width:100%; max-width:520px;
                            max-height:90vh; overflow-y:auto; }
            `}</style>
        </section>
    );
}