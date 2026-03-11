// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthDB } from "../services/LocalDatabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem("currentUserId");
        if (savedUserId) {
          const userData = await AuthDB.getCurrentUser(parseInt(savedUserId));
          if (userData) setUser(userData);
          else await AsyncStorage.removeItem("currentUserId");
        }
      } catch (e) {
        console.error("Load user error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const userData = await AuthDB.login(email, pass);
    setUser(userData);
    await AsyncStorage.setItem("currentUserId", String(userData.id));
  };

  const register = async (email: string, pass: string, name: string) => {
    const userId = await AuthDB.register(email, pass, name);
    const userData = await AuthDB.getCurrentUser(userId);
    setUser(userData);
    await AsyncStorage.setItem("currentUserId", String(userId));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("currentUserId");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
