"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { formatKickoff, getClockLabel, getStatusLabel, isLiveMatch } from "@/lib/matches/presentation";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import type { MatchDetails } from "@/types/match";

export function MatchScoreboard({ match }: { match: MatchDetails }) {
  const scoreboard = useRef<HTMLElement | null>(null);
  const previousState = useRef<string | null>(null);
  const isLive = isLiveMatch(match);
  const scoreState = `${match.homeScore}-${match.awayScore}-${match.status}`;

  useEffect(() => {
    if (!scoreboard.current || prefersReducedMotion()) {
      previousState.current = scoreState;
      return;
    }

    const isInitialReveal = previousState.current === null;
    previousState.current = scoreState;
    const context = gsap.context(() => {
      if (isInitialReveal) {
        gsap.fromTo(".scoreboard-team", { autoAlpha: 0, y: 18 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.fromTo(".score-block", { autoAlpha: 0, scale: 0.86 }, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.8)",
        });
        return;
      }

      gsap.fromTo(".score-numbers strong", { color: "#ffd700", scale: 1.28 }, {
        scale: 1,
        duration: 0.55,
        stagger: 0.05,
        ease: "back.out(2.2)",
        clearProps: "color,transform",
      });
    }, scoreboard);

    return () => context.revert();
  }, [scoreState]);

  return (
    <section
      className={`detail-scoreboard${isLive ? " detail-scoreboard--live" : ""}`}
      aria-labelledby="scoreboard-title"
      ref={scoreboard}
    >
      <div className="scoreboard-nav">
        <Link href="/" className="back-link"><span aria-hidden="true">←</span> All matches</Link>
        <span className={`status-badge${isLive ? " status-badge--live" : ""}`}>
          {isLive && (
            <>
              <span className="live-dot" aria-hidden="true" />
              <span className="live-word">Live</span>
              <span className="live-separator" aria-hidden="true">·</span>
            </>
          )}
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
