import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getAdminCollection } from "../clients/AdminClient";
import type { AdminCollection, AdminSection } from "../types/AdminTypes";

const emptyCollection: AdminCollection = {
    rows: [], total: null, hasNext: false, nextCursor: null,
};

export function useAdminCollection(resource: AdminSection, page: number, keyword: string, cursor: number) {
    const [collection, setCollection] = useState<AdminCollection>(emptyCollection);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const reload = useCallback(() => setRefreshCount((value) => value + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        void getAdminCollection(resource, page, keyword, cursor, controller.signal)
            .then((result) => {
                if (!controller.signal.aborted) setCollection(result);
            })
            .catch((reason: unknown) => {
                if (controller.signal.aborted) return;
                setCollection(emptyCollection);
                if (axios.isAxiosError(reason)) {
                    const status = reason.response?.status;
                    if (status === 401 || status === 403) {
                        setError("Tài khoản chưa được cấp quyền truy cập dữ liệu này.");
                    } else if (status === 404) {
                        setError("Không tìm thấy API quản trị.");
                    } else {
                        setError("Không thể kết nối API. Kiểm tra Backend và thử lại.");
                    }
                } else {
                    setError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu.");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [resource, page, keyword, cursor, refreshCount]);

    return { collection, loading, error, reload };
}
