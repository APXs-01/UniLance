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

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("unilance_token");
      localStorage.removeItem("unilance_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Member 4 - Auth API ──────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => API.post("/auth/register", data),
  verifyEmail:    (data) => API.post("/auth/verify-email", data),
  resendOTP:      (data) => API.post("/auth/resend-otp", data),
  login:          (data) => API.post("/auth/login", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword:  (data) => API.post("/auth/reset-password", data),
  getMe:          ()     => API.get("/auth/me"),
  changePassword: (data) => API.put("/auth/change-password", data),
};

// ─── Member 4 - User/Profile API ─────────────────────────────────────────────
export const userAPI = {
  getPlatformStats:  ()       => API.get("/users/stats"),
  getFreelancers:    (params) => API.get("/users/freelancers", { params }),
  getPublicProfile:  (id)     => API.get(`/users/profile/${id}`),
  updateProfile:     (data)   => API.put("/users/profile", data),
  updatePicture:     (data)   => API.put("/users/profile/picture", data),
  addSkill:          (data)   => API.post("/users/skills", data),
  removeSkill:       (id)     => API.delete(`/users/skills/${id}`),
  updateAvailability:(data)   => API.put("/users/availability", data),
  getAnalytics:      ()       => API.get("/users/analytics"),
  exportPortfolio:   ()       => API.get("/users/portfolio/export", { responseType: "blob" }),
};

// ─── Member 4 - SmartQuest API ────────────────────────────────────────────────
export const smartQuestAPI = {
  start:      (data)     => API.post("/smartquest/start", data),
  submit:     (id, data) => API.post(`/smartquest/${id}/submit`, data),
  getHistory: ()         => API.get("/smartquest/history"),
};
export default API;