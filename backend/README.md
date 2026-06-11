# SignalSure Backend

This backend uses plain Node.js, so you do not need to install Express or any other package.

## How to Run

Open the project in VS Code, then run:

```bash
node backend/server.js
```

Then open:

```text
http://localhost:3000
```

## API Endpoints

### Get Venues

```text
GET /api/venues
```

### Calculate WiFi Trust Score

```text
POST /api/check-wifi
```

Example body:

```json
{
  "name": "Harbor Desk Cafe",
  "download": 72,
  "upload": 38,
  "latency": 28,
  "drops": 0
}
```

### Add Venue

```text
POST /api/venues
```

Example body:

```json
{
  "name": "New Work Cafe",
  "type": "Cafe",
  "city": "Mumbai",
  "speed": 80,
  "upload": 45,
  "latency": 30,
  "drops": 0,
  "summary": "Good for calls and laptop work.",
  "tags": ["remote", "calls", "travel"]
}
```
