"use client";
import Image from "next/image";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import StatusSwitch from "./StatusSwitch";
import Link from "next/link";
import { useSessionStore } from "@/entities/session/model/sessionStore";
type Props = {
  title: string;
  image?: string | null;
  active: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  footer?: React.ReactNode;
  switchSize?: "sm" | "md" | "lg";
  link?: string;
  /** إظهار أو إخفاء مفتاح الحالة (StatusSwitch) - القيمة الافتراضية true */
  showSwitch?: boolean;
  /** إخفاء صورة البطاقة كليًا */
  hideImage?: boolean;
};

export default function CatalogCard({
  title,
  image,
  active,
  onToggle,
  footer,
  switchSize = "sm",
  link,
  showSwitch = true,
  hideImage = false,
}: Props) {
  const isManager = useSessionStore((s) => s.isManager);
  const normalizedImage = getImageUrl({ image }) as string | null;
  return (
    <div
      className={`rounded-3xl border border-primary ${
        hideImage ? "p-4" : "p-2"
      } gap-4 bg-lightgray hover:bg-lightgrayemphasis transition-colors duration-300 ease-out`}
    >
      <div className="flex items-center gap-4">
        {link ? (
          <Link
            href={link}
            className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
          >
            {!hideImage && (
              <div className="relative h-20 w-24 overflow-hidden rounded-2xl bg-slate-50">
                {normalizedImage ? (
                  <Image
                    src={normalizedImage}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    —
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col justify-between h-full gap-2 flex-1 min-w-0">
              <div className="text-sm font-semibold rtl:text-right text-primary flex items-center gap-3 justify-between w-full">
                {title}
              </div>
              <div className="text-xs text-primary rtl:text-right block truncate mt-1">
                {footer}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!hideImage && (
              <div className="relative h-20 w-24 overflow-hidden rounded-2xl bg-slate-50">
                {normalizedImage ? (
                  <Image
                    src={normalizedImage}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    —
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col justify-between h-full gap-2 flex-1 min-w-0">
              <div className="text-base font-semibold rtl:text-right text-primary flex items-center gap-3 justify-between w-full">
                {title}
              </div>
            </div>
          </div>
        )}

        {showSwitch && isManager && (
          <StatusSwitch
            size={switchSize}
            initial={active}
            onToggle={onToggle}
          />
        )}
      </div>
    </div>
  );
}
