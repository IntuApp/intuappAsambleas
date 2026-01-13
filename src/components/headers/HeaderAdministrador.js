"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function HeaderAdministrador() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente.");
      router.push("/login");
    } catch (error) {
      toast.error("Error al cerrar sesión.");
    }
  };

  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm relative">
      {/* LOGO */}
      <div className="flex items-center space-x-2">
        <Image
          src="/logos/logo-header.png"
          alt="Intuapp Logo"
          width={28}
          height={28}
          className="object-contain"
        />
        <span className="text-xl font-semibold text-[#7B8CFF] tracking-wide">
          intuapp
        </span>
      </div>

      {/* USUARIO */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-3 focus:outline-none"
        >
          <div className="text-sm text-right">
            <span className="font-semibold text-gray-900">Invitado</span>
            <span className="text-gray-500"> | Administrador</span>
          </div>

          <div className="w-8 h-8 flex items-center justify-center bg-[#C8E8E8] text-[#006D6D] rounded-full font-bold">
            <span>A</span>
          </div>
        </button>

        {/* DROPDOWN MENU */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
