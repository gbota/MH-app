import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Checkbox, ListItemText, Button, FormControlLabel, FormGroup } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { months } from '../utils/months';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).sort((a, b) => a - b);
const colors = [
  '#42a5f5', // blue
  '#ef5350', // red
  '#ffb74d', // orange
  '#66bb6a', // green
  '#ab47bc', // purple
  '#ffa726', // yellow
  '#26a69a', // teal
  '#8d6e63', // brown
];

const PerformanceDashboard = () => {
  const [selectedYears, setSelectedYears] = useState([currentYear]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCursuri, setShowCursuri] = useState(true);
  const [showTrupe, setShowTrupe] = useState(true);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const monthNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
      // Fetch data for all selected years
      const allYearData = await Promise.all(selectedYears.map(async (year) => {
        // Check if we need to fetch fresh data
        if (!forceRefresh) {
          const cachedData = await axios.get(`http://localhost:5050/api/performance/cached/${year}`);
          if (cachedData.data) {
            return cachedData.data;
          }
        }
        
        // If no cached data or force refresh, fetch new data
        const [schoolRes, rehearsalRes] = await Promise.all([
          axios.get('http://localhost:5050/api/reports/school', {
            params: { month: monthNumbers.join(','), year },
          }),
          axios.get('http://localhost:5050/api/reports/rehearsals', {
            params: { month: monthNumbers.join(','), year },
          }),
        ]);

        // Aggregate school hours per month
        const schoolHoursByMonth = Array(12).fill(0);
        if (schoolRes.data && schoolRes.data.teachers) {
          schoolRes.data.teachers.forEach(teacher => {
            teacher.students.forEach(student => {
              student.events.forEach(ev => {
                const date = new Date(ev.start.dateTime || ev.start.date);
                const m = date.getMonth();
                schoolHoursByMonth[m] += ev.duration;
              });
            });
          });
        }

        // Aggregate rehearsal hours per month
        const rehearsalHoursByMonth = Array(12).fill(0);
        if (rehearsalRes.data && rehearsalRes.data.bands) {
          rehearsalRes.data.bands.forEach(band => {
            band.events.forEach(ev => {
              const date = new Date(ev.start.dateTime || ev.start.date);
              const m = date.getMonth();
              rehearsalHoursByMonth[m] += ev.duration;
            });
          });
        }

        const yearData = {
          year,
          school: schoolHoursByMonth,
          rehearsals: rehearsalHoursByMonth,
        };

        // Cache the new data
        await axios.post(`http://localhost:5050/api/performance/cache/${year}`, yearData);
        
        return yearData;
      }));

      // Prepare data for recharts
      const data = months.map((m, idx) => {
        const entry = { month: m.slice(0, 3) };
        allYearData.forEach((yd) => {
          entry[`school_${yd.year}`] = Number(yd.school[idx].toFixed(2));
          entry[`rehearsals_${yd.year}`] = Number(yd.rehearsals[idx].toFixed(2));
        });
        return entry;
      });
      setChartData(data);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYears]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleYearChange = (event) => {
    setSelectedYears(event.target.value);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Performance Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Yearly overview of school and rehearsal hours. Select multiple years to compare.
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <FormControl sx={{ minWidth: 180, mr: 2 }}>
              <InputLabel id="year-label">Year</InputLabel>
              <Select
                labelId="year-label"
                multiple
                value={selectedYears.sort((a, b) => a - b)}
                onChange={handleYearChange}
                renderValue={selected => selected.sort((a, b) => a - b).join(', ')}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    <Checkbox checked={selectedYears.includes(year)} />
                    <ListItemText primary={year} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Grid>
        </Grid>
        <FormGroup row sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={showCursuri} onChange={e => setShowCursuri(e.target.checked)} />}
            label="Cursuri"
          />
          <FormControlLabel
            control={<Checkbox checked={showTrupe} onChange={e => setShowTrupe(e.target.checked)} />}
            label="Trupe"
          />
        </FormGroup>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && (
          <>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>School & Rehearsal Hours per Month</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedYears.sort((a, b) => a - b).map((year, idx) => (
                  <React.Fragment key={year}>
                    {showCursuri && (
                      <Bar dataKey={`school_${year}`} name={`Ore cursuri ${year}`} fill={colors[idx % colors.length]} />
                    )}
                    {showTrupe && (
                      <Bar dataKey={`rehearsals_${year}`} name={`Ore trupe ${year}`} fill={colors[(idx + 1) % colors.length]} />
                    )}
                  </React.Fragment>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PerformanceDashboard; 