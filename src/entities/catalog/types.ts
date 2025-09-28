export type Id = number | string;

export interface BaseItem {
  id: Id;
  name: string;
  description?: string | null;
  image?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Paginated<T> {
  message?: string;
  data: T[];
  meta: Meta;
}

export type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  [k: string]: unknown;
};

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

// Unified API error type from backend
export interface ApiFieldErrors {
  [field: string]: string[];
}

export interface ApiErrorBody {
  message: string;
  errors?: ApiFieldErrors;
}

export class ApiError extends Error {
  status?: number;
  body?: ApiErrorBody;
  constructor(
    message: string,
    opts?: { status?: number; body?: ApiErrorBody }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.body = opts?.body;
  }
}
