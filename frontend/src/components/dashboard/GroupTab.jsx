import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  GraphicEq as AudioIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ThemeSelector from './ThemeSelector';

const GroupTab = ({
  loading,
  groupList,
  musicList,
  fetchGroups,
  handleOpenCreateGroup,
  handleViewGroup,
  handleOpenEditGroup,
  handleDeleteGroup,
  playMusic,
  getThemeColors,
  themes,
  itemTheme,
  setItemTheme,
  customColor,
  setCustomColor,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: getThemeColors().title }}>音乐合集</Typography>
          <ThemeSelector 
            themes={themes} 
            itemTheme={itemTheme} 
            setItemTheme={setItemTheme} 
            customColor={customColor} 
            setCustomColor={setCustomColor} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchGroups}>
            刷新
          </Button>
          <Button variant="contained" startIcon={<AudioIcon />} onClick={handleOpenCreateGroup}>
            创建新合集
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
        {loading ? (
          <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : groupList.length === 0 ? (
          <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">暂无合集，去创建一个吧！</Typography>
          </Box>
        ) : (
          groupList.map((group) => {
            let musicIds = [];
            try {
              musicIds = JSON.parse(group.content || '[]');
            } catch (e) {
              console.error('解析合集内容失败', e);
            }
            
            return (
              <Paper 
                key={group.id} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  border: '2px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 220,
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                    borderColor: getThemeColors().item
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleViewGroup(group)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 3, 
                    bgcolor: 'rgba(255, 118, 117, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <AudioIcon sx={{ color: getThemeColors().item, fontSize: 32 }} />
                  </Box>
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#2D3436' }}>
                  {group.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>
                  {musicIds.length} 首音乐
                </Typography>
                
                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ mb: 2, opacity: 0.5 }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained"
                      size="small" 
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const ids = JSON.parse(group.content || '[]');
                        const groupQueue = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);
                        if (groupQueue.length > 0) {
                          playMusic(groupQueue[0], groupQueue);
                        }
                      }}
                      sx={{ 
                        bgcolor: getThemeColors().item,
                        '&:hover': { bgcolor: getThemeColors().item, opacity: 0.9 },
                        fontWeight: 700,
                        borderRadius: 2
                      }}
                    >
                      播放
                    </Button>
                    <Tooltip title="编辑">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditGroup(group); }}
                        sx={{ 
                          minWidth: 40,
                          px: 1,
                          borderRadius: 2,
                          color: 'primary.main',
                          borderColor: 'divider'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="删除">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}
                        sx={{ 
                          minWidth: 40,
                          px: 1,
                          borderRadius: 2,
                          color: 'error.main',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'error.main',
                            bgcolor: 'rgba(214, 48, 49, 0.05)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default GroupTab;
