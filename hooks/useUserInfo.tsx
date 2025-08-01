import api from "@/api";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";

interface SellerInfo {
  storeName: string;
  storeSlug: string;
  status: "pending" | "active" | "suspended";
  [key: string]: any;
}

interface UserInfo {
  id: string | null;
  isLoggedIn: boolean;
  name: string | null;
  email: string | null;
  role: string | null;
  accountType: string | null;
  sellerInfo?: SellerInfo | null;
}

interface UserInfoContextType {
  userInfo: UserInfo;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRefreshed: boolean;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined
);

export const UserInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    isLoggedIn: false,
    name: null,
    email: null,
    role: null,
    accountType: null,
    sellerInfo: null,
  });

  const [hasRefreshed, setHasRefreshed] = useState(false);

  const clearUser = () => {
    setUserInfo({
      id: null,
      isLoggedIn: false,
      name: null,
      email: null,
      role: null,
      accountType: null,
      sellerInfo: null,
    });
  };

  const refreshUser = useCallback(async () => {
    try {
      const userRes = await api.get("/auth/me");
      const user = userRes.data;

      let sellerInfo: SellerInfo | null = null;
      try {
        const sellerRes = await api.get("/seller/profile", {
          params: { userId: user._id },
        });
        sellerInfo = sellerRes.data;
      } catch {
        // Ignore 404
      }

      setUserInfo({
        id: user._id,
        isLoggedIn: true,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        sellerInfo,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          const storedToken = await SecureStore.getItemAsync("refreshToken");
          if (!storedToken) throw new Error("No refresh token found");

          const refreshRes = await api.post(
            "/auth/refresh-token",
            { returnRefreshToken: true },
            {
              headers: {
                "x-refresh-token": storedToken,
              },
            }
          );

          const { accessToken, refreshToken } = refreshRes.data;
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          await SecureStore.setItemAsync("refreshToken", refreshToken);

          return await refreshUser(); // retry once
        } catch (refreshErr) {
          console.error("Refresh failed", refreshErr);
          clearUser();
          Toast.show({
            type: "error",
            text1: "Session expired",
            text2: "Please login again.",
          });
        }
      } else {
        clearUser();
        console.error("Failed to fetch user:", err);
      }
    } finally {
      setHasRefreshed(true);
    }
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await api.post("/auth/signin", {
          email,
          password,
          returnRefreshToken: true,
        });

        const { accessToken, refreshToken } = res.data;

        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        await SecureStore.setItemAsync("refreshToken", refreshToken);

        await refreshUser();

        Toast.show({
          type: "success",
          text1: "Welcome back",
          text2: email,
        });
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Login failed. Please try again.";

        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: msg,
        });

        throw new Error(msg);
      }
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("refreshToken");

      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            ...(storedToken ? { "x-refresh-token": storedToken } : {}),
          },
        }
      );

      await SecureStore.deleteItemAsync("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      clearUser();

      Toast.show({
        type: "success",
        text1: "Logged out successfully",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: "Try again later",
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: UserInfoContextType = {
    userInfo,
    login,
    logout,
    refreshUser,
    hasRefreshed,
  };

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfo = (): UserInfoContextType => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error("useUserInfo must be used within a UserInfoProvider");
  }
  return context;
};
