import axios from "axios";
import { authStore } from "../stores/authStore";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  getProfile,
  updateProfile,
  resetPassword,
} from "../clients/ProfileClients.tsx";

type ProfileContextType = {
  profileData: any | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  putProfile: (profileUpdate: ProfileUpdate) => Promise<void>;
  passwordError: string | null;
  updatePassword: (resetPassword: RestPassword) => Promise<void>;
  setProfileData: (profileUpdate: Profile | null) => void;
};
export interface Profile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  isChef: boolean;
  chefProfile: ChefProfile | null;
  roles: string[];
}
export interface ChefProfile {
  bio: string;
  experienceYears: number;
}
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

type ProfileProviderType = {
  children: ReactNode;
};

export interface ProfileUpdate {
  username: string;
  instructorName: string;
  instructorAbout: string;
}
class RestPassword {
  newPassword: string;
  confirmPassword: string;

  constructor(newPassword: string, confirmPassword: string) {
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }

  validatePassword = (): string | null => {
    if (!this.newPassword) {
      return "New password is required.";
    }

    if (!this.confirmPassword) {
      return "Please confirm your password.";
    }

    if (this.newPassword.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(this.newPassword)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(this.newPassword)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(this.newPassword)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/~`+=;']/.test(this.newPassword)) {
      return "Password must contain at least one special character.";
    }

    if (this.newPassword !== this.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };
}

export default RestPassword;

export function ProfileProvider({ children }: ProfileProviderType) {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const pendingProfile = useRef<Promise<void> | null>(null);
  const fetchProfile = useCallback((): Promise<void> => {
    if (pendingProfile.current) return pendingProfile.current;
    const request = (async () => {
      setLoading(true);
      try {
        const data = await getProfile();
        if (!data.success) throw new Error("Failed to load profile");
        setProfileData(data.data);
        setError(null);
        authStore.setAuthStatus("authorized");
      } catch (err) {
        setProfileData(null);
        if (
          axios.isAxiosError(err) &&
          [400, 401, 403].includes(err.response?.status || 0)
        ) {
          authStore.setAuthStatus("unauthorized");
        } else {
          setError("Không thể kiểm tra phiên đăng nhập. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    })();
    pendingProfile.current = request;
    void request.finally(() => {
      pendingProfile.current = null;
    });
    return request;
  }, []);

  const updatePassword = useCallback(async (input: RestPassword) => {
    try {
      if (!input) {
        setPasswordError("Failed to update password, try again");
        return;
      }

      const invalidMessage = input.validatePassword();
      if (invalidMessage) {
        setPasswordError(invalidMessage);
        return;
      }

      const data = await resetPassword(input);

      if (!data.success) {
        setPasswordError("Failed to load profile");
      }
    } catch (e) {
      setPasswordError("Failed to update password");
    }
  }, []);

  const putProfile = useCallback(async (input: ProfileUpdate) => {
    try {
      if (!input) {
        setError("Failed to update profile, try again");
        return;
      }
      const data = await updateProfile(input);

      if (!data.success) {
        setError("Failed to load profile");
      }
    } catch (error) {
      setError("Failed to load profile");
    }
  }, []);

  const value = useMemo<ProfileContextType>(
    () => ({
      profileData,
      loading,
      error,
      fetchProfile,
      putProfile,
      passwordError,
      updatePassword,
      setProfileData,
    }),
    [
      profileData,
      loading,
      error,
      fetchProfile,
      putProfile,
      passwordError,
      updatePassword,
      setProfileData,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
