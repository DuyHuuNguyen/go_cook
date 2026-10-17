import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {logout as logoutClient} from "../clients/UserClient.tsx";
import {authStore} from "../stores/authStore.ts";

type UserContextType = {
    isAuthorized: boolean;
    logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderType = {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderType) {
    const [isAuthorized, setIsAuthorized] = useState(!authStore.isUnAuthorized());

    useEffect(() => {
        return authStore.subscribe(() => {
            setIsAuthorized(!authStore.isUnAuthorized());
        })
    }, []);

    const logout = useCallback(async () => {
        const data = await logoutClient();

        if (!data.success) {
            throw new Error('Log out failed');
        }

        authStore.setAuthStatus("unauthorized");
    }, []);

    const value = useMemo<UserContextType>(
        () => ({
            isAuthorized,
            logout
        }),
        [
            isAuthorized,
            logout
        ]
    )

    return (
      <UserContext.Provider value={value}>
          {children}
      </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
}