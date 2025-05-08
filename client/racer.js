let lastLapResultsLength = 0;
let racerPollingInterval = null;

function generateUniqueRacerId() {
  let ids = JSON.parse(localStorage.getItem('racerIds') || '[]');
  let newId;
  do newId = Math.floor(1000 + Math.random() * 9000);
  while (ids.includes(newId));
  ids.push(newId);
  localStorage.setItem('racerIds', JSON.stringify(ids));
  return newId;
}

function showRacerId() {
  const display = document.querySelector('#racer-id-display');
  const id = sessionStorage.getItem('sessionRacerId') || 'Unknown';
  display.textContent = `Your Racer ID: ${id}`;
}

async function loadRacerResults() {
  const resultsContainer = document.querySelector('#racer-lap-results');
  resultsContainer.innerHTML = '';
  const racerId = sessionStorage.getItem('sessionRacerId');
  if (!racerId) {
    resultsContainer.innerHTML = '<p>No Racer ID found.</p>';
    return;
  }

  let lapResults = [];
  try {
    const res = await fetch('/api/lap-results');
    lapResults = await res.json();
  } catch {
    resultsContainer.innerHTML = '<p>Unable to load lap results from server.</p>';
    return;
  }

  lastLapResultsLength = lapResults.length;

  const visibleResults = lapResults.map((laps, index) =>
    laps.some(lap => lap.racerId === racerId) ? { index, laps } : null
  ).filter(Boolean);

  if (visibleResults.length === 0) {
    resultsContainer.innerHTML = '<p>No lap results for your Racer ID yet.</p>';
    return;
  }

  visibleResults.forEach(({ index, laps }) => {
    const section = document.createElement('section');
    section.classList.add('racer-lap-section');
    section.innerHTML = `<h2>Race ${index + 1} Results</h2>`;
    const list = document.createElement('ul');
    laps.forEach(({ label, racerId }) => {
      const li = document.createElement('li');
      li.textContent = `${label} - Racer ID: ${racerId}`;
      list.appendChild(li);
    });
    section.appendChild(list);
    resultsContainer.appendChild(section);
  });
}

function startRacerPolling() {
  stopRacerPolling();
  racerPollingInterval = setInterval(() => {
    const results = JSON.parse(localStorage.getItem('lapResults') || '[]');
    if (results.length !== lastLapResultsLength) {
      loadRacerResults();
      lastLapResultsLength = results.length;
    }
  }, 2000);
}

function stopRacerPolling() {
  if (racerPollingInterval) {
    clearInterval(racerPollingInterval);
    racerPollingInterval = null;
  }
}

export { generateUniqueRacerId, showRacerId, loadRacerResults, startRacerPolling, stopRacerPolling };
