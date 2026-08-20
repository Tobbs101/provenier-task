# ProFootball - Frontend Developer Assessment

## Overview

Build a **Live Match Center** that displays real-time football match data. You will integrate with our production backend API which serves live match updates, events, and chat functionality.


**Submit:**
- Deployed application URL
- GitHub repository URL
- README with your approach and any trade-offs

---

## Backend API

**Base URL:** `https://profootball.srv883830.hstgr.cloud`

### REST Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/matches` | All matches |
| `GET /api/matches/live` | Currently live matches only |
| `GET /api/matches/:id` | Match details with events and statistics |

---

### Response Examples

**GET /api/matches**

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "homeTeam": { "id": "uuid", "name": "Manchester United", "shortName": "MUN" },
        "awayTeam": { "id": "uuid", "name": "Liverpool", "shortName": "LIV" },
        "homeScore": 2,
        "awayScore": 1,
        "minute": 67,
        "status": "SECOND_HALF",
        "startTime": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 4
  }
}
```

**GET /api/matches/:id**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "homeTeam": { "id": "uuid", "name": "Manchester United", "shortName": "MUN" },
    "awayTeam": { "id": "uuid", "name": "Liverpool", "shortName": "LIV" },
    "homeScore": 2,
    "awayScore": 1,
    "minute": 67,
    "status": "SECOND_HALF",
    "startTime": "2024-01-01T12:00:00.000Z",
    "events": [
      {
        "id": "uuid",
        "type": "GOAL",
        "minute": 23,
        "team": "home",
        "player": "Marcus Rashford",
        "assistPlayer": "Bruno Fernandes",
        "description": "GOAL! Marcus Rashford scores for Manchester United!",
        "timestamp": "2024-01-01T12:23:00.000Z"
      },
      {
        "id": "uuid",
        "type": "YELLOW_CARD",
        "minute": 34,
        "team": "away",
        "player": "Virgil van Dijk",
        "description": "Yellow card shown to Virgil van Dijk",
        "timestamp": "2024-01-01T12:34:00.000Z"
      }
    ],
    "statistics": {
      "possession": { "home": 55, "away": 45 },
      "shots": { "home": 12, "away": 8 },
      "shotsOnTarget": { "home": 6, "away": 3 },
      "corners": { "home": 4, "away": 2 },
      "fouls": { "home": 7, "away": 9 },
      "yellowCards": { "home": 1, "away": 2 },
      "redCards": { "home": 0, "away": 0 }
    }
  }
}
```

**Match Status Values:**
- `NOT_STARTED` - Match hasn't begun
- `FIRST_HALF` - First half in progress
- `HALF_TIME` - Half-time break
- `SECOND_HALF` - Second half in progress
- `FULL_TIME` - Match completed

**Event Types:**
- `GOAL` - Goal scored (includes `player` and optional `assistPlayer`)
- `YELLOW_CARD` - Yellow card shown
- `RED_CARD` - Red card shown
- `SUBSTITUTION` - Player substitution
- `FOUL` - Foul committed
- `SHOT` - Shot attempted

---

### WebSocket (Socket.IO)

The backend uses Socket.IO for real-time communication. Connect to: `wss://profootball.srv883830.hstgr.cloud`

#### Client -> Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe_match` | `{ matchId: "uuid" }` | Subscribe to live updates for a match |
| `unsubscribe_match` | `{ matchId: "uuid" }` | Stop receiving updates for a match |
| `join_chat` | `{ matchId: "uuid", userId: "string", username: "string" }` | Join a match's chat room |
| `leave_chat` | `{ matchId: "uuid", userId: "string" }` | Leave a chat room |
| `send_message` | `{ matchId: "uuid", userId: "string", username: "string", message: "string" }` | Send a chat message |
| `typing_start` | `{ matchId: "uuid", userId: "string", username: "string" }` | Indicate user started typing |
| `typing_stop` | `{ matchId: "uuid", userId: "string" }` | Indicate user stopped typing |

#### Server -> Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `score_update` | `{ matchId, homeScore, awayScore }` | Score has changed |
| `match_event` | `{ matchId, type, minute, team, player, description, ... }` | New match event occurred |
| `stats_update` | `{ matchId, statistics: {...} }` | Match statistics updated |
| `status_change` | `{ matchId, status, minute }` | Match status changed (e.g., half-time) |
| `chat_message` | `{ matchId, userId, username, message, timestamp }` | New chat message received |
| `user_joined` | `{ matchId, userId, username }` | User joined the chat room |
| `user_left` | `{ matchId, userId, username }` | User left the chat room |
| `typing_indicator` | `{ matchId, userId, username, isTyping }` | User typing status changed |
| `error` | `{ code, message }` | Error occurred |

---

## Requirements

### Technical Stack
- **Next.js 14+** (App Router)
- **TypeScript**
- Styling: Your choice

---

### What to Build

#### 1. Match Dashboard

The main view showing all matches. Users should see match scores updating in real-time without refreshing the page. Live matches should be visually distinguishable from upcoming or finished matches. Clicking a match navigates to its detail view.

#### 2. Match Detail View

A detailed view for a single match. Shows the current score, match timeline with events (goals, cards, substitutions), and live statistics. All data should update in real-time as the match progresses. When a user leaves this view, connections should be properly cleaned up.

#### 3. Match Chat

Each match has its own chat room. Users can send and receive messages in real-time. The chat should show typing indicators when other users are typing. Users need some form of identity (username) to participate - this can be simple (e.g., stored in localStorage). The application should handle joining and leaving rooms appropriately.

#### 4. Connection Handling

The application should handle network issues gracefully. If the WebSocket connection drops, it should attempt to reconnect. Users should be aware of the connection status. The application should recover state appropriately after reconnection.

---

## Notes

- The API is live with real matches being simulated
- Matches progress in real-time (1 second = 1 match minute)
- Multiple matches run concurrently
- When matches finish, new ones start automatically
- Chat messages have a 500 character limit
- Chat has rate limiting (server will return errors if exceeded)

---

## Quick Test

Verify the API is working:

```bash
curl https://profootball.srv883830.hstgr.cloud/api/matches
```

---

## Questions?

If the API is down or you encounter technical issues, contact us immediately.

**Good luck!**

