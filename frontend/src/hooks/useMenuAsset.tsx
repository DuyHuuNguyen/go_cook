import {useCallback, useEffect, useRef, useState} from "react";

const API_BASE = "http://localhost:8083/api/v1";
const INITIAL_CURSOR = 0;

export interface MenuAsset {
    id: number;
    url: string;
}

interface AssetPage {
    data: MenuAsset[];
    lastId: number;
    hasNext: boolean;
}

interface ApiResponse {
    data: AssetPage;
    success: boolean;
}


export function useMenuAssets(menuId: number) {
    const [assets, setAssets] = useState<MenuAsset[]>([]);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const lastIdRef = useRef(INITIAL_CURSOR);
    const hasNextRef = useRef(true);
    const loadingRef = useRef(false);
    const versionRef = useRef(0);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasNextRef.current) return;

        const version = versionRef.current;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${API_BASE}/menus/${menuId}/assets/${lastIdRef.current}`,
                {headers: {accept: "*/*"}, credentials: "include"},
            );
            if (!res.ok) throw new Error("Không tải được hình ảnh");

            const body: ApiResponse = await res.json();
            if (version !== versionRef.current) return;

            const page = body.data;
            const items = page.data ?? [];

            const nextCursor = page.lastId > 0
                ? page.lastId
                : items[items.length - 1]?.id ?? lastIdRef.current;

            lastIdRef.current = nextCursor;
            hasNextRef.current = page.hasNext && items.length > 0;
            setHasNext(hasNextRef.current);

            setAssets((prev) => {
                const seen = new Set(prev.map((a) => a.id));
                return [...prev, ...items.filter((a) => !seen.has(a.id))];
            });
        } catch (e) {
            if (version === versionRef.current) {
                setError(e instanceof Error ? e.message : "Lỗi tải hình ảnh");
            }
        } finally {
            if (version === versionRef.current) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }, [menuId]);


    const removeAsset = useCallback(
        async (assetId: number): Promise<boolean> => {
            setDeleteError(null);
            setDeletingIds((prev) => [...prev, assetId]);
            try {
                const res = await fetch(
                    `${API_BASE}/menus/${menuId}/asset/${assetId}`,
                    {method: "PATCH", headers: {accept: "*/*"}, credentials: "include"},
                );
                if (!res.ok) throw new Error("Xóa hình ảnh thất bại");

                setAssets((prev) => prev.filter((a) => a.id !== assetId));
                return true;
            } catch (e) {
                setDeleteError(e instanceof Error ? e.message : "Xóa hình ảnh thất bại");
                return false;
            } finally {
                setDeletingIds((prev) => prev.filter((id) => id !== assetId));
            }
        },
        [menuId],
    );


    const reload = useCallback(() => {
        versionRef.current += 1;
        lastIdRef.current = INITIAL_CURSOR;
        hasNextRef.current = true;
        loadingRef.current = false;
        setAssets([]);
        setHasNext(true);
        setError(null);
        setDeleteError(null);
        setDeletingIds([]);
        void loadMore();
    }, [loadMore]);


    useEffect(() => {
        reload();
    }, [reload]);

    return {
        assets,
        hasNext,
        loading,
        error,
        loadMore,
        reload,
        removeAsset,
        deletingIds,
        deleteError,
    };
}