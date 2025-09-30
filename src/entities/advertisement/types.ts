import type { BaseItem } from "@/entities/catalog/types";

// Transport layer supplies `title`; internally we normalize to `name` to be consistent with BaseItem usage.
export interface Advertisement extends BaseItem {
  // BaseItem: id, name, description?, image?, is_active, created_at?, updated_at?
  title?: string; // keep original field for reference (API sends title)
  starts_at?: string; // YYYY-MM-DD (date only) per spec
  ends_at?: string; // YYYY-MM-DD
}

export interface CreateAdvertisementPayload {
  title: string;
  description?: string;
  starts_at: string; // date string (YYYY-MM-DD)
  ends_at: string; // date string (YYYY-MM-DD)
  is_active?: boolean;
  image?: File | null; // optional file upload
}
