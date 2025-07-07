import React, { useState } from 'react';
import { Drawer, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 230;

// Navigation items for the sidebar, each with an icon, label, and route path
const navItems = [
  { icon: <HomeIcon />, label: 'Main Menu', path: '/dashboard' }, 
  { icon: <DashboardIcon />, label: 'Product', path: '/product/dashboard' },
  { icon: <AssignmentIcon />, label: 'Orders', path: '/orders/dashboard' },
  { icon: <StoreIcon />, label: 'Store', path: '/store' },
  { icon: <PeopleIcon />, label: 'Customer', path: '/customer' },
  { icon: <RestaurantMenuIcon />, label: 'Ingredients', path: '/ingredients/dashboard' },
  { icon: <MapIcon />, label: 'Geographical Reports', path: '/geo-reports' }, 
];

/**
 * Sidebar component
 * Renders a responsive navigation drawer for the app.
 * Shows a permanent drawer on desktop and a temporary drawer with a menu button on mobile.
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  // Check if the screen size is medium or larger (for desktop)
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  // State to control mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Drawer content: logo, divider, and navigation list
  const drawerContent = (
    <>
      {/* App logo/title */}
      <Box sx={{ p: 2, mb: 2, textAlign: 'center', fontWeight: 700, fontSize: 20, letterSpacing: 2 }}>
        🍕 HOLY PEPPERONI 🍕
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      {/* Navigation links */}
      <List>
        {navItems.map((item) => (
          <ListItem disablePadding key={item.label}>
            <ListItemButton
              onClick={() => {
                if (item.path) navigate(item.path);
                setMobileOpen(false); // Close drawer on mobile after navigation
              }}
              disabled={!item.path}
              sx={{
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                transition: 'background 0.2s'
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Show menu icon button on mobile screens */}
      {!isMdUp && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            background: "#232a37",
            color: "#fff",
            '&:hover': { background: "#394150" }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      {/* Permanent drawer for desktop screens */}
      {isMdUp ? (
        <Drawer
          variant="permanent"
          anchor="left"
          PaperProps={{ sx: { width: drawerWidth, background: "#232a37", color: "#fff" } }}
          open
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Temporary drawer for mobile screens
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{ sx: { width: drawerWidth, background: "#232a37", color: "#fff" } }}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;