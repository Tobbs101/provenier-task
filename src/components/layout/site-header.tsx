import Link from "next/link";

import { ConnectionIndicator } from "@/components/socket/connection-indicator";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <Link className="brand-mark" href="/" aria-label="ProFootball home">
          <span className="brand-symbol" aria-hidden="true">P</span>
          <span>ProFootball</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link className="active-nav" href="/">Matches</Link>
        </nav>
        <div className="header-actions">
          <ConnectionIndicator />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
