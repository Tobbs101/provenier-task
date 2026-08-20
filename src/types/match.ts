export const MATCH_STATUSES = [
  "NOT_STARTED",
  "FIRST_HALF",
  "HALF_TIME",
  "SECOND_HALF",
  "FULL_TIME",
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_EVENT_TYPES = [
  "GOAL",
  "YELLOW_CARD",
  "RED_CARD",
  "SUBSTITUTION",
  "FOUL",
  "SHOT",
] as const;

export type MatchEventType = (typeof MATCH_EVENT_TYPES)[number];

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
}

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  minute: number;
  team: "home" | "away";
  player?: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
}

export interface TeamMetric {
  home: number;
  away: number;
}

export interface MatchStatistics {
  possession: TeamMetric;
  shots: TeamMetric;
  shotsOnTarget: TeamMetric;
  corners: TeamMetric;
  fouls: TeamMetric;
  yellowCards: TeamMetric;
  redCards: TeamMetric;
}

export interface MatchDetails extends Match {
  events: MatchEvent[];
  statistics: MatchStatistics;
}

export interface MatchesResponse {
  success: true;
  data: {
    matches: Match[];
    total: number;
  };
}

export interface MatchDetailsResponse {
  success: true;
  data: MatchDetails;
}
