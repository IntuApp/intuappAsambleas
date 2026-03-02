import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { ICON_PATHS } from "@/constans/iconPaths";
import { logoutUser } from "@/lib/auth";

// Definimos los links exclusivos del operador (Sin "Suscripción")
const operatorLinks = [
  { label: "Inicio", href: "/operario", iconPath: ICON_PATHS.home },
  { label: "Entidades", href: "/operario/entidades", iconPath: ICON_PATHS.apartament },
  {
    label: "Salir",
    action: logoutUser,
    iconPath: ICON_PATHS.exit
  }];

export default function OperatorLayout({ children }) {
  return (
    <div className="flex w-full h-screen bg-[#F3F6F9] overflow-hidden">
      <Sidebar links={operatorLinks} basePath="/operario" />

      <div className="flex-1 flex flex-col overflow-hidden py-6">
        <Topbar basePath="/operario" />
        <main className="flex-1 overflow-y-auto px-20 py-5">
          {children}
        </main>
      </div>
    </div>
  );
}