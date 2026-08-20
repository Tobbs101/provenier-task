"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/lib/motion/preferences";
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
  const timeline = useRef<HTMLElement | null>(null);
  const knownEventIds = useRef<Set<string>>(new Set());
  const orderedEvents = useMemo(() => [...events].sort((left, right) => {
    if (right.minute !== left.minute) return right.minute - left.minute;
    return new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
  }), [events]);
  const eventIds = orderedEvents.map(({ id }) => id).join(",");

  useEffect(() => {
    if (!timeline.current) return;

    const currentIds = new Set(orderedEvents.map(({ id }) => id));
    const newIds = new Set(
      [...currentIds].filter((eventId) => !knownEventIds.current.has(eventId)),
    );
    const isInitialReveal = knownEventIds.current.size === 0;
    knownEventIds.current = currentIds;

    if (prefersReducedMotion()) return;

    const eventElements = Array.from(
      timeline.current.querySelectorAll<HTMLElement>("[data-event-id]"),
    );
    const animatedElements = isInitialReveal
      ? eventElements
      : eventElements.filter((element) => newIds.has(element.dataset.eventId ?? ""));

    if (animatedElements.length === 0) return;

    const context = gsap.context(() => {
      gsap.fromTo(animatedElements, {
        autoAlpha: 0,
        x: -20,
        boxShadow: "inset 3px 0 #ffd700",
      }, {
        autoAlpha: 1,
        x: 0,
        boxShadow: "inset 0 0 transparent",
        duration: 0.55,
        stagger: isInitialReveal ? 0.06 : 0,
        ease: "power3.out",
        clearProps: "box-shadow,transform,opacity,visibility",
      });
    }, timeline);

    return () => context.revert();
  }, [eventIds, orderedEvents]);

  return (
    <section className="detail-panel timeline-panel" aria-labelledby="timeline-heading" ref={timeline}>
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
        <ol className="timeline-list" aria-live="polite" aria-relevant="additions">
          {orderedEvents.map((event) => {
            const meta = eventMeta[event.type];
            return (
              <li
                className={`timeline-event timeline-event--${event.type.toLowerCase()}`}
                data-event-id={event.id}
                key={event.id}
              >
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
