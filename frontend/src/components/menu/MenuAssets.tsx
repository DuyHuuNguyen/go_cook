import {useState} from "react";
import {createPortal} from "react-dom";
import {UploadMenuImageModal} from "../seller/UploadMenuImageModal.tsx";
import {useMenuAssets} from "../../hooks/useMenuAsset.tsx";

const POPOVER_WIDTH = 420;
const POPOVER_MARGIN = 8;
const POPOVER_MIN_HEIGHT = 240;
const GRID_GAP = 8;
const IMAGE_MIN_SIZE = 120;

interface PopoverPosition {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
}

interface MenuAssetsProps {
    menuId: number;
    menuName: string;
}

export default function MenuAssets({menuId, menuName}: MenuAssetsProps) {
    const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
    const {
        assets,
        hasNext,
        loading,
        error,
        loadMore,
        reload,
        removeAsset,
        deletingIds,
        deleteError,
    } = useMenuAssets(menuId);

    function openUploadPopover(button: HTMLElement) {
        const rect = button.getBoundingClientRect();
        const width = Math.min(POPOVER_WIDTH, window.innerWidth - POPOVER_MARGIN * 2);
        const left = Math.max(
            POPOVER_MARGIN,
            Math.min(rect.right - width, window.innerWidth - width - POPOVER_MARGIN)
        );
        const top = rect.bottom + POPOVER_MARGIN;
        const maxHeight = Math.max(
            POPOVER_MIN_HEIGHT,
            window.innerHeight - top - POPOVER_MARGIN
        );

        setPopoverPosition({top, left, width, maxHeight});
    }

    function handleImageUploaded() {
        setPopoverPosition(null);
        reload();
    }

    async function handleDelete(assetId: number) {
        if (!window.confirm("Bạn có chắc muốn xóa hình ảnh này?")) return;
        await removeAsset(assetId);
    }

    return (
        <div className="stack">
            <div className="d-flex align-items-center justify-content-between">
                <p className="eyebrow m-0">Hình ảnh thực đơn</p>
                <button
                    type="button"
                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                    onClick={(e) => openUploadPopover(e.currentTarget)}
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Thêm ảnh</span>
                </button>
            </div>

            {assets.length === 0 && !loading && !error && (
                <p className="text-muted">Chưa có hình ảnh</p>
            )}

            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${IMAGE_MIN_SIZE}px, 1fr))`,
                gap: GRID_GAP
            }}>
                {assets.map((asset) => {
                    const isDeleting = deletingIds.includes(asset.id);
                    return (
                        <div
                            key={asset.id}
                            style={{position: "relative", opacity: isDeleting ? 0.5 : 1}}
                        >
                            <img
                                src={asset.url}
                                alt={`Hình ${asset.id}`}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    objectFit: "cover",
                                    borderRadius: 8
                                }}
                            />
                            <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                title="Xóa hình"
                                disabled={isDeleting}
                                onClick={() => void handleDelete(asset.id)}
                                style={{position: "absolute", top: 4, right: 4, lineHeight: 1}}
                            >
                                {isDeleting ? "..." : <i className="bi bi-trash"></i>}
                            </button>
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-danger">{error}</p>}
            {deleteError && <p className="text-danger">{deleteError}</p>}

            {hasNext && (
                <button
                    type="button"
                    className="btn btn-link p-0"
                    disabled={loading}
                    onClick={() => void loadMore()}
                >
                    {loading ? "Đang tải..." : "Tải thêm hình ảnh"}
                </button>
            )}

            {popoverPosition && createPortal(
                <div onSubmit={(e) => e.stopPropagation()}>
                    <div
                        onClick={() => setPopoverPosition(null)}
                        style={{position: "fixed", inset: 0, zIndex: 1040}}
                        aria-label="Đóng"
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: popoverPosition.top,
                            left: popoverPosition.left,
                            width: popoverPosition.width,
                            maxHeight: popoverPosition.maxHeight,
                            overflowY: "auto",
                            zIndex: 1050,
                            background: "var(--bs-body-bg, #fff)",
                            border: "1px solid rgba(0,0,0,.15)",
                            borderRadius: 12,
                            boxShadow: "0 8px 24px rgba(0,0,0,.2)",
                        }}
                    >
                        <UploadMenuImageModal
                            menuId={menuId}
                            menuName={menuName}
                            onClose={() => setPopoverPosition(null)}
                            onUploaded={handleImageUploaded}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}