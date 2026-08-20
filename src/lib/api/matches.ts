import { MATCH_STATUSES, type Match, type MatchesResponse } from "@/types/match";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTeam(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.shortName === "string"
  );
}

function isMatch(value: unknown): value is Match {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isTeam(value.homeTeam) &&
    isTeam(value.awayTeam) &&
    typeof value.homeScore === "number" &&
    typeof value.awayScore === "number" &&
    typeof value.minute === "number" &&
    typeof value.status === "string" &&
    MATCH_STATUSES.includes(value.status as Match["status"]) &&
    typeof value.startTime === "string"
  );
}

function isMatchesResponse(value: unknown): value is MatchesResponse {
  return (
    isRecord(value) &&
    value.success === true &&
    isRecord(value.data) &&
    Array.isArray(value.data.matches) &&
    value.data.matches.every(isMatch) &&
    typeof value.data.total === "number"
  );
}

function getErrorMessage(payload: unknown) {
  if (!isRecord(payload)) return null;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return null;
}

export async function getMatches(signal?: AbortSignal): Promise<Match[]> {
  const response = await fetch("/api/matches", {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal,
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload) ?? "We could not load the matches right now.",
      response.status,
    );
  }

  if (!isMatchesResponse(payload)) {
    throw new ApiError("The match service returned an unexpected response.", 502);
  }

  return payload.data.matches;
}
