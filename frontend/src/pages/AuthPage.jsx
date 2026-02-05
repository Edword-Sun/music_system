import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Tab, 
  Tabs,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock, 
  Face,
  MusicNote
} from '@mui/icons-material';
import { login, register } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: ''
  });

  const { login: setAuthData } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 0) { // Login
        const res = await login({
          username: formData.username,
          password: formData.password
        });
        if (res.body) {
          setAuthData(res.body);
          navigate('/');
        } else {
          setError(res.message || '登录失败');
        }
      } else { // Register
        const res = await register(formData);
        if (res.message === '注册成功') {
          // 注册成功后自动登录
          const loginRes = await login({
            username: formData.username,
            password: formData.password
          });
          if (loginRes.body) {
            setAuthData(loginRes.body);
            navigate('/');
          }
        } else {
          setError(res.message || '注册失败');
        }
      }
    } catch (err) {
      setError('连接服务器失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#F7F9FC',
        p: 2
      }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%', 
          maxSize: 400, 
          maxWidth: 400,
          p: 4, 
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '12px', 
              bgcolor: 'primary.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <MusicNote />
          </Box>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 900 }}>
            Music System
          </Typography>
        </Box>

        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          centered 
          sx={{ mb: 4 }}
        >
          <Tab label="登录" sx={{ fontWeight: 700 }} />
          <Tab label="注册" sx={{ fontWeight: 700 }} />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {tab === 1 && (
            <TextField
              fullWidth
              label="昵称"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Face color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          )}

          <TextField
            fullWidth
            label="密码"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ 
              mt: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              boxShadow: '0 8px 20px rgba(255, 118, 117, 0.3)'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (tab === 0 ? '立即登录' : '立即注册')}
          </Button>
        </form>

        <Button 
          fullWidth 
          variant="text" 
          onClick={() => navigate('/')}
          sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}
        >
          以游客身份继续
        </Button>
      </Paper>
    </Box>
  );
}
