// API Configuration — Axios instance with auth token injection
import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("unilance_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;