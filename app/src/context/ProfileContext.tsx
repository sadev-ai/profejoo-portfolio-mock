// src/context/ProfileContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ProfileResponse, ProfileData } from "@/types/profile";
import * as profileService from "@/services/profile.service";
import { useAuth } from "@/hooks/useAuth";

interface ProfileContextType {
  profile: ProfileResponse | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileData>) => Promise<ProfileResponse>;
  clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Export context for custom providers
export { ProfileContext };
export type { ProfileContextType };

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      
      // If profile basics is empty but we have user data, initialize with user email
      if (data && user?.email && (!data.data?.basics?.email || !data.data?.basics?.first_name)) {
        if (!data.data?.basics?.email) {
          // Initialize profile with user email if basics is empty
const updatedData = await profileService.updateProfile({
            basics: {
              email: user.email,
              first_name: data.data?.basics?.first_name || "",
              last_name: data.data?.basics?.last_name || "",
            }
          });
          setProfile(updatedData);
          return;
        }
      }
      
      setProfile(data);
    } catch (err: any) {
      console.error("[ProfileContext] Failed to fetch profile:", err);
      setError(err.message || "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const updateProfile = useCallback(
    async (updates: Partial<ProfileData>): Promise<ProfileResponse> => {
      try {
        setError(null);
        const updatedProfile = await profileService.updateProfile(updates);
        setProfile(updatedProfile);
        return updatedProfile;
      } catch (err: any) {
        console.error("[ProfileContext] Failed to update profile:", err);
        setError(err.message || "Failed to update profile");
        throw err;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load profile when user logs in
  useEffect(() => {
    // Only refresh if we don't have profile data yet or if auth state changed
    if (isAuthenticated && !profile) {
      refreshProfile();
    } else if (!isAuthenticated && profile) {
      setProfile(null);
      setLoading(false);
    }
  }, [isAuthenticated]); // Remove refreshProfile from deps to avoid re-fetching on HMR

  const value: ProfileContextType = {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
    clearError,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
