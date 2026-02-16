import { redHatDisplay } from "./font";
import "./globals.css";
import { ToastContainer } from "react-toastify";
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
  rel="stylesheet"
/>;

export const metadata = {
  title: "Intuapp Asambleas",
  description: "Plataforma de gestión de asambleas y votaciones en línea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={redHatDisplay.className}>
      <body className="w-full h-full bg-[#F4F7F9]">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
