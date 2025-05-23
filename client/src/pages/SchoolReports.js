import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, List, Divider, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
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
import autoTable from 'jspdf-autotable';
import { useDataContext } from '../context/DataContext';

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // 2 years back, 2 years forward

const SchoolReports = () => {
  const [month, setMonth] = useState([currentMonth]);
  const [year, setYear] = useState(currentYear);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [monthSelectOpen, setMonthSelectOpen] = useState(false);
  const { useReport, getReport, refreshReport } = useDataContext();

  const { loading, error, data: report } = useReport('school', year, month.map(m => m + 1));

  useEffect(() => {
    if (!monthSelectOpen && !report && !loading) {
      getReport('school', year, month.map(m => m + 1));
    }
  }, [month, year, monthSelectOpen]);

  // Replace the handleDownloadPDF function with this implementation
  const handleDownloadPDF = (teacher) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${teacher.teacher} - Report`, pageWidth / 2, 20, { align: 'center' });
    
    // Add period
    doc.setFontSize(12);
    const periodText = `${month.map(m => months[m]).join(', ')} ${year}`;
    doc.text(periodText, pageWidth / 2, 30, { align: 'center' });
    
    // Add total hours
    doc.setFontSize(14);
    doc.text(`Total Hours: ${teacher.totalHours.toFixed(2)}`, pageWidth / 2, 40, { align: 'center' });
    
    // Add students table
    const tableData = [];
    teacher.students.forEach((student, idx) => {
      const studentTotalHours = student.events.reduce((sum, ev) => sum + ev.duration, 0);
      tableData.push([
        idx + 1,
        student.student,
        studentTotalHours.toFixed(2)
      ]);
    });
    
    autoTable(doc, {
      startY: 50,
      head: [['#', 'Student', 'Total Hours']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 }
      }
    });
    
    // Add detailed sessions
    let yPos = doc.lastAutoTable.finalY + 20;
    teacher.students.forEach(student => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${student.student}`, 14, yPos);
      yPos += 10;
      
      const sessionData = student.events.map(ev => {
        const startDate = new Date(ev.start.dateTime || ev.start.date);
        return [
          startDate.toLocaleDateString(),
          startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ev.duration.toFixed(2),
          ev.paymentHours ? `${ev.paymentHours} hours` : '-'
        ];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Time', 'Hours', 'Payment Bundle']],
        body: sessionData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 }
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
    });
    
    // Save the PDF
    const fileName = `${teacher.teacher}_${year}_${month.map(m => months[m]).join('_')}.pdf`;
    doc.save(fileName);
  };

  // Compute summary stats
  let totalHours = 0;
  let studentSet = new Set();
  let instrumentMap = {};
  let instrumentDisplayNames = {};
  let teacherCount = report ? report.teachers.length : 0;
  if (report) {
    report.teachers.forEach(teacher => {
      totalHours += teacher.totalHours;
      teacher.students.forEach(student => {
        studentSet.add(student.student.toLowerCase());
        const instrKey = student.instrument.toLowerCase();
        if (!instrumentMap[instrKey]) instrumentMap[instrKey] = new Set();
        instrumentMap[instrKey].add(student.student.toLowerCase());
        // Store a display name (capitalize first letter)
        if (!instrumentDisplayNames[instrKey]) {
          instrumentDisplayNames[instrKey] = student.instrument.charAt(0).toUpperCase() + student.instrument.slice(1).toLowerCase();
        }
      });
    });
  }

  const handleOpenDialog = (type, instrument = null) => {
    setDialogType(type);
    setSelectedInstrument(instrument);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
    setSelectedInstrument(null);
  };

  const handleRefresh = () => {
    refreshReport('school', year, month.map(m => m + 1));
  };

  const getRankIcon = (index) => {
    switch(index) {
      case 0:
        return <EmojiEventsIcon sx={{ color: '#FFD700', mr: 1 }} />; // Gold
      case 1:
        return <EmojiEventsIcon sx={{ color: '#C0C0C0', mr: 1 }} />; // Silver
      case 2:
        return <EmojiEventsIcon sx={{ color: '#CD7F32', mr: 1 }} />; // Bronze
      default:
        return <PersonIcon sx={{ color: '#90A4AE', mr: 1 }} />; // Neutral icon for others
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h3" color="primary" gutterBottom sx={{ mb: 4, fontWeight: 500 }}>
          School Reports
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <FormControl>
              <InputLabel>Month</InputLabel>
              <Select
                multiple
                value={month}
                label="Month"
                onChange={e => setMonth([...e.target.value])}
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
        </Grid>
        <Box sx={{ height: 32 }} />
        {/* Summary cards */}
        {report && (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', cursor: 'pointer' }} onClick={() => handleOpenDialog('students')}>
                  <CardContent>
                    <Typography variant="h6">Students</Typography>
                    <Typography variant="h4">{studentSet.size}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', cursor: 'pointer' }} onClick={() => handleOpenDialog('teachers')}>
                  <CardContent>
                    <Typography variant="h6">Teachers</Typography>
                    <Typography variant="h4">{teacherCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6">Total Hours</Typography>
                    <Typography variant="h4">{totalHours.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* Students per instrument */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  {Object.entries(instrumentMap)
                    .filter(([instrKey]) => instrKey && instrKey.trim() !== '')
                    .map(([instrKey, students]) => (
                      <Card 
                        key={instrKey} 
                        sx={{ 
                          minWidth: 120, 
                          bgcolor: 'background.paper', 
                          color: 'text.primary', 
                          boxShadow: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleOpenDialog('instruments', instrKey)}
                      >
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" color="text.secondary">{instrumentDisplayNames[instrKey]}</Typography>
                          <Typography variant="h6">{students.size}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              </Grid>
            </Grid>
            {/* Dialog for students/teachers/instruments list */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
              <DialogTitle>
                {dialogType === 'students' ? 'Students' : 
                 dialogType === 'teachers' ? 'Teachers' : 
                 dialogType === 'instruments' ? `Students - ${instrumentDisplayNames[selectedInstrument]}` : ''}
              </DialogTitle>
              <DialogContent>
                <List>
                  {dialogType === 'students' && Array.from(studentSet).sort().map((student, idx) => (
                    <ListItem key={idx}><ListItemText primary={student.charAt(0).toUpperCase() + student.slice(1)} /></ListItem>
                  ))}
                  {dialogType === 'teachers' && report.teachers.map((teacher, idx) => (
                    <ListItem key={idx}><ListItemText primary={teacher.teacher} /></ListItem>
                  ))}
                  {dialogType === 'instruments' && Array.from(instrumentMap[selectedInstrument]).sort().map((student, idx) => (
                    <ListItem key={idx}><ListItemText primary={student.charAt(0).toUpperCase() + student.slice(1)} /></ListItem>
                  ))}
                </List>
              </DialogContent>
            </Dialog>
          </>
        )}
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {report && report.teachers.length === 0 && (
          <Typography color="text.secondary">No data for this period.</Typography>
        )}
        {report && report.teachers.length > 0 && (
          <List>
            {[...report.teachers]
              .sort((a, b) => b.totalHours - a.totalHours)
              .map((teacher, tIdx) => (
              <Box key={teacher.teacher} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Accordion sx={{ background: 'rgba(255,255,255,0.01)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getRankIcon(tIdx)}
                        <Typography variant="h6" color="primary">
                          {teacher.teacher} <span style={{ color: '#bbb', fontWeight: 400, fontSize: 18 }}>{teacher.totalHours.toFixed(2)}h</span>
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {teacher.students.map((student, sIdx) => {
                        const studentTotalHours = student.events.reduce((sum, ev) => sum + ev.duration, 0);
                        return (
                          <Box key={student.student} sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              {student.student} <span style={{ color: '#aaa' }}>({student.instrument})</span> — <span style={{ color: '#bbb' }}>{studentTotalHours.toFixed(2)}h</span>
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Start Time</TableCell>
                                    <TableCell>Hours</TableCell>
                                    <TableCell>Payment Bundle</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {student.events.map((ev, idx) => {
                                    const startDate = new Date(ev.start.dateTime || ev.start.date);
                                    const isPayment = !!ev.paymentHours;
                                    return (
                                      <TableRow key={idx} sx={isPayment ? { backgroundColor: '#d0f5dd' } : {}}>
                                        <TableCell sx={isPayment ? { fontWeight: 600, color: '#1b5e20' } : {}}>{student.student}</TableCell>
                                        <TableCell sx={isPayment ? { fontWeight: 600, color: '#1b5e20' } : {}}>{ev.summary}</TableCell>
                                        <TableCell sx={isPayment ? { fontWeight: 600, color: '#1b5e20' } : {}}>{startDate.toLocaleDateString()}</TableCell>
                                        <TableCell sx={isPayment ? { fontWeight: 600, color: '#1b5e20' } : {}}>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                        <TableCell sx={isPayment ? { fontWeight: 600, color: '#1b5e20' } : {}}>{ev.duration.toFixed(2)}</TableCell>
                                        <TableCell sx={isPayment ? { fontWeight: 600, color: '#1b5e20' } : {}}>{ev.paymentHours ? `${ev.paymentHours} hours` : '-'}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                </Box>
                <IconButton
                  aria-label="Download PDF"
                  onClick={() => handleDownloadPDF(teacher)}
                  color="primary"
                  size="large"
                  sx={{ ml: 2 }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default SchoolReports; 