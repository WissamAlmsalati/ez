"use client";
import React from "react";

/** Skeleton placeholder for Product Detail page. Includes extra block for units editor. */
export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Matches current product page layout: only main card (units/children removed) */}
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
          <div className="text-right md:pl-6 md:order-2 space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-60 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 mt-8">
          <div className="order-2 md:order-2 space-y-4 max-w-sm">
            {/* Name */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-20 w-full bg-gray-200 rounded-md animate-pulse" />
            </div>
            {/* Switches */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-6">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
            {/* Buttons */}
            <div className="flex gap-3 pt-2 flex-wrap">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          {/* Image preview */}
          <div className="order-1 md:order-1 mt-8 md:mt-0 flex flex-col items-center gap-4">
            <div className="relative w-36 h-36 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-100 animate-pulse" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductDetailSkeleton;
