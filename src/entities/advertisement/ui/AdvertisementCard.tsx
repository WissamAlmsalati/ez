"use client";
import Image from "next/image";
import Link from "next/link";
import type { Advertisement } from "../types";
import { cn } from "@/shared/lib/cn";

interface Props {
  item: Advertisement;
  className?: string;
  onClick?: () => void; // في حال أراد المستهلك سلوك مخصص
  href?: string; // إذا مررنا رابطاً نلف البطاقة داخل Link
  ariaLabel?: string;
}

function formatRange(st?: string, en?: string) {
  if (!st && !en) return "";
  if (st && en) return `${st} - ${en}`;
  return st || en || "";
}

export function AdvertisementCard({
  item,
  className,
  onClick,
  href,
  ariaLabel,
}: Props) {
  const core = (
    <div
      className={cn(
        "group rounded-lg border bg-white/50 dark:bg-neutral-900/40 p-3 flex flex-col gap-2 hover:shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        !item.is_active && "opacity-60",
        className,
        href ? "cursor-pointer" : onClick ? "cursor-pointer" : "cursor-default"
      )}
      onClick={onClick}
      aria-label={ariaLabel || item.title || item.name || "إعلان"}
      role={href ? "link" : onClick ? "button" : undefined}
      tabIndex={href || onClick ? 0 : -1}
    >
      {item.image && (
        <div className="relative w-full h-32 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={item.image}
            alt={item.name || item.title || "إعلان"}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover group-hover:scale-[1.02] transition-transform"
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-2 rtl:text-right">
            {item.name || item.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              item.is_active
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
            )}
          >
            {item.is_active ? "نشط" : "موقوف"}
          </span>
        </div>
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {core}
      </Link>
    );
  }
  return core;
}
