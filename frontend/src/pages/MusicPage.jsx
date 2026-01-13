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
import { createMusic, findMusic, updateMusic, deleteMusic, listMusics, uploadAudio } from '../api/client';
import CommentSection from '../components/CommentSection';
import UserActionPropertiesSection from '../components/UserActionPropertiesSection';
import Pagination from '@mui/material/Pagination';
import * as mm from 'music-metadata-browser';

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
    description: '',
    singer_name: '',
    name: '',
    album: '',
    band: '',
    duration_ms: 0,
    mime_type: '',
    bitrate_kbps: 0,
    file_size: 0,
    hash_sha256: '',
    visit_count: 0,
    streamer_id: '',
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
      description: '',
      singer_name: '',
      name: '',
      album: '',
      band: '',
      duration_ms: 0,
      mime_type: '',
      bitrate_kbps: 0,
      file_size: 0,
      hash_sha256: '',
      visit_count: 0,
      streamer_id: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (music) => {
    setDialogMode('edit');
    setFormData({
      id: music.id,
      description: music.description,
      singer_name: music.singer_name,
      name: music.name || '',
      album: music.album || '',
      band: music.band || '',
      duration_ms: music.duration_ms || 0,
      mime_type: music.mime_type || '',
      bitrate_kbps: music.bitrate_kbps || 0,
      file_size: music.file_size || 0,
      hash_sha256: music.hash_sha256 || '',
      visit_count: music.visit_count || 0,
      streamer_id: music.streamer_id || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'duration_ms' || name === 'bitrate_kbps' || name === 'file_size' || name === 'visit_count') 
        ? (value === '' ? 0 : parseInt(value, 10)) 
        : value,
    }));
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const calculateFileHash = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration * 1000));
      });
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    try {
      // 1. 基础属性
      const fileSize = file.size;
      const mimeType = file.type;

      // 2. 计算哈希
      const hash = await calculateFileHash(file);

      // 3. 解析元数据
      let metadata;
      try {
        metadata = await mm.parseBlob(file);
      } catch (err) {
        console.warn('元数据解析失败:', err);
      }

      const common = metadata?.common || {};
      const format = metadata?.format || {};

      // 4. 获取时长 (如果 metadata 中没有，则使用 Audio 兜底)
      let durationMs = format.duration ? Math.round(format.duration * 1000) : 0;
      if (durationMs === 0) {
        durationMs = await getAudioDuration(file);
      }

      setFormData(prev => ({
        ...prev,
        name: common.title || prev.name || file.name.split('.')[0],
        singer_name: common.artist || common.artists?.[0] || prev.singer_name,
        album: common.album || prev.album,
        band: common.albumartist || prev.band,
        duration_ms: durationMs || prev.duration_ms,
        mime_type: mimeType || prev.mime_type,
        bitrate_kbps: format.bitrate ? Math.round(format.bitrate / 1000) : prev.bitrate_kbps,
        file_size: fileSize,
        hash_sha256: hash,
      }));

      showSnackbar('音频属性检测完成', 'success');
    } catch (error) {
      console.error('检测失败:', error);
      showSnackbar('自动检测部分属性失败', 'warning');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      let finalFormData = { ...formData };

      if (selectedFile) {
        setUploading(true);
        try {
          const uploadRes = await uploadAudio(selectedFile);
          if (uploadRes.body && uploadRes.body.id) {
            finalFormData.streamer_id = uploadRes.body.id;
            console.log('音频上传成功，ID:', uploadRes.body.id);
          } else {
            throw new Error('上传失败，未获取到音频ID');
          }
        } catch (error) {
          showSnackbar('音频上传失败: ' + error.message, 'error');
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      if (dialogMode === 'create') {
        await createMusic(finalFormData);
        showSnackbar('音乐创建成功', 'success');
      } else {
        await updateMusic(finalFormData);
        showSnackbar('音乐更新成功', 'success');
      }
      fetchMusic();
      handleCloseDialog();
      setSelectedFile(null); // 重置文件选择
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
    if (!music.streamer_id) {
      showSnackbar('该音乐尚未上传音频文件', 'warning');
      return;
    }
    
    setCurrentAudioUrl(`/streamer/audio?id=${music.streamer_id}`);
    
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
                    image={'https://via.placeholder.com/150'}
                    alt={music.id}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ color: '#1DB954' }}>
                      名称: {music.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      描述: {music.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      歌手姓名: {music.singer_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      专辑: {music.album}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                      乐队: {music.band}
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
              name="name"
              label="名称"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
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
              name="band"
              label="乐队"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.band}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  name="duration_ms"
                  label="时长 (ms)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.duration_ms}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  name="mime_type"
                  label="MIME 类型"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.mime_type}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  name="bitrate_kbps"
                  label="比特率 (kbps)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.bitrate_kbps}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  margin="dense"
                  name="file_size"
                  label="文件大小 (bytes)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.file_size}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            <TextField
              margin="dense"
              name="hash_sha256"
              label="SHA-256 哈希"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.hash_sha256}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#b3b3b3' }}>
                或者上传音频文件:
              </Typography>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                style={{ color: 'white' }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#b3b3b3' }} disabled={uploading}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={uploading}
              sx={{
                bgcolor: '#1DB954',
                '&:hover': {
                  bgcolor: '#1ed760',
                },
              }}
            >
              {uploading ? '上传中...' : '确定'}
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
