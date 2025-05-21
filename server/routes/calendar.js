const express = require('express');
const router = express.Router();
const path = require('path');
const calendarService = require(path.join(__dirname, '..', 'services', 'calendarService'));
const { protect } = require(path.join(__dirname, '..', 'middleware', 'auth'));

// Get events for a specific calendar
router.get('/events/:calendarId', protect, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const { start, end } = req.query;
        
        const events = await calendarService.listEvents(
            calendarId,
            new Date(start),
            new Date(end)
        );
        
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new event
router.post('/events/:calendarId', protect, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const event = req.body;
        
        const createdEvent = await calendarService.createEvent(calendarId, event);
        res.json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an event
router.put('/events/:calendarId/:eventId', protect, async (req, res) => {
    try {
        const { calendarId, eventId } = req.params;
        const event = req.body;
        
        const updatedEvent = await calendarService.updateEvent(calendarId, eventId, event);
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an event
router.delete('/events/:calendarId/:eventId', protect, async (req, res) => {
    try {
        const { calendarId, eventId } = req.params;
        
        await calendarService.deleteEvent(calendarId, eventId);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get available rooms for a time slot
router.get('/available-rooms', protect, async (req, res) => {
    try {
        const { start, end } = req.query;
        
        const availableRooms = await calendarService.getAvailableRooms(
            new Date(start),
            new Date(end)
        );
        
        res.json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get free time slots for a calendar
router.get('/free-slots/:calendarId', protect, async (req, res) => {
    try {
        const { calendarId } = req.params;
        const { start, end, duration } = req.query;
        
        const freeSlots = await calendarService.getFreeTimeSlots(
            calendarId,
            new Date(start),
            new Date(end),
            parseInt(duration)
        );
        
        res.json(freeSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 