import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  GraphicEq as AudioIcon,
  LibraryMusic as MusicIcon,
} from '@mui/icons-material';
import ThemeSelector from './ThemeSelector';

const FavoriteTab = ({
  favoriteGroup,
  musicList,
  currentMusic,
  isPlaying,
  playMusic,
  handleToggleFavorite,
  fetchGroups,
  updateGroup,
  showSnackbar,
  getThemeColors,
  themes,
  itemTheme,
  setItemTheme,
  customColor,
  setCustomColor,
  pulseKeyframes,
  setTabValue,
}) => {
  const ids = favoriteGroup ? JSON.parse(favoriteGroup.content || '[]') : [];
  const favoriteMusics = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: 3, 
            bgcolor: 'rgba(255, 118, 117, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <FavoriteIcon sx={{ color: '#FF7675', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: getThemeColors().title, fontWeight: 800 }}>我的收藏</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {favoriteMusics.length} 首收藏音乐
            </Typography>
          </Box>
          <ThemeSelector 
            themes={themes} 
            itemTheme={itemTheme} 
            setItemTheme={setItemTheme} 
            customColor={customColor} 
            setCustomColor={setCustomColor} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={async () => {
              if (window.confirm('确定要清空收藏夹吗？')) {
                try {
                  await updateGroup({ ...favoriteGroup, content: '[]' });
                  showSnackbar('已清空收藏夹');
                  fetchGroups();
                } catch (e) {
                  showSnackbar('操作失败', 'error');
                }
              }
            }}
            disabled={!favoriteGroup || favoriteMusics.length === 0}
            sx={{ borderRadius: 3 }}
          >
            清空收藏
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              if (!favoriteGroup) return;
              if (favoriteMusics.length > 0) {
                playMusic(favoriteMusics[0], favoriteMusics);
              } else {
                showSnackbar('收藏夹里还没有音乐哦', 'info');
              }
            }}
            disabled={!favoriteGroup || favoriteMusics.length === 0}
            sx={{ borderRadius: 3 }}
          >
            播放全部
          </Button>
        </Box>
      </Box>

      {!favoriteGroup || favoriteMusics.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.5)', border: '2px dashed rgba(255, 118, 117, 0.2)' }}>
          <FavoriteBorderIcon sx={{ fontSize: 64, color: '#FF7675', mb: 2, opacity: 0.3 }} />
          <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 700 }}>收藏夹空空如也</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1, mb: 3 }}>
            在音乐库中点击心形图标，将喜欢的音乐加入这里
          </Typography>
          <Button variant="contained" sx={{ borderRadius: 3, px: 4 }} onClick={() => setTabValue(0)}>
            去探索音乐
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255, 118, 117, 0.05)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#2D3436' }}>歌名</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#2D3436' }}>歌手</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#2D3436' }}>专辑</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#2D3436' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {favoriteMusics.map((music) => {
                const isPlayingCurrent = currentMusic && currentMusic.id === music.id;
                return (
                  <TableRow 
                    key={music.id} 
                    hover 
                    sx={{ 
                      '&:hover': { bgcolor: 'rgba(255, 118, 117, 0.03) !important' },
                      bgcolor: isPlayingCurrent ? 'rgba(255, 118, 117, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isPlayingCurrent ? (
                          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#FF7675', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AudioIcon sx={{ color: '#fff', fontSize: 18 }} />
                          </Box>
                        ) : (
                          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'rgba(255, 118, 117, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MusicIcon sx={{ color: '#FF7675', fontSize: 18 }} />
                          </Box>
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isPlayingCurrent ? '#FF7675' : '#2D3436' }}>
                          {music.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{music.singer_name}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{music.album}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={isPlayingCurrent && isPlaying ? "暂停" : "播放"}>
                          <IconButton 
                            size="small" 
                            onClick={() => playMusic(music, favoriteMusics)}
                            sx={{ 
                              bgcolor: isPlayingCurrent ? '#FF7675' : 'transparent',
                              color: isPlayingCurrent ? '#fff' : '#FF7675',
                              '&:hover': { bgcolor: isPlayingCurrent ? '#FF7675' : 'rgba(255, 118, 117, 0.1)' }
                            }}
                          >
                            {isPlayingCurrent && isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="取消收藏">
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleFavorite(music.id)}
                            sx={{ 
                              color: '#fff',
                              bgcolor: '#FF2D55',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': pulseKeyframes,
                              '&:hover': { 
                                bgcolor: '#FF3B30',
                                transform: 'scale(1.2) rotate(5deg)',
                                boxShadow: '0 4px 12px rgba(255, 45, 85, 0.3)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                          >
                            <FavoriteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FavoriteTab;
