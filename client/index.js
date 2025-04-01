let timer;
let startTime = localStorage.getItem("startTime") ? parseFloat(localStorage.getItem("startTime")) : null;
let elapsedTime = localStorage.getItem("elapsedTime") ? parseInt(localStorage.getItem("elapsedTime")) : 0;
let isRunning = localStorage.getItem("isRunning") === "true";
let lapCount = localStorage.getItem("lapCount") ? parseInt(localStorage.getItem("lapCount")) : 0;

const display = document.querySelector("#timer");
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const resetBtn = document.querySelector("#reset");
const lapContainer = document.querySelector("#laps");

function updateDisplay() {
    let time = elapsedTime;
    if (isRunning && startTime) {
        time += performance.now() - startTime;
    }
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
}

function saveState() {
    localStorage.setItem("elapsedTime", elapsedTime);
    localStorage.setItem("isRunning", isRunning);
    localStorage.setItem("lapCount", lapCount);
    localStorage.setItem("laps", lapContainer.innerHTML);
    if (isRunning) {
        localStorage.setItem("startTime", startTime);
    } else {
        localStorage.removeItem("startTime");
    }
}

function loadState() {
    if (localStorage.getItem("laps")) {
        lapContainer.innerHTML = localStorage.getItem("laps");
    }
    if (isRunning && startTime) {
        elapsedTime += performance.now() - startTime;
        startTime = performance.now();
        timer = setInterval(updateDisplay, 10);
        startBtn.textContent = "Lap";
    }
    updateDisplay();
}

function startTimer() {
    if (!isRunning) {
        startTime = performance.now();
        timer = setInterval(updateDisplay, 10);
        startBtn.textContent = "Lap";
        isRunning = true;
    } else {
        recordLap();
    }
    saveState();
}

function stopTimer() {
    if (isRunning) {
        clearInterval(timer);
        elapsedTime += performance.now() - startTime;
        startBtn.textContent = "Start";
        isRunning = false;
    }
    saveState();
}

function resetTimer() {
    clearInterval(timer);
    elapsedTime = 0;
    isRunning = false;
    lapCount = 0;
    startTime = null;
    display.textContent = "00:00:00:00";
    lapContainer.innerHTML = "";
    startBtn.textContent = "Start";
    localStorage.clear();
}

function recordLap() {
    lapCount++;
    const lapTime = display.textContent;
    const lapItem = document.createElement("li");
    lapItem.textContent = `Lap ${lapCount}: ${lapTime}`;
    lapContainer.appendChild(lapItem);
    saveState();
}

document.addEventListener("DOMContentLoaded", loadState);
startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
