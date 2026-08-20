"use client";

import { useMemo, useState } from "react";

import { MatchCard } from "@/components/match/match-card";
import { useMatches } from "@/hooks/use-matches";
import {
  filterMatches,
  getClockLabel,
  isLiveMatch,
  sortMatches,
  type MatchFilter,
} from "@/lib/matches/presentation";

const filters: { value: MatchFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "finished", label: "Finished" },
];

export function MatchDashboard() {
  const { matches, status, error, retry } = useMatches();
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const sortedMatches = useMemo(() => sortMatches(matches), [matches]);
  const visibleMatches = useMemo(
    () => filterMatches(sortedMatches, activeFilter),
    [activeFilter, sortedMatches],
  );
  const liveMatches = sortedMatches.filter(isLiveMatch);
  const previewMatches = (liveMatches.length > 0 ? liveMatches : sortedMatches).slice(0, 3);

  function getFilterCount(filter: MatchFilter) {
    return filterMatches(matches, filter).length;
  }

  return (
    <main id="main-content">
      <section className="hero-shell">
        <div className="page-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              The game, as it happens
            </p>
            <h1>Every moment.<br />One match center.</h1>
            <p className="hero-description">
              Follow live scores, pivotal events, match statistics, and the conversation around every game.
            </p>
            <a className="primary-action" href="#matches">
              Explore live matches
              <span aria-hidden="true">↘</span>
            </a>
          </div>

          <div className="score-preview" aria-label="Current match overview" aria-live="polite">
            <div className="preview-topline">
              <span>{liveMatches.length > 0 ? "Live now" : "Match feed"}</span>
              <span>{status === "loading" ? "Updating" : `${liveMatches.length} live`}</span>
            </div>
            {status === "loading" && <PreviewSkeleton />}
            {status === "error" && (
              <div className="preview-message">
                <p>Live signal unavailable</p>
                <span>Use the retry control below to reconnect.</span>
              </div>
            )}
            {status === "success" && previewMatches.length === 0 && (
              <div className="preview-message">
                <p>No fixtures yet</p>
                <span>New simulated matches will appear automatically.</span>
              </div>
            )}
            {status === "success" && previewMatches.map((match) => (
              <div className="preview-match" key={match.id}>
                <div className={`preview-status${isLiveMatch(match) ? " preview-status--live" : ""}`}>
                  {isLiveMatch(match) && <span className="live-dot" aria-hidden="true" />}
                  {getClockLabel(match)}
                </div>
                <div className="preview-team">
                  <span>{match.homeTeam.shortName}</span>
                  <strong>{match.status === "NOT_STARTED" ? "—" : match.homeScore}</strong>
                </div>
                <div className="preview-team">
                  <span>{match.awayTeam.shortName}</span>
                  <strong>{match.status === "NOT_STARTED" ? "—" : match.awayScore}</strong>
                </div>
              </div>
            ))}
            <p className="preview-note">Scores update from the protected ProFootball feed.</p>
          </div>
        </div>
      </section>

      <section className="page-container matches-shell" id="matches" aria-labelledby="matches-title">
        <div className="matches-heading">
          <div>
            <p className="section-kicker">Match center</p>
            <h2 id="matches-title">Today&apos;s fixtures</h2>
          </div>
          {status === "success" && (
            <p className="fixture-total"><strong>{matches.length}</strong> matches on the board</p>
          )}
        </div>

        <div className="filter-row" aria-label="Filter matches">
          {filters.map((filter) => (
            <button
              className={`filter-button${activeFilter === filter.value ? " filter-button--active" : ""}`}
              type="button"
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              aria-pressed={activeFilter === filter.value}
            >
              {filter.label}
              <span>{getFilterCount(filter.value)}</span>
            </button>
          ))}
        </div>

        {status === "loading" && <MatchGridSkeleton />}
        {status === "error" && (
          <div className="dashboard-state" role="alert">
            <span className="state-code">Signal lost</span>
            <h3>We missed the latest team sheet.</h3>
            <p>{error}</p>
            <button type="button" onClick={retry}>Try again</button>
          </div>
        )}
        {status === "success" && visibleMatches.length === 0 && (
          <div className="dashboard-state">
            <span className="state-code">Nothing here</span>
            <h3>No {activeFilter === "all" ? "" : activeFilter} matches right now.</h3>
            <p>Choose another filter or check back as the simulation progresses.</p>
          </div>
        )}
        {status === "success" && visibleMatches.length > 0 && (
          <div className="match-grid">
            {visibleMatches.map((match) => <MatchCard match={match} key={match.id} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function PreviewSkeleton() {
  return (
    <div className="preview-skeleton" aria-label="Loading match preview">
      {[0, 1, 2].map((item) => <span key={item} />)}
    </div>
  );
}

function MatchGridSkeleton() {
  return (
    <div className="match-grid" aria-label="Loading matches">
      {[0, 1, 2, 3].map((item) => (
        <div className="match-card match-card-skeleton" key={item}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
