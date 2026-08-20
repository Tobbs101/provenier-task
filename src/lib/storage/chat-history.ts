import type { ChatMessage } from "@/types/socket";

const DATABASE_NAME = "profootball-match-center";
const DATABASE_VERSION = 1;
const MESSAGE_STORE = "chat-messages";
const MATCH_INDEX = "matchId";
const MAX_MESSAGES_PER_MATCH = 200;

interface StoredChatMessage extends ChatMessage {
  key: string;
  receivedAt: number;
}

let databasePromise: Promise<IDBDatabase | null> | null = null;

function getMessageKey(message: ChatMessage) {
  return [message.matchId, message.userId, message.timestamp, message.message].join(":");
}

function openDatabase() {
  if (databasePromise) return databasePromise;
  if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.resolve(null);

  databasePromise = new Promise((resolve) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(MESSAGE_STORE)) {
        const store = database.createObjectStore(MESSAGE_STORE, { keyPath: "key" });
        store.createIndex(MATCH_INDEX, MATCH_INDEX, { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

  return databasePromise;
}

function waitForTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
    transaction.onabort = () => resolve();
  });
}

export async function getMatchChatHistory(matchId: string) {
  const database = await openDatabase();
  if (!database) return [];

  return new Promise<ChatMessage[]>((resolve) => {
    const transaction = database.transaction(MESSAGE_STORE, "readonly");
    const request = transaction.objectStore(MESSAGE_STORE).index(MATCH_INDEX).getAll(matchId);

    request.onsuccess = () => {
      const history = (request.result as StoredChatMessage[])
        .sort((left, right) => left.receivedAt - right.receivedAt)
        .slice(-MAX_MESSAGES_PER_MATCH)
        .map((record) => ({
          matchId: record.matchId,
          userId: record.userId,
          username: record.username,
          message: record.message,
          timestamp: record.timestamp,
        }));
      resolve(history);
    };
    request.onerror = () => resolve([]);
  });
}

export async function saveChatMessage(message: ChatMessage) {
  const database = await openDatabase();
  if (!database) return;

  const transaction = database.transaction(MESSAGE_STORE, "readwrite");
  const store = transaction.objectStore(MESSAGE_STORE);
  const index = store.index(MATCH_INDEX);
  const storedMessage: StoredChatMessage = {
    ...message,
    key: getMessageKey(message),
    receivedAt: Number.isNaN(Date.parse(message.timestamp)) ? Date.now() : Date.parse(message.timestamp),
  };

  store.put(storedMessage);
  const matchMessages = index.getAll(message.matchId);
  matchMessages.onsuccess = () => {
    const records = (matchMessages.result as StoredChatMessage[])
      .sort((left, right) => left.receivedAt - right.receivedAt);
    records
      .slice(0, Math.max(0, records.length - MAX_MESSAGES_PER_MATCH))
      .forEach(({ key }) => store.delete(key));
  };

  await waitForTransaction(transaction);
}

export async function clearMatchChatHistory(matchId: string) {
  const database = await openDatabase();
  if (!database) return;

  const transaction = database.transaction(MESSAGE_STORE, "readwrite");
  const store = transaction.objectStore(MESSAGE_STORE);
  const keys = store.index(MATCH_INDEX).getAllKeys(matchId);
  keys.onsuccess = () => keys.result.forEach((key) => store.delete(key));
  await waitForTransaction(transaction);
}
