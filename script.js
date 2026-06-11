const venues = [
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

let sortHighFirst = true;
const saved = new Set();

const venueList = document.querySelector("#venueList");
const searchInput = document.querySelector("#searchInput");
const needSelect = document.querySelector("#needSelect");
const scoreRange = document.querySelector("#scoreRange");
const scoreValue = document.querySelector("#scoreValue");
const verifiedCount = document.querySelector("#verifiedCount");
const averageScore = document.querySelector("#averageScore");
const favoriteCount = document.querySelector("#favoriteCount");
const sortButton = document.querySelector("#sortButton");
const themeToggle = document.querySelector("#themeToggle");
const simulateTest = document.querySelector("#simulateTest");
const testForm = document.querySelector("#testForm");
const formResult = document.querySelector("#formResult");

function scoreColor(score) {
  if (score >= 85) return "#0f9488";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}

function recommendation(score) {
  if (score >= 85) return "Excellent for remote work and video calls.";
  if (score >= 70) return "Usable, but keep a backup hotspot for important calls.";
  return "Risky for critical work. Avoid for interviews, uploads, or client calls.";
}

function calculateScore(download, upload, latency, drops) {
  const speedScore = Math.min(download, 120) / 120 * 34;
  const uploadScore = Math.min(upload, 80) / 80 * 22;
  const latencyScore = Math.max(0, 26 - Math.min(latency, 180) / 180 * 26);
  const stabilityScore = Math.max(0, 18 - drops * 5);
  return Math.round(speedScore + uploadScore + latencyScore + stabilityScore);
}

function getFilteredVenues() {
  const query = searchInput.value.trim().toLowerCase();
  const need = needSelect.value;
  const minimumScore = Number(scoreRange.value);

  return venues
    .filter((venue) => {
      const searchableText = `${venue.name} ${venue.city} ${venue.type} ${venue.summary}`.toLowerCase();
      const matchesQuery = !query || searchableText.includes(query);
      const matchesNeed = need === "all" || venue.tags.includes(need);
      return matchesQuery && matchesNeed && venue.score >= minimumScore;
    })
    .sort((a, b) => sortHighFirst ? b.score - a.score : a.score - b.score);
}

function updateSummary(items) {
  verifiedCount.textContent = items.length;
  favoriteCount.textContent = saved.size;
  averageScore.textContent = items.length
    ? Math.round(items.reduce((total, item) => total + item.score, 0) / items.length)
    : 0;
}

function renderVenues() {
  const items = getFilteredVenues();
  venueList.innerHTML = "";
  updateSummary(items);
  scoreValue.textContent = scoreRange.value;

  if (!items.length) {
    venueList.innerHTML = '<p class="empty">No verified places match these filters yet. Lower the minimum score or try another destination.</p>';
    return;
  }

  items.forEach((venue) => {
    const card = document.createElement("article");
    card.className = "venue-card";
    card.innerHTML = `
      <div class="venue-score" style="background:${scoreColor(venue.score)}">${venue.score}</div>
      <div>
        <h3>${venue.name}</h3>
        <p>${venue.city} - ${venue.type} - ${venue.summary}</p>
      </div>
      <div class="metrics">
        <span>${venue.speed} Mbps down</span>
        <span>${venue.upload} Mbps up</span>
        <span>${venue.latency} ms</span>
        <span>${venue.tests} tests</span>
        <button class="favorite ${saved.has(venue.id) ? "saved" : ""}" data-id="${venue.id}" type="button">
          ${saved.has(venue.id) ? "Saved" : "Save"}
        </button>
      </div>
    `;
    venueList.appendChild(card);
  });
}

function simulateSpeedTest() {
  const download = Math.floor(35 + Math.random() * 115);
  const latency = Math.floor(15 + Math.random() * 90);
  const drops = Math.random() > 0.82 ? 1 : 0;
  const score = calculateScore(download, Math.floor(download * 0.55), latency, drops);

  document.querySelector("#liveDownload").textContent = download;
  document.querySelector("#liveLatency").textContent = latency;
  document.querySelector("#liveDrops").textContent = drops;
  document.querySelector("#heroScore").textContent = score;
}

searchInput.addEventListener("input", renderVenues);
needSelect.addEventListener("change", renderVenues);
scoreRange.addEventListener("input", renderVenues);

sortButton.addEventListener("click", () => {
  sortHighFirst = !sortHighFirst;
  sortButton.textContent = sortHighFirst ? "Sort: Score high to low" : "Sort: Score low to high";
  renderVenues();
});

venueList.addEventListener("click", (event) => {
  const button = event.target.closest(".favorite");
  if (!button) return;

  const id = button.dataset.id;
  if (saved.has(id)) {
    saved.delete(id);
  } else {
    saved.add(id);
  }

  renderVenues();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

simulateTest.addEventListener("click", simulateSpeedTest);

testForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#venueName").value.trim() || "This venue";
  const download = Number(document.querySelector("#download").value);
  const upload = Number(document.querySelector("#upload").value);
  const latency = Number(document.querySelector("#latency").value);
  const drops = Number(document.querySelector("#drops").value);
  const score = calculateScore(download, upload, latency, drops);

  formResult.innerHTML = `
    <span class="result-score">${score}</span>
    <strong>${name} trust score</strong>
    <p>${recommendation(score)}</p>
  `;
});

renderVenues();
