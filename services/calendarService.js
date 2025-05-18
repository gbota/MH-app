const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

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

class CalendarService {
    constructor() {
        // Load credentials from file
        const credentialsPath = path.join(__dirname, '..', 'credentials.json');
        console.log('Looking for credentials at:', credentialsPath);
        const credentials = JSON.parse(fs.readFileSync(credentialsPath));
        
        // Create JWT client
        this.auth = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/calendar']
        );

        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    }

    async listEvents(calendarId, timeMin, timeMax) {
        try {
            const response = await this.calendar.events.list({
                calendarId,
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            return response.data.items;
        } catch (error) {
            console.error('Error listing events:', error);
            throw error;
        }
    }

    async createEvent(calendarId, event) {
        try {
            const response = await this.calendar.events.insert({
                calendarId,
                resource: event,
            });
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async updateEvent(calendarId, eventId, event) {
        try {
            const response = await this.calendar.events.update({
                calendarId,
                eventId,
                resource: event,
            });
            return response.data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async deleteEvent(calendarId, eventId) {
        try {
            await this.calendar.events.delete({
                calendarId,
                eventId,
            });
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    async getFreeTimeSlots(calendarId, startTime, endTime, duration) {
        try {
            const events = await this.listEvents(calendarId, startTime, endTime);
            const busySlots = events.map(event => ({
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date),
            }));

            const freeSlots = [];
            let currentTime = new Date(startTime);

            while (currentTime < endTime) {
                const slotEnd = new Date(currentTime.getTime() + duration * 60000);
                const isSlotFree = !busySlots.some(busy => 
                    (currentTime >= busy.start && currentTime < busy.end) ||
                    (slotEnd > busy.start && slotEnd <= busy.end) ||
                    (currentTime <= busy.start && slotEnd >= busy.end)
                );

                if (isSlotFree) {
                    freeSlots.push({
                        start: new Date(currentTime),
                        end: new Date(slotEnd),
                    });
                }

                currentTime = new Date(currentTime.getTime() + 30 * 60000); // Move forward by 30 minutes
            }

            return freeSlots;
        } catch (error) {
            console.error('Error getting free time slots:', error);
            throw error;
        }
    }

    async getAvailableRooms(startTime, endTime) {
        try {
            const availableRooms = [];
            
            for (const calendarId of CALENDAR_IDS) {
                const events = await this.listEvents(calendarId, startTime, endTime);
                if (events.length === 0) {
                    availableRooms.push(calendarId);
                }
            }

            return availableRooms;
        } catch (error) {
            console.error('Error getting available rooms:', error);
            throw error;
        }
    }
}

module.exports = new CalendarService(); 