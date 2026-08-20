"use client";

import { useSocket, type ConnectionStatus } from "@/components/providers/socket-provider";

const labels: Record<ConnectionStatus, string> = {
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  disconnected: "Offline",
};

export function ConnectionIndicator() {
  const { status } = useSocket();

  return (
    <span
      className={`connection-pill connection-pill--${status}`}
      role="status"
      aria-live="polite"
      title={`Live connection: ${labels[status].toLowerCase()}`}
    >
      <span className="connection-dot" aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
