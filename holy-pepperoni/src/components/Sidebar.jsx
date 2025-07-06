import React from 'react';
import { Drawer, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment'; // Thêm icon cho Orders
import { useNavigate } from 'react-router-dom';

const drawerWidth = 230;

const navItems = [
  { icon: <HomeIcon />, label: 'Main Menu', path: '/dashboard' }, 
  { icon: <DashboardIcon />, label: 'Product', path: '/product/dashboard' },
  { icon: <AssignmentIcon />, label: 'Orders', path: '/orders/dashboard' }, // Thêm dòng này
  { icon: <StoreIcon />, label: 'Store', path: '/store' },
  { icon: <PeopleIcon />, label: 'Customer', path: '/customer' },
  { icon: <RestaurantMenuIcon />, label: 'Ingredients', path: '/ingredients/dashboard' },
  { icon: <MapIcon />, label: 'Geographical Reports', path: '/geo-reports' }, 
];

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: drawerWidth, background: "#232a37", color: "#fff" } }}
      sx={{ display: { xs: 'none', md: 'block' } }}
      open
    >
      <Box sx={{ p: 2, mb: 2, textAlign: 'center', fontWeight: 700, fontSize: 20, letterSpacing: 2 }}>
        🍕 HOLY PEPPERONI 🍕
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <List>
        {navItems.map((item, idx) => (
          <ListItem disablePadding key={item.label}>
            <ListItemButton
              onClick={() => item.path && navigate(item.path)}
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
    </Drawer>
  );
};

export default Sidebar;