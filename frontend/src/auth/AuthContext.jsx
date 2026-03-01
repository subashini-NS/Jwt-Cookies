import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasCheckedAuth = useRef(false);

  const loadUser = async (throwOnError = false) => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      setPermissions(res.data.user.permissions || []);
      return res.data.user;
    } catch (error) {
      setUser(null);
      setPermissions([]);
      if (throwOnError) {
        throw error;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      loadUser();
    }
  }, []);

  const login = async (credentials) => {
    await api.post("/auth/login", credentials);
    await loadUser(true);
  };

  const register = async (data) => {
    await api.post("/auth/register", data);
    await loadUser(true);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setPermissions([]);
    }
  };

  const hasPermission = (perm) => permissions.includes(perm);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        hasPermission,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
