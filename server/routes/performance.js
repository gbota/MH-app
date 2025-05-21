const express = require('express');
const router = express.Router();
const path = require('path');
const { savePerformanceData, loadPerformanceData, isDataStale } = require(path.join(__dirname, '..', 'utils', 'performanceData'));

// Get cached performance data for a year
router.get('/cached/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      console.log('Invalid year param:', req.params.year);
      return res.status(400).json({ message: 'Invalid year' });
    }

    const data = await loadPerformanceData(year);
    console.log(`[DEBUG] loadPerformanceData(${year}):`, data ? 'FOUND' : 'NOT FOUND');
    if (!data) {
      console.log(`[DEBUG] No cached data found for year ${year}`);
      return res.status(404).json({ message: 'No cached data found' });
    }

    // Check if data is stale
    const stale = await isDataStale(year);
    console.log(`[DEBUG] isDataStale(${year}):`, stale);
    if (stale) {
      console.log(`[DEBUG] Cached data for year ${year} is stale`);
      return res.status(404).json({ message: 'Cached data is stale' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error loading cached performance data:', error);
    res.status(500).json({ message: 'Error loading cached data' });
  }
});

// Cache performance data for a year
router.post('/cache/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ message: 'Invalid year' });
    }

    const data = req.body;
    if (!data || !data.year || !data.school || !data.rehearsals) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    await savePerformanceData(year, data);
    res.json({ message: 'Data cached successfully' });
  } catch (error) {
    console.error('Error caching performance data:', error);
    res.status(500).json({ message: 'Error caching data' });
  }
});

module.exports = router; 