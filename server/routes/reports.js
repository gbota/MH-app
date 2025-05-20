const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');
const { months } = require('../utils/months');
const fs = require('fs');
const path = require('path');
const EXCLUDE_WORDS_PATH = path.join(__dirname, '../data/rehearsal_exclude_words.json');

// Helper to parse event summary
function parseEventSummary(summary) {
  // Example: "John Smith - Guitar Jane Doe (Ab. 4)"
  // or:      "John Smith - Guitar Jane Doe"
  const regex = /^(.*?) - (.*?) (.*?)(?: \(Ab\. (\d+)\w*\))?$/i; // 'i' for case-insensitive
  const match = summary.match(regex);
  if (!match) return null;
  // Remove any trailing (Ab. ...) from student name, case-insensitive
  let student = match[3].replace(/\s*\(Ab\.[^)]+\)$/i, '').trim();
  return {
    teacher: match[1].trim(),
    instrument: match[2].trim(),
    student,
    paymentHours: match[4] ? Number(match[4]) : null,
  };
}

function getEventDuration(event) {
  // Returns duration in hours (float)
  if (!event.start || !event.end) return 0;
  const start = new Date(event.start.dateTime || event.start.date);
  const end = new Date(event.end.dateTime || event.end.date);
  return (end - start) / (1000 * 60 * 60);
}

// Helper to read exclude words from file
function readExcludeWords() {
  try {
    const data = fs.readFileSync(EXCLUDE_WORDS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
// Helper to write exclude words to file
function writeExcludeWords(words) {
  fs.writeFileSync(EXCLUDE_WORDS_PATH, JSON.stringify(words, null, 2), 'utf8');
}

// Endpoint to get exclude words
router.get('/rehearsals/exclude-words', (req, res) => {
  res.json({ excludeWords: readExcludeWords() });
});
// Endpoint to update exclude words
router.post('/rehearsals/exclude-words', (req, res) => {
  const { excludeWords } = req.body;
  if (!Array.isArray(excludeWords)) return res.status(400).json({ message: 'excludeWords must be an array.' });
  writeExcludeWords(excludeWords);
  res.json({ success: true });
});

// /api/reports/school?month=5&year=2024
router.get('/school', async (req, res) => {
  try {
    console.log('\n=== SCHOOL REPORT DEBUG ===');
    let { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year are required.' });
    // Support multiple months (comma-separated or array)
    let monthsArr = Array.isArray(month) ? month : String(month).split(',').map(m => Number(m));
    const yearNum = Number(year);
    console.log(`Processing school report for months: ${monthsArr}, year: ${yearNum}`);
    // Build date ranges for all selected months
    const ranges = monthsArr.map(m => {
      const monthNum = m - 1;
      return {
        start: new Date(yearNum, monthNum, 1, 0, 0, 0),
        end: new Date(yearNum, monthNum + 1, 0, 23, 59, 59),
        monthNum
      };
    });

    // Fetch events from all school calendars for all months
    const CALENDAR_IDS = [
      "musichub.sala4@gmail.com",
      "musichub.sala1@gmail.com",
      "9pum9ujtmdcoqqoosg6le4g9io@group.calendar.google.com",
      "sgaob82ev6lhaqin53urq5iljc@group.calendar.google.com",
      "musichub.sala3@gmail.com",
      "musichub.sala2@gmail.com",
      "tqohu81achtjqgde79mg5jvs3k@group.calendar.google.com",
      "5p7qdudisqjn9l40lafd4ejsc4@group.calendar.google.com",
    ];

    let allEvents = [];
    for (const { start, end } of ranges) {
      for (const calendarId of CALENDAR_IDS) {
        const events = await calendarService.listEvents(calendarId, start, end);
        allEvents = allEvents.concat(events);
      }
    }

    // Parse and group events
    const teacherMap = {};
    for (const event of allEvents) {
      // Exclude rehearsals from school report
      if ((event.summary || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes('sala repetitie')) {
        console.log('Filtered rehearsal event:', event.summary);
        continue;
      }
      const parsed = parseEventSummary(event.summary || '');
      if (!parsed) continue;
      let { teacher, student, instrument, paymentHours } = parsed;
      const duration = getEventDuration(event);
      // Normalize for case-insensitive grouping
      const studentKey = student.toLowerCase() + '|' + instrument.toLowerCase();
      if (!teacherMap[teacher]) {
        teacherMap[teacher] = { teacher, students: {}, totalHours: 0 };
      }
      teacherMap[teacher].totalHours += duration;
      if (!teacherMap[teacher].students[studentKey]) {
        teacherMap[teacher].students[studentKey] = { student, instrument, paymentHours: [], events: [] };
      }
      if (paymentHours) {
        teacherMap[teacher].students[studentKey].paymentHours.push(paymentHours);
      }
      teacherMap[teacher].students[studentKey].events.push({
        summary: event.summary,
        start: event.start,
        end: event.end,
        paymentHours,
        duration,
      });
    }

    // Convert to array for frontend
    const result = Object.values(teacherMap).map(t => ({
      teacher: t.teacher,
      totalHours: t.totalHours,
      students: Object.values(t.students),
    }));

    res.json({
      months: monthsArr,
      monthNames: monthsArr.map(m => months[m - 1]),
      year: yearNum,
      teachers: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating school report.' });
  }
});

// /api/reports/rehearsals?month=5&year=2024
router.get('/rehearsals', async (req, res) => {
  try {
    console.log('\n=== REHEARSALS REPORT DEBUG ===');
    let { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year are required.' });
    let monthsArr = Array.isArray(month) ? month : String(month).split(',').map(m => Number(m));
    const yearNum = Number(year);
    console.log(`Processing rehearsals report for months: ${monthsArr}, year: ${yearNum}`);
    const ranges = monthsArr.map(m => {
      const monthNum = m - 1;
      return {
        start: new Date(yearNum, monthNum, 1, 0, 0, 0),
        end: new Date(yearNum, monthNum + 1, 0, 23, 59, 59),
        monthNum
      };
    });

    // Use the same calendar IDs as school, or adjust if needed
    const CALENDAR_IDS = [
      "musichub.sala4@gmail.com",
      "musichub.sala1@gmail.com",
      "9pum9ujtmdcoqqoosg6le4g9io@group.calendar.google.com",
      "sgaob82ev6lhaqin53urq5iljc@group.calendar.google.com",
      "musichub.sala3@gmail.com",
      "musichub.sala2@gmail.com",
      "tqohu81achtjqgde79mg5jvs3k@group.calendar.google.com",
      "5p7qdudisqjn9l40lafd4ejsc4@group.calendar.google.com",
    ];

    let allEvents = [];
    for (const { start, end } of ranges) {
      for (const calendarId of CALENDAR_IDS) {
        const events = await calendarService.listEvents(calendarId, start, end);
        allEvents = allEvents.concat(events);
      }
    }

    // Only include events that do NOT match the Teacher - Instrument Student pattern
    const lessonRegex = /^(.*?) - (.*?) (.*?)(?: \(Ab\. (\d+)\w*\))?$/i;
    let rehearsalEvents = allEvents.filter(event => {
      const summary = event.summary || '';
      // Exclude only if it matches the lesson pattern AND does NOT start with "Sală repetiție"
      const isLesson = lessonRegex.test(summary) && !/^sală repetiție/i.test(summary);
      return !isLesson;
    });

    // Read exclude words from file
    const excludeWords = readExcludeWords();
    console.log('Exclude words:', excludeWords);
    if (excludeWords && excludeWords.length > 0) {
      rehearsalEvents = rehearsalEvents.filter(event => {
        const summary = event.summary || '';
        const isExcluded = excludeWords.some(word => summary.toLowerCase().includes(word.toLowerCase()));
        if (isExcluded) {
          console.log(`Excluded event: "${summary}"`);
        }
        return !isExcluded;
      });
    }

    // Group by band name (special handling for 'Sală repetiție - 2 ore for ...')
    const bandMap = {};
    for (const event of rehearsalEvents) {
      let summary = event.summary || '';
      let bandName;
      const salaRepetitieMatch = summary.match(/^Sală repetiție - 2 ore for (.+?)(?: \+\d+)?$/i);
      if (salaRepetitieMatch) {
        bandName = salaRepetitieMatch[1].trim();
      } else {
        bandName = summary.split('-')[0].trim();
        if (!bandName) bandName = summary || 'Unknown';
      }
      const duration = getEventDuration(event);
      console.log(`Grouping event: "${event.summary}" under band: "${bandName}"`);
      if (!bandMap[bandName]) {
        bandMap[bandName] = { band: bandName, totalHours: 0, events: [] };
      }
      bandMap[bandName].totalHours += duration;
      bandMap[bandName].events.push({
        summary: event.summary,
        start: event.start,
        end: event.end,
        duration,
      });
    }

    console.log('\nFinal bands:');
    Object.keys(bandMap).forEach(band => {
      console.log(`- ${band}: ${bandMap[band].events.length} events, ${bandMap[band].totalHours} hours`);
    });

    const bands = Object.values(bandMap);

    res.json({
      months: monthsArr,
      monthNames: monthsArr.map(m => months[m - 1]),
      year: yearNum,
      bands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating rehearsals report.' });
  }
});

module.exports = router; 