// API configuration
const getApiUrl = () => {
  // In production, use the environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || window.location.origin;
  }
  // In development, use the env variable or fallback to localhost
  return import.meta.env.VITE_API_URL || "http://localhost:4000";
};

const getWsUrl = () => {
  const apiUrl = getApiUrl();
  // Convert http:// to ws:// and https:// to wss://
  return apiUrl.replace(/^http/, "ws").replace(/^https/, "wss");
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();

