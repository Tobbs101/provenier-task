"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { MatchChat } from "@/components/match-chat/match-chat";
import { MatchScoreboard } from "@/components/match-detail/match-scoreboard";
import { MatchStatistics } from "@/components/match-detail/match-statistics";
import { MatchTimeline } from "@/components/match-detail/match-timeline";
import { useMatchDetails } from "@/hooks/use-match-details";
import { clearMatchChatHistory } from "@/lib/storage/chat-history";

export function MatchDetail({ matchId }: { matchId: string }) {
  const { match, error, isLoading, retry } = useMatchDetails(matchId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [matchId]);

  if (isLoading) return <MatchDetailSkeleton />;

  if (error || !match) {
    const notFound = error?.status === 404 || error?.status === 400;

    if (notFound) {
      return <UnavailableMatchState matchId={matchId} message={error?.message} />;
    }

    return (
      <main className="page-container detail-state" id="main-content">
        <span className="state-code">Signal lost</span>
        <h1>We couldn’t load this match.</h1>
        <p>{error?.message ?? "The match service returned no data."}</p>
        <div className="detail-state-actions">
          <button type="button" onClick={retry}>Try again</button>
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
      <MatchChat matchId={match.id} />
    </main>
  );
}

function UnavailableMatchState({ matchId, message }: { matchId: string; message?: string }) {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState(3);
  const redirectStarted = useRef(false);

  const redirectToDashboard = useCallback(async () => {
    if (redirectStarted.current) return;
    redirectStarted.current = true;
    await clearMatchChatHistory(matchId);
    router.replace("/");
  }, [matchId, router]);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsRemaining((currentValue) => Math.max(0, currentValue - 1));
    }, 1_000);
    const redirect = window.setTimeout(() => void redirectToDashboard(), 3_000);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(redirect);
    };
  }, [redirectToDashboard]);

  return (
    <main className="page-container detail-state expired-match-state" id="main-content">
      <div className="redirect-cue" aria-hidden="true">
        <span>↗</span>
      </div>
      <span className="state-code">Match unavailable</span>
      <h1>This fixture is no longer on the board.</h1>
      <p>{message ?? "The match may have finished and rotated out of the live simulation."}</p>
      <div className="redirect-status" role="status" aria-live="polite">
        <span>Returning to today&apos;s matches in {secondsRemaining}…</span>
        <span className="redirect-progress" aria-hidden="true"><span /></span>
      </div>
      <div className="detail-state-actions">
        <button type="button" onClick={() => void redirectToDashboard()}>Back now</button>
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
