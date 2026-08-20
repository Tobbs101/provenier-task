"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/lib/motion/preferences";
import type { MatchStatistics as MatchStatisticsData, TeamMetric } from "@/types/match";

const metrics: { key: keyof MatchStatisticsData; label: string; percentage?: boolean }[] = [
  { key: "possession", label: "Possession", percentage: true },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on target" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fouls" },
  { key: "yellowCards", label: "Yellow cards" },
  { key: "redCards", label: "Red cards" },
];

function getHomeShare(metric: TeamMetric) {
  const total = metric.home + metric.away;
  return total === 0 ? 50 : (metric.home / total) * 100;
}

export function MatchStatistics({ statistics }: { statistics: MatchStatisticsData }) {
  const panel = useRef<HTMLElement | null>(null);
  const currentShares = useMemo(
    () => metrics.map(({ key }) => getHomeShare(statistics[key])),
    [statistics],
  );
  const previousShares = useRef<number[] | null>(null);
  const statisticsState = metrics
    .map(({ key }) => `${statistics[key].home}-${statistics[key].away}`)
    .join(",");

  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) {
      previousShares.current = currentShares;
      return;
    }

    const bars = Array.from(panel.current.querySelectorAll<HTMLElement>(".statistic-track > span"));
    const oldShares = previousShares.current;
    previousShares.current = currentShares;
    const context = gsap.context(() => {
      bars.forEach((bar, index) => {
        gsap.fromTo(bar, {
          width: `${oldShares?.[index] ?? 0}%`,
        }, {
          width: `${currentShares[index]}%`,
          duration: oldShares ? 0.55 : 0.85,
          ease: "power2.out",
        });
      });

      if (!oldShares) {
        gsap.fromTo(".statistic-values", { autoAlpha: 0, y: 6 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
        });
      }
    }, panel);

    return () => context.revert();
  }, [currentShares, statisticsState]);

  return (
    <section className="detail-panel statistics-panel" aria-labelledby="statistics-heading" ref={panel}>
      <div className="panel-heading">
        <div>
          <p className="section-kicker">By the numbers</p>
          <h2 id="statistics-heading">Statistics</h2>
        </div>
      </div>

      <div className="statistics-list">
        {metrics.map(({ key, label, percentage }) => {
          const metric = statistics[key];
          const suffix = percentage ? "%" : "";
          const homeShare = getHomeShare(metric);

          return (
            <div className="statistic-row" key={key}>
              <div className="statistic-values">
                <strong>{metric.home}{suffix}</strong>
                <span>{label}</span>
                <strong>{metric.away}{suffix}</strong>
              </div>
              <div
                className="statistic-track"
                role="img"
                aria-label={`${label}: home ${metric.home}${suffix}, away ${metric.away}${suffix}`}
              >
                <span style={{ width: `${homeShare}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
