import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'client')));
app.use(express.json());

const raceResults = [];

function hashrace(race) {
  return race.map(l => `${l.label}-${l.racerId}`).join('|');
}

app.post('/api/race-results', (req, res) => {
  const newResults = req.body;
  if (!Array.isArray(newResults)) {
    return res.status(400).json({ error: 'Invalid race data format' });
  }

  const newHash = hashrace(newResults);
  const existingHashes = raceResults.map(hashrace);

  if (!existingHashes.includes(newHash)) {
    raceResults.push(newResults);
    return res.status(201).json({ message: 'race results saved' });
  } else {
    return res.status(200).json({ message: 'Duplicate race results ignored' });
  }
});

app.get('/api/race-results', (req, res) => {
  res.json(raceResults);
});

app.delete('/api/race-results', (req, res) => {
  raceResults.length = 0; // Clear in-memory results
  res.status(200).json({ message: 'race results cleared' });
});

// SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
