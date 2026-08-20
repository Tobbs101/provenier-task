const previewMatches = [
  { home: "ARS", away: "RMA", homeScore: 2, awayScore: 1, minute: "67′" },
  { home: "PSG", away: "CHE", homeScore: 1, awayScore: 1, minute: "HT" },
  { home: "MCI", away: "LIV", homeScore: 0, awayScore: 0, minute: "24′" },
];

export default function Home() {
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

          <div className="score-preview" aria-label="Preview of live matches">
            <div className="preview-topline">
              <span>Live now</span>
              <span>{previewMatches.length} matches</span>
            </div>
            {previewMatches.map((match) => (
              <div className="preview-match" key={`${match.home}-${match.away}`}>
                <div className="preview-status">
                  <span className="live-dot" aria-hidden="true" />
                  {match.minute}
                </div>
                <div className="preview-team">
                  <span>{match.home}</span>
                  <strong>{match.homeScore}</strong>
                </div>
                <div className="preview-team">
                  <span>{match.away}</span>
                  <strong>{match.awayScore}</strong>
                </div>
              </div>
            ))}
            <p className="preview-note">Live data integration arrives in the next milestone.</p>
          </div>
        </div>
      </section>

      <section className="page-container matches-shell" id="matches">
        <div>
          <p className="section-kicker">Match center</p>
          <h2>Today&apos;s fixtures</h2>
        </div>
        <div className="empty-card">
          <span className="empty-card-index">01</span>
          <div>
            <h3>Live match feed</h3>
            <p>The dashboard will connect here through our protected application API.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
