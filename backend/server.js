require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/arxiv/search', (req, res) => {
  // Implement your ArXiv search logic here
  res.json({ papersStored: 5 }); // Dummy response for now
});

app.post('/qdrant/query', (req, res) => {
  // Implement your Qdrant query logic here
  res.json([]); // Dummy response for now
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});