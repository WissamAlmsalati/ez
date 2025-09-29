// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// 1. تعريف شكل المستخدم الكامل كما يأتي من Laravel
interface IUser extends DefaultUser {
  id: number;
  phone: string | null;
  role: string;
  login_type: string;
  is_active: boolean;
  status_text: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// 2. توسيع الأنواع الخاصة بـ NextAuth
declare module "next-auth" {
  interface User extends IUser {
    token: string;
  }

  interface Session {
    user: IUser;
    token: string;
  }
}

declare module "next-auth/jwt" {
  // الـ JWT سيحتوي على هذه البيانات لتمريرها للجلسة
  interface JWT {
    user: IUser;
    token: string;
  }
}