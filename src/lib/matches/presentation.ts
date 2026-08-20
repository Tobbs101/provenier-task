import type { Match, MatchStatus } from "@/types/match";

export type MatchFilter = "all" | "live" | "upcoming" | "finished";

export const LIVE_STATUSES: MatchStatus[] = ["FIRST_HALF", "HALF_TIME", "SECOND_HALF"];

export function isLiveMatch(match: Match) {
  return LIVE_STATUSES.includes(match.status);
}

export function getStatusLabel(status: MatchStatus) {
  const labels: Record<MatchStatus, string> = {
    NOT_STARTED: "Upcoming",
    FIRST_HALF: "First half",
    HALF_TIME: "Half-time",
    SECOND_HALF: "Second half",
    FULL_TIME: "Full-time",
  };

  return labels[status];
}

export function getClockLabel(match: Match) {
  if (match.status === "HALF_TIME") return "HT";
  if (match.status === "FULL_TIME") return "FT";
  if (match.status === "NOT_STARTED") return formatKickoff(match.startTime);
  return `${match.minute}′`;
}

export function formatKickoff(startTime: string) {
  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return "TBD";

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function filterMatches(matches: Match[], filter: MatchFilter) {
  if (filter === "live") return matches.filter(isLiveMatch);
  if (filter === "upcoming") return matches.filter((match) => match.status === "NOT_STARTED");
  if (filter === "finished") return matches.filter((match) => match.status === "FULL_TIME");
  return matches;
}

export function sortMatches(matches: Match[]) {
  const priority: Record<MatchStatus, number> = {
    SECOND_HALF: 0,
    HALF_TIME: 1,
    FIRST_HALF: 2,
    NOT_STARTED: 3,
    FULL_TIME: 4,
  };

  return [...matches].sort((left, right) => {
    const statusDifference = priority[left.status] - priority[right.status];
    if (statusDifference !== 0) return statusDifference;
    return new Date(left.startTime).getTime() - new Date(right.startTime).getTime();
  });
}
