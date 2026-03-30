// API Configuration — Axios instance with auth token injection
import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});



export default API;