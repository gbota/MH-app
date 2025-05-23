import React, { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Chip, Stack, Button, Divider, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useDataContext } from '../context/DataContext';

const NeedsPayment = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const year = selectedDate.year();
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const { useReport, refreshReport, getReport } = useDataContext();
  const { loading, data: schoolData } = useReport('school', year, months);

  useEffect(() => {
    if (!loading && !schoolData) {
      getReport('school', year, months);
    }
  }, [year, months, loading, schoolData]);

  // Debug: Log raw school data
  console.log('Raw school data:', JSON.stringify(schoolData, null, 2));

  // Compute filtered data only when schoolData or selectedDate changes
  const data = useMemo(() => {
    if (!schoolData) return [];
    
    const today = selectedDate.format('YYYY-MM-DD');
    console.log('Selected date:', today);
    
    return schoolData.teachers.map(teacher => {
      console.log(`\nProcessing teacher: ${teacher.teacher}`);
      
      const studentsToday = teacher.students.map(student => {
        console.log(`\nProcessing student: ${student.student}`);
        
        // Find all sessions up to selected day (inclusive)
        const allSessions = student.events
          .filter(ev => {
            const evDate = new Date(ev.start.dateTime || ev.start.date);
            const evDateStr = evDate.toISOString().split('T')[0];
            const isInYear = evDate.getFullYear() === year;
            const isBeforeOrToday = evDateStr <= today;
            console.log(`Event date: ${evDateStr}, In year: ${isInYear}, Before or today: ${isBeforeOrToday}`);
            return isInYear && isBeforeOrToday;
          })
          .sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date));
        
        console.log(`All sessions count: ${allSessions.length}`);
        if (allSessions.length > 0) {
          console.log('Sample session:', allSessions[0]);
        }
        
        if (allSessions.length === 0) {
          console.log('No sessions found, skipping student');
          return null;
        }

        // Find last (Ab.) before or on selected day (case-insensitive)
        const abRegex = /\(ab\.?/i;
        let lastAbIdx = -1;
        for (let i = allSessions.length - 1; i >= 0; i--) {
          if (allSessions[i].summary && abRegex.test(allSessions[i].summary)) {
            lastAbIdx = i;
            console.log(`Found last (Ab.) at index ${i}: ${allSessions[i].summary}`);
            break;
          }
        }

        // Sessions from last (Ab.) (inclusive) up to selected day
        const sessionsFromAb = lastAbIdx !== -1 ? allSessions.slice(lastAbIdx) : allSessions;
        console.log(`Sessions from last (Ab.): ${sessionsFromAb.length}`);

        // Only show students with a session on the selected day
        const hasSessionToday = sessionsFromAb.some(ev => {
          const evDate = new Date(ev.start.dateTime || ev.start.date);
          const evDateStr = evDate.toISOString().split('T')[0];
          const selectedDateStr = selectedDate.format('YYYY-MM-DD');
          const isToday = evDateStr === selectedDateStr;
          console.log(`Comparing dates - Event: ${evDateStr}, Selected: ${selectedDateStr}, Match: ${isToday}`);
          return isToday;
        });

        console.log(`Has session today: ${hasSessionToday}`);

        if (!hasSessionToday) {
          console.log('No session today, skipping student');
          return null;
        }

        // Payment summary, last payment date, spent hours since last payment
        const paymentSessions = allSessions.filter(ev => ev.summary && abRegex.test(ev.summary));
        // Only show unique, ordered bundles
        const paymentBundlesArr = paymentSessions.map(ev => {
          const match = ev.summary.match(/\(ab\.\s*(\d+)h/i);
          return match ? parseInt(match[1]) : null;
        }).filter(Boolean);
        // Remove duplicates and keep order
        const paymentBundles = paymentBundlesArr.filter((v, i, a) => a.indexOf(v) === i);
        const paymentSummary = paymentBundles.length > 0 ? paymentBundles : [];
        const lastPaymentSession = paymentSessions.length > 0 ? paymentSessions[paymentSessions.length - 1] : null;
        const lastPaymentDate = lastPaymentSession ? new Date(lastPaymentSession.start.dateTime || lastPaymentSession.start.date) : null;
        
        // Spent hours since last payment
        let spentHours = 0;
        let lastPaymentHours = 0;
        let abCalculationWarning = false;
        let abNotFound = false;
        if (lastPaymentSession) {
          const lastPaymentTime = new Date(lastPaymentSession.start.dateTime || lastPaymentSession.start.date).getTime();
          // Find the index of the last (Ab.) session in allSessions
          const lastAbIdx = allSessions.findIndex(ev => {
            const evTime = new Date(ev.start.dateTime || ev.start.date).getTime();
            return evTime === lastPaymentTime;
          });
          // Sessions from and after the last (Ab.) session (including the (Ab.) session itself)
          const sessionsFromAb = allSessions.slice(lastAbIdx).filter(ev => {
            const evTime = new Date(ev.start.dateTime || ev.start.date).getTime();
            return evTime <= selectedDate.toDate().getTime();
          });
          spentHours = sessionsFromAb.reduce((sum, ev) => sum + ev.duration, 0);
          // Get the hours from the last (Ab. Xh)
          const abMatch = lastPaymentSession.summary.match(/\(ab\.\s*(\d+)h/i);
          if (abMatch) {
            lastPaymentHours = parseInt(abMatch[1]);
          } else {
            abCalculationWarning = true;
          }
        } else {
          spentHours = allSessions.reduce((sum, ev) => sum + ev.duration, 0);
          lastPaymentHours = 0;
          abNotFound = true;
        }
        const remainingHours = lastPaymentHours - spentHours;

        // Check if this is the last hour
        const isLastHour = remainingHours <= 1;

        // Check if payment is needed (negative remaining hours)
        const needsPayment = remainingHours < 0;

        console.log(`Student included with ${sessionsFromAb.length} sessions`);
        return {
          ...student,
          sessionsFromAb,
          paymentSummary,
          lastPaymentDate,
          spentHours,
          remainingHours,
          isLastHour,
          needsPayment,
          abCalculationWarning,
          abNotFound
        };
      }).filter(Boolean);

      if (studentsToday.length === 0) {
        console.log('No students with sessions today for this teacher');
        return null;
      }

      // Calculate teacher-level indicators
      // Only consider students with a valid remainingHours (not abCalculationWarning or abNotFound)
      const validStudents = studentsToday.filter(s => !s.abCalculationWarning && !s.abNotFound && typeof s.remainingHours === 'number');
      const minRemaining = validStudents.length > 0 ? Math.min(...validStudents.map(s => s.remainingHours)) : null;
      const hasStudentsWithLastHour = validStudents.some(s => s.isLastHour);
      const hasStudentsWithNegative = validStudents.some(s => s.remainingHours < 0);
      // New: show warning if any student has abNotFound or remainingHours <= 0 (and not abCalculationWarning)
      const showTeacherWarning = studentsToday.some(s => s.abNotFound || (!s.abCalculationWarning && typeof s.remainingHours === 'number' && s.remainingHours <= 0));

      console.log(`Teacher included with ${studentsToday.length} students`);
      return {
        ...teacher,
        students: studentsToday,
        hasStudentsWithLastHour,
        minRemaining,
        hasStudentsWithNegative,
        showTeacherWarning
      };
    }).filter(Boolean);
  }, [schoolData, selectedDate, year]);

  // Debug: Log final filtered data
  console.log('Final filtered data:', JSON.stringify(data, null, 2));

  const handleRefresh = () => {
    refreshReport('school', year, months);
    setSelectedDate(selectedDate.clone()); // Force useMemo recalculation
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Needs Payment?
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <DatePicker
              label="Select Day"
              value={selectedDate}
              onChange={setSelectedDate}
              slotProps={{ textField: { size: 'small', sx: { width: 160, fontSize: 14 } } }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleRefresh}
              disabled={loading}
              sx={{ ml: 2 }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
        {loading && <CircularProgress />}
        {data.length === 0 && !loading && (
          <Typography color="text.secondary">No sessions for this day.</Typography>
        )}
        {data.map((teacher, tIdx) => (
          <Accordion key={teacher.teacher} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6" color="primary">{teacher.teacher}</Typography>
                <Stack direction="row" spacing={1}>
                  {teacher.showTeacherWarning && (
                    <WarningIcon color="warning" sx={{ verticalAlign: 'middle' }} />
                  )}
                </Stack>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {teacher.students.map((student, sIdx) => (
                <Box key={student.student} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                      {student.student} <span style={{ color: '#bdbdbd', fontWeight: 400, fontSize: '1rem' }}>({student.instrument})</span>
                    </Typography>
                  </Box>
                  {/* Student payment summary - visual cards */}
                  <Box sx={{ mb: 1, ml: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {/* Payment Bundles */}
                      {student.abCalculationWarning ? (
                        <Chip
                          icon={<WarningIcon />}
                          label="Cannot calculate"
                          color="warning"
                          size="small"
                        />
                      ) : student.abNotFound ? (
                        <Chip
                          icon={<InfoIcon />}
                          label="No payment found"
                          color="error"
                          size="small"
                        />
                      ) : student.paymentSummary.length > 0 && student.paymentSummary.map((h, idx) => (
                        <Chip
                          key={idx}
                          label={`Bundle: ${h}h`}
                          color={idx === student.paymentSummary.length - 1 ? 'primary' : 'default'}
                          size="small"
                        />
                      ))}
                      {/* Last Payment Date */}
                      {student.lastPaymentDate && (
                        <Chip
                          icon={<CalendarTodayIcon />}
                          label={`Last: ${new Date(student.lastPaymentDate).toLocaleDateString()}`}
                          color="default"
                          size="small"
                        />
                      )}
                      {/* Spent Hours */}
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`Spent: ${student.spentHours.toFixed(2)}h`}
                        color="default"
                        size="small"
                      />
                      {/* Remaining Hours */}
                      {(!student.abCalculationWarning) && (
                        <Chip
                          icon={<BatteryFullIcon />}
                          label={`Left: ${student.remainingHours.toFixed(2)}h`}
                          color={student.remainingHours < 0 ? 'error' : student.remainingHours <= 1 ? 'warning' : 'success'}
                          size="small"
                        />
                      )}
                    </Stack>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Start Time</TableCell>
                          <TableCell>Hours</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          let abMatch = null;
                          let abHours = 0;
                          let cumulativeSpent = 0;
                          let bundleFinishedMarked = false;
                          return student.sessionsFromAb.map((ev, idx) => {
                            const startDate = new Date(ev.start.dateTime || ev.start.date);
                            const isPayment = ev.summary && /\(ab\.?/i.test(ev.summary);
                            if (isPayment) {
                              abMatch = ev.summary.match(/\(ab\.\s*(\d+)h/i);
                              abHours = abMatch ? parseInt(abMatch[1]) : 0;
                              cumulativeSpent = 0; // reset for new bundle
                              bundleFinishedMarked = false;
                            }
                            cumulativeSpent += ev.duration;
                            // Mark only the first row where cumulativeSpent >= abHours
                            let bundleFinished = false;
                            if (!bundleFinishedMarked && abHours > 0 && cumulativeSpent >= abHours) {
                              bundleFinished = true;
                              bundleFinishedMarked = true;
                            }
                            return (
                              <TableRow
                                key={idx}
                                sx={isPayment ? {
                                  backgroundColor: '#f5f5f5',
                                  fontWeight: 700,
                                  color: '#333',
                                  borderLeft: bundleFinished ? '4px solid #d32f2f' : '2px solid #bdbdbd',
                                } : {}}
                              >
                                <TableCell sx={isPayment ? { fontWeight: 700, color: '#333' } : {}}>
                                  {ev.summary}
                                  {bundleFinished && (
                                    <span style={{ color: '#d32f2f', fontWeight: 700, marginLeft: 8 }}>
                                      (Bundle finished)
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell sx={isPayment ? { fontWeight: 700, color: '#333' } : {}}>{startDate.toLocaleDateString()}</TableCell>
                                <TableCell sx={isPayment ? { fontWeight: 700, color: '#333' } : {}}>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                <TableCell sx={isPayment ? { fontWeight: 700, color: '#333' } : {}}>{ev.duration.toFixed(2)}</TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default NeedsPayment; 