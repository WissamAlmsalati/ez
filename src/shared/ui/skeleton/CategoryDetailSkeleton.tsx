"use client";
import React from "react";

/**
 * Skeleton placeholder for Category Detail page.
 * Tries to mimic the final layout so the page doesn't shift noticeably.
 */
export function CategoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb / Title */}
      {/* <div className="h-6 w-40 rounded-md bg-gray-200 animate-pulse" /> */}

      <div className="grid gap-6">
        {/* Main card */}
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
            <div className="text-right md:pl-6 md:order-2 space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 mt-8">
            {/* Form (left in RTL visual order) */}
            <div className="order-2 md:order-2 space-y-4 max-w-sm">
              {/* Name */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
              </div>
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse" />
              </div>
              {/* Status */}
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            {/* Image avatar */}
            <div className="order-1 md:order-1 mt-8 md:mt-0 flex flex-col items-center gap-4">
              <div className="relative w-36 h-36 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-100 animate-pulse" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Types list card */}
        <div className="space-y-4 bg-white rounded-lg p-8 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg border bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetailSkeleton;
