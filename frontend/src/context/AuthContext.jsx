import { useCallback, useEffect, useMemo, useState } from "react";

import { getCurrentUser, login as loginRequest } from "../api/auth.api.js";
import { tokenStorageKey, unauthorizedEvent } from "../api/client.js";
import AuthContext from "./authContext.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(tokenStorageKey),
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  const clearSession = useCallback(() => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    function handleSessionRemoval(event) {
      if (
        event.type === unauthorizedEvent ||
        (event.key === tokenStorageKey && !event.newValue)
      )
        clearSession();
    }
    window.addEventListener(unauthorizedEvent, handleSessionRemoval);
    window.addEventListener("storage", handleSessionRemoval);
    return () => {
      window.removeEventListener(unauthorizedEvent, handleSessionRemoval);
      window.removeEventListener("storage", handleSessionRemoval);
    };
  }, [clearSession]);

  useEffect(() => {
    let isActive = true;
    if (!token) {
      return undefined;
    }
    getCurrentUser()
      .then((currentUser) => {
        if (isActive) setUser(currentUser);
      })
      .catch(() => {
        if (isActive) clearSession();
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [clearSession, token]);

  const login = useCallback(async (credentials) => {
    const result = await loginRequest(credentials);
    localStorage.setItem(tokenStorageKey, result.token);
    setToken(result.token);
    setUser(result.user);
    setIsLoading(false);
    return result.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout: clearSession,
    }),
    [clearSession, isLoading, login, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
