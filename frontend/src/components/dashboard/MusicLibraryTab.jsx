import React from 'react';
import { 
  Box, Typography, TextField, InputAdornment, Button, 
  TableContainer, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, CircularProgress, Stack, Tooltip, IconButton 
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  SettingsVoice as StreamerIcon,
  CloudUpload as UploadIcon,
  GraphicEq as AudioIcon,
  LibraryMusic as MusicIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  PlaylistAdd as PlaylistAddIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ThemeSelector from './ThemeSelector';

const MusicLibraryTab = ({
  loading,
  musicList,
  musicSearch,
  setMusicSearch,
  fetchMusic,
  handleSyncMusic,
  handleOpenCreate,
  currentMusic,
  getThemeColors,
  cuteFont,
  isMusicFavorite,
  handleToggleFavorite,
  handleOpenAddToGroupMenu,
  playMusic,
  handleOpenEdit,
  handleDeleteMusic,
  pulseKeyframes,
  themes,
  itemTheme,
  setItemTheme,
  customColor,
  setCustomColor
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: getThemeColors().title }}>音乐管理</Typography>
          <ThemeSelector 
            themes={themes} 
            itemTheme={itemTheme} 
            setItemTheme={setItemTheme} 
            customColor={customColor} 
            setCustomColor={setCustomColor} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="搜索歌名/歌手/专辑..."
            value={musicSearch}
            onChange={(e) => setMusicSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 260,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.02)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                }
              }
            }}
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchMusic()}>
            刷新
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<StreamerIcon />} 
            onClick={handleSyncMusic}
            disabled={loading}
          >
            同步流
          </Button>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={handleOpenCreate}>
            新增音乐
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>歌名</TableCell>
              <TableCell>歌手</TableCell>
              <TableCell>专辑</TableCell>
              <TableCell>乐队</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
            ) : musicList.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>暂无音乐</TableCell></TableRow>
            ) : (
              musicList.map((music) => {
                const isPlayingCurrent = currentMusic && currentMusic.id === music.id;
                return (
                  <TableRow 
                    key={music.id}
                    hover
                    sx={{ 
                      bgcolor: isPlayingCurrent ? 'rgba(255, 118, 117, 0.06)' : 'inherit',
                      '&:hover': { bgcolor: 'rgba(255, 118, 117, 0.1) !important' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isPlayingCurrent ? (
                          <Box sx={{ 
                            width: 32, height: 32, borderRadius: 2, bgcolor: 'primary.main', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            <AudioIcon sx={{ color: '#fff', fontSize: 18 }} />
                          </Box>
                        ) : (
                          <Box sx={{ 
                            width: 32, height: 32, borderRadius: 2, bgcolor: 'background.default', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            <MusicIcon sx={{ color: getThemeColors().item, fontSize: 18 }} />
                          </Box>
                        )}
                        <Typography variant="body2" sx={{ 
                          fontWeight: isPlayingCurrent ? 800 : 600, 
                          color: getThemeColors().item,
                          fontFamily: cuteFont
                        }}>
                          {music.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                       fontWeight: 700, 
                       color: getThemeColors().item,
                       fontFamily: cuteFont
                     }}>{music.singer_name}</TableCell>
                     <TableCell sx={{ 
                       fontWeight: 700,
                       color: 'text.secondary',
                       fontFamily: cuteFont
                     }}>{music.album}</TableCell>
                     <TableCell sx={{ 
                       fontWeight: 700,
                       color: 'text.secondary',
                       fontFamily: cuteFont
                     }}>{music.band}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                        <Tooltip title={isMusicFavorite(music.id) ? "取消收藏" : "加入收藏"}>
                          <IconButton 
                            onClick={() => handleToggleFavorite(music.id)}
                            sx={{ 
                              bgcolor: isMusicFavorite(music.id) ? '#FF2D55' : 'rgba(255, 45, 85, 0.12)',
                              color: isMusicFavorite(music.id) ? '#fff' : '#FF2D55',
                              border: isMusicFavorite(music.id) ? '2px solid #FF2D55' : '2px solid rgba(255, 45, 85, 0.6)',
                              animation: isMusicFavorite(music.id) ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': pulseKeyframes,
                              width: 44,
                              height: 44,
                              '&:hover': { 
                                bgcolor: isMusicFavorite(music.id) ? '#FF3B30' : 'rgba(255, 45, 85, 0.2)',
                                color: isMusicFavorite(music.id) ? '#fff' : '#FF2D55',
                                border: '2px solid #FF2D55',
                                transform: 'scale(1.2) rotate(15deg)',
                                boxShadow: '0 4px 15px rgba(255, 45, 85, 0.4)',
                              },
                              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              '& .MuiSvgIcon-root': {
                                filter: isMusicFavorite(music.id) ? 'none' : 'drop-shadow(0 0 1px rgba(255,45,85,0.8))',
                                fontSize: '1.4rem'
                              }
                            }}
                          >
                            {isMusicFavorite(music.id) ? <FavoriteIcon /> : <FavoriteBorderIcon sx={{ stroke: '#FF2D55', strokeWidth: 1.5 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="添加到合集">
                          <IconButton 
                            onClick={(e) => handleOpenAddToGroupMenu(e, music)}
                            sx={{ 
                              bgcolor: 'success.main', 
                              color: '#fff',
                              '&:hover': { 
                                bgcolor: 'success.dark',
                                transform: 'scale(1.1)' 
                              },
                              boxShadow: '0 4px 10px rgba(46, 213, 115, 0.3)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <PlaylistAddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="播放">
                          <IconButton 
                            onClick={() => playMusic(music, musicList)} 
                            sx={{ 
                              bgcolor: 'info.main', 
                              color: '#fff',
                              '&:hover': { 
                                bgcolor: 'info.dark',
                                transform: 'scale(1.1)' 
                              },
                              boxShadow: '0 4px 10px rgba(84, 160, 255, 0.3)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="编辑">
                          <IconButton 
                            onClick={() => handleOpenEdit(music)}
                            sx={{ 
                              bgcolor: 'warning.main', 
                              color: '#fff',
                              '&:hover': { 
                                bgcolor: 'warning.dark',
                                transform: 'scale(1.1)' 
                              },
                              boxShadow: '0 4px 10px rgba(255, 159, 67, 0.3)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton 
                            onClick={() => handleDeleteMusic(music.id)}
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
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MusicLibraryTab;
