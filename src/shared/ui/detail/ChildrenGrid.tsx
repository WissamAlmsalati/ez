"use client";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import React from "react";

export interface ChildItemCard {
  id: number | string;
  title: string;
  image?: string | null;
  active: boolean;
  footer?: string;
}

interface ChildrenGridProps {
  items: ChildItemCard[];
  onToggle?: (id: number | string) => void | Promise<any>;
  empty?: React.ReactNode;
  loading?: boolean;
}

export function ChildrenGrid({
  items,
  onToggle,
  empty,
  loading,
}: ChildrenGridProps) {
  if (loading)
    return <div className="text-sm text-gray-500">جار التحميل...</div>;
  if (!items || items.length === 0)
    return (
      <div className="text-sm text-gray-400">{empty || "لا توجد عناصر"}</div>
    );
  return (
    <CatalogGrid>
      {items.map((i) => (
        <CatalogCard
          key={i.id}
          title={i.title}
          image={i.image || null}
          active={i.active}
          onToggle={(next) => {
            if (onToggle) onToggle(i.id);
          }}
          footer={i.footer}
        />
      ))}
    </CatalogGrid>
  );
}
