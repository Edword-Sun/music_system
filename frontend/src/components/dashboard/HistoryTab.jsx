import React, { useMemo } from 'react';
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
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import ThemeSelector from './ThemeSelector';

// Using standard MUI icons
import RefreshIconMui from '@mui/icons-material/Refresh';
import DeleteIconMui from '@mui/icons-material/Delete';
import HistoryIconMui from '@mui/icons-material/History';
import PlayArrowIconMui from '@mui/icons-material/PlayArrow';
import PauseIconMui from '@mui/icons-material/Pause';
import FavoriteIconMui from '@mui/icons-material/Favorite';
import FavoriteBorderIconMui from '@mui/icons-material/FavoriteBorder';

const HistoryTab = ({
  loading,
  historyList,
  musicList,
  fetchHistory,
  handleClearHistory,
  handleDeleteHistory,
  musicMap,
  getThemeColors,
  themes,
  itemTheme,
  setItemTheme,
  customColor,
  setCustomColor,
  cuteFont,
  currentMusic,
  playMusic,
  isPlaying,
  isMusicFavorite,
  handleToggleFavorite,
  pulseKeyframes,
}) => {
  const groupedHistory = useMemo(() => {
    const groups = {};
    historyList.forEach((history) => {
      const date = new Date(history.create_time).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(history);
    });
    // 按日期倒序排序
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [historyList]);

  const formatDateHeader = (dateStr) => {
    return dateStr;
  };

  const getDateColor = (dateStr) => {
    return getThemeColors().separator;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: getThemeColors().title }}>最近播放</Typography>
          <ThemeSelector 
            themes={themes} 
            itemTheme={itemTheme} 
            setItemTheme={setItemTheme} 
            customColor={customColor} 
            setCustomColor={setCustomColor} 
          />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<RefreshIconMui />} onClick={fetchHistory}>
            刷新
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIconMui />} onClick={handleClearHistory}>
            清空历史
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>音乐名称</TableCell>
              <TableCell>作者名</TableCell>
              <TableCell>播放时间</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : historyList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  暂无历史记录
                </TableCell>
              </TableRow>
            ) : (
              groupedHistory.map(([date, items]) => {
                const headerColor = getDateColor(date);
                return (
                  <React.Fragment key={date}>
                    {/* 日期分割标题 */}
                    <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
                      <TableCell colSpan={4} sx={{ 
                        bgcolor: 'transparent', 
                        py: 2, 
                        borderBottom: 'none',
                        pt: 5 // 进一步增加顶部间距，强化呼吸感
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 900, // 加重字重
                            color: headerColor, // 使用动态颜色
                            fontSize: '1.5rem', // 字体更大一些，更有冲击力
                            fontFamily: '"Quicksand", sans-serif',
                            textShadow: `2px 2px 0px ${headerColor}22`, // 添加轻微的阴影效果
                            letterSpacing: 1
                          }}>
                            {formatDateHeader(date)}
                          </Typography>
                          <Box sx={{ 
                            flexGrow: 1, 
                            height: '3px', 
                            background: `linear-gradient(to right, ${headerColor}44, ${headerColor}05)`, 
                            borderRadius: 2 
                          }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                    
                    {/* 该日期下的记录 */}
                    {items.map((history) => {
                      const isPlayingCurrent = currentMusic && currentMusic.id === history.music_id;
                      const musicInfo = musicMap[history.music_id] || {};
                      
                      return (
                        <TableRow 
                          key={history.id}
                          hover
                          sx={{ 
                            bgcolor: isPlayingCurrent ? 'rgba(255, 118, 117, 0.06)' : 'inherit',
                            '&:hover': { bgcolor: 'rgba(255, 118, 117, 0.1) !important' }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <HistoryIconMui sx={{ color: getThemeColors().item, fontSize: 18, opacity: 0.7 }} />
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: getThemeColors().item,
                                fontFamily: cuteFont
                              }}>
                                {musicInfo.name || history.music_id}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                             fontWeight: 700, 
                             color: getThemeColors().item,
                             fontFamily: cuteFont
                           }}>
                             {musicInfo.singer_name || '未知歌手'}
                           </TableCell>
                           <TableCell sx={{ 
                             fontWeight: 700, 
                             color: getThemeColors().item,
                             fontFamily: cuteFont
                           }}>
                             {new Date(history.create_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title={isMusicFavorite(musicInfo.id) ? "取消收藏" : "加入收藏"}>
                                <IconButton 
                                  onClick={() => handleToggleFavorite(musicInfo.id)}
                                  disabled={!musicInfo.id}
                                  sx={{ 
                                    color: isMusicFavorite(musicInfo.id) ? '#fff' : '#FF2D55',
                                    bgcolor: isMusicFavorite(musicInfo.id) ? '#FF2D55' : 'rgba(255, 45, 85, 0.15)',
                                    border: isMusicFavorite(musicInfo.id) ? '1px solid #FF2D55' : '1.5px solid rgba(255, 45, 85, 0.6)',
                                    animation: isMusicFavorite(musicInfo.id) ? 'pulse 2s infinite' : 'none',
                                    '@keyframes pulse': pulseKeyframes,
                                    '&:hover': { 
                                      transform: 'scale(1.2) rotate(10deg)',
                                      bgcolor: isMusicFavorite(musicInfo.id) ? '#FF3B30' : 'rgba(255, 45, 85, 0.25)',
                                      border: '1px solid #FF2D55',
                                      boxShadow: '0 4px 12px rgba(255, 45, 85, 0.3)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    '& .MuiSvgIcon-root': {
                                      filter: isMusicFavorite(musicInfo.id) ? 'none' : 'drop-shadow(0 0 1px rgba(255,45,85,0.8))',
                                    }
                                  }}
                                >
                                  {isMusicFavorite(musicInfo.id) ? <FavoriteIconMui fontSize="small" /> : <FavoriteBorderIconMui fontSize="small" sx={{ stroke: '#FF2D55', strokeWidth: 1.5 }} />}
                                </IconButton>
                              </Tooltip>
                              <IconButton 
                                color="primary" 
                                onClick={() => playMusic(musicInfo, musicList)} 
                                disabled={!musicInfo.id}
                                sx={{ 
                                  bgcolor: 'rgba(255, 118, 117, 0.05)',
                                  '&:hover': { 
                                    transform: 'scale(1.1)',
                                    bgcolor: 'rgba(255, 118, 117, 0.1)' 
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                {isPlayingCurrent && isPlaying ? <PauseIconMui fontSize="small" /> : <PlayArrowIconMui fontSize="small" />}
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteHistory(history.id)} 
                                sx={{ 
                                  bgcolor: 'rgba(255, 118, 117, 0.05)',
                                  '&:hover': { 
                                    transform: 'scale(1.1) rotate(5deg)', 
                                    bgcolor: 'rgba(255, 118, 117, 0.1)' 
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <DeleteIconMui fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistoryTab;
