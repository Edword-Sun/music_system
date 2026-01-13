import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  listMusics,
  createMusic,
  updateMusic,
  deleteMusic,
  listMusicHistories,
  deleteMusicHistory,
  addMusicHistory,
  uploadAudio,
  getAudioUrl,
  listStreamers,
  deleteStreamer,
} from '../api/client';

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [musicList, setMusicList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [streamerList, setStreamerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    singer_name: '',
    album: '',
    band: '',
    streamer_id: '',
  });
  const [uploading, setUploading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchMusic();
    } else if (tabValue === 1) {
      fetchHistory();
    } else {
      fetchStreamers();
    }
  }, [tabValue]);

  const fetchMusic = async () => {
    setLoading(true);
    try {
      const res = await listMusics({ page: 1, size: 100 });
      setMusicList(res.body.data || []);
    } catch (error) {
      showSnackbar('获取音乐列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await listMusicHistories({ page: 1, size: 100 });
      setHistoryList(res.body.data || []);
    } catch (error) {
      showSnackbar('获取历史记录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamers = async () => {
    setLoading(true);
    try {
      const res = await listStreamers({ page: 1, size: 100 });
      setStreamerList(res.body.data || []);
    } catch (error) {
      showSnackbar('获取 Streamer 列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setFormData({ id: '', name: '', singer_name: '', album: '', band: '', streamer_id: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (music) => {
    setDialogMode('edit');
    setFormData({
      id: music.id,
      name: music.name || '',
      singer_name: music.singer_name || '',
      album: music.album || '',
      band: music.band || '',
      streamer_id: music.streamer_id || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAudio(file);
      if (res.body && res.body.id) {
        setFormData({ ...formData, streamer_id: res.body.id });
        showSnackbar('文件上传成功');
      } else {
        showSnackbar('上传失败：未返回 ID', 'error');
      }
    } catch (error) {
      showSnackbar('上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createMusic(formData);
        showSnackbar('添加成功');
      } else {
        await updateMusic(formData);
        showSnackbar('更新成功');
      }
      fetchMusic();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('操作失败', 'error');
    }
  };

  const handleDeleteMusic = async (id) => {
    if (window.confirm('确定要删除这首歌吗？')) {
      try {
        await deleteMusic(id);
        showSnackbar('删除成功');
        fetchMusic();
      } catch (error) {
        showSnackbar('删除失败', 'error');
      }
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteMusicHistory(id);
      showSnackbar('删除成功');
      fetchHistory();
    } catch (error) {
      showSnackbar('删除失败', 'error');
    }
  };

  const handleDeleteStreamer = async (id) => {
    if (window.confirm('确定要删除这个 Streamer 吗？')) {
      try {
        await deleteStreamer(id);
        showSnackbar('删除成功');
        fetchStreamers();
      } catch (error) {
        showSnackbar('删除失败', 'error');
      }
    }
  };

  const handleStreamerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAudio(file);
      if (res.body && res.body.id) {
        showSnackbar('Streamer 创建成功，ID: ' + res.body.id);
        if (tabValue === 2) {
          fetchStreamers();
        }
      } else {
        showSnackbar('创建失败：未返回 ID', 'error');
      }
    } catch (error) {
      showSnackbar('创建失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const playMusic = async (music) => {
    const url = getAudioUrl(music.streamer_id);
    if (!url) {
      showSnackbar('音频文件不存在', 'error');
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(url);
    audio.play().catch(e => showSnackbar('播放失败', 'error'));
    setCurrentAudio(audio);

    // 记录播放历史
    try {
      await addMusicHistory({ music_id: music.id });
    } catch (error) {
      console.error('记录历史失败', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="音乐库" />
          <Tab label="播放历史" />
          <Tab label="Streamers" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">音乐管理</Typography>
            <Box>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMusic} sx={{ mr: 1 }}>
                刷新
              </Button>
              <Button variant="contained" startIcon={<UploadIcon />} onClick={handleOpenCreate}>
                新增音乐
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>歌名</TableCell>
                  <TableCell>歌手</TableCell>
                  <TableCell>专辑</TableCell>
                  <TableCell>乐队</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                ) : musicList.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">暂无音乐</TableCell></TableRow>
                ) : (
                  musicList.map((music) => (
                    <TableRow key={music.id}>
                      <TableCell>{music.name}</TableCell>
                      <TableCell>{music.singer_name}</TableCell>
                      <TableCell>{music.album}</TableCell>
                      <TableCell>{music.band}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => playMusic(music)}>
                          <PlayArrowIcon />
                        </IconButton>
                        <IconButton color="info" onClick={() => handleOpenEdit(music)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteMusic(music.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">最近播放</Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchHistory}>
              刷新
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>音乐 ID</TableCell>
                  <TableCell>播放时间</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
                ) : historyList.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">暂无历史记录</TableCell></TableRow>
                ) : (
                  historyList.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.music_id}</TableCell>
                      <TableCell>{new Date(history.create_time).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => handleDeleteHistory(history.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Streamer 管理</Typography>
            <Box>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStreamers} sx={{ mr: 1 }}>
                刷新
              </Button>
              <Button
                variant="contained"
                component="label"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                创建 Streamer
                <input type="file" hidden accept="audio/*" onChange={handleStreamerUpload} />
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>原始文件名</TableCell>
                  <TableCell>格式</TableCell>
                  <TableCell>存储路径</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                ) : streamerList.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">暂无 Streamer</TableCell></TableRow>
                ) : (
                  streamerList.map((streamer) => (
                    <TableRow key={streamer.id}>
                      <TableCell>{streamer.id}</TableCell>
                      <TableCell>{streamer.original_name}</TableCell>
                      <TableCell>{streamer.format}</TableCell>
                      <TableCell>{streamer.storage_path}</TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => handleDeleteStreamer(streamer.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 新增/编辑对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? '新增音乐' : '编辑音乐'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="歌名"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              name="singer_name"
              label="歌手"
              fullWidth
              value={formData.singer_name}
              onChange={handleInputChange}
            />
            <TextField
              name="album"
              label="专辑"
              fullWidth
              value={formData.album}
              onChange={handleInputChange}
            />
            <TextField
              name="band"
              label="乐队"
              fullWidth
              value={formData.band}
              onChange={handleInputChange}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                name="streamer_id"
                label="音频 ID"
                fullWidth
                disabled
                value={formData.streamer_id}
              />
              <Button
                variant="contained"
                component="label"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                上传
                <input type="file" hidden accept="audio/*" onChange={handleFileUpload} />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.streamer_id}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
