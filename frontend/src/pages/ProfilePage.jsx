import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { findUser, updateUser } from '../api/client';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    account: '',
    email: '',
    // password: '', // Not including password for now
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 假设用户ID为1，或者从其他地方获取
    const userId = 1; // 需要替换为实际用户ID
    fetchUser(userId);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userData.name,
      account: userData.account,
      email: userData.email,
    });
  };

  const handleSubmit = async () => {
    try {
      const updatedData = {
        id: userData.id,
        name: formData.name,
        account: formData.account,
        email: formData.email,
        // If password change is needed, handle separately
      };
      const response = await updateUser(updatedData);
      if (response.message === '更新用户成功') {
        setUserData(response.body);
        setIsEditing(false);
        localStorage.setItem('user', JSON.stringify(response.body));
        setSnackbar({
          open: true,
          message: '个人信息更新成功！',
          severity: 'success',
        });
      } else {
        throw new Error(response.body.error || '更新失败');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || '更新失败，请重试',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  if (!userData) {
    return (
      <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', pt: 8 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" align="center">
            请登录以查看和编辑个人信息
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              mt: 2,
              bgcolor: '#1DB954',
              '&:hover': { bgcolor: '#1ed760' },
            }}
          >
            去登录
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', pt: 8 }}>
      <Container maxWidth="sm">
        <Card sx={{ bgcolor: '#181818' }}>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              个人信息
            </Typography>
            <TextField
              fullWidth
              label="姓名"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              disabled={!isEditing}
            />
            <TextField
              fullWidth
              label="账号"
              name="account"
              value={formData.account}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              disabled={!isEditing}
            />
            <TextField
              fullWidth
              label="邮箱"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              disabled={!isEditing}
            />
            {isEditing ? (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    mt: 2,
                    bgcolor: '#1DB954',
                    '&:hover': { bgcolor: '#1ed760' },
                  }}
                >
                  保存
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleCancel}
                  sx={{ mt: 1, color: '#b3b3b3' }}
                >
                  取消
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={handleEdit}
                sx={{
                  mt: 2,
                  bgcolor: '#1DB954',
                  '&:hover': { bgcolor: '#1ed760' },
                }}
              >
                编辑
              </Button>
            )}
          </CardContent>
        </Card>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProfilePage;