"use client";
import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rtl:text-right",
          title: "rtl:text-right",
          description: "rtl:text-right",
          closeButton: "rtl:left-2 ltr:right-2",
        },
      }}
      dir="rtl"
    />
  );
}
