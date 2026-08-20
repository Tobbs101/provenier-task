"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getMatches } from "@/lib/api/matches";
import type { Match } from "@/types/match";

type RequestStatus = "loading" | "success" | "error";

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  const retry = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const nextMatches = await getMatches(controller.signal);
      setMatches(nextMatches);
      setStatus("success");
    } catch (requestError) {
      if (isAbortError(requestError)) return;
      setError(requestError instanceof Error ? requestError.message : "We could not load the matches.");
      setStatus("error");
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

  return {
    matches,
    status,
    error,
    retry,
  };
}
