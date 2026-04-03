import axios from "axios";

// Prefer runtime override via EXPO_PUBLIC_API_BASE_URL; falls back to local dev server.
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
