import type { AdminRow } from "./AdminTypes";

export type AdminMenuFilters = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  diners?: number;
};

export type AdminMenuRow = AdminRow & {
  category?: string;
  chef?: string;
  price?: string;
  status?: string;
  isActive?: string;
  source?: string;
  moderationSource?: string;
  imageUrls?: string;
  dishes?: string;
  guests?: string;
  reason?: string;
};

export type AdminMenuPage = {
  rows: AdminMenuRow[];
  recordsTotal: number;
  recordsFiltered: number;
};

export type AdminMenuUpdate = {
  name: string;
  description: string;
  categoryId: string;
  tempPrice: string;
  minGuests: string;
  maxGuests: string;
};
