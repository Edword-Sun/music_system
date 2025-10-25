import React, { useState, useEffect } from 'react';
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
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { createUser, updateUser, deleteUser, findUser, listUsers } from '../api/client';

const UserPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    account: '',
    password: '',
    email: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 打开创建用户对话框
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      username: '',
      password: '',
      email: '',
    });
    setOpenDialog(true);
  };

  // 打开编辑用户对话框
  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
    });
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
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
        await createUser(formData);
        showSnackbar('用户创建成功！');
      } else {
        await updateUser(selectedUser.id, formData);
        showSnackbar('用户更新成功！');
      }
      handleCloseDialog();
      handleSearch();
    } catch (error) {
      showSnackbar(error.message || '操作失败，请重试', 'error');
    }
  };

  // 删除用户
  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      showSnackbar('用户删除成功！');
      handleSearch();
    } catch (error) {
      showSnackbar(error.message || '删除失败，请重试', 'error');
    }
  };

  // 搜索用户
  const handleSearch = async () => {
    try {
      const response = await listUsers();
      setUsers(response.body || []);
    } catch (error) {
      showSnackbar(error.message || '搜索失败，请重试', 'error');
    }
  };

  // 过滤用户列表
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 分页处理
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 组件加载时搜索用户
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
            用户管理
          </Typography>
        </Box>

        {/* 操作区 */}
        <Card sx={{ mb: 4, bgcolor: '#181818', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>用户列表</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{
                  bgcolor: '#1DB954',
                  '&:hover': {
                    bgcolor: '#1ed760',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                创建用户
              </Button>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#b3b3b3' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: '#282828',
                  borderRadius: 20,
                  mb: 3,
                },
              }}
            />
            <Divider sx={{ bgcolor: '#282828', my: 2 }} />
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#b3b3b3', fontWeight: 600 } }}>
                    <TableCell>ID</TableCell>
                    <TableCell>用户名</TableCell>
                    <TableCell>邮箱</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>更新时间</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            transition: 'background-color 0.2s',
                          },
                        }}
                      >
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.create_time).toLocaleString()}</TableCell>
                        <TableCell>{new Date(user.update_time).toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(user)}
                            sx={{ color: '#1DB954', '&:hover': { color: '#1ed760' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(user.id)}
                            sx={{ color: '#ff5252', '&:hover': { color: '#ff1744' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ color: '#b3b3b3' }}
              />
            </TableContainer>
          </CardContent>
        </Card>

        {/* 创建/编辑用户对话框 */}
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
            {dialogMode === 'create' ? '创建新用户' : '编辑用户'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="用户名"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="password"
              label="密码"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="邮箱"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
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

export default UserPage;