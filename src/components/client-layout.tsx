"use client";

import { UserProvider } from "@/components/user-provider";
import type { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
