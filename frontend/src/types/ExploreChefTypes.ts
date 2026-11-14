export interface ExploreChefDish {
  id: number;
  name: string;
}

export interface ExploreChefItem {
  userId: number;
  username: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  experienceYears: number | null;
  reviewReason: string | null;
  onboardedAt: string | null;
  dishes: ExploreChefDish[];
  totalBookings: number;
  totalSuccessfullyBookings: number;
}

export interface ExploreChefServiceArea {
  provinceCode: string;
  provinceName: string;
  wardCode: string | null;
  wardName: string | null;
}

export interface ExploreChefMenuCategory {
  id: number;
  name: string;
}

export interface ExploreChefMenuSeller {
  id: number;
  username: string;
  avatarUrl: string | null;
}

export interface ExploreChefMenuItem {
  id: number;
  name: string;
  description: string | null;
  tempPrice: number;
  minGuests: number;
  maxGuests: number;
  status: string;
  createdAt: number;
  category: ExploreChefMenuCategory;
  seller: ExploreChefMenuSeller;
  dishes: ExploreChefDish[];
  imageUrls: string[];
}

export interface ExploreChefDetail extends ExploreChefItem {
  serviceAreas: ExploreChefServiceArea[];
  menus: ExploreChefMenuItem[];
  totalMenus: number;
}

