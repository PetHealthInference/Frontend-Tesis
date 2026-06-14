const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl && import.meta.env.PROD) {
  throw new Error("VITE_API_BASE_URL debe estar configurado en produccion.");
}

export const env = {
  apiBaseUrl: apiBaseUrl ?? "",
};
