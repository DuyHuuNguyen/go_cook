import { Container } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'react-bootstrap-icons';
import type { HomeChef } from '../../types/HomeTypes';
import HomeListState from './HomeListState';

interface HomeChefsProps {
    chefs: HomeChef[];
    loading: boolean;
    error: boolean;
    onRetry: () => void;
    onSelect: (chef: HomeChef) => void;
}

export default function HomeChefs({ chefs, loading, error, onRetry, onSelect }: HomeChefsProps) {
    return (
        <section className="gc-home-section gc-home-chefs" id="dau-bep">
            <Container>
                <div className="gc-home-heading gc-home-heading-row">
                    <div>
                        <p className="gc-home-kicker">GIAN BẾP GOCOOK</p>
                        <h2>Gặp gỡ những đầu bếp</h2>
                        <p>Tìm hiểu các đầu bếp có mặt trên GoCook.</p>
                    </div>
                    <Link to="/menus" className="gc-home-text-link">
                        Khám phá thực đơn <ArrowRight size={17} />
                    </Link>
                </div>
                {loading || error || chefs.length === 0 ? (
                    <HomeListState
                        loading={loading}
                        error={error}
                        onRetry={onRetry}
                        emptyMessage="Chưa có đầu bếp nào được hiển thị. Vui lòng quay lại sau."
                    />
                ) : (
                    <div className="gc-home-chef-grid">
                        {chefs.map((chef) => (
                            <button
                                className="gc-home-chef-card"
                                type="button"
                                onClick={() => onSelect(chef)}
                                key={chef.id}
                            >
                                {chef.avatarUrl ? (
                                    <img src={chef.avatarUrl} alt={`Đầu bếp ${chef.name}`} loading="lazy" />
                                ) : (
                                    <span className="gc-home-image-placeholder">Chưa có ảnh đầu bếp</span>
                                )}
                                <span className="gc-home-chef-body">
                                    <small>ĐẦU BẾP GOCOOK</small>
                                    <strong>{chef.name}</strong>
                                    <span>{chef.bio || 'Chưa có thông tin giới thiệu.'}</span>
                                    <span className="gc-home-card-link">Xem thông tin <ArrowUpRight size={17} /></span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
}
