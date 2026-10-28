import 'bootstrap-icons/font/bootstrap-icons.css';

export type MenuStatus = 'ACTIVE' | 'DISACTIVE';

export interface MenuRow {
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

interface Props {
    menu: MenuRow;
    onView?: (menu: MenuRow) => void;   // bấm "Xem chi tiết"
    onSelect?: (menu: MenuRow) => void; // bấm "Chọn thực đơn"
}

const MAX_DISHES_SHOWN = 3;
const formatPrice = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function MenuCard({ menu, onView, onSelect }: Props) {
    const shown = menu.dishes.slice(0, MAX_DISHES_SHOWN);
    const rest = menu.dishes.length - shown.length;

    return (
        <article className="mc-card">
            {/* Ảnh + badge danh mục */}
            <div className="mc-image">
                {menu.imageUrls?.[0] ? (
                    <img src={menu.imageUrls[0]} alt={menu.name} loading="lazy" />
                ) : (
                    <div className="mc-image-empty"><i className="bi bi-image"></i></div>
                )}
                <span className="mc-badge">{menu.category?.name}</span>
            </div>

            <div className="mc-body">
                {/* Số khách + người bán */}
                <div className="mc-meta">
                    <span><i className="bi bi-people"></i> {menu.minGuests}–{menu.maxGuests} người</span>
                    <span>{menu.seller?.username}</span>
                </div>

                <h3 className="mc-title">{menu.name}</h3>
                <p className="mc-desc">{menu.description}</p>

                {/* Danh sách món */}
                <div className="mc-dishes">
                    <div className="mc-dishes-title">TRONG THỰC ĐƠN</div>
                    <ul>
                        {shown.map(d => <li key={d.id}>{d.name}</li>)}
                        {rest > 0 && <li className="mc-more">+{rest} món khác</li>}
                    </ul>
                </div>

                {/* Giá */}
                <div className="mc-price-row">
                    <span className="mc-price-label">Giá tham khảo</span>
                    <span className="mc-price">{formatPrice(menu.tempPrice)}</span>
                </div>

                {/* Nút */}
                <div className="mc-actions">
                    <button className="mc-btn mc-btn-light" onClick={() => onView?.(menu)}>
                        <i className="bi bi-eye"></i> Xem chi tiết
                    </button>
                    <button className="mc-btn mc-btn-dark" onClick={() => onSelect?.(menu)}>
                        Chọn thực đơn <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>

            <style>{`
                .mc-card { background:#fff; border-radius:20px; overflow:hidden; display:flex; flex-direction:column;
                           box-shadow:0 2px 12px rgba(0,0,0,.06); height:100%; }
                .mc-image { position:relative; height:210px; background:#e8e7de; }
                .mc-image img { width:100%; height:100%; object-fit:cover; display:block; }
                .mc-image-empty { height:100%; display:flex; align-items:center; justify-content:center;
                                  font-size:48px; color:#aaa; }
                .mc-badge { position:absolute; top:14px; left:12px; background:#fff; color:#2f4a17;
                            font-weight:700; font-size:13px; padding:8px 14px; border-radius:999px; }
                .mc-body { padding:16px; display:flex; flex-direction:column; flex:1; }
                .mc-meta { display:flex; justify-content:space-between; font-size:14px; color:#555; }
                .mc-title { font-size:22px; font-weight:700; margin:12px 0 6px; color:#1d241a; }
                .mc-desc { color:#666; font-size:14px; margin:0 0 16px;
                           display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
                .mc-dishes { background:#f4f2ea; border-radius:14px; padding:14px 16px; margin-bottom:16px; flex:1; }
                .mc-dishes-title { font-size:12px; font-weight:700; letter-spacing:.3px; color:#3d4a2c; margin-bottom:8px; }
                .mc-dishes ul { margin:0; padding-left:20px; font-size:14px; color:#333; }
                .mc-dishes li { margin-bottom:4px; }
                .mc-more { color:#777; list-style:none; margin-left:-20px; padding-left:20px; font-style:italic; }
                .mc-price-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
                .mc-price-label { font-size:14px; color:#555; }
                .mc-price { font-size:26px; font-weight:800; color:#3a5a1e; }
                .mc-actions { display:flex; gap:10px; }
                .mc-btn { flex:1; border:0; border-radius:999px; padding:12px 10px; font-size:14px; font-weight:500;
                          display:inline-flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;
                          transition:filter .15s; }
                .mc-btn:hover { filter:brightness(.95); }
                .mc-btn-light { background:#f0ece3; color:#222; }
                .mc-btn-dark { background:#365a1c; color:#fff; }
            `}</style>
        </article>
    );
}