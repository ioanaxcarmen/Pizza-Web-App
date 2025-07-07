import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import BellAnimation from "./BellAnimation";

const drawerWidth = 230;

// Dummy notifications for the bell dropdown
const dummyNotifications = [
  { id: 1, title: "New order received", time: "2 minutes ago" },
  { id: 2, title: "Stock level low", time: "10 minutes ago" },
  { id: 3, title: "Pizza of the month updated", time: "1 hour ago" }
];

/**
 * TopBar component
 * Displays the top navigation bar with title, notification bell, and user avatar.
 * Shows a menu button on mobile for opening the sidebar.
 * Props:
 *   - title: string, page title to display
 *   - onLogout: function, called when user clicks logout
 *   - onMenuClick: function, called when menu button is clicked (mobile)
 */
function TopBar({ title = "", onLogout, onMenuClick }) {
  // State for bell (notification) dropdown menu
  const [anchorBell, setAnchorBell] = useState(null);
  // State for avatar (user) dropdown menu
  const [anchorAvatar, setAnchorAvatar] = useState(null);

  // Open/close handlers for bell menu
  const handleBellClick = (event) => setAnchorBell(event.currentTarget);
  const handleBellClose = () => setAnchorBell(null);

  // Open/close handlers for avatar menu
  const handleAvatarClick = (event) => setAnchorAvatar(event.currentTarget);
  const handleAvatarClose = () => setAnchorAvatar(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` }, // Responsive width with sidebar
        ml: { md: `${drawerWidth}px` }, // Margin for sidebar
        background: "linear-gradient(90deg, #faa28a 0%, #fff 100%)",
        color: "#232a37",
        boxShadow: "0 2px 8px rgba(35,42,55,0.04)"
      }}
      elevation={1}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 68 }}>
        {/* Left: Menu button (mobile) and page title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Menu icon only visible on mobile */}
          <IconButton color="inherit" sx={{ display: { md: 'none' } }} onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          {/* Page title */}
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              {title}
            </Typography>
          )}
        </Box>
        {/* Right: Notification bell and user avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Bell icon with dropdown notifications */}
          <IconButton color="inherit" onClick={handleBellClick}>
            <BellAnimation />
          </IconButton>
          <Menu
            anchorEl={anchorBell}
            open={Boolean(anchorBell)}
            onClose={handleBellClose}
            PaperProps={{
              sx: { minWidth: 280, mt: 1 }
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Typography sx={{ p: 2, fontWeight: 700 }}>Notifications</Typography>
            <Divider />
            {/* Show notifications or a message if none */}
            {dummyNotifications.length === 0 ? (
              <MenuItem disabled>
                <ListItemText primary="No notifications" />
              </MenuItem>
            ) : (
              dummyNotifications.map((noti) => (
                <MenuItem key={noti.id} onClick={handleBellClose}>
                  <ListItemText
                    primary={noti.title}
                    secondary={<span style={{ color: "#777" }}>{noti.time}</span>}
                  />
                </MenuItem>
              ))
            )}
          </Menu>
          {/* Avatar with dropdown menu for logout */}
          <IconButton color="inherit" onClick={handleAvatarClick} sx={{ ml: 1 }}>
            <Avatar sx={{ bgcolor: "#faa28a", width: 36, height: 36 }}>
              <AccountCircle sx={{ color: "#fff" }} />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorAvatar}
            open={Boolean(anchorAvatar)}
            onClose={handleAvatarClose}
            PaperProps={{
              sx: { minWidth: 150, mt: 1 }
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {/* Logout menu item */}
            <MenuItem onClick={() => { handleAvatarClose(); onLogout && onLogout(); }}>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;