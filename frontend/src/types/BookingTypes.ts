export interface SelectedDish {
  dishId: number;
  dishName: string;
  quantity: number;
}

export interface MenuRequestDraft {
  dishes: SelectedDish[];
  adults: number;
  notes: string;
  mealDate: string;
  mealTime: string;
  address: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
}

export interface BookingDishRequest {
  dishId: number;
  quantity: number;
}

export interface CreateBookingRequest {
  scheduledAt: string;
  serviceAddress: string;
  customerNote: string;
  guestCount: number;
  dishes: BookingDishRequest[];
  provinceCode: string;
  wardCode: string;
}

export interface BookingDishResponse {
  dishId: number;
  dishName: string;
  quantity: number;
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  customerId: number;
  chefId: number | null;
  scheduledAt: string;
  serviceAddress: string;
  provideCode: string;
  wardCode: string;
  customerNote: string;
  guestCount: number;
  totalAmount: number;
  bookingStatus: string;
  createdAt: number;
  dishes: BookingDishResponse[];
}

export interface DishSearchResponse {
  id: number;
  name: string;
}

export interface DishSearchParams {
  keyword: string;
  page: number;
  size: number;
}

export interface MatchedDish {
  dishId: number;
  dishName: string;
  quantity: number;
}

export interface MatchingChef {
  chefId: number;
  fullName: string;
  bio: string;
  experience_years: string;
  avatar: string;
  matchedDishCount: number;
  totalRequestedDishCount: number;
  matchedDishes: MatchedDish[];
  unmatchedDishes: MatchedDish[];
}

export interface MatchingChefsResponse {
  isSuccess: boolean;
  data: MatchingChef[];
}

export interface BookingRequestResponse {
  requestId: number;
  bookingId: number;
  chefId: number;
  requestStatus: string;
  bookingStatus: string;
  expiresAt: number;
  scheduleStartAt: number;
  scheduleEndAt: number;
}

export interface PaginationResponse<T> {
  data: T[];
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

export interface KeySetPaginationResponse<T> {
  data: T[];
  lastId: number;
  hasNext: boolean;
}

