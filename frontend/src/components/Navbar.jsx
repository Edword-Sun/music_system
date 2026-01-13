import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}
          >
            极简音乐系统
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
