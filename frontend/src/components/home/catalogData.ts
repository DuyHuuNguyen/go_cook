import type { HomeChef, HomeMenu } from '../../types/HomeTypes';

export interface CatalogMenu extends HomeMenu {
    dishes?: string[];
    sample?: boolean;
}

// Nội dung minh họa lấy theo các bố cục thực đơn trong GO Cook.pdf (trang 3, 14).
// Chỉ hiển thị khi API chưa có dữ liệu. Không phải bản ghi trong PostgreSQL.
export const demoMenus: CatalogMenu[] = [
    {
        id: -1,
        name: 'Mâm Cơm Sum Vầy Miền Nam',
        description: 'Mâm cơm bốn món quen thuộc, phù hợp bữa ăn gia đình.',
        referencePrice: 430000,
        minGuests: 4,
        maxGuests: 6,
        categoryId: -1,
        categoryName: 'Mâm cơm Nam Bộ',
        chefId: -1,
        chefName: 'Đầu bếp GoCook',
        imageUrl: '/assets/menu-south.webp',
        dishes: ['Canh chua cá bớp bông điên điển', 'Cá kho tộ nước dừa', 'Thịt ba chỉ luộc', 'Rau muống xào tỏi'],
        sample: true,
    },
    {
        id: -2,
        name: 'Tiệc Lẩu Cua Đồng & Gà Hấp Lá Chanh',
        description: 'Bữa tiệc cuối tuần với lẩu nóng và các món ăn truyền thống.',
        referencePrice: 750000,
        minGuests: 6,
        maxGuests: 10,
        categoryId: -2,
        categoryName: 'Tiệc gia đình',
        chefId: -2,
        chefName: 'Đầu bếp GoCook',
        imageUrl: '/assets/menu-hotpot.webp',
        dishes: ['Lẩu riêu cua bắp bò', 'Gà hấp lá chanh', 'Chả mực giã tay', 'Nộm ngó sen tai heo'],
        sample: true,
    },
    {
        id: -3,
        name: 'Mâm Cơm Xứ Huế Đậm Đà',
        description: 'Những món ăn mang hương vị miền Trung gần gũi.',
        referencePrice: 520000,
        minGuests: 4,
        maxGuests: 6,
        categoryId: -3,
        categoryName: 'Món miền Trung',
        chefId: -3,
        chefName: 'Đầu bếp GoCook',
        imageUrl: '/assets/menu-hue.webp',
        dishes: ['Thịt luộc tôm chua', 'Cá kho nghệ', 'Canh mít non', 'Vả trộn tôm thịt'],
        sample: true,
    },
    {
        id: -4,
        name: 'Tiệc Bò & Pasta Tại Nhà',
        description: 'Món Âu dành cho dịp gặp mặt và kỷ niệm.',
        referencePrice: 1650000,
        minGuests: 6,
        maxGuests: 10,
        categoryId: -4,
        categoryName: 'Tiệc cuối tuần',
        chefId: -4,
        chefName: 'Đầu bếp GoCook',
        imageUrl: '/assets/menu-european.webp',
        dishes: ['Bò áp chảo', 'Mì Ý sốt nấm', 'Sò điệp áp chảo', 'Salad cà chua'],
        sample: true,
    },
    {
        id: -5,
        name: 'Mâm Cơm Dưỡng Sinh & Chay',
        description: 'Mâm cơm thanh đạm, nhiều rau củ và nấm.',
        referencePrice: 380000,
        minGuests: 4,
        maxGuests: 6,
        categoryId: -5,
        categoryName: 'Dưỡng sinh & Chay',
        chefId: -5,
        chefName: 'Đầu bếp GoCook',
        imageUrl: '/assets/menu-vegetarian.webp',
        dishes: ['Cơm gạo lứt', 'Nấm áp chảo', 'Canh củ sen', 'Đậu hũ sốt nấm'],
        sample: true,
    },
    {
        id: -6,
        name: 'Combo Cơm Nhà 5 Ngày',
        description: 'Gợi ý thực đơn thay đổi trong tuần cho gia đình bận rộn.',
        referencePrice: 1850000,
        minGuests: 3,
        maxGuests: 4,
        categoryId: -6,
        categoryName: 'Thực đơn theo tuần',
        chefId: -6,
        chefName: 'Đầu bếp GoCook',
        imageUrl: '/assets/menu-weekly.webp',
        dishes: ['Năm mâm cơm đổi món', 'Món canh mỗi ngày', 'Món mặn và rau củ', 'Tráng miệng theo ngày'],
        sample: true,
    },
];

export const demoChefs: HomeChef[] = [
    { id: -1, name: 'Mai Hương', avatarUrl: '/assets/chef-menus-one.webp', bio: 'Món cơm gia đình và ẩm thực Nam Bộ.', experienceYears: 0 },
    { id: -2, name: 'Tuấn Anh', avatarUrl: '/assets/chef-menus-two.webp', bio: 'Mâm cơm truyền thống miền Bắc.', experienceYears: 0 },
    { id: -3, name: 'Thanh Trúc', avatarUrl: '/assets/chef-menus-three.webp', bio: 'Thực đơn thanh đạm và dưỡng sinh.', experienceYears: 0 },
    { id: -4, name: 'Hoàng Long', avatarUrl: '/assets/chef-menus-four.webp', bio: 'Bữa tiệc gia đình và họp mặt.', experienceYears: 0 },
];

export function displayPrice(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export function normalizeSearch(value: string): string {
    return value.toLocaleLowerCase('vi-VN').normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
}
