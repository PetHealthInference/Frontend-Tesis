import type { LoginRequest, LoginResponse } from "../types/auth";
import { apiClient } from "./apiClient";

const TOKEN_STORAGE_KEY = "access_token";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const payload: LoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", payload, {
      skipAuth: true,
    });

    localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
    return response;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
