import { useEffect, useState } from 'react';
import { getHomeData } from '../clients/HomeClient';
import type { HomeChef } from '../types/HomeTypes';
import { demoChefs, demoMenus, type CatalogMenu } from '../components/home/catalogData';

export interface CatalogState {
    menus: CatalogMenu[];
    chefs: HomeChef[];
    loading: boolean;
    demo: boolean;
    retry: () => void;
}

export function useCatalog(): CatalogState {
    const [menus, setMenus] = useState<CatalogMenu[]>([]);
    const [chefs, setChefs] = useState<HomeChef[]>([]);
    const [loading, setLoading] = useState(true);
    const [demo, setDemo] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        getHomeData(controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;
                setMenus(data.menus.length ? data.menus : demoMenus);
                setChefs(data.chefs.length ? data.chefs : demoChefs);
                setDemo(data.menus.length === 0);
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                setMenus(demoMenus);
                setChefs(demoChefs);
                setDemo(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [refresh]);

    return {
        menus,
        chefs,
        loading,
        demo,
        retry: () => setRefresh((number) => number + 1),
    };
}
