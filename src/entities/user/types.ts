import type { BaseItem, Paginated } from "@/entities/catalog/types";
import type { Department } from "@/entities/department/types";

export type UserRole = "manager" | "employee" | "customer";

export interface User extends BaseItem {
  // BaseItem: id, name, description?, image?, is_active, created_at, updated_at
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  role_text?: string;
  login_type?: string | null;
  login_type_text?: string | null;
  department_id?: number | null;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  department?: Department | null;
  status_text?: string;
  can_login?: boolean;
  display_identifier?: string; // email or phone shown by backend
}

export type UsersList = Paginated<User>;
