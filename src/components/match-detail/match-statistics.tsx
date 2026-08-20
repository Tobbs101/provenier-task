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
  return (
    <section className="detail-panel statistics-panel" aria-labelledby="statistics-heading">
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
