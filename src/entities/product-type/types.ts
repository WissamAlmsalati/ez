import type { BaseItem } from "@/entities/catalog/types";
import { Category } from "../category/types";

export interface ProductType extends BaseItem {
  category_id: number;
  department_id?: number;
  category: Category;
}

export interface CreateTypePayload {
  name: string;
  description?: string;
  category_id: number;
  department_id: number;
  is_active?: boolean;
  image?: File | null;
}

export interface ProductTypeDetails extends ProductType {
  created_at?: string;
  updated_at?: string;
  image?: string | null;
}
