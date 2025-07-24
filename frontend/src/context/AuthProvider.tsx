// File: frontend/src/context/AuthProvider.tsx
import { LOCAL_STORAGE_KEYS } from "constants/app.constants";
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import * as userService from "services/userService";
import websocketService from "services/websocketService";
import type { UserPreferences } from "types/user.types";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

const defaultPreferences: UserPreferences = {
  chatBackgroundSetting: "#282828",
  fontSizeSetting: "medium",
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);

  const fetchAndSetUserPreferences = useCallback(() => {
    userService
      .getUserProfile()
      .then((profile) => {
        setPreferences({
          chatBackgroundSetting:
            profile.chatBackgroundSetting ||
            defaultPreferences.chatBackgroundSetting,
          fontSizeSetting:
            profile.fontSizeSetting || defaultPreferences.fontSizeSetting,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch user preferences:", error);
      });
  }, []);

  useEffect(() => {
    if (token) {
      const decodedToken: { sub: string } = jwtDecode(token);
      setUserEmail(decodedToken.sub);
      fetchAndSetUserPreferences();
      websocketService.connect(token, () => {
        console.log("WebSocket connection confirmed in AuthProvider.");
        setIsSocketConnected(true);
      });
    } else {
      setUserEmail(null);
      setPreferences(defaultPreferences);
      setIsSocketConnected(false);
    }
    return () => {
      websocketService.disconnect();
      setIsSocketConnected(false);
    };
  }, [token, fetchAndSetUserPreferences]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  };

  const updatePreferences = (newPrefs: UserPreferences): Promise<void> => {
    const oldPrefs = preferences;
    setPreferences(newPrefs);

    return userService
      .updateUserPreferences(newPrefs)
      .then(() => {
        toast.success(t("success.preferences.update"));
      })
      .catch((error) => {
        console.error("Failed to save preferences:", error);
        setPreferences(oldPrefs);
        throw error;
      });
  };

  const value = {
    token,
    userEmail,
    isSocketConnected,
    preferences,
    login,
    logout,
    updatePreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
