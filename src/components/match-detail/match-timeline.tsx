import type { MatchEvent, MatchEventType } from "@/types/match";

const eventMeta: Record<MatchEventType, { icon: string; label: string }> = {
  GOAL: { icon: "●", label: "Goal" },
  YELLOW_CARD: { icon: "▮", label: "Yellow card" },
  RED_CARD: { icon: "▮", label: "Red card" },
  SUBSTITUTION: { icon: "⇄", label: "Substitution" },
  FOUL: { icon: "×", label: "Foul" },
  SHOT: { icon: "↗", label: "Shot" },
};

export function MatchTimeline({ events }: { events: MatchEvent[] }) {
  const orderedEvents = [...events].sort((left, right) => {
    if (right.minute !== left.minute) return right.minute - left.minute;
    return new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
  });

  return (
    <section className="detail-panel timeline-panel" aria-labelledby="timeline-heading">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Play by play</p>
          <h2 id="timeline-heading">Match timeline</h2>
        </div>
        <span>{events.length} events</span>
      </div>

      {orderedEvents.length === 0 ? (
        <div className="panel-empty">
          <span aria-hidden="true">○</span>
          <p>Match events will appear here as the action unfolds.</p>
        </div>
      ) : (
        <ol className="timeline-list">
          {orderedEvents.map((event) => {
            const meta = eventMeta[event.type];
            return (
              <li className={`timeline-event timeline-event--${event.type.toLowerCase()}`} key={event.id}>
                <time>{event.minute}′</time>
                <span className="event-icon" aria-hidden="true">{meta.icon}</span>
                <div>
                  <span className="event-label">{meta.label} · {event.team}</span>
                  <h3>{event.player ?? event.description}</h3>
                  {event.assistPlayer && <p>Assist: {event.assistPlayer}</p>}
                  {event.player && event.description && <p>{event.description}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
