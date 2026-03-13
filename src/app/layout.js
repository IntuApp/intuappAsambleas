import { cookies } from 'next/headers';
import { AuthProvider } from '@/context/AuthContext';
import { Red_Hat_Display } from 'next/font/google';
import './globals.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 1. Instanciamos la fuente y creamos una variable CSS
const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-red-hat-display',
  display: 'swap',
});

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const initialSession = sessionCookie ? JSON.parse(sessionCookie) : null;

  return (
    // 2. Inyectamos la variable de la fuente en el HTML
    <html lang="es" className={`${redHatDisplay.variable}`}>
      {/* 3. Le decimos al body que use la fuente "sans" de Tailwind y active el antialiasing para que se vea nítida */}
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <AuthProvider initialSession={initialSession}>
          {children}
        </AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </body>
    </html>
  );
}