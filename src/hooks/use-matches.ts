"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSocket } from "@/components/providers/socket-provider";
import { getMatches } from "@/lib/api/matches";
import type { ScoreUpdate, StatusChange } from "@/types/socket";
import type { Match } from "@/types/match";

type RequestStatus = "loading" | "success" | "error";
const CANONICAL_REFRESH_INTERVAL_MS = 15_000;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useMatches() {
  const { socket } = useSocket();
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(async (showLoadingState = false) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    if (showLoadingState) {
      setStatus("loading");
      setError(null);
    }

    try {
      const nextMatches = await getMatches(controller.signal);
      setMatches(nextMatches);
      setStatus("success");
      setError(null);
    } catch (requestError) {
      if (isAbortError(requestError)) return;
      if (showLoadingState) {
        setError(requestError instanceof Error ? requestError.message : "We could not load the matches.");
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;

    getMatches(controller.signal)
      .then((nextMatches) => {
        setMatches(nextMatches);
        setStatus("success");
      })
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) return;
        setError(requestError instanceof Error ? requestError.message : "We could not load the matches.");
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh(false);
    }, CANONICAL_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    function handleScoreUpdate(update: ScoreUpdate) {
      setMatches((currentMatches) => currentMatches.map((match) => (
        match.id === update.matchId
          ? { ...match, homeScore: update.homeScore, awayScore: update.awayScore }
          : match
      )));
    }

    function handleStatusChange(update: StatusChange) {
      setMatches((currentMatches) => currentMatches.map((match) => (
        match.id === update.matchId
          ? { ...match, status: update.status, minute: update.minute }
          : match
      )));
    }

    socket.on("score_update", handleScoreUpdate);
    socket.on("status_change", handleStatusChange);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("status_change", handleStatusChange);
    };
  }, [socket]);

  const matchIds = matches.map((match) => match.id).sort().join(",");

  useEffect(() => {
    const subscribedMatchIds = matchIds ? matchIds.split(",") : [];
    if (subscribedMatchIds.length === 0) return;

    function subscribeToMatches() {
      subscribedMatchIds.forEach((matchId) => socket.emit("subscribe_match", { matchId }));
    }

    function handleReconnect() {
      subscribeToMatches();
      void refresh(false);
    }

    socket.on("connect", handleReconnect);
    if (socket.connected) subscribeToMatches();

    return () => {
      socket.off("connect", handleReconnect);
      if (socket.connected) {
        subscribedMatchIds.forEach((matchId) => socket.emit("unsubscribe_match", { matchId }));
      }
    };
  }, [matchIds, refresh, socket]);

  return {
    matches,
    status,
    error,
    retry: () => refresh(true),
  };
}
