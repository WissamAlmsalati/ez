import type { BaseItem } from "@/entities/catalog/types";

export interface Category extends BaseItem {
  sort_order?: number | null;
  department_id?: number | string | null;
  slug?: string | null;
  types_count?: number;
  status_text?: string; // raw from API if mapper not applied
  image_url?: string | null; // raw
  // mapped / normalized (when mapper layer used)
  statusText?: string;
  imageUrl?: string | null;
  typesCount?: number;
  departmentId?: number | string | null;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  sort_order?: number | null;
  is_active?: boolean;
  image?: File | null;
  department_id?: number | string | null;
}

// Full detail response shape (normalized) for Category detail page
export interface CategoryDetails extends Category {
  created_at?: string;
  updated_at?: string;
  // Keep raw image too if backend returns under `image`
  image?: string | null;
}
