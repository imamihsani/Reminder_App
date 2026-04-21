const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ====== CACHE (sementara di memory) ======
let reminders = [];

// ====== GET semua reminder ======
app.get('/reminders', (req, res) => {
  res.json(reminders);
});

// ====== TAMBAH reminder ======
app.post('/reminders', (req, res) => {
  const { text, time } = req.body;

  const newReminder = {
    id: Date.now(),
    text,
    time
  };

  reminders.push(newReminder);
  res.json(newReminder);
});

// ====== HAPUS reminder ======
app.delete('/reminders/:id', (req, res) => {
  const id = parseInt(req.params.id);

  reminders = reminders.filter(r => r.id !== id);

  res.json({ message: 'Deleted' });
});

// ====== START SERVER ======
app.listen(5000, () => {
  console.log('Server jalan di http://localhost:5000');
});