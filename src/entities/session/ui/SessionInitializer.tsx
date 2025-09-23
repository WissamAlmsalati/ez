"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "../model/sessionStore";

export function SessionInitializer() {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useSessionStore();

  useEffect(() => {
    if (status !== "loading") {
      setUser(
        session?.user
          ? { ...session.user, token: (session as any).token ?? "" }
          : null
      );
      setLoading(false);
    }
  }, [session, status, setUser, setLoading]);

  return null;
}
