import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: '首页', path: '/' },
    { label: '个人资料', path: '/profile' },
    { label: '用户管理', path: '/user/list' },
    { label: '音乐', path: '/music/list' },
  ];

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#181818' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: '#1DB954' }}>
          音乐系统
        </Typography>
        {menuItems.map((item) => (
          <Button key={item.label} color="inherit" onClick={() => navigate(item.path)}>
            {item.label}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;