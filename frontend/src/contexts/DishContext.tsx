import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode, useRef, useEffect,
} from "react";
import {getDishes} from "../clients/DishClient.tsx";


export interface IDish {
    id: number;
    name: string;
}


interface IDishContext {
    dishes: IDish[];
    lastId: number;
    hasNext: boolean;
    loading: boolean;
    error: string | null;
    loadMoreDishes: () => Promise<void>;
    refreshDishes: () => Promise<void>;
    selectedDishes: number [];
    setSelectedDishes: (dishIds: number[]) => void;
}

const DishContext = createContext<IDishContext | undefined>(undefined);

interface DishProviderProps {
    children: ReactNode;
}

function DishProvider({children}: DishProviderProps) {
    const [dishes, setDishes] = useState<IDish[]>([]);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDishes, setSelectedDishes] = useState<number[]>([])

    const lastIdRef = useRef(0);
    const hasNextRef = useRef(true);
    const loadingRef = useRef(false);


    const loadMoreDishes = useCallback(async () => {
        if (loadingRef.current || !hasNextRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await getDishes(lastIdRef.current);
            const result = response.data;
            console.log(result)

            setDishes((previousDishes) => [
                ...previousDishes,
                ...result.data
            ]);

            lastIdRef.current = result.lastId;
            hasNextRef.current = result.hasNext;
            setHasNext(result.hasNext);
        } catch (err) {
            console.error("Failed to load dishes:", err);
            setError("Không thể tải danh sách món ăn.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    const refreshDishes = useCallback(async () => {
        setDishes([]);
        lastIdRef.current = 0;
        hasNextRef.current = true;
        setHasNext(true);
        setError(null);
        await loadMoreDishes();
    }, [loadMoreDishes]);

    const contextValue = useMemo(
        () => ({
            dishes,
            lastId: lastIdRef.current,
            hasNext,
            loading,
            error,
            loadMoreDishes,
            refreshDishes,
            selectedDishes,
            setSelectedDishes
        }),
        [dishes, hasNext, loading, error, loadMoreDishes, refreshDishes, selectedDishes, setSelectedDishes]
    );

    return <DishContext.Provider value={contextValue}>{children}</DishContext.Provider>;
}

export default DishProvider;

export function useDish() {
    const context = useContext(DishContext);

    if (!context) {
        throw new Error(
            "useDish must be used within a DishProvider"
        );
    }

    return context;
}
