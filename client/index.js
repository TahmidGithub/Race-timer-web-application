import { loadState, startTimer, endTimer } from './marshal.js';
import { generateUniqueRacerId, showRacerId, loadRacerResults, startRacerPolling, stopRacerPolling } from './racer.js';

const routes = {
  '/': 'welcome-view',
  '/race': 'timer-view',
  '/racer': 'racer-view',
};

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
  } else if (path === '/racer') {
    showRacerId();
    loadRacerResults();
    startRacerPolling();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  handleRoute();
  window.onpopstate = () => handleRoute();

  window.addEventListener('online', async () => {
    const queue = JSON.parse(localStorage.getItem('offlineLapQueue') || '[]');
    if (queue.length === 0) return;
    for (const result of queue) {
      try {
        await fetch('/api/lap-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });
      } catch {
        console.warn('Failed to sync offline result.');
        return;
      }
    }
    localStorage.removeItem('offlineLapQueue');
    console.log('Offline results synced.');
  });

  document.querySelector('#go-to-race')?.addEventListener('click', () => navigate('/race'));
  document.querySelector('#go-to-racer')?.addEventListener('click', () => {
    let id = sessionStorage.getItem('sessionRacerId');
    if (!id) {
      id = generateUniqueRacerId();
      sessionStorage.setItem('sessionRacerId', id);
    }
    localStorage.setItem('lastRacerId', id);
    navigate('/racer');
  });

  document.querySelector('#clear-results')?.addEventListener('click', async () => {
    if (confirm('Clear all lap results?')) {
      localStorage.removeItem('lapResults');
      document.querySelectorAll('.lap-results').forEach(e => e.remove());
      try {
        await fetch('/api/lap-results', { method: 'DELETE' });
      } catch {
        alert('Failed to clear server lap results.');
        return;
      }
      alert('Results cleared!');
    }
  });

  document.querySelector('#start')?.addEventListener('click', startTimer);
  document.querySelector('#reset')?.addEventListener('click', endTimer);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(console.error);
}
