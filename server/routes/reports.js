const express = require('express');
const router = express.Router();
const { getCalendar } = require('../utils/calendar');

// Test route
router.get('/test', (req, res) => res.json({ ok: true }));

router.get('/rehearsals', async (req, res) => {
  try {
    const { month, year, excludeWords = [] } = req.query;
    console.log('Rehearsals report request:', { month, year, excludeWords });
    
    const months = Array.isArray(month) ? month : [month];
    console.log('Processing months:', months);
    
    const calendar = await getCalendar();
    console.log('Calendar API initialized successfully');
    
    const events = [];
    
    for (const m of months) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0);
      console.log(`Fetching events for ${m}/${year}:`, { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      try {
        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });
        
        console.log(`Found ${response.data.items.length} events for ${m}/${year}`);
        events.push(...response.data.items);
      } catch (error) {
        console.error(`Error fetching events for ${m}/${year}:`, error.message);
        throw error;
      }
    }
    
    console.log(`Total events before filtering: ${events.length}`);
    
    // Filter out lessons and excluded events
    const rehearsalEvents = events.filter(event => {
      const summary = event.summary.toLowerCase();
      // Check if it's a rehearsal (contains "sala repetitie" or similar)
      const isRehearsal = /sal[ăa]\s*repeti[țt]ie/i.test(summary);
      // Check if it's not a lesson (doesn't contain teacher-student pattern)
      const isNotLesson = !/^[^:]+:\s*[^:]+$/.test(summary);
      // Check if it's not in exclude list
      const isNotExcluded = !excludeWords.some(word => 
        summary.includes(word.toLowerCase())
      );
      
      const shouldInclude = (isRehearsal || isNotLesson) && isNotExcluded;
      if (shouldInclude) {
        console.log('Including event:', { 
          summary: event.summary,
          isRehearsal,
          isNotLesson,
          isNotExcluded
        });
      }
      
      return shouldInclude;
    });
    
    console.log(`Events after filtering: ${rehearsalEvents.length}`);
    
    // Group events by band
    const bands = {};
    rehearsalEvents.forEach(event => {
      const summary = event.summary;
      // Extract band name (everything before the first colon or the whole summary)
      const bandName = summary.split(':')[0].trim();
      const duration = (new Date(event.end.dateTime) - new Date(event.start.dateTime)) / (1000 * 60 * 60);
      
      if (!bands[bandName]) {
        bands[bandName] = {
          band: bandName,
          totalHours: 0,
          events: []
        };
      }
      
      bands[bandName].totalHours += duration;
      bands[bandName].events.push({
        ...event,
        duration
      });
    });
    
    // Convert to array and sort by total hours
    const bandsArray = Object.values(bands).sort((a, b) => b.totalHours - a.totalHours);
    console.log(`Found ${bandsArray.length} bands`);
    
    res.json({ bands: bandsArray });
  } catch (error) {
    console.error('Error in rehearsals report:', error);
    // Send more detailed error information
    res.status(500).json({ 
      error: 'Failed to fetch rehearsals report', 
      details: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 