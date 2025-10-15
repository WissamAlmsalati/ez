import type {
  BaseItem,
  Paginated,
  Meta,
  ListParams,
} from "@/entities/catalog/types";

// Order status union based on provided endpoint doc
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_preparation"
  | "ready"
  | "delivered"
  | "cancelled";

export interface OrderUserDepartment {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string; // could be refined later
  login_type?: string;
  department_id?: number | null;
  is_active: boolean;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  department?: OrderUserDepartment | null;
}

export interface OrderItemUnit {
  id: number;
  name: string;
  symbol?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface OrderItemProductUnit {
  id: number;
  product_id: number;
  unit_id: number;
  unit_size: number;
  price: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  product: any; // backend returns either nested product or string - keep flexible
  unit: OrderItemUnit;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_unit_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  product_unit: OrderItemProductUnit;
}

export interface OrderDepartmentAssignment {
  id: number;
  order_id: number;
  department_id: number;
  assigned_employee_id?: number | null;
  status: OrderStatus; // assuming department status shares same union
  assigned_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  department: OrderUserDepartment;
  assigned_employee?: OrderUser | null;
}

export interface OrderStatusHistoryEntry {
  id: number;
  order_id: number;
  previous_status: OrderStatus;
  new_status: OrderStatus;
  changed_by: number;
  notes?: string | null;
  changed_at: string;
  created_at?: string;
  updated_at?: string;
  changed_by_user: OrderUser;
}

export interface Order /* internal normalized shape */ {
  id: number; // mapped from order_id
  order_number: string;
  user_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_date?: string | null;
  delivery_time?: string | null;
  delivery_address?: string | null;
  notes?: string | null;
  total_amount: number;
  formatted_total?: string; // e.g. "0.00 LYD"
  status: OrderStatus;
  status_text?: string; // Arabic / localized label from backend
  created_at?: string;
  updated_at?: string;
  user?: OrderUser;
  items?: OrderItem[];
  departments?: OrderDepartmentAssignment[];
  status_history?: OrderStatusHistoryEntry[];
  items_count?: number;
  departments_count?: number;
  items_summary?: Array<{
    product_name: string;
    quantity: string;
    unit_name: string;
    total_price: string | null;
  }>;
}

export interface OrdersListParams extends ListParams {
  status?: OrderStatus;
  department_id?: number;
  pickup_date?: string; // YYYY-MM-DD
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  user_id?: number; // filter by user/customer id
}

export type OrdersPaginated = Paginated<Order>;
