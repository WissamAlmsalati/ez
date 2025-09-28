"use client";
import React from "react";
import { Button, Spinner } from "flowbite-react";

interface RetryErrorProps {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

export default function RetryError({
  message = "حدث خطأ في التحميل",
  onRetry,
  retrying,
  className = "",
}: RetryErrorProps) {
  return (
    <div
      className={`p-4 text-red-600 bg-white border rounded space-y-3 ${className}`}
    >
      <div className="text-sm font-medium">{message}</div>
      <Button size="xs" onClick={onRetry} disabled={retrying} color="light">
        {retrying ? (
          <>
            <Spinner size="xs" className="me-2" /> جارِ المحاولة...
          </>
        ) : (
          "إعادة المحاولة"
        )}
      </Button>
    </div>
  );
}
