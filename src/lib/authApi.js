import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// identifier can be a superadmin's email or a Sales Manager's mobile number —
// the backend figures out which by whether it contains "@".
export const login = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: identifier,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const logout = async () => {
  try {
    await axios.post(`${API_BASE_URL}/auth/logout`);
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
