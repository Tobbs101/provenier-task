import {
  MATCH_EVENT_TYPES,
  MATCH_STATUSES,
  type Match,
  type MatchDetails,
  type MatchDetailsResponse,
  type MatchesResponse,
  type MatchEvent,
  type TeamMetric,
} from "@/types/match";

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

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isMatchEvent(value: unknown): value is MatchEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    MATCH_EVENT_TYPES.includes(value.type as MatchEvent["type"]) &&
    typeof value.minute === "number" &&
    (value.team === "home" || value.team === "away") &&
    isOptionalString(value.player) &&
    isOptionalString(value.assistPlayer) &&
    typeof value.description === "string" &&
    typeof value.timestamp === "string"
  );
}

function isTeamMetric(value: unknown): value is TeamMetric {
  return isRecord(value) && typeof value.home === "number" && typeof value.away === "number";
}

function isMatchDetails(value: unknown): value is MatchDetails {
  if (!isMatch(value)) return false;

  const candidate = value as Match & { events?: unknown; statistics?: unknown };

  return (
    Array.isArray(candidate.events) &&
    candidate.events.every(isMatchEvent) &&
    isRecord(candidate.statistics) &&
    isTeamMetric(candidate.statistics.possession) &&
    isTeamMetric(candidate.statistics.shots) &&
    isTeamMetric(candidate.statistics.shotsOnTarget) &&
    isTeamMetric(candidate.statistics.corners) &&
    isTeamMetric(candidate.statistics.fouls) &&
    isTeamMetric(candidate.statistics.yellowCards) &&
    isTeamMetric(candidate.statistics.redCards)
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

function isMatchDetailsResponse(value: unknown): value is MatchDetailsResponse {
  return isRecord(value) && value.success === true && isMatchDetails(value.data);
}

function getErrorMessage(payload: unknown) {
  if (!isRecord(payload)) return null;
  if (typeof payload.error === "string") return payload.error;
  if (isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message;
  }
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

export async function getMatchDetails(matchId: string, signal?: AbortSignal): Promise<MatchDetails> {
  const response = await fetch(`/api/matches/${encodeURIComponent(matchId)}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal,
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload) ?? "We could not load this match right now.",
      response.status,
    );
  }

  if (!isMatchDetailsResponse(payload)) {
    throw new ApiError("The match service returned unexpected match details.", 502);
  }

  return payload.data;
}
