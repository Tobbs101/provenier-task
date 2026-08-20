import Link from "next/link";

import { formatKickoff, getClockLabel, getStatusLabel, isLiveMatch } from "@/lib/matches/presentation";
import type { MatchDetails } from "@/types/match";

export function MatchScoreboard({ match }: { match: MatchDetails }) {
  const isLive = isLiveMatch(match);

  return (
    <section className="detail-scoreboard" aria-labelledby="scoreboard-title">
      <div className="scoreboard-nav">
        <Link href="/" className="back-link"><span aria-hidden="true">←</span> All matches</Link>
        <span className={`status-badge${isLive ? " status-badge--live" : ""}`}>
          {isLive && <span className="live-dot" aria-hidden="true" />}
          {getStatusLabel(match.status)} · {getClockLabel(match)}
        </span>
      </div>

      <div className="scoreboard-main" id="scoreboard-title">
        <TeamBlock name={match.homeTeam.name} shortName={match.homeTeam.shortName} side="Home" />
        <div className="score-block" aria-live="polite" aria-atomic="true">
          <div className="score-numbers">
            <strong>{match.status === "NOT_STARTED" ? "—" : match.homeScore}</strong>
            <span>:</span>
            <strong>{match.status === "NOT_STARTED" ? "—" : match.awayScore}</strong>
          </div>
          <span>{match.status === "NOT_STARTED" ? formatKickoff(match.startTime) : getStatusLabel(match.status)}</span>
        </div>
        <TeamBlock name={match.awayTeam.name} shortName={match.awayTeam.shortName} side="Away" />
      </div>
    </section>
  );
}

function TeamBlock({ name, shortName, side }: { name: string; shortName: string; side: string }) {
  return (
    <div className="scoreboard-team">
      <span className="scoreboard-side">{side}</span>
      <span className="scoreboard-crest" aria-hidden="true">{shortName.slice(0, 3)}</span>
      <h1>{name}</h1>
    </div>
  );
}
