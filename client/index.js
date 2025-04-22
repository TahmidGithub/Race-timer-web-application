let timer;
let startTime = localStorage.getItem('startTime') ? parseInt(localStorage.getItem('startTime')) : null;
let elapsedTime = localStorage.getItem('elapsedTime') ? parseInt(localStorage.getItem('elapsedTime')) : 0;
let isRunning = localStorage.getItem('isRunning') === 'true';
let lapCount = localStorage.getItem('lapCount') ? parseInt(localStorage.getItem('lapCount')) : 0;

const display = document.querySelector('#timer');
const startBtn = document.querySelector('#start');
const resetBtn = document.querySelector('#reset');
const lapContainer = document.querySelector('#laps');

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
  localStorage.setItem('laps', JSON.stringify(lapsData));

  if (isRunning) {
    localStorage.setItem('startTime', startTime);
  } else {
    localStorage.removeItem('startTime');
  }
}

function loadState() {
  if (localStorage.getItem('laps')) {
    const laps = JSON.parse(localStorage.getItem('laps'));
    lapContainer.innerHTML = '';

    laps.forEach(({ label, racerId }) => {
      lapContainer.appendChild(createLapFromTemplate(label, racerId));
    });
  }

  if (isRunning && startTime) {
    const now = Date.now();
    elapsedTime += now - startTime;
    startTime = now;
    timer = setInterval(updateDisplay, 10);
    startBtn.textContent = 'Lap';
  }

  updateDisplay();
}

function startTimer() {
  if (!isRunning) {
    startTime = Date.now();
    timer = setInterval(updateDisplay, 10);
    startBtn.textContent = 'Lap';
    isRunning = true;
  } else {
    recordLap();
  }
  saveState();
}

function endTimer() {
  if (isRunning && startTime) {
    elapsedTime += Date.now() - startTime;
  }
  clearInterval(timer);
  elapsedTime = 0;
  isRunning = false;
  lapCount = 0;
  startTime = null;
  display.textContent = '00:00:00:00';
  lapContainer.innerHTML = '';
  startBtn.textContent = 'Start';
  localStorage.clear();
}

function recordLap() {
  const time = isRunning && startTime ? Date.now() - startTime + elapsedTime : elapsedTime;
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  const lapTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;

  lapCount++;
  const label = `Lap ${lapCount}: ${lapTime}`;
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

document.addEventListener('DOMContentLoaded', loadState);
startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', endTimer);
