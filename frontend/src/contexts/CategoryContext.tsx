import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {getCategories} from "../clients/CategoryClient.tsx";

export interface ICategory {
    id: number;
    name: string;
}

interface ICategoryContext {
    categories: ICategory[];
    hasNext: boolean;
    loading: boolean;
    error: string | null;
    loadMoreCategories: () => Promise<void>;
    refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<ICategoryContext | undefined>(undefined);

function CategoryProvider({children}: { children: ReactNode }) {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastIdRef = useRef(0);
    const hasNextRef = useRef(true);
    const loadingRef = useRef(false);

    const loadMoreCategories = useCallback(async () => {
        if (loadingRef.current || !hasNextRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await getCategories(lastIdRef.current);
            const result = response.data;

            setCategories((prev) => [...prev, ...result.data]);

            lastIdRef.current = result.lastId;
            hasNextRef.current = result.hasNext;
            setHasNext(result.hasNext);
        } catch (err) {
            console.error("Failed to load categories:", err);
            setError("Không thể tải danh sách danh mục.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    const refreshCategories = useCallback(async () => {
        setCategories([]);
        lastIdRef.current = 0;
        hasNextRef.current = true;
        setHasNext(true);
        setError(null);
        await loadMoreCategories();
    }, [loadMoreCategories]);

    const value = useMemo(
        () => ({
            categories,
            hasNext,
            loading,
            error,
            loadMoreCategories,
            refreshCategories,
        }),
        [categories, hasNext, loading, error, loadMoreCategories, refreshCategories]
    );

    return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export default CategoryProvider;

export function useCategory() {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error("useCategory must be used within a CategoryProvider");
    }
    return context;
}