import type { BaseItem, Paginated } from "@/entities/catalog/types";
import type { Department } from "@/entities/department/types";
import type { Category } from "@/entities/category/types";

export type UserRole = "manager" | "employee" | "customer";

// Base shape shared by all users from API
export interface UserBase extends BaseItem {
  // BaseItem: id, name, description?, image?, is_active, created_at, updated_at
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  role_text?: string; // e.g. "Employee"
  login_type?: string | null; // e.g. "email" | "phone"
  login_type_text?: string | null; // e.g. "Email"
  department_id?: number | null;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  department?: Department | null;
  status_text?: string; // e.g. "Active"
  can_login?: boolean;
  display_identifier?: string; // email or phone shown by backend
}

// When role is "employee" the API includes an array of categories
export type User =
  | (UserBase & { role: "employee"; categories: Category[] })
  | (UserBase & { role: "manager" | "customer"; categories?: undefined });

export type UsersList = Paginated<User>;
