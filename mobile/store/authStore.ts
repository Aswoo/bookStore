import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import {
  AuthSuccessResponse,
  AuthUser,
  ErrorResponse,
} from "../types/api";

type AuthResult = { success: true } | { success: false; error: string };

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const parseAuthResponse = async (response: Response): Promise<AuthSuccessResponse> => {
  const data = (await response.json()) as AuthSuccessResponse & ErrorResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong");
  }

  return data;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await parseAuthResponse(response);

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await parseAuthResponse(response);

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;

      set({ token, user });
    } catch (error) {
      console.log("Auth check failed", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
