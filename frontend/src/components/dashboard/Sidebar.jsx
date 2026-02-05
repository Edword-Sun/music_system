import React from 'react';
import { 
  Drawer, Box, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, IconButton, Tooltip,
  Avatar, Divider
} from '@mui/material';
import {
  LibraryMusic as MusicIcon,
  History as HistoryIcon,
  GraphicEq as AudioIcon,
  Favorite as FavoriteIcon,
  Assessment as BarChartIcon,
  SettingsVoice as StreamerIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';

const Sidebar = ({ 
  open, 
  onToggle, 
  tabValue, 
  setTabValue, 
  drawerWidth, 
  collapsedDrawerWidth 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const isGuest = user?.role === 'guest';

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
          display: 'flex',
          flexDirection: 'column'
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

      <Box sx={{ px: 2, mt: 2, flexGrow: 1 }}>
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

      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: open ? 'flex-start' : 'center',
            px: open ? 1 : 0,
            mb: 1
          }}
        >
          <Tooltip title={!open ? (isGuest ? '未登录' : user?.nickname || user?.username) : ''} placement="right">
            <Avatar 
              src={user?.avatar} 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: isGuest ? '#dfe6e9' : 'primary.main',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              {isGuest ? '?' : (user?.nickname || user?.username || 'U')[0].toUpperCase()}
            </Avatar>
          </Tooltip>
          {open && (
            <Box sx={{ ml: 1.5, overflow: 'hidden', flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, noWrap: true }}>
                {isGuest ? '游客模式' : (user?.nickname || user?.username)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {isGuest ? '登录体验更多功能' : (user?.role === 'admin' ? '管理员' : '普通用户')}
              </Typography>
            </Box>
          )}
          {open && !isGuest && (
            <IconButton size="small" onClick={() => setProfileOpen(true)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
        
        <Tooltip title={!open ? (isGuest ? '登录' : '退出登录') : ''} placement="right">
          <ListItemButton
            onClick={() => isGuest ? navigate('/auth') : logout()}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              borderRadius: 3,
              color: isGuest ? 'primary.main' : 'text.secondary',
              '&:hover': {
                backgroundColor: isGuest ? 'rgba(255, 118, 117, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
                color: 'inherit'
              }}
            >
              {isGuest ? <LoginIcon /> : <LogoutIcon />}
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary={isGuest ? '立即登录' : '退出登录'} 
                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} 
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>

      <ProfileModal 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </Drawer>
  );
};

export default Sidebar;
