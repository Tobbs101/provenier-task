import Link from "next/link";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;

  return (
    <main className="page-container detail-placeholder" id="main-content">
      <p className="section-kicker">Match center</p>
      <h1>Match details are next.</h1>
      <p>
        The route for match <code>{id}</code> is ready. The live timeline, statistics, and chat arrive in the next progressive milestone.
      </p>
      <Link className="primary-action" href="/">
        Back to fixtures
        <span aria-hidden="true">↖</span>
      </Link>
    </main>
  );
}
