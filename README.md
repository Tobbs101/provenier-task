# ProFootball Match Center

A responsive live football experience built for the ProFootball frontend assessment. It combines real-time scores, match events, statistics, and match-specific chat in a Next.js App Router application.

## Features

- Live, upcoming, and completed match filtering
- Real-time score, status, timeline, and statistics updates
- Match-specific chat with persistent browser identity and typing indicators
- Per-match chat history stored in IndexedDB
- Automatic Socket.IO reconnection and visible connection status
- Graceful REST loading, failure, retry, and expired-match states
- Light and dark themes with persisted preference
- Responsive layouts, keyboard navigation, live regions, and reduced-motion support

## Technology

- Next.js 14+ App Router and React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- GSAP
- Vitest and React Testing Library
- IndexedDB for local chat history
- Yarn 1.x

## Getting started

Requirements:

- Node.js 20.9 or newer
- Yarn 1.22

Install and start the development server:

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```bash
PROFOOTBALL_API_URL=https://profootball.srv883830.hstgr.cloud
NEXT_PUBLIC_PROFOOTBALL_SOCKET_URL=https://profootball.srv883830.hstgr.cloud
```

`PROFOOTBALL_API_URL` is server-only and is used by the Next.js route-handler proxy. The Socket.IO URL must be public because the browser establishes that persistent connection directly.

## Available scripts

```bash
yarn dev         # start the development server
yarn build       # create a production build
yarn start       # serve the production build
yarn lint        # run ESLint
yarn typecheck   # run TypeScript without emitting files
yarn test        # run the test suite once
yarn test:watch  # run tests in watch mode
```

## Approach

### REST boundary

Browser REST requests use same-origin endpoints under `/api/matches`. Next.js route handlers validate match identifiers, forward only allowlisted paths to the configured upstream service, disable caching, preserve upstream status codes, and return controlled errors when the upstream request fails or exceeds ten seconds.

The browser validates successful API payloads before putting them into application state. This prevents malformed upstream data from failing later inside presentation components.

### Real-time lifecycle

The application owns one managed Socket.IO client. The dashboard subscribes only to the match IDs it currently knows about. The detail view subscribes to its selected match and joins that match's chat room after the user creates an identity.

Subscriptions and chat membership are removed during cleanup. When the socket reconnects, active views subscribe again and refresh their canonical REST state before continuing with socket updates. The UI exposes connecting, connected, reconnecting, and disconnected states.

Timeline events are ordered by match minute, timestamp, and arrival order. This keeps the latest event at the top even when the backend emits multiple events with identical minute and timestamp values.

### Local persistence

The generated user ID and display name are stored in `localStorage`. Chat messages are deduplicated and stored per match in IndexedDB, capped at the latest 200 messages for each match. History is local to the current browser and is removed when an invalid or expired match redirects back to the dashboard.

No authentication token, API credential, or private server configuration is stored in browser persistence.

### Design and accessibility

- Agenia Bold is used for display typography and scores.
- Otflag Sans Medium is used for interface and body text.
- Brand yellow (`#ffd700`) is the primary accent.
- Dark mode uses brand dark (`#0d0d0d`) as its page background.
- The initial theme follows the operating-system preference and an explicit choice persists.
- Semantic regions, labels, focus states, skip navigation, and polite live regions support keyboard and assistive-technology use.
- GSAP interactions defer to the user's reduced-motion preference.

## Testing

The automated suite covers:

- Match status presentation, filtering, and ordering
- Live match-card navigation and indicators
- REST response validation and error propagation
- Timeline ordering for simultaneous events
- IndexedDB persistence, match isolation, deduplication, and cleanup

Run the complete local quality check with:

```bash
yarn test
yarn lint
yarn typecheck
```

## Trade-offs

- Initial match data is loaded client-side so reconnect recovery and live state share one predictable state path. This introduces a short skeleton state instead of rendering the first response on the server.
- Socket.IO connects directly from the browser because WebSocket traffic is long-lived and event-driven. REST traffic remains behind the server-side proxy so its upstream configuration is not exposed.
- Chat identity is intentionally lightweight and browser-local, as allowed by the assessment. It is not authentication and should not be treated as verified identity.
- The backend does not expose historical chat through REST, so IndexedDB provides continuity only for messages observed by the current browser.
- Team monograms are used instead of external crest assets to avoid adding an unprovided asset dependency.
- Unit and component tests cover high-risk state and ordering behavior; a production project would add browser-level tests for reconnection and multi-user chat across separate sessions.

## Deployment

The app can be deployed to any Node-compatible Next.js host. Configure both environment variables from `.env.example`, run `yarn build`, and serve with `yarn start`. For Vercel, add the variables to the project environment and use the detected Next.js defaults.
