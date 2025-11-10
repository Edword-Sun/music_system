import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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
  Pagination,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import {
  listComments,
  createComment,
  updateComment,
  deleteComment,
} from '../api/client';

const CommentPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ content: '', music_id: '', user_id: '' });

  const [toast, setToast] = useState({ open: false, severity: 'success', text: '' });

  const load = async () => {
    try {
      const res = await listComments({
        page,
        page_size: pageSize,
        keyword,
      });
      if (res?.body) {
        setRows(res.body.list || []);
        setTotal(res.body.total || 0);
      }
    } catch (e) {
      showToast('加载失败', 'error');
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    load();
  }, [page, keyword, user]);

  const showToast = (text, severity = 'success') => {
    setToast({ open: true, text, severity });
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ content: '', music_id: '', user_id: user.id });
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({ content: row.content, music_id: row.music_id, user_id: row.user_id });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateComment({ id: editing.id, ...form });
        showToast('更新成功');
      } else {
        await createComment(form);
        showToast('创建成功');
      }
      setOpen(false);
      load();
    } catch (e) {
      showToast('保存失败', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除？')) return;
    try {
      await deleteComment({ id });
      showToast('删除成功');
      load();
    } catch (e) {
      showToast('删除失败', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">评论管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          新增评论
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="搜索音乐或用户关键字"
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={() => setPage(1)}>搜索</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>内容</TableCell>
              <TableCell>音乐ID</TableCell>
              <TableCell>用户ID</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.content}</TableCell>
                <TableCell>{r.music_id}</TableCell>
                <TableCell>{r.user_id}</TableCell>
                <TableCell>{new Date(r.create_time).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton color="primary" size="small" onClick={() => handleEdit(r)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(total / pageSize)}
          page={page}
          onChange={(_, p) => setPage(p)}
          color="primary"
        />
      </Box>

      {/* 新增/编辑弹窗 */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑评论' : '新增评论'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="评论内容"
            fullWidth
            multiline
            rows={3}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <TextField
            margin="dense"
            label="音乐ID"
            fullWidth
            value={form.music_id}
            onChange={(e) => setForm({ ...form, music_id: e.target.value })}
          />
          <TextField
            margin="dense"
            label="用户ID"
            fullWidth
            disabled
            value={form.user_id}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* 提示条 */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CommentPage;