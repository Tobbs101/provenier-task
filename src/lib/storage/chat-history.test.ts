import "fake-indexeddb/auto";

import { describe, expect, it } from "vitest";

import type { ChatMessage } from "@/types/socket";

import { clearMatchChatHistory, getMatchChatHistory, saveChatMessage } from "./chat-history";

function createMessage(matchId: string, message: string, minute: number): ChatMessage {
  return {
    matchId,
    userId: "user-1",
    username: "Supporter",
    message,
    timestamp: `2026-08-20T18:${String(minute).padStart(2, "0")}:00.000Z`,
  };
}

describe("chat history storage", () => {
  it("persists messages separately for each match", async () => {
    const firstMatchMessage = createMessage("storage-match-a", "What a finish", 2);
    const secondMatchMessage = createMessage("storage-match-b", "Great save", 3);

    await saveChatMessage(firstMatchMessage);
    await saveChatMessage(secondMatchMessage);

    await expect(getMatchChatHistory("storage-match-a")).resolves.toEqual([firstMatchMessage]);
    await expect(getMatchChatHistory("storage-match-b")).resolves.toEqual([secondMatchMessage]);
  });

  it("deduplicates a repeated message", async () => {
    const message = createMessage("storage-match-dedupe", "Goal!", 4);

    await saveChatMessage(message);
    await saveChatMessage(message);

    await expect(getMatchChatHistory("storage-match-dedupe")).resolves.toEqual([message]);
  });

  it("clears only the requested match history", async () => {
    const clearedMessage = createMessage("storage-match-clear", "Finished", 5);
    const retainedMessage = createMessage("storage-match-retain", "Still live", 6);
    await saveChatMessage(clearedMessage);
    await saveChatMessage(retainedMessage);

    await clearMatchChatHistory("storage-match-clear");

    await expect(getMatchChatHistory("storage-match-clear")).resolves.toEqual([]);
    await expect(getMatchChatHistory("storage-match-retain")).resolves.toEqual([retainedMessage]);
  });
});
