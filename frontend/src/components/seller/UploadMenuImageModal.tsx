import { useEffect, useState } from 'react';

interface Props {
    menuId: number;
    menuName: string;
    onClose: () => void;
    onUploaded: (menuId: number, newImageUrl: string) => void;
}

const MAX_SIZE_MB = 5;

export function UploadMenuImageModal({ menuId, menuName, onClose, onUploaded }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleSelect = (f: File | undefined) => {
        setError(null);
        if (!f) return;
        if (!f.type.startsWith('image/')) return setError('Vui lòng chọn file ảnh.');
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return setError(`Ảnh tối đa ${MAX_SIZE_MB}MB.`);
        setFile(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/v1/menus/asset/${menuId}`, {
                method: 'POST',
                body: formData,
                credentials: "include"
            });
            if (!res.ok) throw new Error(`Upload thất bại (${res.status})`);

            const json = await res.json();
            const newUrl: string = json?.data?.url ?? preview ?? '';
            onUploaded(menuId, newUrl);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="menu-modal-backdrop" onClick={onClose}>
            <div className="menu-modal" onClick={e => e.stopPropagation()}>
                <div className="menu-modal-header">
                    <h5 className="m-0">Thêm ảnh cho menu #{menuId}</h5>
                    <button className="btn-close" onClick={onClose} aria-label="Đóng" />
                </div>

                <div className="menu-modal-body">
                    <p className="text-muted mb-2">{menuName}</p>

                    <label className="upload-dropzone">
                        {preview ? (
                            <img src={preview} alt="preview"
                                 style={{ width: '100%', maxHeight: 260, objectFit: 'contain' }} />
                        ) : (
                            <div className="text-center text-muted">
                                <i className="bi bi-cloud-arrow-up" style={{ fontSize: 40 }}></i>
                                <div>Bấm để chọn ảnh (tối đa {MAX_SIZE_MB}MB)</div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={e => handleSelect(e.target.files?.[0])}
                        />
                    </label>

                    {file && <small className="text-muted d-block mt-2">{file.name}</small>}
                    {error && <div className="alert alert-danger mt-2 mb-0 py-2">{error}</div>}
                </div>

                <div className="menu-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>
                        {loading ? 'Đang tải...' : 'Tải lên'}
                    </button>
                </div>
            </div>

            <style>{`
                .upload-dropzone {
                    display: flex; align-items: center; justify-content: center;
                    min-height: 160px;
                    border: 2px dashed #ced4da; border-radius: 8px;
                    cursor: pointer; padding: 12px;
                }
                .upload-dropzone:hover { border-color: #0d6efd; background: #f8faff; }
            `}</style>
        </div>
    );
}