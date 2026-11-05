import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getBookings } from "../clients/BookingClient";
import type { BookingResponse } from "../types/BookingTypes";

interface IBookingContext {
  bookings: BookingResponse[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<IBookingContext | undefined>(undefined);

export default function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBookings(targetPage, size);
      setBookings(result?.data ?? []);
      setTotalPages(result?.totalPages ?? 0);
      setTotalElements(result?.totalElements ?? 0);
      setHasNext(Boolean(result?.hasNext));
      setHasPrevious(Boolean(result?.hasPrevious));
    } catch {
      setError("Không thể tải danh sách đơn đặt bếp.");
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    void fetchBookings(page);
  }, [page, fetchBookings]);

  const refreshBookings = useCallback(async () => {
    await fetchBookings(page);
  }, [fetchBookings, page]);

  const value = useMemo(
    () => ({
      bookings,
      page,
      size,
      totalPages,
      totalElements,
      hasNext,
      hasPrevious,
      loading,
      error,
      setPage,
      refreshBookings,
    }),
    [
      bookings,
      page,
      size,
      totalPages,
      totalElements,
      hasNext,
      hasPrevious,
      loading,
      error,
      refreshBookings,
    ],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

