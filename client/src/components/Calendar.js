import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

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

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(CALENDAR_IDS[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    start: { dateTime: new Date().toISOString() },
    end: { dateTime: new Date().toISOString() },
  });

  useEffect(() => {
    fetchEvents();
  }, [selectedCalendar, startDate, endDate]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`/api/calendar/events/${selectedCalendar}`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await axios.post(`/api/calendar/events/${selectedCalendar}`, newEvent);
      setOpenDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Calendar</InputLabel>
              <Select
                value={selectedCalendar}
                onChange={(e) => setSelectedCalendar(e.target.value)}
                label="Calendar"
              >
                {CALENDAR_IDS.map((id) => (
                  <MenuItem key={id} value={id}>
                    {id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Create New Event
        </Button>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Events
          </Typography>
          {events.map((event) => (
            <Box key={event.id} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
              <Typography variant="subtitle1">{event.summary}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(event.start.dateTime).toLocaleString()} -{' '}
                {new Date(event.end.dateTime).toLocaleString()}
              </Typography>
              <Typography variant="body2">{event.description}</Typography>
            </Box>
          ))}
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Summary"
              value={newEvent.summary}
              onChange={(e) =>
                setNewEvent({ ...newEvent, summary: e.target.value })
              }
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              sx={{ mt: 2 }}
            />
            <TimePicker
              label="Start Time"
              value={new Date(newEvent.start.dateTime)}
              onChange={(date) =>
                setNewEvent({
                  ...newEvent,
                  start: { dateTime: date.toISOString() },
                })
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mt: 2 }} />
              )}
            />
            <TimePicker
              label="End Time"
              value={new Date(newEvent.end.dateTime)}
              onChange={(date) =>
                setNewEvent({
                  ...newEvent,
                  end: { dateTime: date.toISOString() },
                })
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mt: 2 }} />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Calendar; 