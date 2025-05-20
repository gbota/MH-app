const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());

const reportsRouter = require('./routes/reports');
const performanceRouter = require('./routes/performance');

app.use('/api/reports', reportsRouter);
app.use('/api/performance', performanceRouter);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 