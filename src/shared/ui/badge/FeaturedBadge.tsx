"use client";
import React from "react";

interface Props {
  className?: string;
}

export const FeaturedBadge: React.FC<Props> = ({ className }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 text-[11px] px-2 py-0.5 border border-yellow-300 font-medium ${
      className || ""
    }`}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
    مميز
  </span>
);

export default FeaturedBadge;
