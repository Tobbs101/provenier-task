import type { Metadata } from "next";

import { MatchDetail } from "@/components/match-detail/match-detail";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Match details",
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;

  return <MatchDetail matchId={id} />;
}
