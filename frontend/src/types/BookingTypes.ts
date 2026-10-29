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
