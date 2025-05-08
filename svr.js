import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'client')));
app.use(express.json());

const lapResults = [];

function hashLaps(laps) {
  return laps.map(l => `${l.label}-${l.racerId}`).join('|');
}

app.post('/api/lap-results', (req, res) => {
  const newResults = req.body;
  if (!Array.isArray(newResults)) {
    return res.status(400).json({ error: 'Invalid lap data format' });
  }

  const newHash = hashLaps(newResults);
  const existingHashes = lapResults.map(hashLaps);

  if (!existingHashes.includes(newHash)) {
    lapResults.push(newResults);
    return res.status(201).json({ message: 'Lap results saved' });
  } else {
    return res.status(200).json({ message: 'Duplicate lap results ignored' });
  }
});

app.get('/api/lap-results', (req, res) => {
  res.json(lapResults);
});

app.delete('/api/lap-results', (req, res) => {
  lapResults.length = 0; // Clear in-memory results
  res.status(200).json({ message: 'Lap results cleared' });
});

// SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});