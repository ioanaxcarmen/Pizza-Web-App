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

// Thông báo giả
const dummyNotifications = [
  { id: 1, title: "New order received", time: "2 minutes ago" },
  { id: 2, title: "Stock level low", time: "10 minutes ago" },
  { id: 3, title: "Pizza of the month updated", time: "1 hour ago" }
];

function TopBar({ title = "", onLogout, onMenuClick }) {
  // State cho dropdown chuông
  const [anchorBell, setAnchorBell] = useState(null);
  // State cho dropdown avatar
  const [anchorAvatar, setAnchorAvatar] = useState(null);

  // Mở đóng menu bell
  const handleBellClick = (event) => setAnchorBell(event.currentTarget);
  const handleBellClose = () => setAnchorBell(null);

  // Mở đóng menu avatar
  const handleAvatarClick = (event) => setAnchorAvatar(event.currentTarget);
  const handleAvatarClose = () => setAnchorAvatar(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        background: "linear-gradient(90deg, #faa28a 0%, #fff 100%)",
        color: "#232a37",
        boxShadow: "0 2px 8px rgba(35,42,55,0.04)"
      }}
      elevation={1}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 68 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" sx={{ display: { md: 'none' } }} onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
              {title}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Bell icon với dropdown */}
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
          {/* Avatar với menu logout */}
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