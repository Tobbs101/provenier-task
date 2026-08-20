# ProFootball Match Center

A live football match center built with Next.js App Router, TypeScript, Tailwind CSS, Socket.IO, and GSAP.

## Getting started

This project uses Yarn.

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
yarn dev        # start the development server
yarn build      # create a production build
yarn start      # serve the production build
yarn lint       # run ESLint
yarn typecheck  # run TypeScript without emitting files
```

## Architecture

The browser accesses the football REST API through allowlisted, same-origin route handlers under `/api`. The upstream URL is server-only and can be configured with `PROFOOTBALL_API_URL`. Proxy responses are not cached so live match state cannot become stale.

Real-time match updates and chat will be provided through Socket.IO. The final transport configuration will account for the WebSocket capabilities of the selected deployment platform.

## Design foundation

- Agenia Bold is used for display typography and scores.
- Otflag Sans Medium is used for interface and body text.
- Brand yellow (`#ffd700`) is the primary accent.
- Dark mode uses brand dark (`#0d0d0d`) as its page background.
- The theme follows the system preference initially and persists an explicit user choice.

Further assessment decisions, trade-offs, testing details, and deployment information will be documented as the implementation progresses.
