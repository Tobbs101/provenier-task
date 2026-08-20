"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSocket } from "@/components/providers/socket-provider";
import { ApiError, getMatchDetails } from "@/lib/api/matches";
import type { MatchDetails, MatchEvent } from "@/types/match";
import type { MatchEventUpdate, ScoreUpdate, StatsUpdate, StatusChange } from "@/types/socket";

interface MatchRequestError {
  message: string;
  status?: number;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function toRequestError(error: unknown): MatchRequestError {
  if (error instanceof ApiError) return { message: error.message, status: error.status };
  if (error instanceof Error) return { message: error.message };
  return { message: "We could not load this match." };
}

export function useMatchDetails(matchId: string) {
  const { socket } = useSocket();
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [error, setError] = useState<MatchRequestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(async (showLoadingState = false) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    if (showLoadingState) {
      setIsLoading(true);
      setError(null);
    }

    try {
      setMatch(await getMatchDetails(matchId, controller.signal));
      setError(null);
    } catch (requestError) {
      if (isAbortError(requestError)) return;
      if (showLoadingState) setError(toRequestError(requestError));
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;

    getMatchDetails(matchId, controller.signal)
      .then((nextMatch) => setMatch(nextMatch))
      .catch((requestError: unknown) => {
        if (!isAbortError(requestError)) setError(toRequestError(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [matchId]);

  useEffect(() => {
    function handleScoreUpdate(update: ScoreUpdate) {
      if (update.matchId !== matchId) return;
      setMatch((currentMatch) => currentMatch ? {
        ...currentMatch,
        homeScore: update.homeScore,
        awayScore: update.awayScore,
      } : currentMatch);
    }

    function handleStatusChange(update: StatusChange) {
      if (update.matchId !== matchId) return;
      setMatch((currentMatch) => currentMatch ? {
        ...currentMatch,
        status: update.status,
        minute: update.minute,
      } : currentMatch);
    }

    function handleStatsUpdate(update: StatsUpdate) {
      if (update.matchId !== matchId) return;
      setMatch((currentMatch) => currentMatch ? {
        ...currentMatch,
        statistics: update.statistics,
      } : currentMatch);
    }

    function handleMatchEvent(update: MatchEventUpdate) {
      if (update.matchId !== matchId) return;

      const event: MatchEvent = {
        id: update.id ?? [update.type, update.minute, update.team, update.player, update.description].join(":"),
        type: update.type,
        minute: update.minute,
        team: update.team,
        player: update.player,
        assistPlayer: update.assistPlayer,
        description: update.description,
        timestamp: update.timestamp ?? new Date().toISOString(),
      };

      setMatch((currentMatch) => {
        if (!currentMatch || currentMatch.events.some(({ id }) => id === event.id)) {
          return currentMatch;
        }

        return { ...currentMatch, events: [...currentMatch.events, event] };
      });
    }

    socket.on("score_update", handleScoreUpdate);
    socket.on("status_change", handleStatusChange);
    socket.on("stats_update", handleStatsUpdate);
    socket.on("match_event", handleMatchEvent);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("status_change", handleStatusChange);
      socket.off("stats_update", handleStatsUpdate);
      socket.off("match_event", handleMatchEvent);
    };
  }, [matchId, socket]);

  useEffect(() => {
    function subscribeToMatch() {
      socket.emit("subscribe_match", { matchId });
    }

    function handleConnect() {
      subscribeToMatch();
      void refresh(false);
    }

    socket.on("connect", handleConnect);
    if (socket.connected) subscribeToMatch();

    return () => {
      socket.off("connect", handleConnect);
      if (socket.connected) socket.emit("unsubscribe_match", { matchId });
    };
  }, [matchId, refresh, socket]);

  return { match, error, isLoading, retry: () => refresh(true) };
}
