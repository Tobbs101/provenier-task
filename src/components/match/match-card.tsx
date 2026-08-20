"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import { getClockLabel, getStatusLabel, isLiveMatch } from "@/lib/matches/presentation";
import { prefersReducedMotion } from "@/lib/motion/preferences";
import type { Match } from "@/types/match";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const card = useRef<HTMLAnchorElement | null>(null);
  const previousScore = useRef(`${match.homeScore}-${match.awayScore}`);
  const isLive = isLiveMatch(match);
  const statusTone = isLive ? "live" : match.status === "FULL_TIME" ? "finished" : "upcoming";
  const score = `${match.homeScore}-${match.awayScore}`;

  useEffect(() => {
    if (previousScore.current === score || !card.current || prefersReducedMotion()) {
      previousScore.current = score;
      return;
    }

    previousScore.current = score;
    const context = gsap.context(() => {
      gsap.fromTo(".match-team-row strong", {
        color: "#ffd700",
        scale: 1.45,
      }, {
        scale: 1,
        duration: 0.55,
        ease: "back.out(2.5)",
        clearProps: "color,transform",
      });
    }, card);

    return () => context.revert();
  }, [score]);

  return (
    <Link
      ref={card}
      className={`match-card match-card--${statusTone}`}
      href={`/matches/${match.id}`}
      aria-label={`${match.homeTeam.name} ${match.homeScore}, ${match.awayTeam.name} ${match.awayScore}. ${isLive ? "Live, " : ""}${getStatusLabel(match.status)}.`}
    >
      <div className="match-card-topline">
        <span className={`status-badge status-badge--${statusTone}`}>
          {isLive && (
            <>
              <span className="live-dot" aria-hidden="true" />
              <span className="live-word">Live</span>
              <span className="live-separator" aria-hidden="true">·</span>
            </>
          )}
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
