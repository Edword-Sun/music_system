import React from 'react';
import { 
  Drawer, Box, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, IconButton, Tooltip 
} from '@mui/material';
import {
  LibraryMusic as MusicIcon,
  History as HistoryIcon,
  GraphicEq as AudioIcon,
  Favorite as FavoriteIcon,
  Assessment as BarChartIcon,
  SettingsVoice as StreamerIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

const Sidebar = ({ 
  open, 
  onToggle, 
  tabValue, 
  setTabValue, 
  drawerWidth, 
  collapsedDrawerWidth 
}) => {
  const menuItems = [
    { label: '音乐库', icon: <MusicIcon />, value: 0 },
    { label: '我的收藏', icon: <FavoriteIcon sx={{ color: '#FF7675' }} />, value: 4 },
    { label: '音乐合集', icon: <AudioIcon />, value: 3 },
    { label: '播放历史', icon: <HistoryIcon />, value: 1 },
    { label: '播放统计', icon: <BarChartIcon />, value: 5 },
    { label: '音乐流', icon: <StreamerIcon />, value: 2 },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedDrawerWidth,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedDrawerWidth,
          transition: 'width 0.3s',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          borderRight: 'none',
          backgroundColor: '#fff',
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center' }}>
        {open && (
          <Typography variant="h6" sx={{ 
            fontWeight: 800, 
            background: 'linear-gradient(45deg, #FF7675 30%, #FAB1A0 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 1
          }}>
            MUSIC POP
          </Typography>
        )}
        <IconButton onClick={onToggle} sx={{ backgroundColor: '#F7F9FC' }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Box sx={{ px: 2, mt: 2 }}>
        <List sx={{ '& .MuiListItem-root': { mb: 1 } }}>
          {menuItems.map((item) => (
            <ListItem key={item.value} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={!open ? item.label : ''} placement="right">
                <ListItemButton
                  selected={tabValue === item.value}
                  onClick={() => setTabValue(item.value)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 3,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#fff',
                      },
                    },
                    '&:hover:not(.Mui-selected)': {
                      backgroundColor: 'rgba(255, 118, 117, 0.12)',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: tabValue === item.value ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ 
                        fontWeight: tabValue === item.value ? 800 : 600,
                        fontSize: '0.95rem'
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
