import type { Match } from "@/types/match";

export function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: "match-1",
    homeTeam: {
      id: "home-1",
      name: "Northbridge FC",
      shortName: "NFC",
    },
    awayTeam: {
      id: "away-1",
      name: "Riverside United",
      shortName: "RSU",
    },
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: "SECOND_HALF",
    startTime: "2026-08-20T18:00:00.000Z",
    ...overrides,
  };
}
