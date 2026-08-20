import Link from "next/link";

import { getClockLabel, getStatusLabel, isLiveMatch } from "@/lib/matches/presentation";
import type { Match } from "@/types/match";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = isLiveMatch(match);
  const statusTone = isLive ? "live" : match.status === "FULL_TIME" ? "finished" : "upcoming";

  return (
    <Link
      className={`match-card match-card--${statusTone}`}
      href={`/matches/${match.id}`}
      aria-label={`${match.homeTeam.name} ${match.homeScore}, ${match.awayTeam.name} ${match.awayScore}. ${getStatusLabel(match.status)}.`}
    >
      <div className="match-card-topline">
        <span className={`status-badge status-badge--${statusTone}`}>
          {isLive && <span className="live-dot" aria-hidden="true" />}
          {getStatusLabel(match.status)}
        </span>
        <span className="match-clock">{getClockLabel(match)}</span>
      </div>

      <div className="match-team-row">
        <span className="team-monogram" aria-hidden="true">{match.homeTeam.shortName.slice(0, 3)}</span>
        <span className="team-name">{match.homeTeam.name}</span>
        <strong>{match.status === "NOT_STARTED" ? "—" : match.homeScore}</strong>
      </div>
      <div className="match-team-row">
        <span className="team-monogram" aria-hidden="true">{match.awayTeam.shortName.slice(0, 3)}</span>
        <span className="team-name">{match.awayTeam.name}</span>
        <strong>{match.status === "NOT_STARTED" ? "—" : match.awayScore}</strong>
      </div>

      <div className="match-card-footer">
        <span>Match center</span>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  );
}
