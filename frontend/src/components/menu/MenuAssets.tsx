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
        <div className="stack-sm">
            <div className="between">
                <div>
                    <p className="eyebrow m-0">03 · Hình ảnh thực đơn</p>
                    <h3 className="mt-1">Thư viện hình ảnh ({assets.length})</h3>
                </div>
                <button
                    type="button"
                    className="btn secondary sm"
                    onClick={(e) => openUploadPopover(e.currentTarget)}
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Thêm ảnh</span>
                </button>
            </div>

            {assets.length === 0 && !loading && !error && (
                <div className="soft text-center py-4">
                    <p className="muted mb-0">Chưa có hình ảnh nào cho thực đơn này. Nhấn &ldquo;Thêm ảnh&rdquo; để tải lên.</p>
                </div>
            )}

            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${IMAGE_MIN_SIZE}px, 1fr))`,
                gap: 12
            }}>
                {assets.map((asset) => {
                    const isDeleting = deletingIds.includes(asset.id);
                    return (
                        <div
                            key={asset.id}
                            style={{
                                position: "relative",
                                opacity: isDeleting ? 0.5 : 1,
                                borderRadius: 12,
                                overflow: "hidden",
                                border: "1px solid #e5e6dc",
                                background: "#f6f3ea"
                            }}
                        >
                            <img
                                src={asset.url}
                                alt={`Hình ${asset.id}`}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    objectFit: "cover",
                                    display: "block"
                                }}
                            />
                            <button
                                type="button"
                                title="Xóa hình"
                                disabled={isDeleting}
                                onClick={() => void handleDelete(asset.id)}
                                style={{
                                    position: "absolute",
                                    top: 6,
                                    right: 6,
                                    width: 28,
                                    height: 28,
                                    minHeight: 28,
                                    padding: 0,
                                    borderRadius: "50%",
                                    background: "rgba(180, 35, 24, 0.9)",
                                    color: "#fff",
                                    border: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    lineHeight: 1,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
                                }}
                            >
                                {isDeleting ? "..." : <i className="bi bi-trash"></i>}
                            </button>
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-danger mb-0">{error}</p>}
            {deleteError && <p className="text-danger mb-0">{deleteError}</p>}

            {hasNext && (
                <div>
                    <button
                        type="button"
                        className="btn secondary sm"
                        disabled={loading}
                        onClick={() => void loadMore()}
                    >
                        {loading ? "Đang tải..." : "Tải thêm hình ảnh"}
                    </button>
                </div>
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