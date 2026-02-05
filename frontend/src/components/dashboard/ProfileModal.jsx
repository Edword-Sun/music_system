import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  PhotoCamera as PhotoCameraIcon,
  Face as FaceIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../api/client';

const ProfileModal = ({ open, onClose }) => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    nickname: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        avatar: user.avatar || ''
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!formData.nickname.trim()) {
      setError('昵称不能为空');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await updateUser({
        id: user.id,
        nickname: formData.nickname,
        avatar: formData.avatar
      });

      if (res.body) {
        // 更新本地存储的 token 和用户信息
        const token = localStorage.getItem('token');
        login({ token, ...res.body });
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(res.message || '更新失败');
      }
    } catch (err) {
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        编辑个人资料
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={formData.avatar} 
              sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {(formData.nickname || user?.username || 'U')[0].toUpperCase()}
            </Avatar>
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 15, 
                right: 0, 
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              size="small"
              component="label"
            >
              <PhotoCameraIcon fontSize="small" color="primary" />
              {/* 这里可以添加文件上传逻辑，现在先支持输入 URL */}
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {user?.username} (ID: {user?.id?.substring(0, 8)}...)
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>资料更新成功！</Alert>}

        <TextField
          fullWidth
          label="昵称"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: <FaceIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          label="头像 URL"
          name="avatar"
          value={formData.avatar}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          placeholder="请输入图片链接"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
          取消
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || success}
          sx={{ fontWeight: 700, px: 4 }}
        >
          {loading ? '保存中...' : '保存修改'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;
