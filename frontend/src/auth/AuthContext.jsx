import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasCheckedAuth = useRef(false);

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      setPermissions(res.data.user.permissions || []);
    } catch {
      setUser(null);
      setPermissions([]);
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
    await loadUser();
  };

  const register = async (data) => {
    await api.post("/auth/register", data);
    await loadUser();
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setPermissions([]);
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
