import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { PlayArrow as PlayArrowIcon, Favorite as FavoriteIcon, Share as ShareIcon, Edit as EditIcon, Delete as DeleteIcon, Star as StarIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { createMusic, findMusic, updateMusic, deleteMusic, listMusics } from '../api/client';
import CommentSection from '../components/CommentSection';
import UserActionPropertiesSection from '../components/UserActionPropertiesSection';
import Pagination from '@mui/material/Pagination';

const MusicPage = () => {
  const navigate = useNavigate();
  const [musicList, setMusicList] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); // Add sortOrder state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    content: '',
    play_time: '',
    singer_name: '',
    cover_url: '',
    source_url: '',
    visit_count: 0,
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
  }, [page, size, sortOrder]); // Add sortOrder to dependency array

  const fetchMusic = async () => {
    try {
      const response = await listMusics({
        page: page,
        size: size,
      });
      setMusicList(response.body.data || []);
      setTotal(response.body.total || 0);
    } catch (error) {
      showSnackbar(error.message || '获取音乐失败', 'error');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      id: '',
      title: '',
      description: '',
      content: '',
      play_time: '',
      singer_name: '',
      cover_url: '',
      source_url: '',
      visit_count: 0,
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (music) => {
    setDialogMode('edit');
    setFormData({
      id: music.id,
      title: music.title,
      description: music.description,
      content: music.content,
      play_time: music.play_time,
      singer_name: music.singer_name,
      cover_url: music.cover_url || '',
      source_url: music.source_url || '',
      visit_count: music.visit_count || 0,
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
      await deleteMusic(id);
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

  const [currentAudioUrl, setCurrentAudioUrl] = useState('');

  const handlePlayMusic = async (music) => {
    setCurrentAudioUrl(music.source_url || '');
    try {
      // 1. 获取最新音乐数据
      const response = await findMusic({ id: music.id });
      const latestMusic = response.body;
      if (latestMusic) {
        // 2. 点击次数加一
        const updatedMusic = {
          ...latestMusic,
          visit_count: (latestMusic.visit_count || 0) + 1
        };
        // 3. 修改
        await updateMusic(updatedMusic);
        // 刷新列表以显示新的点击次数
        fetchMusic();
      }
    } catch (error) {
      console.error('更新播放次数失败:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Container maxWidth="lg">
        <Box sx={{ pt: 1, pb: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: 'white', mr: 2 }}
            aria-label="返回首页"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1DB954', m: 0 }}>
            音乐管理
          </Typography>
        </Box>
        {currentAudioUrl && (
          <Box sx={{ mb: 2 }}>
            <audio src={currentAudioUrl} controls style={{ width: '100%' }} />
          </Box>
        )}
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
                      描述: {music.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      内容: {music.content}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      播放时长: {music.play_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      歌手姓名: {music.singer_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#1DB954', fontWeight: 'bold', mt: 1 }}>
                      播放次数: {music.visit_count || 0}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <IconButton size="small" sx={{ color: 'white' }} onClick={() => handlePlayMusic(music)}>
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(total / size)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                bgcolor: '#1DB954',
                color: 'white',
                '&:hover': {
                  bgcolor: '#1ed760',
                },
              },
            }}
          />
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
              name="description"
              label="描述"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="content"
              label="内容"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.content}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="play_time"
              label="播放时长"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.play_time}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="singer_name"
              label="歌手姓名"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.singer_name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="cover_url"
              label="封面URL"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.cover_url}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="source_url"
              label="音频URL"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.source_url}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
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
