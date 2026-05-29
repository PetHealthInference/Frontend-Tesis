const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const TOKEN_STORAGE_KEY = "access_token";

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function buildUrl(endpoint: string): string {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizedBaseUrl}${normalizedEndpoint}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(status: number, data: unknown): string {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  const messages: Record<number, string> = {
    401: "No autorizado. Inicia sesion nuevamente.",
    403: "No tienes permisos para realizar esta accion.",
    404: "Recurso no encontrado.",
    422: "Los datos enviados no son validos.",
    500: "Error interno del servidor.",
  };

  return messages[status] ?? "Error al comunicarse con el servidor.";
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers, ...fetchOptions } = options;
  const token = getToken();

  const response = await fetch(buildUrl(endpoint), {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    throw new ApiError(response.status, getErrorMessage(response.status, data), data);
  }

  return data as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
