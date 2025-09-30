"use client";
import React from "react";

export default function AdvertisementDetailSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border animate-pulse">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
          <div className="md:order-2 md:pl-6 max-w-sm space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-100 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-9 w-full bg-gray-100 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-100 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-9 w-full bg-gray-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-9 w-full bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-8 w-24 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden ring-1 ring-dashed ring-gray-200 bg-gray-100 aspect-[16/6]" />
            <div className="h-7 w-28 bg-gray-100 rounded" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <div className="h-9 w-28 bg-gray-100 rounded" />
            <div className="h-9 w-32 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
