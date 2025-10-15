// Normalization / mapping utilities from transport (API) shape to domain shape.
// Keep them small & pure; they accept the raw (already camelized) object.
import type { Category } from "@/entities/category/types";
import type { Department } from "@/entities/department/types";
import type { Unit } from "@/entities/unit/types";
import type { ProductType } from "@/entities/product-type/types";
import type { Product } from "@/entities/product/types";
import type { Advertisement } from "@/entities/advertisement/types";
import type { User } from "@/entities/user/types";

// Example env helper (optional) – safe access
const CDN = process.env.NEXT_PUBLIC_CDN?.replace(/\/$/, "");

export function mapCategoryApi(raw: any): Category {
  if (!raw) return raw;
  // عند هذه المرحلة interceptor قام بـ camelCase: image_url => imageUrl
  const rawImage = raw.image_url ?? raw.imageUrl ?? raw.image; // نحاول كل الاحتمالات
  const isAbsolute =
    typeof rawImage === "string" && /^https?:\/\//i.test(rawImage);
  const normalizedImage = rawImage
    ? isAbsolute
      ? rawImage
      : CDN
      ? `${CDN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
      : rawImage
    : null;
  return {
    ...raw,
    // ensure snake_case field exists for domain consistency
    is_active: raw.is_active ?? raw.isActive ?? false,
    departmentId: raw.department_id ?? raw.departmentId ?? null,
    // نحفظ الشكلين للتوافق لكن نضمن وجود image القياسي الذي يستخدمه الـ UI
    image: normalizedImage,
    imageUrl: normalizedImage,
    statusText: raw.status_text ?? raw.statusText,
    typesCount: raw.types_count ?? raw.typesCount ?? 0,
    sort_order: raw.sort_order ?? raw.sortOrder ?? null,
  } as Category;
}

export function mapDepartmentApi(raw: any): Department {
  if (!raw) return raw;
  const rawImage = raw.image_url ?? raw.imageUrl ?? raw.image;
  const isAbsolute =
    typeof rawImage === "string" && /^https?:\/\//i.test(rawImage);
  const normalizedImage = rawImage
    ? isAbsolute
      ? rawImage
      : CDN
      ? `${CDN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
      : rawImage
    : null;
  return {
    ...raw,
    is_active: raw.is_active ?? raw.isActive ?? false,
    usersCount: raw.users_count ?? raw.usersCount ?? 0,
    typesCount: raw.types_count ?? raw.typesCount ?? 0,
    statusText: raw.status_text ?? raw.statusText,
    image: normalizedImage,
    imageUrl: normalizedImage,
  } as Department;
}

export function mapUnitApi(raw: any): Unit {
  if (!raw) return raw;
  return {
    ...raw,
    is_active: raw.is_active ?? raw.isActive ?? false,
    displayName: raw.display_name ?? raw.displayName ?? raw.name,
  } as Unit;
}

export function mapProductTypeApi(raw: any): ProductType {
  if (!raw) return raw;
  const rawImage = raw.image_url ?? raw.imageUrl ?? raw.image;
  const isAbsolute =
    typeof rawImage === "string" && /^https?:\/\//i.test(rawImage);
  const normalizedImage = rawImage
    ? isAbsolute
      ? rawImage
      : CDN
      ? `${CDN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
      : rawImage
    : null;
  return {
    ...raw,
    is_active: raw.is_active ?? raw.isActive ?? false,
    department_id: raw.department_id ?? raw.departmentId,
    category_id: raw.category_id ?? raw.categoryId,
    image: normalizedImage,
    imageUrl: normalizedImage,
  } as ProductType;
}

export function mapProductApi(raw: any): Product {
  if (!raw) return raw;
  const rawImage = raw.image_url ?? raw.imageUrl ?? raw.image;
  const isAbsolute =
    typeof rawImage === "string" && /^https?:\/\//i.test(rawImage);
  const normalizedImage = rawImage
    ? isAbsolute
      ? rawImage
      : CDN
      ? `${CDN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
      : rawImage
    : null;
  return {
    ...raw,
    is_active: raw.is_active ?? raw.isActive ?? false,
    type_id: raw.type_id ?? raw.typeId,
    category_id: raw.category_id ?? raw.categoryId,
    is_featured: raw.is_featured ?? raw.isFeatured ?? false,
    image: normalizedImage,
    imageUrl: normalizedImage,
  } as Product;
}

export function mapAdvertisementApi(raw: any): Advertisement {
  if (!raw) return raw;
  const rawImage = raw.image_url ?? raw.imageUrl ?? raw.image;
  const isAbsolute =
    typeof rawImage === "string" && /^https?:\/\//i.test(rawImage);
  const normalizedImage = rawImage
    ? isAbsolute
      ? rawImage
      : CDN
      ? `${CDN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
      : rawImage
    : null;
  return {
    // ننسخ الأصل (بعد camelCase interceptor)
    ...raw,
    // توحيد الحقول: API يرسل title بينما النظام الداخلي يستخدم name
    name: raw.name ?? raw.title ?? "",
    title: raw.title ?? raw.name,
    description: raw.description ?? null,
    image: normalizedImage,
    imageUrl: normalizedImage,
    is_active: raw.is_active ?? raw.isActive ?? true,
    starts_at: raw.starts_at ?? raw.startsAt ?? null,
    ends_at: raw.ends_at ?? raw.endsAt ?? null,
  } as Advertisement;
}

// Generic helper for arrays (if needed elsewhere)
export function mapArray<T, R>(
  items: T[] | undefined | null,
  fn: (x: T) => R
): R[] {
  if (!items) return [];
  return items.map(fn);
}

export function mapUserApi(raw: any): User {
  if (!raw) return raw;
  // Ensure is_active consistency and optional department mapping passthrough
  const dept = raw.department ? mapDepartmentApi(raw.department) : null;
  return {
    ...raw,
    is_active: raw.is_active ?? raw.isActive ?? true,
    department_id: raw.department_id ?? raw.departmentId ?? null,
    department: dept,
    // Explicitly ensure role is one of our union types when possible
    role: (raw.role as any) ?? "customer",
    role_text: raw.role_text ?? raw.roleText,
    login_type: raw.login_type ?? raw.loginType ?? null,
    login_type_text: raw.login_type_text ?? raw.loginTypeText ?? null,
    status_text: raw.status_text ?? raw.statusText,
    display_identifier: raw.display_identifier ?? raw.displayIdentifier,
    can_login: raw.can_login ?? raw.canLogin,
    image: null, // no image for users in cards
  } as User;
}
