import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {getProfile, updateProfile,resetPassword} from "../clients/ProfileClients.tsx";

type ProfileContextType = {
    profileData: any | null,
    loading: boolean,
    error: string | null,
    fetchProfile: () => Promise<void>,
    putProfile: (profileUpdate:ProfileUpdate) => Promise<void>,
    passwordError: string | null,
    updatePassword: (resetPassword: RestPassword) => Promise<void>,
    setProfileData:(profileUpdate:Profile | null) => void
};
export interface Profile {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    isChef: boolean;
    chefProfile: ChefProfile | null;
    roles: string [];
}
export interface  ChefProfile{
    bio: string;
    experienceYears: number;
}
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

type ProfileProviderType = {
    children: ReactNode;
}

export  interface ProfileUpdate{
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


export default RestPassword


export function ProfileProvider({ children }: ProfileProviderType) {
    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
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

    const fetchProfile = useCallback(async () => {


        setLoading(true);
        try {
            const data = await getProfile();

            if (!data.success) {
                setError("Failed to load profile");
            }

            setProfileData(data.data);
            console.log(data.data)
        } catch (err) {
            console.log(err);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePassword = useCallback(async (input : RestPassword) => {
        try{
            if (!input) {
                setPasswordError("Failed to update password, try again");
                return;
            }

            const invalidMessage = input.validatePassword();
            if (invalidMessage) {
                setPasswordError(invalidMessage);
                return;
            }

            const data = await  resetPassword(input);

            if (!data.success) {
                setPasswordError("Failed to load profile");
            }

        } catch (e){
            setPasswordError("Failed to update password");
        }
    },[])

    const putProfile = useCallback(async (input : ProfileUpdate) => {
        try{
            if (!input) {
                setError("Failed to update profile, try again");
                return;
            }
            const data = await  updateProfile(input);

            if (!data.success) {
                setError("Failed to load profile");
            }
        } catch (error) {
            setError("Failed to load profile");
        }
    },[])

    const value = useMemo<ProfileContextType>(
        () => ({
            profileData,
            loading,
            error,
            fetchProfile,
            putProfile,
            passwordError,
            updatePassword,
            setProfileData
        }),
        [
            profileData,
            loading,
            error,
            fetchProfile,
            putProfile,
            passwordError,
            updatePassword,
            setProfileData
        ]
    );

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within ProfileProvider');
    }
    return context;
}