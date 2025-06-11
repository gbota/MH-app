import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, List, Divider, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, TextField, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import { months } from '../utils/months';
import axios from 'axios';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { rentalInstruments } from '../utils/rentalInstruments';
import { useDataContext } from '../context/DataContext';
import config from '../config';

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const RehearsalsReports = () => {
  const [month, setMonth] = useState([currentMonth]);
  const [year, setYear] = useState(currentYear);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [excludeWords, setExcludeWords] = useState([]);
  const [excludeWordsLoaded, setExcludeWordsLoaded] = useState(false);
  const [newExcludeWord, setNewExcludeWord] = useState('');
  const [monthSelectOpen, setMonthSelectOpen] = useState(false);
  const [instrumentDialogOpen, setInstrumentDialogOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [instrumentEntries, setInstrumentEntries] = useState([]);
  const { useReport, getReport, refreshReport } = useDataContext();

  const { loading, error, data: report } = useReport('rehearsals', year, month.map(m => m + 1));

  useEffect(() => {
    // Load exclude words from backend
    const fetchExcludeWords = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/reports/rehearsals/exclude-words`);
        setExcludeWords(res.data.excludeWords || []);
        setExcludeWordsLoaded(true);
      } catch (err) {
        setExcludeWords([]);
        setExcludeWordsLoaded(true);
      }
    };
    fetchExcludeWords();
  }, []);

  useEffect(() => {
    // Only save to backend after initial load
    if (!excludeWordsLoaded) return;
    const saveExcludeWords = async () => {
      try {
        await axios.post(`${config.apiUrl}/reports/rehearsals/exclude-words`, { excludeWords });
      } catch (err) {
        // Optionally handle error
      }
    };
    saveExcludeWords();
  }, [excludeWords, excludeWordsLoaded]);

  useEffect(() => {
    if (!loading && !report) {
      getReport('rehearsals', year, month.map(m => m + 1));
    }
  }, [year, month, loading, report]);

  const handleAddExcludeWord = () => {
    if (newExcludeWord.trim() && !excludeWords.includes(newExcludeWord.trim())) {
      setExcludeWords([...excludeWords, newExcludeWord.trim()]);
      setNewExcludeWord('');
    }
  };

  const handleRemoveExcludeWord = (word) => {
    setExcludeWords(excludeWords.filter(w => w !== word));
  };

  const handleDownloadPDF = (band) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${band.band} - Rehearsal Report`, pageWidth / 2, 20, { align: 'center' });
    
    // Add period
    doc.setFontSize(12);
    const periodText = `${month.map(m => months[m]).join(', ')} ${year}`;
    doc.text(periodText, pageWidth / 2, 30, { align: 'center' });
    
    // Add total hours
    doc.setFontSize(14);
    doc.text(`Total Hours: ${band.totalHours.toFixed(2)}`, pageWidth / 2, 40, { align: 'center' });
    
    // Add sessions table
    const sessionData = band.events.map(ev => {
      const startDate = new Date(ev.start.dateTime || ev.start.date);
      return [
        startDate.toLocaleDateString(),
        startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ev.duration.toFixed(2),
        ev.summary
      ];
    });
    
    doc.autoTable({
      startY: 50,
      head: [['Date', 'Time', 'Hours', 'Description']],
      body: sessionData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 90 }
      }
    });
    
    // Save the PDF
    const fileName = `${band.band}_${year}_${month.map(m => months[m]).join('_')}.pdf`;
    doc.save(fileName);
  };

  // Group bands case-insensitively (revert to previous logic)
  let bandMap = {};
  if (report) {
    report.bands.forEach(band => {
      const bandKey = band.band.trim().toLowerCase();
      if (!bandMap[bandKey]) {
        bandMap[bandKey] = { ...band, band: band.band.trim(), totalHours: 0, events: [] };
      }
      bandMap[bandKey].totalHours += band.totalHours;
      bandMap[bandKey].events = bandMap[bandKey].events.concat(band.events);
    });
  }
  const bands = Object.values(bandMap);
  let totalHours = 0;
  let bandCount = bands.length;
  bands.forEach(band => { totalHours += band.totalHours; });

  // Calculate rental instrument stats (case-insensitive, no double-counting)
  const instrumentStats = {};
  const instrumentDetails = {};
  rentalInstruments.forEach(instr => {
    instrumentStats[instr] = 0;
    instrumentDetails[instr] = [];
  });
  bands.forEach(band => {
    band.events.forEach(ev => {
      rentalInstruments.forEach(instr => {
        const bandMatch = band.band.toLowerCase().includes(instr.toLowerCase());
        const eventMatch = ev.summary && ev.summary.toLowerCase().includes(instr.toLowerCase());
        if (bandMatch || eventMatch) {
          instrumentStats[instr] += ev.duration;
          instrumentDetails[instr].push({ band: band.band, hours: ev.duration, event: ev });
        }
      });
    });
  });

  const handleInstrumentCardClick = (instr) => {
    setSelectedInstrument(instr);
    setInstrumentEntries(instrumentDetails[instr]);
    setInstrumentDialogOpen(true);
  };

  const handleInstrumentDialogClose = () => {
    setInstrumentDialogOpen(false);
    setSelectedInstrument(null);
    setInstrumentEntries([]);
  };

  const handleRefresh = () => {
    refreshReport('rehearsals', year, month.map(m => m + 1));
  };

  const handleDownloadAllPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yOffset = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.text('All Bands - Rehearsal Report', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    
    // Add period
    doc.setFontSize(12);
    const periodText = `${month.map(m => months[m]).join(', ')} ${year}`;
    doc.text(periodText, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    
    // Add total hours
    doc.setFontSize(14);
    doc.text(`Total Hours: ${totalHours.toFixed(2)}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    
    // Add bands table
    const bandData = bands.map(band => [
      band.band,
      band.totalHours.toFixed(2),
      band.events.length.toString()
    ]);
    
    doc.autoTable({
      startY: yOffset,
      head: [['Band', 'Total Hours', 'Number of Sessions']],
      body: bandData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 45 },
        2: { cellWidth: 45 }
      }
    });
    
    // Save the PDF with new filename format
    const shortMonths = month.map(m => months[m].substring(0, 3));
    const fileName = `${year}-${shortMonths.join('_')}_Rehearsals report.pdf`;
    doc.save(fileName);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Rehearsals Reports
        </Typography>
        
        {/* Filters */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <FormControl>
              <InputLabel>Month</InputLabel>
              <Select
                multiple
                value={month}
                label="Month"
                onChange={e => setMonth(e.target.value)}
                onOpen={() => setMonthSelectOpen(true)}
                onClose={() => setMonthSelectOpen(false)}
                sx={{ minWidth: 120 }}
                renderValue={selected => selected.map(idx => months[idx]).join(', ')}
              >
                {months.map((m, idx) => (
                  <MenuItem key={m} value={idx}>
                    <Checkbox checked={month.includes(idx)} />
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={e => setYear(Number(e.target.value))}
                sx={{ minWidth: 100 }}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleRefresh} disabled={loading} sx={{ ml: 2 }}>
              Refresh
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleDownloadAllPDF} 
              disabled={loading || !bands.length}
              startIcon={<DownloadIcon />}
              sx={{ ml: 2 }}
            >
              Export All Bands
            </Button>
          </Grid>
        </Grid>

        {/* Exclude Words */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Exclude Events Containing:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              value={newExcludeWord}
              onChange={(e) => setNewExcludeWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddExcludeWord()}
              placeholder="Add word to exclude"
            />
            <Button variant="contained" onClick={handleAddExcludeWord}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {excludeWords.map((word) => (
              <Chip
                key={word}
                label={word}
                onDelete={() => handleRemoveExcludeWord(word)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Summary cards */}
        {report && (
          <>
            <Grid container spacing={2} sx={{ mb: 0 }} alignItems="stretch">
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">Bands</Typography>
                    <Typography variant="h4">{bandCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">Total Hours</Typography>
                    <Typography variant="h4">{totalHours.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ height: 32 }} />
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
              {rentalInstruments.map(instr => (
                instrumentStats[instr] > 0 && (
                  <Grid item xs={12} sm={6} md={3} lg={2} key={instr}>
                    <Card
                      sx={{
                        minWidth: 120,
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 2,
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleInstrumentCardClick(instr)}
                    >
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary">{instr}</Typography>
                        <Typography variant="h6">{instrumentStats[instr].toFixed(2)}h</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              ))}
            </Grid>
          </>
        )}

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {report && report.bands.length === 0 && (
          <Typography color="text.secondary">No data for this period.</Typography>
        )}
        {report && bands.length > 0 && (
          <List>
            {bands.map((band, idx) => (
              <Box key={band.band} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Accordion sx={{ background: 'rgba(255,255,255,0.01)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" color="primary">
                        {band.band} <span style={{ color: '#bbb', fontWeight: 400, fontSize: 18 }}>— Total: {band.totalHours.toFixed(2)} hours</span>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Start Time</TableCell>
                              <TableCell>Hours</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {band.events.map((ev, idx) => {
                              const startDate = new Date(ev.start.dateTime || ev.start.date);
                              return (
                                <TableRow key={idx}>
                                  <TableCell>{startDate.toLocaleDateString()}</TableCell>
                                  <TableCell>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                  <TableCell>{ev.duration.toFixed(2)}</TableCell>
                                  <TableCell>{ev.summary}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                </Box>
                <IconButton
                  aria-label="Download PDF"
                  onClick={() => handleDownloadPDF(band)}
                  color="primary"
                  size="large"
                  sx={{
                    ml: 2,
                    color: 'primary.main',
                    fontSize: { xs: 28, md: 24 },
                    backgroundColor: { xs: 'background.paper', md: 'transparent' },
                    borderRadius: 2,
                    boxShadow: { xs: 1, md: 0 },
                  }}
                >
                  <DownloadIcon sx={{ fontSize: { xs: 28, md: 24 } }} />
                </IconButton>
              </Box>
            ))}
          </List>
        )}
        {/* Instrument rental dialog with date */}
        <Dialog open={instrumentDialogOpen} onClose={handleInstrumentDialogClose}>
          <DialogTitle>{selectedInstrument} Rental Entries</DialogTitle>
          <DialogContent>
            {instrumentEntries.length === 0 ? (
              <Typography>No entries found.</Typography>
            ) : (
              <List>
                {instrumentEntries.map((entry, idx) => {
                  let dateStr = '';
                  if (entry.event && entry.event.start) {
                    const startDate = new Date(entry.event.start.dateTime || entry.event.start.date);
                    dateStr = startDate.toLocaleDateString();
                  }
                  return (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={entry.band + (dateStr ? ` (${dateStr})` : '')}
                        secondary={entry.hours.toFixed(2) + ' hours'}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default RehearsalsReports; 