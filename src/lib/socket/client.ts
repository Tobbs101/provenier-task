import { io, type Socket } from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

export type MatchSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const DEFAULT_SOCKET_URL = "https://profootball.srv883830.hstgr.cloud";

let socket: MatchSocket | null = null;

export function getMatchSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_PROFOOTBALL_SOCKET_URL ?? DEFAULT_SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Number.POSITIVE_INFINITY,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      timeout: 10_000,
    });
  }

  return socket;
}
