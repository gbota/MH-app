import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import Calendar from '../components/Calendar';

const Dashboard = () => {
  const stats = [
    { title: 'Total Teachers', value: '12', icon: <SchoolIcon /> },
    { title: 'Total Students', value: '45', icon: <PeopleIcon /> },
    { title: 'Active Bands', value: '8', icon: <MusicNoteIcon /> },
    { title: 'Pending Payments', value: '15', icon: <PaymentIcon /> },
  ];

  const recentActivities = [
    { text: 'New student registration: John Doe', time: '2 hours ago' },
    { text: 'Band rehearsal scheduled: Rock Band', time: '3 hours ago' },
    { text: 'Payment received: $150', time: '5 hours ago' },
    { text: 'New teacher joined: Sarah Smith', time: '1 day ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={activity.text}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Lessons
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Guitar Lesson - John Doe"
                  secondary="Today, 2:00 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Piano Lesson - Jane Smith"
                  secondary="Today, 4:00 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Band Rehearsal - Rock Band"
                  secondary="Tomorrow, 6:00 PM"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calendar
            </Typography>
            <Calendar />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 