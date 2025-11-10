import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  findUserActionProperties,
  deleteUserActionProperties,
  createMusic,
  updateMusic,
  deleteMusic,
  listMusics,
  findMusic,
  createUserActionProperties,
  updateUserActionProperties,
} from '../api/client';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favoriteMusics, setFavoriteMusics] = useState([]);
  const [uapList, setUapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState({
    id: '',
    name: '',
    artist: '',
    album: '',
    genre: '',
    source: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState(null);
  // 选择目录添加收藏相关状态
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [libraryList, setLibraryList] = useState([]);
  const [librarySearch, setLibrarySearch] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchFavoriteMusics();
    } else {
      setLoading(false);
      setError('请重新登录以完善用户信息（缺少用户ID）。');
    }
  }, [user]);

  const fetchFavoriteMusics = async () => {
    setLoading(true);
    setError('');
    try {
      // 获取用户ID（必须存在）
      const userId = user.id;
      if (!userId) throw new Error('缺少用户ID');
      const response = await findUserActionProperties({
        user_id: userId,
        collected: true,
      });
      if (response.message === '查找user_action_properties成功' && response.body) {
        const uaps = response.body || [];
        setUapList(uaps);
        const musics = await Promise.all(
          uaps.map(async (uap) => {
            try {
              const musicResponse = await findMusic({ id: uap.music_id });
              // 后端成功时 message 可能为空字符串，这里以是否有 body 作为成功判定
              if (musicResponse && musicResponse.body) {
                return { ...musicResponse.body, uapId: uap.id };
              }
              // 音乐详情不存在时，使用占位信息保证也能展示一条记录
              return { id: uap.music_id, title: '未知音乐', singer_name: '', uapId: uap.id, __placeholder: true };
            } catch {
              return { id: uap.music_id, title: '未知音乐', singer_name: '', uapId: uap.id, __placeholder: true };
            }
          })
        );
        setFavoriteMusics(musics);
      } else {
        setUapList([]);
        setFavoriteMusics([]);
      }
    } catch (err) {
      console.error('获取收藏音乐失败:', err);
      setError('获取收藏音乐失败。');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (uapId) => {
    try {
      const response = await deleteUserActionProperties({ id: uapId });
      if (response.message === '删除user_action_properties成功') {
        setSnackbarMessage('已从收藏中移除。');
        setSnackbarOpen(true);
        fetchFavoriteMusics(); // Refresh the list
      } else {
        setError(response.message || '移除收藏失败。');
      }
    } catch (err) {
      console.error('移除收藏失败:', err);
      setError('移除收藏失败。');
    }
  };

  const handleAddMusic = () => {
    // 改为从目录选择添加收藏
    openSelectDialog();
  };

  const handleEditMusic = (music) => {
    setIsEditing(true);
    setCurrentMusic(music);
    setDialogOpen(true);
  };

  const handleDeleteMusic = (music) => {
    setMusicToDelete(music);
    setDeleteConfirmOpen(true);
  };

  const openSelectDialog = async () => {
    setSelectDialogOpen(true);
    setLibraryLoading(true);
    setLibraryError('');
    try {
      const resp = await listMusics({ page: 1, size: 50 });
      const list = resp?.body?.data || [];
      setLibraryList(list);
    } catch (e) {
      setLibraryError(e?.message || '加载音乐目录失败');
    } finally {
      setLibraryLoading(false);
    }
  };

  const closeSelectDialog = () => {
    setSelectDialogOpen(false);
    setLibrarySearch('');
  };

  const addFavoriteFromLibrary = async (musicId) => {
    try {
      const userId = user.id;
      if (!userId) {
        setError('缺少用户ID，请重新登录后再试。');
        return;
      }
      const resp = await createUserActionProperties({
        user_id: userId,
        music_id: musicId,
        collected: true,
      });
      if (resp?.message && resp.message.includes('创建user_action_properties成功')) {
        setSnackbarMessage('已加入收藏');
        setSnackbarOpen(true);
        closeSelectDialog();
        fetchFavoriteMusics();
      } else {
        setError(resp?.message || '加入收藏失败');
      }
    } catch (e) {
      setError(e?.message || '加入收藏失败');
    }
  };

  const confirmDeleteMusic = async () => {
    try {
      const response = await deleteMusic(musicToDelete.id);
      if (response.message === '删除音乐成功') {
        setSnackbarMessage('音乐删除成功。');
        setSnackbarOpen(true);
        fetchFavoriteMusics(); // Refresh the list
      } else {
        setError(response.message || '音乐删除失败。');
      }
    } catch (err) {
      console.error('删除音乐失败:', err);
      setError('删除音乐失败。');
    } finally {
      setDeleteConfirmOpen(false);
      setMusicToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentMusic({
      id: '',
      name: '',
      artist: '',
      album: '',
      genre: '',
      source: '',
    });
  };

  const handleMusicFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentMusic((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveMusic = async () => {
    try {
      if (isEditing) {
        const response = await updateMusic(currentMusic);
        if (response.message === '更新音乐成功') {
          setSnackbarMessage('音乐更新成功。');
          setSnackbarOpen(true);
          fetchFavoriteMusics(); // Refresh the list
        } else {
          setError(response.message || '音乐更新失败。');
        }
      } else {
        const response = await createMusic(currentMusic);
        if (response.message === '创建音乐成功') {
          setSnackbarMessage('音乐创建成功。');
          setSnackbarOpen(true);
          fetchFavoriteMusics(); // Refresh the list
        } else {
          setError(response.message || '音乐创建失败。');
        }
      }
      handleDialogClose();
    } catch (err) {
      console.error('保存音乐失败:', err);
      setError('保存音乐失败。');
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mt={4} mb={2}>
        <IconButton onClick={() => navigate('/')} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ ml: 1, flexGrow: 1 }}>
          我的收藏
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddMusic}
          sx={{ mr: 2 }}
        >
          从目录选择添加
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && favoriteMusics.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          您还没有收藏任何音乐。
        </Alert>
      )}

      {!loading && !error && favoriteMusics.length > 0 && (
        <List>
          {favoriteMusics.map((music) => (
            <ListItem key={music.id} divider>
              <ListItemText
                primary={music.title || music.name || `ID: ${music.id}`}
                secondary={
                  (music.singer_name || music.artist || '') +
                  (music.album ? ` - ${music.album}` : '')
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditMusic(music)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteMusic(music)}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="remove-favorite"
                  onClick={() => handleRemoveFavorite(music.uapId)}
                >
                  <DeleteIcon color="secondary" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* 从目录选择添加收藏的对话框 */}
      <Dialog
        open={selectDialogOpen}
        onClose={closeSelectDialog}
        PaperProps={{
          sx: { bgcolor: '#282828', color: 'white', minWidth: '520px' },
        }}
      >
        <DialogTitle>选择音乐加入收藏</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="搜索标题或歌手..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {libraryLoading && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          )}

          {libraryError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {libraryError}
            </Alert>
          )}

          {!libraryLoading && !libraryError && (
            <List>
              {(libraryList || [])
                .filter((m) => {
                  const q = librarySearch.trim().toLowerCase();
                  if (!q) return true;
                  const t = (m.title || '').toLowerCase();
                  const s = (m.singer_name || '').toLowerCase();
                  return t.includes(q) || s.includes(q);
                })
                .map((m) => {
                  const alreadyFav = favoriteMusics.some((fm) => fm.id === m.id);
                  return (
                    <ListItem key={m.id} divider>
                      <ListItemText
                        primary={m.title || '未命名'}
                        secondary={m.singer_name ? `歌手：${m.singer_name}` : undefined}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={alreadyFav}
                          onClick={() => addFavoriteFromLibrary(m.id)}
                        >
                          {alreadyFav ? '已在收藏' : '加入收藏'}
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSelectDialog} sx={{ color: '#b3b3b3' }}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{isEditing ? '编辑音乐' : '添加音乐'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="音乐名称"
            type="text"
            fullWidth
            variant="standard"
            value={currentMusic.name}
            onChange={handleMusicFormChange}
          />
          <TextField
            margin="dense"
            name="artist"
            label="艺术家"
            type="text"
            fullWidth
            variant="standard"
            value={currentMusic.artist}
            onChange={handleMusicFormChange}
          />
          <TextField
            margin="dense"
            name="album"
            label="专辑"
            type="text"
            fullWidth
            variant="standard"
            value={currentMusic.album}
            onChange={handleMusicFormChange}
          />
          <TextField
            margin="dense"
            name="genre"
            label="流派"
            type="text"
            fullWidth
            variant="standard"
            value={currentMusic.genre}
            onChange={handleMusicFormChange}
          />
          <TextField
            margin="dense"
            name="source"
            label="来源"
            type="text"
            fullWidth
            variant="standard"
            value={currentMusic.source}
            onChange={handleMusicFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>取消</Button>
          <Button onClick={handleSaveMusic}>{isEditing ? '保存' : '添加'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            您确定要删除音乐 "{musicToDelete?.name}" 吗？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={confirmDeleteMusic} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FavoritesPage;