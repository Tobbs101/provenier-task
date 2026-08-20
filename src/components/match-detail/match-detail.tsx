"use client";

import Link from "next/link";

import { MatchScoreboard } from "@/components/match-detail/match-scoreboard";
import { MatchStatistics } from "@/components/match-detail/match-statistics";
import { MatchTimeline } from "@/components/match-detail/match-timeline";
import { useMatchDetails } from "@/hooks/use-match-details";

export function MatchDetail({ matchId }: { matchId: string }) {
  const { match, error, isLoading, retry } = useMatchDetails(matchId);

  if (isLoading) return <MatchDetailSkeleton />;

  if (error || !match) {
    const notFound = error?.status === 404 || error?.status === 400;
    return (
      <main className="page-container detail-state" id="main-content">
        <span className="state-code">{notFound ? "Match unavailable" : "Signal lost"}</span>
        <h1>{notFound ? "This fixture is no longer on the board." : "We couldn’t load this match."}</h1>
        <p>{error?.message ?? "The match service returned no data."}</p>
        <div className="detail-state-actions">
          {!notFound && <button type="button" onClick={retry}>Try again</button>}
          <Link href="/">Back to matches</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content">
      <MatchScoreboard match={match} />
      <div className="page-container detail-grid">
        <MatchTimeline events={match.events} />
        <MatchStatistics statistics={match.statistics} />
      </div>
    </main>
  );
}

function MatchDetailSkeleton() {
  return (
    <main className="page-container detail-loading" id="main-content" aria-label="Loading match details">
      <div className="detail-loading-score" />
      <div className="detail-loading-grid">
        <div />
        <div />
      </div>
    </main>
  );
}
