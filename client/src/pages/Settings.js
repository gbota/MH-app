import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const defaultCalendars = [
  { name: 'Sala 4', id: 'musichub.sala4@gmail.com' },
  { name: 'Sala 1', id: 'musichub.sala1@gmail.com' },
  { name: 'Sala 3', id: 'musichub.sala3@gmail.com' },
  { name: 'Sala 2', id: 'musichub.sala2@gmail.com' },
  { name: 'Trupe', id: 'tqohu81achtjqgde79mg5jvs3k@group.calendar.google.com' },
  { name: 'Trupe 2', id: '5p7qdudisqjn9l40lafd4ejsc4@group.calendar.google.com' },
  { name: 'Grupa 1', id: '9pum9ujtmdcoqqoosg6le4g9io@group.calendar.google.com' },
  { name: 'Grupa 2', id: 'sgaob82ev6lhaqin53urq5iljc@group.calendar.google.com' },
];

const Settings = () => {
  const [calendars, setCalendars] = useState(defaultCalendars);
  const [newCalendar, setNewCalendar] = useState({ name: '', id: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('calendarListV2');
    if (saved) setCalendars(JSON.parse(saved));
  }, []);

  const handleAddCalendar = () => {
    if (!newCalendar.name || !newCalendar.id) return;
    if (calendars.some(c => c.id === newCalendar.id)) {
      setSnackbar({ open: true, message: 'Calendar ID already exists', severity: 'error' });
      return;
    }
    const updated = [...calendars, { ...newCalendar }];
    setCalendars(updated);
    setNewCalendar({ name: '', id: '' });
    setOpenDialog(false);
    setSnackbar({ open: true, message: 'Calendar added', severity: 'success' });
  };

  const handleRemoveCalendar = (id) => {
    const updated = calendars.filter(c => c.id !== id);
    setCalendars(updated);
    setSnackbar({ open: true, message: 'Calendar removed', severity: 'success' });
  };

  const handleSave = () => {
    localStorage.setItem('calendarListV2', JSON.stringify(calendars));
    setSnackbar({ open: true, message: 'Settings saved', severity: 'success' });
  };

  const handleRestore = () => {
    setCalendars(defaultCalendars);
    localStorage.setItem('calendarListV2', JSON.stringify(defaultCalendars));
    setSnackbar({ open: true, message: 'Defaults restored', severity: 'success' });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const startEdit = (idx) => {
    setEditIdx(idx);
    setEditName(calendars[idx].name);
  };

  const cancelEdit = () => {
    setEditIdx(null);
    setEditName('');
  };

  const saveEdit = (idx) => {
    if (!editName.trim()) return;
    const updated = calendars.map((c, i) => i === idx ? { ...c, name: editName } : c);
    setCalendars(updated);
    setEditIdx(null);
    setEditName('');
    setSnackbar({ open: true, message: 'Name updated', severity: 'success' });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Calendar Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage the list of calendar names and IDs used to fetch all events. You can edit the display name for each calendar.
        </Typography>
        <List>
          {calendars.map((cal, idx) => (
            <ListItem key={cal.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={2} alignItems="center">
                    {editIdx === idx ? (
                      <TextField
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        size="small"
                        sx={{ width: 160 }}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit(idx);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                    ) : (
                      <b>{cal.name}</b>
                    )}
                    <span style={{ color: '#aaa' }}>{cal.id}</span>
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                {editIdx === idx ? (
                  <>
                    <IconButton edge="end" aria-label="save" onClick={() => saveEdit(idx)}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="cancel" onClick={cancelEdit}>
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton edge="end" aria-label="edit" onClick={() => startEdit(idx)}>
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveCalendar(cal.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Calendar
          </Button>
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSave}>
            Save Settings
          </Button>
          <Button variant="outlined" color="secondary" startIcon={<RestoreIcon />} onClick={handleRestore}>
            Restore Defaults
          </Button>
        </Box>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Calendar</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Calendar Name"
            type="text"
            fullWidth
            value={newCalendar.name}
            onChange={e => setNewCalendar({ ...newCalendar, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Calendar ID"
            type="text"
            fullWidth
            value={newCalendar.id}
            onChange={e => setNewCalendar({ ...newCalendar, id: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCalendar} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 