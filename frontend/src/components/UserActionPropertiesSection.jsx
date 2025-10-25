import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { createUserActionProperties, findUserActionProperties, updateUserActionProperties } from '../api/client';

const UserActionPropertiesSection = ({ musicId, userId }) => {
  const [properties, setProperties] = useState({
    thumb: false,
    un_thumb: false,
    collected: false,
    share: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (musicId && userId) {
      fetchUserActionProperties();
    }
  }, [musicId, userId]);

  const fetchUserActionProperties = async () => {
    try {
      // Assuming findUserActionProperties can filter by musicId and userId
      const response = await findUserActionProperties({ music_id: musicId, user_id: userId });
      if (response.data && response.data.length > 0) {
        setProperties(response.data[0]); // Assuming only one set of properties per user/music
      } else {
        setProperties({
          thumb: false,
          un_thumb: false,
          collected: false,
          share: false,
        });
      }
    } catch (error) {
      showSnackbar(error.message || '获取用户操作属性失败', 'error');
    }
  };

  const handleCheckboxChange = async (event) => {
    const { name, checked } = event.target;
    const updatedProperties = { ...properties, [name]: checked };
    setProperties(updatedProperties);

    try {
      if (properties.id) {
        await updateUserActionProperties(properties.id, updatedProperties);
        showSnackbar('用户操作属性更新成功', 'success');
      } else {
        const newProperties = { ...updatedProperties, music_id: musicId, user_id: userId };
        await createUserActionProperties(newProperties);
        showSnackbar('用户操作属性创建成功', 'success');
        fetchUserActionProperties(); // Fetch again to get the ID of the newly created properties
      }
    } catch (error) {
      showSnackbar(error.message || '更新用户操作属性失败', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>用户操作</Typography>
      <FormControlLabel
        control={<Checkbox checked={properties.thumb} onChange={handleCheckboxChange} name="thumb" />}
        label="点赞"
      />
      <FormControlLabel
        control={<Checkbox checked={properties.un_thumb} onChange={handleCheckboxChange} name="un_thumb" />}
        label="踩"
      />
      <FormControlLabel
        control={<Checkbox checked={properties.collected} onChange={handleCheckboxChange} name="collected" />}
        label="收藏"
      />
      <FormControlLabel
        control={<Checkbox checked={properties.share} onChange={handleCheckboxChange} name="share" />}
        label="分享"
      />

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

export default UserActionPropertiesSection;