import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
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
  TextField,
  Snackbar,
  Alert,
  Pagination,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  listMusicHistories,
  addMusicHistory,
  updateMusicHistory,
  deleteMusicHistory,
  listMusics,
} from '../api/client';

export default function MusicHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [onlyMine, setOnlyMine] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', music_id: '', user_id: '' });
  const [musics, setMusics] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const startMs = useMemo(() => (startTime ? new Date(startTime).getTime() : 0), [startTime]);
  const endMs = useMemo(() => (endTime ? new Date(endTime).getTime() : 0), [endTime]);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const load = async () => {
    try {
      const params = {
        page,
        size: pageSize,
        start_time: startMs || 0,
        end_time: endMs || 0,
      };
      if (onlyMine && user?.id) params.user_ids = [user.id];
      const res = await listMusicHistories(params);
      const body = res?.body;
      setRows(body?.data || []);
      setTotal(body?.total || 0);
    } catch (e) {
      showSnackbar(e?.message || '加载失败', 'error');
    }
  };

  const loadMusics = async () => {
    try {
      const resp = await listMusics({ page: 1, size: 50 });
      setMusics(resp?.body?.data || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    load();
  }, [page, pageSize, onlyMine, startMs, endMs]);

  const handleOpenCreate = () => {
    setDialogMode('create');
    setEditingRow(null);
    setForm({ title: '', description: '', music_id: '', user_id: user?.id || '' });
    setOpenDialog(true);
    loadMusics();
  };

  const handleOpenEdit = (row) => {
    setDialogMode('edit');
    setEditingRow(row);
    setForm({ id: row.id, title: row.title || '', description: row.description || '', music_id: row.music_id || '', user_id: row.user_id || '' });
    setOpenDialog(true);
    loadMusics();
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        const payload = { title: form.title, description: form.description, music_id: form.music_id, user_id: user?.id || form.user_id };
        const resp = await addMusicHistory(payload);
        const msg = resp?.message || '添加成功';
        showSnackbar(msg, 'success');
      } else {
        const payload = { id: form.id, title: form.title, description: form.description, music_id: form.music_id, user_id: form.user_id };
        const resp = await updateMusicHistory(payload);
        const msg = resp?.message || '更新成功';
        showSnackbar(msg, 'success');
      }
      setOpenDialog(false);
      load();
    } catch (e) {
      showSnackbar(e?.message || '保存失败', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const resp = await deleteMusicHistory(id);
      const msg = resp?.message || '删除成功';
      showSnackbar(msg, 'success');
      load();
    } catch (e) {
      showSnackbar(e?.message || '删除失败', 'error');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Container maxWidth="lg">
        <Box sx={{ pt: 1, pb: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white', mr: 2 }} aria-label="返回首页">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1DB954', m: 0 }}>
            音乐历史
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Checkbox checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />}
                label="只看我的"
              />
              <TextField
                label="开始时间"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="结束时间"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1ed760' } }}
                onClick={() => setPage(1)}
              >
                搜索
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1ed760' } }}
                onClick={handleOpenCreate}
              >
                添加历史
              </Button>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>标题</TableCell>
                <TableCell>详情</TableCell>
                <TableCell>音乐ID</TableCell>
                <TableCell>用户ID</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>更新时间</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>{r.music_id}</TableCell>
                  <TableCell>{r.user_id}</TableCell>
                  <TableCell>{new Date(r.create_time).toLocaleString()}</TableCell>
                  <TableCell>{new Date(r.update_time).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(r)} sx={{ color: '#1DB954', '&:hover': { color: '#1ed760' } }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(r.id)} sx={{ color: '#ff5252', '&:hover': { color: '#ff1744' } }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.max(1, Math.ceil(total / pageSize))} page={page} onChange={(_, val) => setPage(val)} />
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperProps={{ sx: { bgcolor: '#282828', color: 'white', minWidth: '420px' } }}
        >
          <DialogTitle>{dialogMode === 'create' ? '添加历史' : '编辑历史'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="标题"
              type="text"
              fullWidth
              variant="outlined"
              value={form.title}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="详情"
              type="text"
              fullWidth
              variant="outlined"
              value={form.description}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="music_id"
              label="音乐ID"
              type="text"
              fullWidth
              variant="outlined"
              value={form.music_id}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              placeholder={musics.length ? '可从下方列表选择一个音乐ID' : ''}
            />
            {musics.length > 0 && (
              <Box sx={{ maxHeight: 160, overflow: 'auto', border: '1px solid #333', borderRadius: 1, p: 1 }}>
                {musics.map((m) => (
                  <Box
                    key={m.id}
                    sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, cursor: 'pointer', '&:hover': { bgcolor: '#333' } }}
                    onClick={() => setForm((prev) => ({ ...prev, music_id: m.id }))}
                  >
                    <Typography variant="body2">{m.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#b3b3b3' }}>{m.id}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: '#b3b3b3' }}>取消</Button>
            <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1ed760' } }}>保存</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar}>
          <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

