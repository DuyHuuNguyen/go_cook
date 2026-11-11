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
import { getExploreChefs } from "../clients/ExploreChefClient";
import type { ExploreChefItem } from "../types/ExploreChefTypes";

interface IExploreChefContext {
  chefs: ExploreChefItem[];
  lastId: number;
  hasNext: boolean;
  loading: boolean;
  error: string | null;
  loadMoreChefs: () => Promise<void>;
  refreshChefs: () => Promise<void>;
}

const ExploreChefContext = createContext<IExploreChefContext | undefined>(
  undefined,
);

interface ExploreChefProviderProps {
  children: ReactNode;
}

export function ExploreChefProvider({ children }: ExploreChefProviderProps) {
  const [chefs, setChefs] = useState<ExploreChefItem[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastIdRef = useRef(0);
  const hasNextRef = useRef(true);
  const loadingRef = useRef(false);

  const loadMoreChefs = useCallback(async () => {
    if (loadingRef.current || !hasNextRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await getExploreChefs(lastIdRef.current);
      const newChefs = result?.data ?? [];

      setChefs((prev) => {
        const existingIds = new Set(prev.map((c) => c.userId));
        const filteredNew = newChefs.filter((c) => !existingIds.has(c.userId));
        return [...prev, ...filteredNew];
      });

      const nextHasMore = Boolean(result?.hasNext) && newChefs.length > 0;
      lastIdRef.current = result?.lastId ?? -1;
      hasNextRef.current = nextHasMore;
      setHasNext(nextHasMore);
    } catch (err) {
      console.error("Failed to load explore chefs:", err);
      setError("Không thể tải danh sách đầu bếp. Vui lòng thử lại.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const refreshChefs = useCallback(async () => {
    setChefs([]);
    lastIdRef.current = 0;
    hasNextRef.current = true;
    setHasNext(true);
    setError(null);
    await loadMoreChefs();
  }, [loadMoreChefs]);

  useEffect(() => {
    void loadMoreChefs();
  }, [loadMoreChefs]);

  const contextValue = useMemo(
    () => ({
      chefs,
      lastId: lastIdRef.current,
      hasNext,
      loading,
      error,
      loadMoreChefs,
      refreshChefs,
    }),
    [chefs, hasNext, loading, error, loadMoreChefs, refreshChefs],
  );

  return (
    <ExploreChefContext.Provider value={contextValue}>
      {children}
    </ExploreChefContext.Provider>
  );
}

export function useExploreChef() {
  const context = useContext(ExploreChefContext);
  if (!context) {
    throw new Error(
      "useExploreChef must be used within an ExploreChefProvider",
    );
  }
  return context;
}

export default ExploreChefProvider;

