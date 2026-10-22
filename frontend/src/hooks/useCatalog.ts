import { useEffect, useState } from "react";
import { getAllMenus } from "../clients/MenuClient";
import type { HomeChef } from "../types/HomeTypes";
import type { CatalogMenu } from "../components/home/catalogData";

export interface CatalogState {
  menus: CatalogMenu[];
  /** Danh sách đầu bếp chưa có – hiện chưa được lấy từ /api/v1/menus, giữ lại để tương thích Home.tsx */
  chefs: HomeChef[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export function useCatalog(): CatalogState {
  const [menus, setMenus] = useState<CatalogMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(false);

    getAllMenus(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setMenus(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Không tải được danh mục GoCook:", err);
        setMenus([]);
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
    chefs: [], // khoong có api Chefs, thêm thêm
    loading,
    error,
    retry: () => setRefresh((value) => value + 1),
  };
}
