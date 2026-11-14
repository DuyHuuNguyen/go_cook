export type ChefScheduleStatus = "HELD" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface ChefScheduleItem {
  id: number;
  bookingId?: number;
  bookingCode?: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  serviceAddress?: string;
  startAt: string;
  endAt: string;
  status: ChefScheduleStatus;
  holdExpiresAt?: string;
  guestCount?: number;
  totalAmount?: number;
  dishes?: string[];
}

export interface ChefScheduleDay {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: string; // "SUN", "MON", ...
  displayDate: string; // "14/11"
  isToday: boolean;
  scheduleCount: number;
  items: ChefScheduleItem[];
}

export interface ChefWeeklyScheduleResponse {
  startDate: string;
  endDate: string;
  prevWeekStartDate: string;
  nextWeekStartDate: string;
  weekOfYear: number;
  year: number;
  displayRange: string;
  days: ChefScheduleDay[];
  allSchedules: ChefScheduleItem[];
}

