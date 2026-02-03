"use client";
import HeaderOperario from "@/components/headers/HeaderOperario";
import TopBar from "@/components/ui/TopBar";
import { UserProvider } from "@/context/UserContext";
import { PageTitleProvider } from "@/context/PageTitleContext";

const Layout = ({ children }) => {
  return (
    <UserProvider>
      <PageTitleProvider>
        <main className="flex w-full h-full bg-[#F3F6F9]">
          <HeaderOperario />
          <div className="flex w-full h-full flex-col justify-center items-center align-center ">
            <div className=" w-full h-full max-w-[1128px] max-h-[1380px] my-8 flex flex-col gap-8">
              <TopBar />
              {children}
            </div>
          </div>
        </main>
      </PageTitleProvider>
    </UserProvider>
  );
};

export default Layout;
