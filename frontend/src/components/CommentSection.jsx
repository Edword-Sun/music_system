import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { createComment, findComment, deleteComment } from '../api/client';

const CommentSection = ({ musicId }) => {
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (musicId) {
      fetchComments();
    }
  }, [musicId]);

  const fetchComments = async () => {
    try {
      // Assuming findComment can filter by musicId
      const response = await findComment({ music_id: musicId });
      setComments(response.data || []);
    } catch (error) {
      showSnackbar(error.message || '获取评论失败', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!newCommentContent.trim()) {
      showSnackbar('评论内容不能为空', 'warning');
      return;
    }
    try {
      await createComment({
        music_id: musicId,
        user_id: 'current_user_id', // TODO: Replace with actual current user ID
        content: newCommentContent,
      });
      setNewCommentContent('');
      fetchComments();
      showSnackbar('评论添加成功！');
    } catch (error) {
      showSnackbar(error.message || '添加评论失败', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>评论</Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="添加评论..."
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          sx={{ mr: 1, bgcolor: '#181818', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '.MuiInputBase-input': { color: 'white' } }}
          InputLabelProps={{ style: { color: '#b3b3b3' } }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          sx={{
            bgcolor: '#1DB954',
            '&:hover': {
              bgcolor: '#1ed760',
            },
          }}
        >
          发布
        </Button>
      </Box>
      <List sx={{ bgcolor: '#181818', borderRadius: '8px', p: 2 }}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            暂无评论
          </Typography>
        ) : (
          comments.map((comment, index) => (
            <React.Fragment key={comment.id || index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ color: '#1DB954' }}>
                      {comment.user_id} {/* TODO: Display actual username */}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{ display: 'inline', color: 'white' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
              {index < comments.length - 1 && <Divider component="li" sx={{ bgcolor: '#333' }} />}
            </React.Fragment>
          ))
        )}
      </List>

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
    </Box>
  );
};

export default CommentSection;