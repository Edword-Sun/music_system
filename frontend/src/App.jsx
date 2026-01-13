import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';

// 明亮、轻快、俏皮的主题
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF7675', // 珊瑚粉，更俏皮
      light: '#FAB1A0',
      dark: '#E17055',
    },
    secondary: {
      main: '#00D2D3', // 更鲜艳的青蓝色
    },
    info: {
      main: '#54A0FF', // 明亮的蓝色
    },
    warning: {
      main: '#FF9F43', // 活泼的亮橙色/黄色
    },
    error: {
      main: '#FF6B6B', // 鲜艳的红色
    },
    background: {
      default: '#F7F9FC', // 极淡的蓝灰色背景
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
    },
  },
  shape: {
    borderRadius: 12, // 减小圆角弧度，从 20 调整为 12
  },
  typography: {
    fontFamily: '"Quicksand", "PingFang SC", "Microsoft YaHei", sans-serif',
    h5: {
      fontWeight: 800,
      letterSpacing: 0.5,
    },
    h6: {
      fontWeight: 800,
      letterSpacing: 0.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      borderRadius: 12,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          padding: '8px 20px',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(255, 118, 117, 0.25)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #FF7675 30%, #FAB1A0 90%)',
          color: '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 30px rgba(149, 157, 165, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          color: '#636E72',
          backgroundColor: '#F7F9FC',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: 'rgba(255, 118, 117, 0.08) !important',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 118, 117, 0.1)',
          },
        },
        colorPrimary: {
          '&:hover': {
            backgroundColor: 'rgba(255, 118, 117, 0.15)',
          },
        },
        colorSecondary: {
          '&:hover': {
            backgroundColor: 'rgba(116, 185, 255, 0.15)',
          },
        },
        colorError: {
          '&:hover': {
            backgroundColor: 'rgba(255, 118, 117, 0.15)',
          },
        },
        colorInfo: {
          '&:hover': {
            backgroundColor: 'rgba(116, 185, 255, 0.15)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* 兜底路由 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
