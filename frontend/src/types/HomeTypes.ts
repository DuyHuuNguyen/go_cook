export interface HomeCategory {
  id: number;
  name: string;
}

export interface HomeMenu {
  id: number;
  name: string;
  description: string | null;
  referencePrice: number;
  minGuests: number;
  maxGuests: number;
  categoryId: number;
  categoryName: string;
  chefId: number;
  chefName: string;
  imageUrl: string | null;
}

export interface HomeChef {
  id: number;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  experienceYears: number;
}

export interface HomeData {
  categories: HomeCategory[];
  menus: HomeMenu[];
  chefs: HomeChef[];
}
