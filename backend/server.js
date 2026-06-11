const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

let venues = [
  {
    id: "harbor",
    name: "Harbor Desk Cafe",
    type: "Cafe",
    city: "Lisbon",
    score: 94,
    speed: 112,
    upload: 58,
    latency: 19,
    tests: 58,
    summary: "Quiet tables, strong upload consistency, and no video-call drops in the last 24 hours.",
    tags: ["remote", "calls", "upload", "travel"]
  },
  {
    id: "metro",
    name: "MetroStay Business Hotel",
    type: "Hotel",
    city: "Bengaluru",
    score: 82,
    speed: 67,
    upload: 31,
    latency: 35,
    tests: 31,
    summary: "Reliable in the lobby and work lounge, with some evening congestion in rooms.",
    tags: ["remote", "travel", "calls"]
  },
  {
    id: "canal",
    name: "Canal Cowork Loft",
    type: "Coworking",
    city: "Amsterdam",
    score: 89,
    speed: 96,
    upload: 74,
    latency: 24,
    tests: 44,
    summary: "A strong choice for long calls, shared work sessions, and file uploads.",
    tags: ["remote", "calls", "upload"]
  },
  {
    id: "oldtown",
    name: "Old Town Guesthouse",
    type: "Guesthouse",
    city: "Prague",
    score: 61,
    speed: 28,
    upload: 9,
    latency: 86,
    tests: 12,
    summary: "Advertises high-speed WiFi, but verified reports show unstable peak-hour latency.",
    tags: ["travel"]
  }
];

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function calculateScore(download, upload, latency, drops) {
  const speedScore = (Math.min(download, 120) / 120) * 34;
  const uploadScore = (Math.min(upload, 80) / 80) * 22;
  const latencyScore = Math.max(0, 26 - (Math.min(latency, 180) / 180) * 26);
  const stabilityScore = Math.max(0, 18 - drops * 5);

  return Math.round(speedScore + uploadScore + latencyScore + stabilityScore);
}

function getRecommendation(score) {
  if (score >= 85) return "Excellent for remote work and video calls.";
  if (score >= 70) return "Usable, but keep a backup hotspot for important calls.";
  return "Risky for critical work. Avoid for interviews, uploads, or client calls.";
}

function serveStaticFile(request, response) {
  const frontendDir = path.join(__dirname, "..");
  const requestedPath = request.url === "/" ? "/index.html" : request.url;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(frontendDir, safePath);
  const extension = path.extname(filePath);

  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript"
  };

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentTypes[extension] || "text/plain" });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { message: "OK" });
    return;
  }

  if (request.method === "GET" && request.url === "/api/venues") {
    sendJson(response, 200, venues);
    return;
  }

  if (request.method === "POST" && request.url === "/api/check-wifi") {
    try {
      const body = await readBody(request);
      const download = Number(body.download);
      const upload = Number(body.upload);
      const latency = Number(body.latency);
      const drops = Number(body.drops);

      if (!body.name || !download || !upload || !latency || drops < 0) {
        sendJson(response, 400, { error: "Please provide name, download, upload, latency, and drops." });
        return;
      }

      const score = calculateScore(download, upload, latency, drops);
      const result = {
        name: body.name,
        score,
        recommendation: getRecommendation(score)
      };

      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, { error: "Invalid JSON body." });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/venues") {
    try {
      const body = await readBody(request);
      const download = Number(body.speed);
      const upload = Number(body.upload);
      const latency = Number(body.latency);
      const drops = Number(body.drops || 0);

      if (!body.name || !body.city || !body.type || !download || !upload || !latency) {
        sendJson(response, 400, { error: "Please provide name, city, type, speed, upload, and latency." });
        return;
      }

      const newVenue = {
        id: body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: body.name,
        type: body.type,
        city: body.city,
        score: calculateScore(download, upload, latency, drops),
        speed: download,
        upload,
        latency,
        tests: 1,
        summary: body.summary || "New verified WiFi report submitted by a traveler.",
        tags: body.tags || ["travel"]
      };

      venues.push(newVenue);
      sendJson(response, 201, newVenue);
    } catch (error) {
      sendJson(response, 400, { error: "Invalid JSON body." });
    }
    return;
  }

  serveStaticFile(request, response);
});

server.listen(PORT, () => {
  console.log(`SignalSure backend running at http://localhost:${PORT}`);
});
