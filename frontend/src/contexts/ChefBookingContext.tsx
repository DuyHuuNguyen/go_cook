import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getChefBookings,
  acceptChefBooking,
  rejectChefBooking,
} from "../clients/BookingClient";
import { BookingResponse } from "../types/BookingTypes";
import { useApp } from "./AppContext";

interface IChefBookingContext {
  bookings: BookingResponse[];
  lastId: number;
  hasNext: boolean;
  loading: boolean;
  actionLoadingId: number | null;
  error: string | null;
  loadMoreBookings: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  acceptBooking: (bookingId: number) => Promise<boolean>;
  rejectBooking: (bookingId: number, reason?: string) => Promise<boolean>;
}

const ChefBookingContext = createContext<IChefBookingContext | undefined>(
  undefined,
);

interface ChefBookingProviderProps {
  children: ReactNode;
}

export function ChefBookingProvider({ children }: ChefBookingProviderProps) {
  const { notify } = useApp();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastIdRef = useRef(0);
  const hasNextRef = useRef(true);
  const loadingRef = useRef(false);

  const loadMoreBookings = useCallback(async () => {
    if (loadingRef.current || !hasNextRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await getChefBookings(lastIdRef.current);
      const newBookings = result?.data ?? [];

      setBookings((prev) => {
        // De-duplicate by id in case of overlap
        const existingIds = new Set(prev.map((b) => b.id));
        const filteredNew = newBookings.filter((b) => !existingIds.has(b.id));
        return [...prev, ...filteredNew];
      });

      lastIdRef.current = result?.lastId ?? -1;
      hasNextRef.current = Boolean(result?.hasNext);
      setHasNext(Boolean(result?.hasNext));
    } catch (err) {
      console.error("Failed to load chef bookings:", err);
      setError("Không thể tải danh sách đơn đặt bếp. Vui lòng thử lại.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const refreshBookings = useCallback(async () => {
    setBookings([]);
    lastIdRef.current = 0;
    hasNextRef.current = true;
    setHasNext(true);
    setError(null);
    await loadMoreBookings();
  }, [loadMoreBookings]);

  useEffect(() => {
    void loadMoreBookings();
  }, [loadMoreBookings]);

  const acceptBooking = useCallback(
    async (bookingId: number) => {
      setActionLoadingId(bookingId);
      try {
        const res = await acceptChefBooking(bookingId);
        if (res.success) {
          notify(res.message, { title: "Đơn đặt bếp", variant: "success" });
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId ? { ...b, bookingStatus: "CHEF_ACCEPT" } : b,
            ),
          );
          return true;
        }
        notify("Thao tác thất bại, vui lòng thử lại.", {
          title: "Đơn đặt bếp",
          variant: "danger",
        });
        return false;
      } catch (err) {
        console.error("Failed to accept booking:", err);
        notify("Lỗi khi chấp nhận đơn đặt bếp.", {
          title: "Đơn đặt bếp",
          variant: "danger",
        });
        return false;
      } finally {
        setActionLoadingId(null);
      }
    },
    [notify],
  );

  const rejectBooking = useCallback(
    async (bookingId: number, reason?: string) => {
      setActionLoadingId(bookingId);
      try {
        const res = await rejectChefBooking(bookingId, reason);
        if (res.success) {
          notify(res.message, { title: "Đơn đặt bếp", variant: "info" });
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId ? { ...b, bookingStatus: "CHEF_REJECT" } : b,
            ),
          );
          return true;
        }
        notify("Thao tác thất bại, vui lòng thử lại.", {
          title: "Đơn đặt bếp",
          variant: "danger",
        });
        return false;
      } catch (err) {
        console.error("Failed to reject booking:", err);
        notify("Lỗi khi từ chối đơn đặt bếp.", {
          title: "Đơn đặt bếp",
          variant: "danger",
        });
        return false;
      } finally {
        setActionLoadingId(null);
      }
    },
    [notify],
  );

  const contextValue = useMemo(
    () => ({
      bookings,
      lastId: lastIdRef.current,
      hasNext,
      loading,
      actionLoadingId,
      error,
      loadMoreBookings,
      refreshBookings,
      acceptBooking,
      rejectBooking,
    }),
    [
      bookings,
      hasNext,
      loading,
      actionLoadingId,
      error,
      loadMoreBookings,
      refreshBookings,
      acceptBooking,
      rejectBooking,
    ],
  );

  return (
    <ChefBookingContext.Provider value={contextValue}>
      {children}
    </ChefBookingContext.Provider>
  );
}

export function useChefBooking() {
  const context = useContext(ChefBookingContext);
  if (!context) {
    throw new Error(
      "useChefBooking must be used within a ChefBookingProvider",
    );
  }
  return context;
}

export default ChefBookingProvider;

