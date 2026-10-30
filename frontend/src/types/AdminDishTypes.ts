import type { AdminRow } from "./AdminTypes";

export type AdminDish = {
  id: number;
  name: string;
  isActive: boolean;
  chefId: number | null;
  chefName: string | null;
  createdAt: number | null;
  updatedAt: number | null;
  moderationSource: string | null;
  moderationReason: string | null;
};

export type AdminDishFilters = {
  isActive?: boolean;
  ownership?: "SHARED" | "CHEF";
  chefId?: number;
};

export type AdminDishPage = {
  rows: AdminRow[];
  recordsTotal: number;
  recordsFiltered: number;
};
