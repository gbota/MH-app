const { google } = require('googleapis');
const path = require('path');

// Load credentials from the credentials.json file
const credentials = require('../../credentials.json');

// Create a new JWT client using the credentials
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/calendar.readonly']
);

// Create a new calendar client
const calendar = google.calendar({ version: 'v3', auth });

async function getEvents(month, year) {
  try {
    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Format dates for Google Calendar API
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();

    // Get events from the calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

async function listEvents(calendarId, start, end) {
  let allEvents = [];
  let pageToken = undefined;
  try {
    do {
      const response = await calendar.events.list({
        calendarId,
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        pageToken,
      });
      allEvents = allEvents.concat(response.data.items);
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    return allEvents;
  } catch (error) {
    console.error(`Error fetching events for calendar ${calendarId}:`, error);
    return [];
  }
}

module.exports = {
  getEvents,
  listEvents,
}; 