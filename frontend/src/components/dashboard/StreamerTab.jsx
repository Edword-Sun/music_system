import React from 'react';
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Paper,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  GraphicEq as AudioIcon,
} from '@mui/icons-material';
import ThemeSelector from './ThemeSelector';

const StreamerTab = ({
  loading,
  uploading,
  streamerList,
  streamerSearch,
  setStreamerSearch,
  fetchStreamers,
  handleStreamerUpload,
  handleDeleteStreamer,
  getThemeColors,
  themes,
  itemTheme,
  setItemTheme,
  customColor,
  setCustomColor,
  cuteFont,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: getThemeColors().title }}>音乐流管理</Typography>
          <ThemeSelector 
            themes={themes} 
            itemTheme={itemTheme} 
            setItemTheme={setItemTheme} 
            customColor={customColor} 
            setCustomColor={setCustomColor} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="搜索音乐流名称..."
            value={streamerSearch}
            onChange={(e) => setStreamerSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchStreamers(streamerSearch);
              }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 3,
                backgroundColor: '#fff'
              } 
            }}
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchStreamers(streamerSearch)}>
            刷新
          </Button>
          <Button
            variant="contained"
            component="label"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            批量上传音频
            <input type="file" hidden accept="audio/*" multiple onChange={handleStreamerUpload} />
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : streamerList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  暂无音乐流
                </TableCell>
              </TableRow>
            ) : (
              streamerList.map((streamer) => (
                <TableRow key={streamer.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 118, 117, 0.08) !important' } }}>
                  <TableCell sx={{ 
                    color: getThemeColors().item, 
                    fontWeight: 700, 
                    fontSize: '0.85rem',
                    fontFamily: cuteFont
                  }}>{streamer.id.substring(0, 8)}...</TableCell>
                   <TableCell>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <AudioIcon sx={{ color: getThemeColors().item, fontSize: 18 }} />
                       <Typography variant="body2" sx={{ 
                         fontWeight: 600, 
                         color: getThemeColors().item,
                         fontFamily: cuteFont
                       }}>
                         {streamer.original_name}
                       </Typography>
                     </Box>
                   </TableCell>
                  <TableCell>
                    <Box component="span" sx={{ 
                      px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'secondary.light', color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                      fontFamily: cuteFont
                    }}>
                      {streamer.format.toUpperCase()}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                     color: 'text.secondary', 
                     fontSize: '0.85rem',
                     fontWeight: 700,
                     fontFamily: cuteFont
                   }}>{streamer.storage_path}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleDeleteStreamer(streamer.id)} 
                      sx={{ 
                        bgcolor: 'error.main', 
                        color: '#fff',
                        '&:hover': { 
                          bgcolor: 'error.dark',
                          transform: 'scale(1.1)'
                        },
                        boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)',
                        transition: 'all 0.2s'
                      }}
                    >
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
  );
};

export default StreamerTab;
