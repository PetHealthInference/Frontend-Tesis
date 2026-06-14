import { TOKEN_STORAGE_KEY } from "../config/auth";
import type { LoginRequest, LoginResponse } from "../types/auth";
import { apiClient } from "./apiClient";
import { API_ROUTES } from "./apiRoutes";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const payload: LoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>(API_ROUTES.auth.login, payload, {
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
