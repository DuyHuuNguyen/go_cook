import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type { CatalogMenu } from "../components/home/catalogData";

interface MenuApiDish {
  id: number;
  name: string;
}

interface MenuApiCategory {
  id: number;
  name: string;
}

interface MenuApiSeller {
  id: number;
  username: string;
  avatarUrl: string | null;
}

export interface MenuApiItem {
  id: number;
  name: string;
  description: string;
  tempPrice: number;
  minGuests: number;
  maxGuests: number;
  status: string;
  category: MenuApiCategory;
  seller: MenuApiSeller;
  dishes: MenuApiDish[];
  imageUrls: string[];
}

interface MenuPageData {
  data: MenuApiItem[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
  pageSize: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  empty: boolean;
}

interface MenuApiResponse {
  success: boolean;
  data: MenuPageData;
}

// ---- Mapper: chuyển MenuApiItem → CatalogMenu dùng trong UI ----
export function toMenuCatalog(item: MenuApiItem): CatalogMenu {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    referencePrice: item.tempPrice,
    minGuests: item.minGuests,
    maxGuests: item.maxGuests,
    categoryId: item.category.id,
    categoryName: item.category.name,
    chefId: item.seller.id,
    chefName: item.seller.username,
    imageUrl: item.imageUrls?.[0] ?? null,
    dishes: item.dishes.map((d) => d.name),
  };
}

export async function getMenusPage(
  page: number,
  size: number,
  signal?: AbortSignal,
): Promise<MenuPageData> {
  const { data } = await axiosClient.get<MenuApiResponse>(
    ENDPOINTS.MENU.LIST.V1,
    {
      params: { page, size },
      signal,
    },
  );
  if (!data.success || !data.data) {
    throw new Error("Không thể tải danh sách thực đơn");
  }
  return data.data;
}

export async function getAllMenus(
  signal?: AbortSignal,
): Promise<CatalogMenu[]> {
  const pageSize = 20;
  const firstPage = await getMenusPage(1, pageSize, signal);
  const results: CatalogMenu[] = firstPage.data.map(toMenuCatalog);

  if (firstPage.totalPages <= 1) {
    return results;
  }

  // Gọi song song các trang còn lại
  const remainingPages = Array.from(
    { length: firstPage.totalPages - 1 },
    (_, i) => i + 2, // trang 2, 3, 4, ...
  );

  const pages = await Promise.all(
    remainingPages.map((page) => getMenusPage(page, pageSize, signal)),
  );

  for (const page of pages) {
    results.push(...page.data.map(toMenuCatalog));
  }

  return results;
}
