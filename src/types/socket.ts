import type { MatchEventType, MatchStatistics, MatchStatus } from "@/types/match";

export interface ScoreUpdate {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface StatusChange {
  matchId: string;
  status: MatchStatus;
  minute: number;
}

export interface StatsUpdate {
  matchId: string;
  statistics: MatchStatistics;
}

export interface MatchEventUpdate {
  matchId: string;
  id?: string;
  type: MatchEventType;
  minute: number;
  team: "home" | "away";
  player?: string;
  assistPlayer?: string;
  description: string;
  timestamp?: string;
}

export interface ChatMessage {
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface TypingIndicator {
  matchId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface SocketUser {
  matchId: string;
  userId: string;
  username: string;
}

export interface SocketError {
  code: string;
  message: string;
}

export interface ServerToClientEvents {
  score_update: (payload: ScoreUpdate) => void;
  match_event: (payload: MatchEventUpdate) => void;
  stats_update: (payload: StatsUpdate) => void;
  status_change: (payload: StatusChange) => void;
  chat_message: (payload: ChatMessage) => void;
  user_joined: (payload: SocketUser) => void;
  user_left: (payload: SocketUser) => void;
  typing_indicator: (payload: TypingIndicator) => void;
  error: (payload: SocketError) => void;
}

export interface ClientToServerEvents {
  subscribe_match: (payload: { matchId: string }) => void;
  unsubscribe_match: (payload: { matchId: string }) => void;
  join_chat: (payload: SocketUser) => void;
  leave_chat: (payload: Omit<SocketUser, "username">) => void;
  send_message: (payload: SocketUser & { message: string }) => void;
  typing_start: (payload: SocketUser) => void;
  typing_stop: (payload: Omit<SocketUser, "username">) => void;
}
