"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getMatchSocket, type MatchSocket } from "@/lib/socket/client";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

interface SocketContextValue {
  socket: MatchSocket;
  status: ConnectionStatus;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useMemo(() => getMatchSocket(), []);
  const [status, setStatus] = useState<ConnectionStatus>(
    socket.connected ? "connected" : "connecting",
  );

  useEffect(() => {
    function handleConnect() {
      setStatus("connected");
    }

    function handleDisconnect(reason: string) {
      setStatus(reason === "io client disconnect" ? "disconnected" : "reconnecting");
    }

    function handleConnectError() {
      setStatus("reconnecting");
    }

    function handleReconnectAttempt() {
      setStatus("reconnecting");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.disconnect();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket, status }), [socket, status]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within SocketProvider.");
  }

  return context;
}
