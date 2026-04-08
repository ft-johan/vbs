# Safari Vibes Live Event Controller

A lightweight two-screen web setup for running a live event flow:
- `admin.html`: control panel for operators (mode switching, score updates, winner selection)
- `display.html`: public-facing fullscreen display with animated scenes
- `index.html`: launcher page with quick links to Admin and Display

The app uses Firebase Realtime Database as a shared state bus between the admin and display screens.

## Project Analysis

### What this project does
- Uses a single realtime state object at `liveEvent` in Firebase.
- Supports 4 display modes:
  - `start`: countdown screen
  - `game`: game-in-progress scene
  - `score`: scoreboard scene
  - `winner`: winner reveal with confetti
- Admin can:
  - switch modes
  - increment/decrement each team by 1000
  - set exact scores manually
  - reset scores
  - declare winner (`MOSES FFC` or `AHARON FFC`)

### Architecture
- Frontend-only static HTML/CSS/JS (no build step).
- Firebase Web SDK loaded from CDN modules.
- Shared Firebase config in `assets/js/firebase-config.js`.
- Page-specific logic split into separate files:
  - `assets/js/admin.js`
  - `assets/js/display.js`
- Page-specific styles split into:
  - `assets/css/admin.css`
  - `assets/css/display.css`
- State shape used by both screens:

```json
{
  "mode": "start|game|score|winner",
  "teamA": 0,
  "teamB": 0,
  "winner": ""
}
```

### Current gaps / risks found
1. No auth/authorization on admin actions (anyone with page access can control state).
2. Frontend contains Firebase client config by design; secure rules are required in production.

## Quick Start

### 1) Configure Firebase
Create a Firebase project with Realtime Database enabled.

In `assets/js/firebase-config.js`, set the values in:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2) Serve files locally
Use any static server (recommended; avoid `file://` for module imports).

Example with Node:

```bash
npx serve .
```

Then open:
- Launcher: `http://localhost:3000/`
- Admin view: `http://localhost:3000/admin.html`
- Display view: `http://localhost:3000/display.html`

### 3) Initialize state once (optional)
From admin view, click controls to push first state; display will then sync automatically.

## Firebase Rules (development)
For testing only, permissive rules may be used temporarily:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production/events, lock this down with authentication and path-scoped rules.

## Suggested Next Improvements
1. Add auth (Firebase Auth or token gate) for admin controls.
2. Add a read-only operator mode for backup devices.
3. Add write retry/backoff and offline queue indicators.
4. Add event presets as saved templates in Firebase.
5. Add audit logging (who changed mode/score and when).

## Tech Notes
- External dependencies:
  - Firebase Web SDK 10.12.0
  - canvas-confetti 1.9.2
  - Google Fonts
- Designed as a no-build static web project.
