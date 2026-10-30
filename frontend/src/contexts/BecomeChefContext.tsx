import { createContext, useContext, useState, type ReactNode } from "react";
import { becomeChef } from "../clients/UserClient.tsx";

interface BecomeChefProps {
  children: ReactNode;
}

const BecomeChefContext = createContext<any>(null);

function BecomeChefProvider({ children }: BecomeChefProps) {
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [wardCode, setWardCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitBecomeChef = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await becomeChef(
        bio,
        experienceYears,
        wardCode,
        provinceCode,
        phone,
      );

      setSuccess(true);
      return response;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Đăng ký trở thành đầu bếp thất bại.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BecomeChefContext.Provider
      value={{
        bio,
        setBio,
        experienceYears,
        setExperienceYears,
        wardCode,
        setWardCode,
        provinceCode,
        setProvinceCode,
        loading,
        error,
        success,
        submitBecomeChef,
      }}
    >
      {children}
    </BecomeChefContext.Provider>
  );
}

export default BecomeChefProvider;

export function useBecomeChef() {
  const context = useContext(BecomeChefContext);

  if (!context) {
    throw new Error("useBecomeChef must be used within a BecomeChefProvider");
  }

  return context;
}
