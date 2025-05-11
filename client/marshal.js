// marshal.js
let timer;
let startTime = localStorage.getItem('startTime') ? parseInt(localStorage.getItem('startTime')) : null;
let elapsedTime = localStorage.getItem('elapsedTime') ? parseInt(localStorage.getItem('elapsedTime')) : 0;
let isRunning = localStorage.getItem('isRunning') === 'true';
let raceCount = localStorage.getItem('raceCount') ? parseInt(localStorage.getItem('raceCount')) : 0;

const display = document.querySelector('#timer');
const startBtn = document.querySelector('#start');
const raceContainer = document.querySelector('#Time');

function updateDisplay() {
  const time = isRunning && startTime ? Date.now() - startTime + elapsedTime : elapsedTime;
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
}

function saveState() {
  localStorage.setItem('elapsedTime', elapsedTime);
  localStorage.setItem('isRunning', isRunning);
  localStorage.setItem('raceCount', raceCount);
  const raceData = Array.from(raceContainer.children).map(li => ({
    label: li.querySelector('span')?.textContent || '',
    racerId: li.querySelector('input')?.value || '',
  }));
  localStorage.setItem('Time', JSON.stringify(raceData));
  isRunning ? localStorage.setItem('startTime', startTime) : localStorage.removeItem('startTime');
}

function loadState() {
  raceContainer.innerHTML = '';
  const storedrace = JSON.parse(localStorage.getItem('Time') || '[]');
  storedrace.forEach(({ label, racerId }) => {
    raceContainer.appendChild(createraceFromTemplate(label, racerId));
  });
  if (localStorage.getItem('raceResults')) {
    renderraceResults(JSON.parse(localStorage.getItem('raceResults')));
  }
  if (isRunning && startTime) {
    elapsedTime += Date.now() - startTime;
    startTime = Date.now();
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
    recordrace();
  }
  saveState();
}

function endTimer() {
  const race = Array.from(raceContainer.children);
  if (race.length === 0 || race.some(race => race.querySelector('input').value.trim() === '')) {
    alert('All race must have a Racer ID.');
    return;
  }

  const racerIds = race.map(race => race.querySelector('input').value.trim());
  if (new Set(racerIds).size !== racerIds.length) {
    alert('Duplicate Racer IDs are not allowed.');
    return;
  }

  if (isRunning) {
    elapsedTime += Date.now() - startTime;
    clearInterval(timer);
    isRunning = false;
  }

  saveraceResults();
  startBtn.textContent = 'Start Next Race';
}

function recordrace() {
  const time = isRunning && startTime ? Date.now() - startTime + elapsedTime : elapsedTime;
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  raceCount++;
  raceContainer.appendChild(createraceFromTemplate(`Time ${raceCount}: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`));
  saveState();
}

function createraceFromTemplate(labelText, racerId = '') {
  const template = document.querySelector('#race-template');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.race-label').textContent = labelText;
  const input = clone.querySelector('input');
  input.value = racerId;
  input.addEventListener('blur', saveState);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  return clone;
}

function renderraceResults(resultsArray, baseRaceNumber = null) {
  resultsArray.forEach((raceData, index) => {
    // Use passed-in race number or fallback to DOM count
    const raceNum = baseRaceNumber ? baseRaceNumber + index : document.querySelectorAll('.race-results').length + 1;

    const resultSection = document.createElement('section');
    resultSection.classList.add('race-results');

    const raceTitle = document.createElement('h2');
    raceTitle.textContent = `Race ${raceNum} Results`;

    const resultList = document.createElement('ul');
    raceData.forEach(({ label, racerId }) => {
      const li = document.createElement('li');
      li.textContent = `${label} - Racer ID: ${racerId}`;
      resultList.appendChild(li);
    });

    resultSection.appendChild(raceTitle);
    resultSection.appendChild(resultList);

    document.body.appendChild(resultSection);
  });
}


function queueOfflineResult(result) {
  const queue = JSON.parse(localStorage.getItem('offlineraceQueue') || '[]');
  queue.push(result);
  localStorage.setItem('offlineraceQueue', JSON.stringify(queue));
}

async function saveraceResults() {
  const raceData = Array.from(raceContainer.children).map(li => {
    const label = li.querySelector('span')?.textContent || '';
    const racerId = li.querySelector('input')?.value || '';
    return { label, racerId };
  });

  const results = JSON.parse(localStorage.getItem('raceResults') || '[]');
  results.push(raceData);
  localStorage.setItem('raceResults', JSON.stringify(results));

  let raceNumber = parseInt(localStorage.getItem('raceNumber') || '0');
  raceNumber++;
  localStorage.setItem('raceNumber', raceNumber);

  if (navigator.onLine) {
    try {
      await fetch('/api/race-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raceData),
      });
    } catch (e) {
      queueOfflineResult(raceData);
    }
  } else {
    queueOfflineResult(raceData);
  }

  renderraceResults([raceData], raceNumber);

  // Reset state
  elapsedTime = 0;
  startTime = null;
  raceCount = 0;
  raceContainer.innerHTML = '';
  display.textContent = '00:00:00:00';

  saveState();
}

export { loadState, startTimer, endTimer };
