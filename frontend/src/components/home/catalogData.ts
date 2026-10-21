import type { HomeMenu } from '../../types/HomeTypes';

// Giữ kiểu dữ liệu này để trang chủ và danh sách thực đơn dùng chung.
// Không khai báo dữ liệu mẫu: danh sách thực đơn được lấy từ API.
export interface CatalogMenu extends HomeMenu {
    dishes?: string[];
}

export function displayPrice(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export function normalizeSearch(value: string): string {
    return value.toLocaleLowerCase('vi-VN').normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();
}
