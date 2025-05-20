const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/performance');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Save performance data for a specific year
async function savePerformanceData(year, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `performance_${year}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Load performance data for a specific year
async function loadPerformanceData(year) {
  try {
    const filePath = path.join(DATA_DIR, `performance_${year}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null; // Return null if file doesn't exist or can't be read
  }
}

// Check if data for a year is stale (older than 24 hours)
async function isDataStale(year) {
  try {
    const filePath = path.join(DATA_DIR, `performance_${year}.json`);
    const stats = await fs.stat(filePath);
    const lastModified = stats.mtime;
    const now = new Date();
    const hoursSinceLastUpdate = (now - lastModified) / (1000 * 60 * 60);
    return hoursSinceLastUpdate > 24;
  } catch {
    return true; // Consider data stale if file doesn't exist
  }
}

module.exports = {
  savePerformanceData,
  loadPerformanceData,
  isDataStale
}; 