"use client";
import { CardBox } from "@/shared/ui/cards";

function Bar({ w = "w-32" }: { w?: string }) {
  return (
    <div
      className={`h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ${w}`}
    />
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <CardBox className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bar w="w-24" />
            <Bar w="w-40" />
          </div>
        ))}
      </CardBox>
      <CardBox className="space-y-3">
        <Bar w="w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} w="w-3/4" />
        ))}
      </CardBox>
      <CardBox className="space-y-3">
        <Bar w="w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Bar key={i} w="w-full" />
        ))}
      </CardBox>
    </div>
  );
}

export default OrderDetailSkeleton;
