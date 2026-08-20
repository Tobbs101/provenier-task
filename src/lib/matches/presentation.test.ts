import { describe, expect, it } from "vitest";

import { createMatch } from "@/test/fixtures";

import {
  filterMatches,
  getClockLabel,
  getStatusLabel,
  isLiveMatch,
  sortMatches,
} from "./presentation";

describe("match presentation", () => {
  it.each(["FIRST_HALF", "HALF_TIME", "SECOND_HALF"] as const)(
    "treats %s as live",
    (status) => {
      expect(isLiveMatch(createMatch({ status }))).toBe(true);
    },
  );

  it.each(["NOT_STARTED", "FULL_TIME"] as const)("does not treat %s as live", (status) => {
    expect(isLiveMatch(createMatch({ status }))).toBe(false);
  });

  it("uses compact clock labels for active and completed matches", () => {
    expect(getClockLabel(createMatch({ status: "HALF_TIME" }))).toBe("HT");
    expect(getClockLabel(createMatch({ status: "FULL_TIME" }))).toBe("FT");
    expect(getClockLabel(createMatch({ status: "FIRST_HALF", minute: 24 }))).toBe("24′");
    expect(getStatusLabel("SECOND_HALF")).toBe("Second half");
  });

  it("filters matches without changing the source collection", () => {
    const matches = [
      createMatch({ id: "live", status: "FIRST_HALF" }),
      createMatch({ id: "upcoming", status: "NOT_STARTED" }),
      createMatch({ id: "finished", status: "FULL_TIME" }),
    ];

    expect(filterMatches(matches, "live").map(({ id }) => id)).toEqual(["live"]);
    expect(filterMatches(matches, "upcoming").map(({ id }) => id)).toEqual(["upcoming"]);
    expect(filterMatches(matches, "finished").map(({ id }) => id)).toEqual(["finished"]);
    expect(matches).toHaveLength(3);
  });

  it("orders live matches first and kickoff times within a status", () => {
    const matches = [
      createMatch({ id: "finished", status: "FULL_TIME" }),
      createMatch({ id: "upcoming-late", status: "NOT_STARTED", startTime: "2026-08-20T20:00:00Z" }),
      createMatch({ id: "first-half", status: "FIRST_HALF" }),
      createMatch({ id: "second-half", status: "SECOND_HALF" }),
      createMatch({ id: "upcoming-early", status: "NOT_STARTED", startTime: "2026-08-20T19:00:00Z" }),
    ];

    expect(sortMatches(matches).map(({ id }) => id)).toEqual([
      "second-half",
      "first-half",
      "upcoming-early",
      "upcoming-late",
      "finished",
    ]);
    expect(matches[0].id).toBe("finished");
  });
});
