import type { HomeChef, HomeMenu } from '../../types/HomeTypes';

export interface CatalogMenu extends HomeMenu {
    dishes?: string[];
    sample?: boolean;
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
