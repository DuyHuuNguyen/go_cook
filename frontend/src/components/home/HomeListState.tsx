interface HomeListStateProps {
    loading: boolean;
    error: boolean;
    emptyMessage: string;
    onRetry: () => void;
}

export default function HomeListState({ loading, error, emptyMessage, onRetry }: HomeListStateProps) {
    if (loading) {
        return <div className="gc-home-list-state" role="status">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return (
            <div className="gc-home-list-state" role="alert">
                <p>Không kết nối được dữ liệu từ máy chủ.</p>
                <button type="button" onClick={onRetry} className="gc-home-btn gc-home-btn-outline">
                    Thử lại
                </button>
            </div>
        );
    }

    return <div className="gc-home-list-state">{emptyMessage}</div>;
}
