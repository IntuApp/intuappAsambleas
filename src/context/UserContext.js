"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth(); // usuario autenticado y estado de carga

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado
export const useUser = () => useContext(UserContext);
