import {
    createContext,
    useCallback,
    useMemo,
    useState,
    useContext,
    type ReactNode,
} from "react";
import { Toast, ToastContainer } from "react-bootstrap";

type Notification = {
    message: string;
    variant: string;
    delay: number;
    autohide: boolean;
    title: string;
};

type NotifyOptions = Partial<Omit<Notification, "message">>;

type AppContextType = {
    notification: Notification | null;
    notify: (message: string, options?: NotifyOptions) => void;
    clearNotification: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
    children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
    const [notification, setNotification] = useState<Notification | null>(null);

    const notify = useCallback(
        (message: string, options: NotifyOptions = {}) => {
            setNotification({
                message,
                variant: options.variant ?? "primary",
                delay: options.delay ?? 3000,
                autohide: options.autohide ?? true,
                title: options.title ?? "Notification",
            });
        },
        []
    );

    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const value = useMemo<AppContextType>(
        () => ({
            notification,
            notify,
            clearNotification,
        }),
        [notification, notify, clearNotification]
    );

    return (
        <AppContext.Provider value={value}>
            {children}
            <ToastContainer position="top-end" className="p-3">
                {notification && (
                    <Toast
                        bg={notification.variant}
                        delay={notification.delay}
                        autohide={notification.autohide}
                        onClose={clearNotification}
                    >
                        <Toast.Header>
                            <strong className="me-auto">{notification.title}</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white">{notification.message}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);

    if (context === undefined) {
        throw new Error("useApp must be used within AppProvider");
    }

    return context;
}
