import { useEffect, useState } from 'react';
import { getHomeData } from '../clients/HomeClient';
import type { HomeChef } from '../types/HomeTypes';
import type { CatalogMenu } from '../components/home/catalogData';

export interface CatalogState {
    menus: CatalogMenu[];
    chefs: HomeChef[];
    loading: boolean;
    error: boolean;
    retry: () => void;
}

export function useCatalog(): CatalogState {
    const [menus, setMenus] = useState<CatalogMenu[]>([]);
    const [chefs, setChefs] = useState<HomeChef[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError(false);

        getHomeData(controller.signal)
            .then((data) => {
                if (controller.signal.aborted) {
                    return;
                }

                // API hợp lệ nhưng không có bản ghi => mảng rỗng, không gán demo.
                setMenus(Array.isArray(data.menus) ? data.menus : []);
                setChefs(Array.isArray(data.chefs) ? data.chefs : []);
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                console.error('Không tải được danh mục GoCook:', error);
                setMenus([]);
                setChefs([]);
                setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [refresh]);

    return {
        menus,
        chefs,
        loading,
        error,
        retry: () => setRefresh((value) => value + 1),
    };
}
