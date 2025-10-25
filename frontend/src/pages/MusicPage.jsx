import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, Favorite as FavoriteIcon, Share as ShareIcon, Edit as EditIcon, Delete as DeleteIcon, Star as StarIcon } from '@mui/icons-material';
import { createMusic, findMusic, updateMusic, deleteMusic } from '../api/client';
import CommentSection from '../components/CommentSection';
import UserActionPropertiesSection from '../components/UserActionPropertiesSection';

const MusicPage = () => {
  const [musicList, setMusicList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    id: '',
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

  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedMusicForComment, setSelectedMusicForComment] = useState(null);
  const [openUserActionPropertiesDialog, setOpenUserActionPropertiesDialog] = useState(false);
  const [selectedMusicForUserActionProperties, setSelectedMusicForUserActionProperties] = useState(null);

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const response = await findMusic({});
      setMusicList(response.data || []);
    } catch (error) {
      showSnackbar(error.message || '获取音乐失败', 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      id: '',
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

  const handleOpenEditDialog = (music) => {
    setDialogMode('edit');
    setFormData({
      id: music.id,
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createMusic(formData);
        showSnackbar('音乐创建成功', 'success');
      } else {
        await updateMusic(formData);
        showSnackbar('音乐更新成功', 'success');
      }
      fetchMusic();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.message || '操作失败', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMusic({ id });
      showSnackbar('音乐删除成功', 'success');
      fetchMusic();
    } catch (error) {
      showSnackbar(error.message || '删除失败', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 打开评论对话框
  const handleOpenCommentDialog = (music) => {
    setSelectedMusicForComment(music);
    setOpenCommentDialog(true);
  };

  // 关闭评论对话框
  const handleCloseCommentDialog = () => {
    setOpenCommentDialog(false);
    setSelectedMusicForComment(null);
  };

  // 打开用户操作属性对话框
  const handleOpenUserActionPropertiesDialog = (music) => {
    setSelectedMusicForUserActionProperties(music);
    setOpenUserActionPropertiesDialog(true);
  };

  // 关闭用户操作属性对话框
  const handleCloseUserActionPropertiesDialog = () => {
    setOpenUserActionPropertiesDialog(false);
    setSelectedMusicForUserActionProperties(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1DB954' }}>
          音乐管理
        </Typography>
        <Button
          variant="contained"
          sx={{
            mb: 3,
            bgcolor: '#1DB954',
            '&:hover': {
              bgcolor: '#1ed760',
            },
          }}
          onClick={handleOpenCreateDialog}
        >
          添加新音乐
        </Button>

        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {musicList.map((music) => (
              <Grid item key={music.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    backgroundColor: '#282828',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#3a3a3a',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={music.cover_url || 'https://via.placeholder.com/150'}
                    alt={music.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ color: '#1DB954' }}>
                      {music.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      {music.artist} - {music.album}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      流派: {music.genre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      时长: {music.duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      发行日期: {music.release_date}
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
                      <IconButton size="small" sx={{ color: 'white' }} onClick={() => handleOpenCommentDialog(music)}>
                        <ShareIcon /> {/* Using ShareIcon as a placeholder for comment icon */}
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'white' }} onClick={() => handleOpenUserActionPropertiesDialog(music)}>
                        <StarIcon /> {/* Placeholder icon for user action properties */}
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

        {/* 评论对话框 */}
        <Dialog
          open={openCommentDialog}
          onClose={handleCloseCommentDialog}
          PaperProps={{
            sx: {
              bgcolor: '#282828',
              color: 'white',
              minWidth: '400px',
            },
          }}
        >
          <DialogTitle>评论</DialogTitle>
          <DialogContent>
            {selectedMusicForComment && (
              <CommentSection musicId={selectedMusicForComment.id} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCommentDialog} sx={{ color: '#b3b3b3' }}>
              关闭
            </Button>
          </DialogActions>
        </Dialog>

        {/* 用户操作属性对话框 */}
        <Dialog
          open={openUserActionPropertiesDialog}
          onClose={handleCloseUserActionPropertiesDialog}
          PaperProps={{
            sx: {
              bgcolor: '#282828',
              color: 'white',
              minWidth: '400px',
            },
          }}
        >
          <DialogTitle>用户操作属性</DialogTitle>
          <DialogContent>
            {selectedMusicForUserActionProperties && (
              <UserActionPropertiesSection musicId={selectedMusicForUserActionProperties.id} userId="test_user_id" />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUserActionPropertiesDialog} sx={{ color: '#b3b3b3' }}>
              关闭
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