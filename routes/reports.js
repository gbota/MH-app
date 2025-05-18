const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');
const { months } = require('../utils/months');

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

// /api/reports/school?month=5&year=2024
router.get('/school', async (req, res) => {
  try {
    let { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year are required.' });
    // Support multiple months (comma-separated or array)
    let monthsArr = Array.isArray(month) ? month : String(month).split(',').map(m => Number(m));
    const yearNum = Number(year);
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

module.exports = router; 