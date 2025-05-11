let lastraceResultsLength = 0;
let racerPollingInterval = null;

function generateUniqueRacerId() {
  const ids = JSON.parse(localStorage.getItem('racerIds') || '[]');
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
  const resultsContainer = document.querySelector('#racer-race-results');
  resultsContainer.innerHTML = '';
  const racerId = sessionStorage.getItem('sessionRacerId');
  if (!racerId) {
    resultsContainer.innerHTML = '<p>No Racer ID found.</p>';
    return;
  }

  let raceResults = [];
  try {
    const res = await fetch('/api/race-results');
    raceResults = await res.json();
  } catch {
    resultsContainer.innerHTML = '<p>Unable to load race results from server.</p>';
    return;
  }

  lastraceResultsLength = raceResults.length;

  const visibleResults = raceResults.map((race, index) =>
    race.some(race => race.racerId === racerId) ? { index, race } : null,
  ).filter(Boolean);

  if (visibleResults.length === 0) {
    resultsContainer.innerHTML = '<p>No race results for your Racer ID yet.</p>';
    return;
  }

  visibleResults.forEach(({ index, race }) => {
    const section = document.createElement('section');
    section.classList.add('racer-race-section');
    section.innerHTML = `<h2>Race ${index + 1} Results</h2>`;
    const list = document.createElement('ul');
    race.forEach(({ label, racerId }) => {
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
    const results = JSON.parse(localStorage.getItem('raceResults') || '[]');
    if (results.length !== lastraceResultsLength) {
      loadRacerResults();
      lastraceResultsLength = results.length;
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
