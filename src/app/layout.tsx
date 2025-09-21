import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./css/globals.css";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import customTheme from "@/shared/lib/theme/custom-theme";
import { CustomizerContextProvider } from "@processes/customizer/model/CustomizerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MaterialM - Nextjs",
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
      <body className={`${inter.className}`}>
        <Flowbite theme={{ theme: customTheme }}>
          <CustomizerContextProvider>
            {children}
          </CustomizerContextProvider>
        </Flowbite>
      </body>
    </html>
  );
}
