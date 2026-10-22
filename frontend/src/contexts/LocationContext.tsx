import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import getAllProvinces, {findWards} from "../clients/LocationClient.tsx";



const LocationContext = createContext<any>(null);

function LocationProvider({ children }: { children: ReactNode }) {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const findAllProvinces = async () => {
        try {
            setLoading(true);

            const response = await getAllProvinces();

            if (response.success) {
                setProvinces(response.data);
            }
            console.log(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách tỉnh/thành phố:", error);
        } finally {
            setLoading(false);
        }
    };

    const searchWards = async (wardName: string) => {
        if (!wardName.trim()) {
            setWards([]);
            return;
        }

        try {
            const response = await findWards(wardName);

            if (response.success) {
                setWards(response.data);
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm phường/xã:", error);
        }
    };

    useEffect(() => {
        void findAllProvinces();
        console.log("Call  get province")
    }, []);

    return (
        <LocationContext.Provider
            value={{
                provinces,
                wards,
                loading,
                getAllProvinces,
                searchWards,
                findAllProvinces
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export default  LocationProvider;

export function useLocation() {
    const context = useContext(LocationContext);

    if (!context) {
        throw new Error(
            "useLocation must be used within a LocationProvider"
        );
    }

    return context;

}