const express = require('express');
const cors = require('cors');
const reportsRouter = require('./routes/reports');

const app = express();

app.use(cors());
app.use(express.json());

// Direct test route
app.get('/test-direct', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/reports', reportsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 