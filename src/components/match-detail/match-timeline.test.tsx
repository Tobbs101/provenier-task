import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MatchEvent } from "@/types/match";

import { MatchTimeline } from "./match-timeline";

function createEvent(overrides: Partial<MatchEvent>): MatchEvent {
  return {
    id: "event-1",
    type: "SHOT",
    minute: 42,
    team: "home",
    description: "Shot saved",
    timestamp: "2026-08-20T18:42:00.000Z",
    ...overrides,
  };
}

describe("MatchTimeline", () => {
  it("places the latest arrival first when events share a minute and timestamp", () => {
    const existingEvent = createEvent({ id: "existing", description: "First chance" });
    const incomingEvent = createEvent({ id: "incoming", description: "Follow-up chance" });

    render(<MatchTimeline events={[existingEvent, incomingEvent]} />);

    const timelineItems = screen.getByRole("list").querySelectorAll("li");
    expect(timelineItems[0]).toHaveTextContent("Follow-up chance");
    expect(timelineItems[1]).toHaveTextContent("First chance");
  });

  it("continues to prioritize the highest match minute", () => {
    const laterArrival = createEvent({ id: "minute-41", minute: 41, description: "Later arrival" });
    const higherMinute = createEvent({ id: "minute-42", minute: 42, description: "Higher minute" });

    render(<MatchTimeline events={[higherMinute, laterArrival]} />);

    expect(screen.getByRole("list").querySelector("li")).toHaveTextContent("Higher minute");
  });
});
