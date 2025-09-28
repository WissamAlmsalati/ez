"use client";
import { Sidebar } from "@widgets/sidebar";
import { Header } from "@widgets/header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full min-h-screen">
      <div className="page-wrapper flex w-full">
        {/* Header/sidebar */}
        <Sidebar />
        <div className="body-wrapper w-full bg-lightgray dark:bg-dark">
          {/* Top Header  */}

          <Header/>

          {/* Body Content  */}
          <div className="container mx-auto  pb-[30px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
