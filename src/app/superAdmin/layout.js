"use client";
import HeaderSuperAdmin from "@/components/headers/HeaderSuperAdmin";
import TopBar from "@/components/ui/TopBar";
import { UserProvider } from "@/context/UserContext";

import { PageTitleProvider } from "@/context/PageTitleContext";

const Layout = ({ children }) => {
  return (
    <UserProvider>
      <PageTitleProvider>
        <div className="flex min-h-screen">
          <HeaderSuperAdmin />

          <div className="flex-1 bg-gray-50 min-h-screen flex flex-col">
            <TopBar />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </PageTitleProvider>
    </UserProvider>
  );
};

export default Layout;
