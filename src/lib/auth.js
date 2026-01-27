import { useState, useEffect } from "react";

const USER_SESSION_KEY = "user_session";

export const login = async (email, password) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const userSession = await response.json();

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userSession));
    window.dispatchEvent(new Event("storage")); // Trigger update for useAuth
    return userSession;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: error.message };
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw new Error(error.message);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem(USER_SESSION_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();

    const handleStorageChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { user };
};

export const resetPassword = async (email) => {
  // Not implemented for custom auth yet, or needs a different approach (e.g. email service)
  console.warn("Reset password not implemented for custom auth");
  return false;
};
