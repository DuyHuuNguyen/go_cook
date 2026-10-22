import {createContext, useCallback, useContext, useState, type ReactNode} from "react";
import {createMenu, type CreateMenuRequest} from "../clients/MenuClient.tsx";

interface MenuContextType {
    loading: boolean;
    error: string | null;
    success: boolean;
    submitMenu: (payload: CreateMenuRequest) => Promise<boolean>;
    resetStatus: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export default function MenuProvider({children}: { children: ReactNode }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submitMenu = useCallback(async (payload: CreateMenuRequest) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await createMenu(payload);
            setSuccess(true);
            return true;
        } catch (e: any) {
            setError(
                e?.response?.data?.message ?? e?.message ?? "Tạo thực đơn thất bại"
            );
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetStatus = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return (
        <MenuContext.Provider value={{loading, error, success, submitMenu, resetStatus}}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const ctx = useContext(MenuContext);
    if (!ctx) {
        throw new Error("useMenu must be used within a MenuProvider");
    }
    return ctx;
}