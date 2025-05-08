// marshal.js
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
  let time = isRunning && startTime ? Date.now() - startTime + elapsedTime : elapsedTime;
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
  const lapsData = Array.from(lapContainer.children).map(li => ({
    label: li.querySelector('span')?.textContent || '',
    racerId: li.querySelector('input')?.value || '',
  }));
  localStorage.setItem('Time', JSON.stringify(lapsData));
  isRunning ? localStorage.setItem('startTime', startTime) : localStorage.removeItem('startTime');
}

function loadState() {
  lapContainer.innerHTML = '';
  const storedLaps = JSON.parse(localStorage.getItem('Time') || '[]');
  storedLaps.forEach(({ label, racerId }) => {
    lapContainer.appendChild(createLapFromTemplate(label, racerId));
  });
  if (localStorage.getItem('lapResults')) {
    renderLapResults(JSON.parse(localStorage.getItem('lapResults')));
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
    recordLap();
  }
  saveState();
}

function endTimer() {
  const laps = Array.from(lapContainer.children);
  if (laps.length === 0 || laps.some(lap => lap.querySelector('input').value.trim() === '')) {
    alert('All laps must have a Racer ID.');
    return;
  }

  const racerIds = laps.map(lap => lap.querySelector('input').value.trim());
  if (new Set(racerIds).size !== racerIds.length) {
    alert('Duplicate Racer IDs are not allowed.');
    return;
  }

  if (isRunning) {
    elapsedTime += Date.now() - startTime;
    clearInterval(timer);
    isRunning = false;
  }

  saveLapResults();
  startBtn.textContent = 'Start Next Race';
}

function recordLap() {
  const time = isRunning && startTime ? Date.now() - startTime + elapsedTime : elapsedTime;
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  lapCount++;
  lapContainer.appendChild(createLapFromTemplate(`Time ${lapCount}: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`));
  saveState();
}

function createLapFromTemplate(labelText, racerId = '') {
  const template = document.querySelector('#lap-template');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.lap-label').textContent = labelText;
  const input = clone.querySelector('input');
  input.value = racerId;
  input.addEventListener('blur', saveState);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  return clone;
}

function renderLapResults(resultsArray, baseRaceNumber = null) {
    resultsArray.forEach((lapsData, index) => {
      // Use passed-in race number or fallback to DOM count
      const raceNum = baseRaceNumber ? baseRaceNumber + index : document.querySelectorAll('.lap-results').length + 1;
  
      const resultSection = document.createElement('section');
      resultSection.classList.add('lap-results');
  
      const lapTitle = document.createElement('h2');
      lapTitle.textContent = `Race ${raceNum} Results`;
  
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
  

function queueOfflineResult(result) {
  const queue = JSON.parse(localStorage.getItem('offlineLapQueue') || '[]');
  queue.push(result);
  localStorage.setItem('offlineLapQueue', JSON.stringify(queue));
}

async function saveLapResults() {
    const lapsData = Array.from(lapContainer.children).map(li => {
      const label = li.querySelector('span')?.textContent || '';
      const racerId = li.querySelector('input')?.value || '';
      return { label, racerId };
    });
  
    const results = JSON.parse(localStorage.getItem('lapResults') || '[]');
    results.push(lapsData);
    localStorage.setItem('lapResults', JSON.stringify(results));
  
    let raceNumber = parseInt(localStorage.getItem('raceNumber') || '0');
    raceNumber++;
    localStorage.setItem('raceNumber', raceNumber);
  
    if (navigator.onLine) {
      try {
        await fetch('/api/lap-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lapsData),
        });
      } catch (e) {
        queueOfflineResult(lapsData);
      }
    } else {
      queueOfflineResult(lapsData);
    }
  
    renderLapResults([lapsData], raceNumber);
  
    // Reset state
    elapsedTime = 0;
    startTime = null;
    lapCount = 0;
    lapContainer.innerHTML = '';
    display.textContent = '00:00:00:00';
  
    saveState();
  }  

export { loadState, startTimer, endTimer };