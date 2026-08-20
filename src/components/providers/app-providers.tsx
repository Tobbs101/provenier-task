"use client";

import { SocketProvider } from "@/components/providers/socket-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
