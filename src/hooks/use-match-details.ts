"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, getMatchDetails } from "@/lib/api/matches";
import type { MatchDetails } from "@/types/match";

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
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [error, setError] = useState<MatchRequestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeRequest = useRef<AbortController | null>(null);

  const retry = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      setMatch(await getMatchDetails(matchId, controller.signal));
    } catch (requestError) {
      if (isAbortError(requestError)) return;
      setError(toRequestError(requestError));
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

  return { match, error, isLoading, retry };
}
