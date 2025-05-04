const routes = {
  '/': 'welcome-view',
  '/race': 'timer-view',
  '/racer': 'racer-view',
};

let lastLapResultsLength = 0;
let racerPollingInterval = null;

function navigate(path) {
  history.pushState({}, '', path);
  handleRoute(path);
}

function handleRoute(path = location.pathname) {
  document.querySelectorAll('section[data-route]').forEach(section => {
    section.style.display = 'none';
  });

  const viewId = routes[path] || routes['/'];
  document.querySelector(`#${viewId}`).style.display = 'block';

  if (path === '/race') {
    loadState();
    stopRacerPolling();
  }

  if (path === '/racer') {
    showRacerId();
    loadRacerResults();
    startRacerPolling();
  }
}

// Racer ID Functions
function generateUniqueRacerId() {
  let ids = JSON.parse(localStorage.getItem('racerIds') || '[]');
  let newId;
  do {
    newId = Math.floor(1000 + Math.random() * 9000);
  } while (ids.includes(newId));
  ids.push(newId);
  localStorage.setItem('racerIds', JSON.stringify(ids));
  return newId;
}

function showRacerId() {
  const display = document.querySelector('#racer-id-display');
  const id = sessionStorage.getItem('sessionRacerId') || 'Unknown';
  display.textContent = `Your Racer ID: ${id}`;
}

// Timer Variables
let timer;
let startTime = localStorage.getItem('startTime') ? parseInt(localStorage.getItem('startTime')) : null;
let elapsedTime = localStorage.getItem('elapsedTime') ? parseInt(localStorage.getItem('elapsedTime')) : 0;
let isRunning = localStorage.getItem('isRunning') === 'true';
let lapCount = localStorage.getItem('lapCount') ? parseInt(localStorage.getItem('lapCount')) : 0;

const display = document.querySelector('#timer');
const startBtn = document.querySelector('#start');
const resetBtn = document.querySelector('#reset');
const lapContainer = document.querySelector('#Time');

function updateDisplay() {
  let time = elapsedTime;
  if (isRunning && startTime) {
    time = Date.now() - startTime + elapsedTime;
  }
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
}

function saveState() {
  localStorage.setItem('elapsedTime', elapsedTime);
  localStorage.setItem('isRunning', isRunning);
  localStorage.setItem('lapCount', lapCount);

  const lapsData = Array.from(lapContainer.children).map(li => {
    const label = li.querySelector('span')?.textContent || '';
    const input = li.querySelector('input')?.value || '';
    return { label, racerId: input };
  });
  localStorage.setItem('Time', JSON.stringify(lapsData));

  if (isRunning) {
    localStorage.setItem('startTime', startTime);
  } else {
    localStorage.removeItem('startTime');
  }
}

function loadState() {
  if (localStorage.getItem('Time')) {
    const laps = JSON.parse(localStorage.getItem('Time'));
    lapContainer.innerHTML = '';
    laps.forEach(({ label, racerId }) => {
      lapContainer.appendChild(createLapFromTemplate(label, racerId));
    });
  }

  if (localStorage.getItem('lapResults')) {
    const results = JSON.parse(localStorage.getItem('lapResults'));
    renderLapResults(results);
  }

  if (isRunning && startTime) {
    const now = Date.now();
    elapsedTime += now - startTime;
    startTime = now;
    timer = setInterval(updateDisplay, 10);
    startBtn.textContent = 'Time';
  }

  updateDisplay();
}

function startTimer() {
  if (!isRunning) {
    startTime = Date.now();
    timer = setInterval(updateDisplay, 10);
    startBtn.textContent = 'Time';
    isRunning = true;
  } else {
    recordLap();
  }
  saveState();
}

function endTimer() {
  if (isRunning && startTime) {
    elapsedTime += Date.now() - startTime;
    clearInterval(timer);
    isRunning = false;
  }
  saveLapResults();
  startBtn.textContent = 'Start Next Lap';
}

function recordLap() {
  const time = isRunning && startTime ? Date.now() - startTime + elapsedTime : elapsedTime;
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  const lapTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;

  lapCount++;
  const label = `Time ${lapCount}: ${lapTime}`;
  lapContainer.appendChild(createLapFromTemplate(label));
  saveState();
}

function createLapFromTemplate(labelText, racerId = '') {
  const template = document.querySelector('#lap-template');
  const clone = template.content.cloneNode(true);
  const span = clone.querySelector('.lap-label');
  const input = clone.querySelector('input');

  span.textContent = labelText;
  input.value = racerId;

  input.addEventListener('blur', saveState);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
  });

  return clone;
}

function saveLapResults() {
  const lapsData = Array.from(lapContainer.children).map(li => {
    const label = li.querySelector('span')?.textContent || '';
    const racerId = li.querySelector('input')?.value || '';
    return { label, racerId };
  });

  const results = JSON.parse(localStorage.getItem('lapResults') || '[]');
  results.push(lapsData);
  localStorage.setItem('lapResults', JSON.stringify(results));

  renderLapResults([lapsData]);

  elapsedTime = 0;
  startTime = null;
  lapCount = 0;
  lapContainer.innerHTML = '';
  display.textContent = '00:00:00:00';

  saveState();
}

function renderLapResults(resultsArray) {
  resultsArray.forEach((lapsData, index) => {
    const resultSection = document.createElement('section');
    resultSection.classList.add('lap-results');

    const lapTitle = document.createElement('h2');
    lapTitle.textContent = `Race ${document.querySelectorAll('.lap-results').length + 1} Results`;

    const resultList = document.createElement('ul');
    lapsData.forEach(({ label, racerId }) => {
      const li = document.createElement('li');
      li.textContent = `${label} - Racer ID: ${racerId}`;
      resultList.appendChild(li);
    });

    resultSection.appendChild(lapTitle);
    resultSection.appendChild(resultList);

    document.body.appendChild(resultSection);
  });
}

// Racer view
function loadRacerResults() {
  const resultsContainer = document.querySelector('#racer-lap-results');
  resultsContainer.innerHTML = '';

  const racerId = sessionStorage.getItem('sessionRacerId');
  if (!racerId) {
    resultsContainer.innerHTML = '<p>No Racer ID found.</p>';
    return;
  }

  const lapResults = JSON.parse(localStorage.getItem('lapResults') || '[]');
  lastLapResultsLength = lapResults.length;

  const racesVisibleToRacer = lapResults
    .map((laps, index) => {
      const participated = laps.some(lap => lap.racerId === racerId);
      return participated ? { index, laps } : null;
    })
    .filter(entry => entry !== null);

  if (racesVisibleToRacer.length === 0) {
    resultsContainer.innerHTML = '<p>No lap results for your Racer ID yet.</p>';
    return;
  }

  racesVisibleToRacer.forEach(({ index, laps }) => {
    const section = document.createElement('section');
    section.classList.add('racer-lap-section');

    const title = document.createElement('h2');
    title.textContent = `Race ${index + 1} Results`;
    section.appendChild(title);

    const list = document.createElement('ul');
    laps.forEach(({ label, racerId }) => {
      const item = document.createElement('li');
      item.textContent = `${label} - Racer ID: ${racerId}`;
      list.appendChild(item);
    });

    section.appendChild(list);
    resultsContainer.appendChild(section);
  });
}

function startRacerPolling() {
  stopRacerPolling();
  racerPollingInterval = setInterval(() => {
    const lapResults = JSON.parse(localStorage.getItem('lapResults') || '[]');
    if (lapResults.length !== lastLapResultsLength) {
      loadRacerResults();
      lastLapResultsLength = lapResults.length;
    }
  }, 2000);
}

function stopRacerPolling() {
  if (racerPollingInterval) {
    clearInterval(racerPollingInterval);
    racerPollingInterval = null;
  }
}

// Initial Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  handleRoute();

  window.onpopstate = () => handleRoute();

  document.querySelector('#go-to-race')?.addEventListener('click', () => {
    navigate('/race');
  });

  document.querySelector('#go-to-racer')?.addEventListener('click', () => {
    let sessionRacerId = sessionStorage.getItem('sessionRacerId');
    if (!sessionRacerId) {
      const newId = generateUniqueRacerId();
      sessionStorage.setItem('sessionRacerId', newId);
      sessionRacerId = newId;
    }
    localStorage.setItem('lastRacerId', sessionRacerId); // Optional legacy use
    navigate('/racer');
  });

  document.querySelector('#clear-results')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all lap results?')) {
      localStorage.removeItem('lapResults');
      document.querySelectorAll('.lap-results').forEach(section => section.remove());
      alert('Lap results cleared!');
    }
  });

  startBtn?.addEventListener('click', startTimer);
  resetBtn?.addEventListener('click', endTimer);
});
