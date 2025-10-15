import React from "react";
import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "@shared/styles/css/globals.css";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import customTheme from "@/shared/lib/theme/custom-theme";
import { CustomizerContextProvider } from "@processes/customizer/model/CustomizerContext";
import QueryProvider from "./providers/QueryProvider";
import AuthProvider from "./providers/AuthProvider";
import { SessionInitializer } from "@/entities/session/ui/SessionInitializer";
import ToastProvider from "./providers/ToastProvider";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "الازدهار للحلويات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeModeScript />
      </head>
      <body className={`${alexandria.className}`}>
        <Flowbite theme={{ theme: customTheme }}>
          <AuthProvider>
            <CustomizerContextProvider>
              <QueryProvider>
                <SessionInitializer />
                <ToastProvider />
                {children}
              </QueryProvider>
            </CustomizerContextProvider>
          </AuthProvider>
        </Flowbite>
      </body>
    </html>
  );
}
