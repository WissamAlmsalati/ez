import type { BaseItem } from "@/entities/catalog/types";
import { ProductType } from "../product-type/types";

export interface Product extends BaseItem {
  sku?: string | null;
  category_id?: number;
  type_id: number;
  type: ProductType;
  is_featured?: boolean;
}

export interface UnitPriceItem {
  unit_id: number;
  unit_size: number;
  price: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  sku?: string;
  type_id: number;
  is_active?: boolean;
  is_featured?: boolean;
  image?: File | null;
  prices: UnitPriceItem[];
}

export interface ProductUnit {
  id: number;
  product_id: number;
  unit_id: number;
  unit_size: number;
  price: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  unit: {
    id: number;
    name: string;
    symbol?: string;
    description?: string | null;
    is_active: boolean;
  };
}

export interface ProductDetails extends Product {
  category_id: number;
  created_at?: string;
  updated_at?: string;
  image?: string | null;
  units?: ProductUnit[];
  type: ProductType & { category: { id: number; name: string } };
}
