"use client";
import Image from "next/image";
import StatusSwitch from "./StatusSwitch";
import Link from "next/link";
type Props = {
  title: string;
  image?: string | null;
  active: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  footer?: React.ReactNode;
  switchSize?: "sm" | "md" | "lg";
  link?: string;
};

export default function CatalogCard({
  title,
  image,
  active,
  onToggle,
  footer,
  switchSize = "sm",
  link,
}: Props) {
  return (
    <Link
      href={link ?? "#"}
      className="rounded-3xl border border-primary p-2 gap-4 bg-lightgray hover:bg-lightgrayemphasis transition-colors duration-300 ease-out cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-24 overflow-hidden rounded-2xl bg-slate-50">
          {image ? (
            <Image src={image} alt={title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400">
              —
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between h-full gap-2 flex-1 min-w-0">
          <div className="text-base font-semibold rtl:text-right text-primary flex items-center gap-3 justify-between w-full">
            {title}
            <StatusSwitch
              size={switchSize}
              initial={active}
              onToggle={onToggle}
            />
          </div>

          <span className="text-xs text-primary rtl:text-right block truncate">
            {footer}
          </span>
        </div>
      </div>
      {/* <div className="flex items-center gap-3"> */}
      {/* <StatusSwitch size={switchSize} initial={active} onToggle={onToggle} /> */}
      {/* </div> */}
    </Link>
  );
}
