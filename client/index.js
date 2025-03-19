let timer;
let startTime;
let elapsedTime = 0;
let isRunning = false;
let lapCount = 0;

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!");

    const display = document.querySelector("#timer");
    const startBtn = document.querySelector("#start");
    const stopBtn = document.querySelector("#stop");
    const resetBtn = document.querySelector("#reset");
    const lapContainer = document.querySelector("#laps");

    function updateDisplay() {
        const time = performance.now() - startTime + elapsedTime;
        const hours = Math.floor(time / 3600000);
        const minutes = Math.floor((time % 3600000) / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);

        display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
    }

    function startTimer() {
        if (!isRunning) {
            console.log("Timer started!");
            startTime = performance.now();
            timer = setInterval(updateDisplay, 10);
            startBtn.textContent = "Lap";
            isRunning = true;
        } else {
            recordLap();
        }
    }

    function stopTimer() {
        if (isRunning) {
            console.log("Timer stopped!");
            clearInterval(timer);
            elapsedTime += performance.now() - startTime;
            startBtn.textContent = "Start";
            isRunning = false;
        }
    }

    function resetTimer() {
        console.log("Timer reset!");
        clearInterval(timer);
        elapsedTime = 0;
        isRunning = false;
        lapCount = 0;
        display.textContent = "00:00:00:00";
        lapContainer.innerHTML = "";
        startBtn.textContent = "Start";
    }

    function recordLap() {
        lapCount++;
        const lapTime = display.textContent;
        const lapItem = document.createElement("li");
        lapItem.textContent = `Lap ${lapCount}: ${lapTime}`;
        lapContainer.appendChild(lapItem);
        console.log(`Lap ${lapCount} recorded: ${lapTime}`);
    }

    startBtn.addEventListener("click", startTimer);
    stopBtn.addEventListener("click", stopTimer);
    resetBtn.addEventListener("click", resetTimer);
});