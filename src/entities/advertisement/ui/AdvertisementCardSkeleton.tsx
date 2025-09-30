"use client";
import { cn } from "@/shared/lib/cn";

interface Props {
  className?: string;
}

// Skeleton لبطاقة الإعلان: يحاكي نفس التركيب (صورة علوية + عنوان + شارة الحالة + المدى الزمني)
export function AdvertisementCardSkeleton({ className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white/50 dark:bg-neutral-900/40 p-3 flex flex-col gap-2 animate-pulse",
        className
      )}
    >
      <div className="relative w-full h-32 overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-700" />
      <div className="flex items-start justify-between gap-2">
        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-3 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="h-2.5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

export function AdvertisementSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <AdvertisementCardSkeleton key={i} />
      ))}
    </div>
  );
}
