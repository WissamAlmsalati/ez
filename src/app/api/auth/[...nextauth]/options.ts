import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "البريد الإلكتروني",
          type: "text",
          placeholder: "ادخل البريد الإلكتروني ",
        },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                email: credentials?.identifier,
                password: credentials?.password,
              }),
            }
          );

          const json = await response.json();
          // Backend returns { message, data: { user: {...}, token, ... } }
          const payload = json?.data ?? json;
          const user = payload?.user ?? payload?.data?.user;

          if (response.ok && user) {
            return {
              id: user.id?.toString?.() ?? String(user.id),
              name: user.name,
              email: user.email ?? credentials?.identifier ?? "",
              phone: user.phone ?? null,
              role: user.role,
              login_type: user.login_type,
              is_active: user.is_active,
              status_text: user.status_text,
              email_verified_at: user.email_verified_at ?? null,
              phone_verified_at: user.phone_verified_at ?? null,
              created_at: user.created_at,
              updated_at: user.updated_at,
              // attach API token so we can use it later
              token: payload?.token ?? payload?.access_token ?? "",
            } as any;
          } else {
            console.error("Login failed:", json);
            return null;
          }
        } catch (err: unknown) {
          console.error("Authorize Error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/login",
  },

  debug: process.env.NODE_ENV === "development",

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    async jwt({ token, user }) {
      // On sign in, persist our user object and API token into the JWT
      if (user) {
        (token as any).user = user;
        (token as any).token =
          (user as any).token ?? (token as any).token ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose user and token to the session in a consistent shape
      (session as any).user = (token as any).user ?? session.user;
      (session as any).token = (token as any).token ?? "";
      return session;
    },

    async signIn({ user }) {
      if (!user) {
        console.error("No user returned from authorize");
        return false;
      }
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
