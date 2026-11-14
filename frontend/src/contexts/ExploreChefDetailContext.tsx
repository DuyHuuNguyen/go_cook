import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getExploreChefDetail } from "../clients/ExploreChefClient";
import type { ExploreChefDetail } from "../types/ExploreChefTypes";

interface IExploreChefDetailContext {
  chefDetail: ExploreChefDetail | null;
  loading: boolean;
  error: string | null;
  refreshChefDetail: () => Promise<void>;
}

const ExploreChefDetailContext = createContext<
  IExploreChefDetailContext | undefined
>(undefined);

interface ExploreChefDetailProviderProps {
  chefId?: string | number;
  children: ReactNode;
}

export function ExploreChefDetailProvider({
  chefId,
  children,
}: ExploreChefDetailProviderProps) {
  const [chefDetail, setChefDetail] = useState<ExploreChefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericChefId = Number(chefId);
  const isValidChefId =
    chefId !== undefined &&
    String(chefId).trim() !== "" &&
    Number.isInteger(numericChefId) &&
    numericChefId > 0;

  const fetchChefDetail = useCallback(
    async (isCancelled?: () => boolean) => {
      if (!isValidChefId) {
        if (!isCancelled?.()) {
          setChefDetail(null);
          setError("Mã đầu bếp không hợp lệ.");
          setLoading(false);
        }
        return;
      }

      if (!isCancelled?.()) {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await getExploreChefDetail(numericChefId);
        if (isCancelled?.()) return;
        setChefDetail(data ?? null);
        if (!data) {
          setError("Không tìm thấy thông tin đầu bếp.");
        }
      } catch (err: unknown) {
        if (isCancelled?.()) return;
        console.error("Failed to fetch chef detail:", err);
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404 || status === 400) {
          setError("Không tìm thấy hồ sơ đầu bếp này.");
        } else {
          setError("Không thể tải thông tin đầu bếp. Vui lòng thử lại sau.");
        }
        setChefDetail(null);
      } finally {
        if (!isCancelled?.()) {
          setLoading(false);
        }
      }
    },
    [isValidChefId, numericChefId],
  );

  useEffect(() => {
    let cancelled = false;
    setChefDetail(null);
    void fetchChefDetail(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [fetchChefDetail]);

  const refreshChefDetail = useCallback(async () => {
    await fetchChefDetail();
  }, [fetchChefDetail]);

  const contextValue = useMemo(
    () => ({
      chefDetail,
      loading,
      error,
      refreshChefDetail,
    }),
    [chefDetail, loading, error, refreshChefDetail],
  );

  return (
    <ExploreChefDetailContext.Provider value={contextValue}>
      {children}
    </ExploreChefDetailContext.Provider>
  );
}

export function useExploreChefDetail(): IExploreChefDetailContext {
  const context = useContext(ExploreChefDetailContext);
  if (!context) {
    throw new Error(
      "useExploreChefDetail must be used within an ExploreChefDetailProvider",
    );
  }
  return context;
}

