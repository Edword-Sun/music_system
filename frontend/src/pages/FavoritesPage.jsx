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
import { AuthContext } from '../context/AuthContext';
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
  const { user } = useContext(AuthContext);
  const [favoriteMusics, setFavoriteMusics] = useState([]);
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

  useEffect(() => {
    if (user && user.id) {
      fetchFavoriteMusics();
    } else {
      setLoading(false);
      setError('请先登录以查看您的收藏。');
    }
  }, [user]);

  const fetchFavoriteMusics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await findUserActionProperties({
        user_id: user.id,
        collected: true,
      });
      if (response.message === '查找user_action_properties成功' && response.body) {
        const musicIds = response.body.map((uap) => uap.music_id);
        const musics = await Promise.all(
          musicIds.map(async (musicId) => {
            const musicResponse = await findMusic({ id: musicId });
            if (musicResponse.message === 'Success' && musicResponse.body) {
              return { ...musicResponse.body, uapId: response.body.find(uap => uap.music_id === musicId).id };
            }
            return null;
          })
        );
        setFavoriteMusics(musics.filter(Boolean));
      } else {
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
    setIsEditing(false);
    setCurrentMusic({
      id: '',
      name: '',
      artist: '',
      album: '',
      genre: '',
      source: '',
    });
    setDialogOpen(true);
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
        >
          添加音乐
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
                primary={music.name}
                secondary={`${music.artist} - ${music.album}`}
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