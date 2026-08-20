"use client";

import { useMemo, useSyncExternalStore } from "react";

export interface ChatIdentity {
  userId: string;
  username: string;
}

const STORAGE_KEY = "profootball-chat-identity";
const CHANGE_EVENT = "profootball-chat-identity-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function parseIdentity(value: string | null): ChatIdentity | null {
  if (!value) return null;

  try {
    const identity: unknown = JSON.parse(value);
    if (
      typeof identity === "object" &&
      identity !== null &&
      "userId" in identity &&
      "username" in identity &&
      typeof identity.userId === "string" &&
      typeof identity.username === "string"
    ) {
      return identity as ChatIdentity;
    }
  } catch {
    return null;
  }

  return null;
}

export function useChatIdentity() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const identity = useMemo(() => parseIdentity(snapshot), [snapshot]);

  function saveUsername(username: string) {
    const nextIdentity: ChatIdentity = {
      userId: identity?.userId ?? crypto.randomUUID(),
      username: username.trim(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIdentity));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return { identity, saveUsername };
}
