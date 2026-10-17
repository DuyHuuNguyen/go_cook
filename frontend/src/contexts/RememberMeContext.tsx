import {createContext, useContext, useEffect, useState} from "react";

interface RememberMeInfo {
    role: string;
    email: string;
    username: string;
    avatarUrl: string;
}

const RememberMeContext = createContext<RememberMeInfo | undefined>(undefined);

export function RememberMeProvider({ children }: { children: React.ReactNode }) {
    const [rememberMe, setRememberMe] = useState<RememberMeInfo>({
        role: "",
        email: "",
        username: "",
        avatarUrl:"",
    });

    useEffect(() => {
        const value = getCookie("remember_me");

        if (!value) return;

        const [role, email, usernameEncode, avatarUrl] = value.split("_");

        const username = usernameEncode.replace(/\+/g, " ");

        setRememberMe({
            role,
            email,
            username ,
            avatarUrl
        });
    }, []);

    return (
        <RememberMeContext.Provider value={rememberMe}>
            {children}
        </RememberMeContext.Provider>
    );
}

export function useRememberMe(){
    const  context = useContext(RememberMeContext);
    if (!context) {
        throw new Error('useRememberMe must be used within the context');
    }
    return context;
}

const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split("; ");

    const cookie = cookies.find((row) =>
        row.startsWith(`${name}=`)
    );

    return cookie
        ? decodeURIComponent(cookie.split("=")[1])
        : null;
};