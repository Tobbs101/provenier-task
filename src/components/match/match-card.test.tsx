import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createMatch } from "@/test/fixtures";

import { MatchCard } from "./match-card";

describe("MatchCard", () => {
  it("links a live match to its match center with a visible indicator", () => {
    render(<MatchCard match={createMatch({ id: "live-42", status: "FIRST_HALF", minute: 31 })} />);

    const link = screen.getByRole("link", {
      name: /northbridge fc 2, riverside united 1\. live, first half/i,
    });

    expect(link).toHaveAttribute("href", "/matches/live-42");
    expect(screen.getByText("Live")).toBeVisible();
    expect(screen.getByText("31′")).toBeVisible();
  });
});
