const SERVICE_STANDARDS = [
    {
        step: 1,
        title: 'Tự tay đi chợ sớm',
        desc: 'Đầu bếp trực tiếp lựa chọn rau củ, thịt cá tươi sống tinh sương ngay trước giờ nấu 1.5 tiếng.',
    },
    {
        step: 2,
        title: 'Dụng cụ & Gia vị chuẩn',
        desc: 'Mang đầy đủ dao thớt chuyên dụng khử trùng, bộ gia vị sạch thiết yếu khi nấu tại nhà bạn.',
    },
    {
        step: 3,
        title: 'Nấu trực tiếp trong bếp',
        desc: 'Món ăn chế biến nóng sốt ngay trước giờ dùng cơm tại nhà, giữ trọn vẹn hương vị bữa khói ấm áp.',
    },
    {
        step: 4,
        title: 'Rửa dọn sạch bóng',
        desc: 'Tự giác rửa sạch xoong chảo, lau bếp sạch trơn, dọn rác gọn gàng trước khi chào gia chủ ra về.',
    },
];

export default function MenuDetailServiceStandards() {
    return (
        <div className="mdd-section">
            <h3>
                <i className="fa-solid fa-shield-halved mdd-icon-green" />
                Quy chuẩn phục vụ tại gia của GO Cook
            </h3>
            <div className="mdd-standards-grid">
                {SERVICE_STANDARDS.map(({ step, title, desc }) => (
                    <div className="mdd-standard-item" key={step}>
                        <div className="mdd-standard-step">{step}</div>
                        <div>
                            <h4>{title}</h4>
                            <p>{desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
