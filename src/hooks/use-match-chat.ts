"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSocket } from "@/components/providers/socket-provider";
import type { ChatIdentity } from "@/hooks/use-chat-identity";
import { getMatchChatHistory, saveChatMessage } from "@/lib/storage/chat-history";
import type {
  ChatMessage,
  SocketError,
  SocketUser,
  TypingIndicator,
} from "@/types/socket";

const TYPING_TIMEOUT_MS = 1_200;

interface UseMatchChatOptions {
  matchId: string;
  identity: ChatIdentity | null;
}

function isDuplicateMessage(messages: ChatMessage[], nextMessage: ChatMessage) {
  return messages.some((message) => (
    message.userId === nextMessage.userId &&
    message.timestamp === nextMessage.timestamp &&
    message.message === nextMessage.message
  ));
}

function mergeMessages(currentMessages: ChatMessage[], nextMessages: ChatMessage[]) {
  const messagesByKey = new Map<string, ChatMessage>();

  [...currentMessages, ...nextMessages].forEach((message) => {
    const key = [message.userId, message.timestamp, message.message].join(":");
    messagesByKey.set(key, message);
  });

  return [...messagesByKey.values()].sort((left, right) => {
    const leftTime = Date.parse(left.timestamp);
    const rightTime = Date.parse(right.timestamp);
    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
    return leftTime - rightTime;
  });
}

export function useMatchChat({ matchId, identity }: UseMatchChatOptions) {
  const { socket, status } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    let isActive = true;

    void getMatchChatHistory(matchId).then((history) => {
      if (isActive && history.length > 0) {
        setMessages((currentMessages) => mergeMessages(currentMessages, history));
      }
    });

    return () => {
      isActive = false;
    };
  }, [matchId]);

  const stopTyping = useCallback(() => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = null;

    if (identity && isTyping.current && socket.connected) {
      socket.emit("typing_stop", { matchId, userId: identity.userId });
    }
    isTyping.current = false;
  }, [identity, matchId, socket]);

  const startTyping = useCallback(() => {
    if (!identity || !socket.connected) return;

    if (!isTyping.current) {
      socket.emit("typing_start", { matchId, ...identity });
      isTyping.current = true;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, TYPING_TIMEOUT_MS);
  }, [identity, matchId, socket, stopTyping]);

  const sendMessage = useCallback((message: string) => {
    const trimmedMessage = message.trim();
    if (!identity || !socket.connected || !trimmedMessage || trimmedMessage.length > 500) {
      return false;
    }

    setError(null);
    stopTyping();
    socket.emit("send_message", { matchId, ...identity, message: trimmedMessage });
    return true;
  }, [identity, matchId, socket, stopTyping]);

  useEffect(() => {
    if (!identity) return;
    const activeIdentity = identity;

    function joinChat() {
      socket.emit("join_chat", { matchId, ...activeIdentity });
    }

    function handleMessage(message: ChatMessage) {
      if (message.matchId !== matchId) return;
      setMessages((currentMessages) => (
        isDuplicateMessage(currentMessages, message)
          ? currentMessages
          : [...currentMessages, message]
      ));
      void saveChatMessage(message);
    }

    function handleTyping(indicator: TypingIndicator) {
      if (indicator.matchId !== matchId || indicator.userId === activeIdentity.userId) return;

      setTypingUsers((currentUsers) => {
        const withoutUser = currentUsers.filter(({ userId }) => userId !== indicator.userId);
        return indicator.isTyping ? [...withoutUser, indicator] : withoutUser;
      });
    }

    function handleUserLeft(user: SocketUser) {
      if (user.matchId !== matchId) return;
      setTypingUsers((currentUsers) => currentUsers.filter(({ userId }) => userId !== user.userId));
    }

    function handleSocketError(socketError: SocketError) {
      setError(socketError.message || "The chat server rejected that request.");
    }

    socket.on("connect", joinChat);
    socket.on("chat_message", handleMessage);
    socket.on("typing_indicator", handleTyping);
    socket.on("user_left", handleUserLeft);
    socket.on("error", handleSocketError);
    if (socket.connected) joinChat();

    return () => {
      socket.off("connect", joinChat);
      socket.off("chat_message", handleMessage);
      socket.off("typing_indicator", handleTyping);
      socket.off("user_left", handleUserLeft);
      socket.off("error", handleSocketError);
      stopTyping();
      if (socket.connected) socket.emit("leave_chat", { matchId, userId: activeIdentity.userId });
    };
  }, [identity, matchId, socket, stopTyping]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.matchId === matchId),
    [matchId, messages],
  );

  return {
    messages: visibleMessages,
    typingUsers,
    error,
    connectionStatus: status,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
