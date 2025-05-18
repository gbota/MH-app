const { google } = require('googleapis');
const path = require('path');

const getCalendar = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../credentials.json'),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    return calendar;
  } catch (error) {
    console.error('Error initializing calendar:', error);
    throw error;
  }
};

module.exports = { getCalendar }; 