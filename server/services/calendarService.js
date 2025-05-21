const { google } = require('googleapis');
const path = require('path');

// Load credentials from the credentials.json file
const credentials = require('../../credentials.json');

// Create a new JWT client using the credentials
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/calendar']
);

// Create a new calendar client
const calendar = google.calendar({ version: 'v3', auth });

// Get events from a specific calendar within a date range
async function listEvents(calendarId, start, end) {
  try {
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error listing events:', error);
    throw new Error('Failed to fetch events');
  }
}

// Create a new event in a calendar
async function createEvent(calendarId, event) {
  try {
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

// Update an existing event in a calendar
async function updateEvent(calendarId, eventId, event) {
  try {
    const response = await calendar.events.update({
      calendarId: calendarId,
      eventId: eventId,
      resource: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

// Delete an event from a calendar
async function deleteEvent(calendarId, eventId) {
  try {
    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
}

// Get available rooms for a time slot
async function getAvailableRooms(start, end) {
  try {
    // This is a simplified example - in a real app, you would query your room resources
    // and check their availability using the Calendar API's free/busy endpoint
    const response = await calendar.freebusy.query({
      resource: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [
          // Add your room resources here
          { id: 'room1@resource.calendar.google.com' },
          { id: 'room2@resource.calendar.google.com' },
        ],
      },
    });
    
    // Process the free/busy response to find available rooms
    const busyRooms = new Set();
    for (const [calendarId, calendarData] of Object.entries(response.data.calendars)) {
      if (calendarData.busy && calendarData.busy.length > 0) {
        busyRooms.add(calendarId);
      }
    }
    
    // Return available rooms (those not in the busy set)
    return [
      { id: 'room1', name: 'Room 1', available: !busyRooms.has('room1@resource.calendar.google.com') },
      { id: 'room2', name: 'Room 2', available: !busyRooms.has('room2@resource.calendar.google.com') },
    ];
  } catch (error) {
    console.error('Error getting available rooms:', error);
    throw new Error('Failed to get available rooms');
  }
}

// Get free time slots for a calendar
async function getFreeTimeSlots(calendarId, start, end, durationMinutes) {
  try {
    // Get busy slots for the calendar
    const response = await calendar.freebusy.query({
      resource: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: calendarId }],
      },
    });
    
    const busySlots = response.data.calendars[calendarId].busy || [];
    const freeSlots = [];
    
    // Convert duration to milliseconds
    const durationMs = durationMinutes * 60 * 1000;
    
    // Start checking from the current time or the provided start time
    let currentTime = new Date(start);
    
    // Check until we reach the end time
    while (currentTime.getTime() + durationMs <= end.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      
      // Check if the current time slot overlaps with any busy slot
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (
          (currentTime >= busyStart && currentTime < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentTime <= busyStart && slotEnd >= busyEnd)
        );
      });
      
      if (!isBusy) {
        freeSlots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
        });
      }
      
      // Move to the next time slot (increment by 30 minutes or your preferred interval)
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }
    
    return freeSlots;
  } catch (error) {
    console.error('Error getting free time slots:', error);
    throw new Error('Failed to get free time slots');
  }
}

// Legacy function for backward compatibility
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
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error(`Error fetching events for calendar ${calendarId}:`, error);
    return []; // Return empty array instead of throwing to prevent report failure
  }
}

module.exports = {
  getEvents,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAvailableRooms,
  getFreeTimeSlots
};