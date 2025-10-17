import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { createMusic, updateMusic, deleteMusic, findMusic } from '../api/client';

const MusicPage = () => {
  const navigate = useNavigate();
  const [musics, setMusics] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    release_date: '',
    cover_url: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 打开创建音乐对话框
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      title: '',
      artist: '',
      album: '',
      genre: '',
      duration: '',
      release_date: '',
      cover_url: '',
    });
    setOpenDialog(true);
  };

  // 打开编辑音乐对话框
  const handleOpenEditDialog = (music) => {
    setDialogMode('edit');
    setSelectedMusic(music);
    setFormData({
      title: music.title,
      artist: music.artist,
      album: music.album,
      genre: music.genre,
      duration: music.duration,
      release_date: music.release_date,
      cover_url: music.cover_url,
    });
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMusic(null);
  };

  // 显示提示消息
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createMusic(formData);
        showSnackbar('音乐创建成功！');
      } else {
        await updateMusic(selectedMusic.id, formData);
        showSnackbar('音乐更新成功！');
      }
      handleCloseDialog();
      handleSearch();
    } catch (error) {
      showSnackbar(error.message || '操作失败，请重试', 'error');
    }
  };

  // 删除音乐
  const handleDelete = async (musicId) => {
    try {
      await deleteMusic(musicId);
      showSnackbar('音乐删除成功！');
      handleSearch();
    } catch (error) {
      showSnackbar(error.message || '删除失败，请重试', 'error');
    }
  };

  // 搜索音乐
  const handleSearch = async () => {
    try {
      const response = await findMusic({});
      setMusics(response.data || []);
    } catch (error) {
      showSnackbar(error.message || '搜索失败，请重试', 'error');
    }
  };

  // 组件加载时搜索音乐
  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', pb: 4 }}>
      <Container maxWidth="lg">
        {/* 顶部导航 */}
        <Box sx={{ pt: 2, pb: 4, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            音乐管理
          </Typography>
        </Box>

        {/* 操作区 */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">音乐列表</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{
                bgcolor: '#1DB954',
                '&:hover': {
                  bgcolor: '#1ed760',
                },
              }}
            >
              添加音乐
            </Button>
          </Box>

          <Grid container spacing={3}>
            {musics.map((music) => (
              <Grid item xs={12} sm={6} md={4} key={music.id}>
                <Card
                  sx={{
                    bgcolor: '#181818',
                    transition: '0.3s',
                    '&:hover': {
                      bgcolor: '#282828',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={music.cover_url || 'https://i.scdn.co/image/ab67616d0000b273f7f74100d5cc850e01172cbf'}
                    alt={music.title}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {music.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {music.artist}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      专辑：{music.album}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      流派：{music.genre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      时长：{music.duration}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <IconButton size="small" sx={{ color: 'white' }}>
                        <PlayArrowIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'white' }}>
                        <FavoriteIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'white' }}>
                        <ShareIcon />
                      </IconButton>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(music)}
                        sx={{ color: '#1DB954', mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(music.id)}
                        sx={{ color: '#ff5252' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 创建/编辑音乐对话框 */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              bgcolor: '#282828',
              color: 'white',
              minWidth: '400px',
            },
          }}
        >
          <DialogTitle>
            {dialogMode === 'create' ? '添加新音乐' : '编辑音乐'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="标题"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="artist"
              label="艺术家"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.artist}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="album"
              label="专辑"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.album}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="genre"
              label="流派"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.genre}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="duration"
              label="时长"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.duration}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="release_date"
              label="发行日期"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.release_date}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="dense"
              name="cover_url"
              label="封面图片 URL"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.cover_url}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#b3b3b3' }}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                bgcolor: '#1DB954',
                '&:hover': {
                  bgcolor: '#1ed760',
                },
              }}
            >
              确定
            </Button>
          </DialogActions>
        </Dialog>

        {/* 提示消息 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MusicPage;