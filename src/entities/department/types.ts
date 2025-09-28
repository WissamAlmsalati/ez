import type { BaseItem } from "@/entities/catalog/types";

export interface Department extends BaseItem {
  usersCount?: number;
  typesCount?: number;
  statusText?: string;
  imageUrl?: string | null;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  is_active?: boolean;
  image?: File | null;
}
