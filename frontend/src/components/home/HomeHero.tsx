import type { SyntheticEvent } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight, Check2Circle, GeoAlt, People, Search } from 'react-bootstrap-icons';

interface HomeHeroProps {
    keyword: string;
    area: string;
    guests: number;
    onKeywordChange: (keyword: string) => void;
    onAreaChange: (area: string) => void;
    onGuestsChange: (guests: number) => void;
    onSearch: (event: SyntheticEvent<HTMLFormElement>) => void;
}

export default function HomeHero({ keyword, area, guests, onKeywordChange, onAreaChange, onGuestsChange, onSearch }: HomeHeroProps) {
    return (
            <section className="gc-home-hero">
                <Container>
                    <div className="gc-home-hero-grid">
                        <div className="gc-home-hero-copy">
                            <p className="gc-home-kicker">DỊCH VỤ ĐẦU BẾP NẤU ĂN TẠI NHÀ</p>
                            <h1>
                                Đầu bếp bạn chọn.
                                <span>Bữa ăn bạn muốn.</span>
                                Ngay tại nhà.
                            </h1>
                            <p className="gc-home-lead">
                                Chọn thực đơn phù hợp hoặc tự lên món theo sở thích.
                                GoCook giúp bạn chuẩn bị thông tin cho bữa cơm gia đình,
                                tiệc cuối tuần và những dịp đặc biệt.
                            </p>
                            <div className="gc-home-hero-actions">
                                <Link to="/menus" className="gc-home-btn gc-home-btn-primary">
                                    Xem thực đơn <ArrowRight size={18} />
                                </Link>
                                <Link to="/create-menu" className="gc-home-btn gc-home-btn-outline">
                                    Tự tạo thực đơn
                                </Link>
                            </div>
                            <div className="gc-home-hero-points">
                                <span><Check2Circle /> Nấu trực tiếp tại nhà</span>
                                <span><Check2Circle /> Linh hoạt khẩu phần</span>
                            </div>
                        </div>
                        <div className="gc-home-hero-visual">
                            <img
                                src="/assets/hero.png"
                                alt="Đầu bếp GoCook đang nấu ăn trong căn bếp gia đình"
                            />
                            <div className="gc-home-photo-caption">
                                <strong>Gian bếp nhà bạn, món ăn bạn thích.</strong>
                                <span>Khám phá các cách đặt bữa ăn trên GoCook.</span>
                            </div>
                        </div>
                    </div>

                    <form className="gc-home-search" onSubmit={onSearch} role="search">
                        <label className="gc-home-search-field">
                            <GeoAlt size={22} />
                            <span>
                                <small>KHU VỰC</small>
                                <select value={area} onChange={(event) => onAreaChange(event.target.value)}>
                                    <option>TP. Hồ Chí Minh</option>
                                    <option>Hà Nội</option>
                                    <option>Khu vực khác</option>
                                </select>
                            </span>
                        </label>
                        <label className="gc-home-search-field gc-home-search-keyword">
                            <Search size={22} />
                            <span>
                                <small>MÓN ĂN / THỰC ĐƠN</small>
                                <input
                                    type="search"
                                    value={keyword}
                                    onChange={(event) => onKeywordChange(event.target.value)}
                                    placeholder="Ví dụ: cơm nhà, món chay, lẩu..."
                                />
                            </span>
                        </label>
                        <label className="gc-home-search-field">
                            <People size={22} />
                            <span>
                                <small>SỐ NGƯỜI ĂN</small>
                                <select value={guests} onChange={(event) => onGuestsChange(Number(event.target.value))}>
                                    {[2, 3, 4, 5, 6, 8, 10, 12].map((value) => (
                                        <option value={value} key={value}>{value} người</option>
                                    ))}
                                </select>
                            </span>
                        </label>
                        <button type="submit" className="gc-home-btn gc-home-btn-primary gc-home-search-button">
                            Tìm thực đơn <ArrowRight size={17} />
                        </button>
                    </form>
                    <p className="gc-home-search-note">
                        Bộ lọc khu vực đang ở chế độ giao diện; thông tin phục vụ thực tế sẽ được kết nối sau.
                    </p>
                </Container>
            </section>
    );
}
