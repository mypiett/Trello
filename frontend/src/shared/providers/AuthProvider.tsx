// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   type ReactNode,
// } from "react";
// import { tokenStorage } from "@/shared/utils/tokenStorage";
// import { authService } from "@/shared/api/services/authService";

// type AuthContextType = {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   user: any;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState<any>(null);

//   // =========================
//   // INIT CHECK AUTH
//   // =========================
//   useEffect(() => {
//     const initAuth = () => {
//       const token = tokenStorage.getAccessToken();
//       const storedUser = tokenStorage.getUser();

//       if (token) {
//         setIsAuthenticated(true);
//         setUser(storedUser);
//       } else {
//         setIsAuthenticated(false);
//         setUser(null);
//       }

//       setIsLoading(false);
//     };

//     initAuth();
//   }, []);

//   // =========================
//   // LOGIN
//   // =========================
//   const login = useCallback(async (email: string, password: string) => {
//     setIsLoading(true);

//     try {
//       const response = await authService.login({ email, password });
//       const { accessToken, refreshToken, user } = response.responseObject;

//       tokenStorage.setAccessToken(accessToken);
//       tokenStorage.setRefreshToken(refreshToken);
//       tokenStorage.setUser(user);

//       setIsAuthenticated(true);
//       setUser(user);
//     } catch (error) {
//       setIsAuthenticated(false);
//       setUser(null);
//       tokenStorage.clearTokens();
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // =========================
//   // LOGOUT
//   // =========================
//   const logout = useCallback(async () => {
//     setIsLoading(true);

//     try {
//       await authService.logout();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       tokenStorage.clearTokens();

//       setIsAuthenticated(false);
//       setUser(null);

//       sessionStorage.removeItem("redirect");

//       setIsLoading(false);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         isLoading,
//         user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return context;
// };

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { tokenStorage } from "@/shared/utils/tokenStorage";
import { authService } from "@/shared/api/services/authService";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ================= INIT AUTH =================
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    const storedUser = tokenStorage.getUser();

    setIsAuthenticated(!!token);
    setUser(token ? storedUser : null);

    setIsLoading(false);
  }, []);

  // ================= LOGIN =================
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      const { accessToken, refreshToken, user } = response.responseObject;

      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      tokenStorage.setUser(user);

      setIsAuthenticated(true);
      setUser(user);

      return response.responseObject;
    } catch (error) {
      tokenStorage.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================= LOGOUT =================
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      tokenStorage.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
