import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider, useTheme } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  {
    text: 'Needs Payment?',
    icon: <PaymentIcon />,
    path: '/needs-payment',
  },
  {
    text: 'School Reports',
    icon: <AssessmentIcon />,
    path: '/school-reports',
  },
  {
    text: 'Rehearsals Reports',
    icon: <EventNoteIcon />,
    path: '/rehearsals-reports',
  },
  {
    text: 'Performance Dashboard',
    icon: <DashboardIcon />,
    path: '/performance-dashboard',
  },
];

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const theme = useTheme();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Box sx={{ mb: 1 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 64, width: 'auto', marginBottom: 8 }} />
        </Box>
      </Box>
      <Divider sx={{ bgcolor: theme.palette.divider }} />
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ bgcolor: theme.palette.divider }} />
        <List>
          <ListItemButton
            component={Link}
            to="/settings"
            selected={location.pathname === '/settings'}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText },
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 