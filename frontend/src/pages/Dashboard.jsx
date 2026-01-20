import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Slider,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeUp as VolumeUpIcon,
  GraphicEq as AudioIcon,
  LibraryMusic as MusicIcon,
  History as HistoryIcon,
  SettingsVoice as StreamerIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  listMusics,
  createMusic,
  updateMusic,
  deleteMusic,
  listMusicHistories,
  deleteMusicHistory,
  addMusicHistory,
  uploadAudio,
  getAudioUrl,
  listStreamers,
  deleteStreamer,
} from '../api/client';

const ThemeSelector = ({ themes, itemTheme, setItemTheme, customColor, setCustomColor }) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>配色方案:</Typography>
    {Object.entries(themes).filter(([key]) => key !== 'CUSTOM').map(([key, theme]) => (
      <Tooltip 
        key={key} 
        title={theme.name} 
        TransitionComponent={Fade} 
        TransitionProps={{ timeout: 200 }}
        arrow
        placement="top"
      >
        <Box
          onClick={() => setItemTheme(key)}
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.item} 50%, ${theme.separator} 50%)`,
            cursor: 'pointer',
            border: itemTheme === key ? '2px solid #2D3436' : '2px solid transparent',
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.2)' }
          }}
        />
      </Tooltip>
    ))}
    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, my: 'auto' }} />
    <Tooltip 
      title="自定义 RGB 颜色" 
      TransitionComponent={Fade} 
      TransitionProps={{ timeout: 200 }}
      arrow
      placement="top"
    >
      <Box 
        component="label"
        htmlFor="custom-color-picker"
        sx={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: customColor,
            border: itemTheme === 'CUSTOM' ? '2px solid #2D3436' : '2px solid #ddd',
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.2)' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <input
            id="custom-color-picker"
            type="color"
            value={customColor}
            onInput={(e) => {
              setCustomColor(e.target.value);
              setItemTheme('CUSTOM');
            }}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              border: 'none',
              padding: 0
            }}
          />
        </Box>
      </Box>
    </Tooltip>
  </Box>
);

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [musicList, setMusicList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [streamerList, setStreamerList] = useState([]);
  const [streamerSearch, setStreamerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    singer_name: '',
    album: '',
    band: '',
    streamer_id: '',
  });
  const [uploading, setUploading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [musicMap, setMusicMap] = useState({}); // 缓存音乐详情，用于 ID 到名称的映射
  
  // 颜色方案主题状态
  const [itemTheme, setItemTheme] = useState('A');
  const [customColor, setCustomColor] = useState('#F28B8B'); // 默认自定义颜色

  const themes = {
    A: { name: '珊瑚粉', title: '#FF7675', item: '#FF7675', separator: '#54A0FF' },
    B: { name: '活力橙', title: '#FF7675', item: '#FF9F43', separator: '#54A0FF' },
    C: { name: '温润粉', title: '#FF7675', item: '#FFB3B3', separator: '#54A0FF' },
    CUSTOM: { name: '自定义', title: '#FF7675', item: customColor, separator: '#54A0FF' },
  };

  const getThemeColors = () => themes[itemTheme];

  const cuteFont = '"Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "STHeiti", "SimHei", "YouYuan", sans-serif';

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchMusic();
    } else if (tabValue === 1) {
      fetchHistory();
      fetchMusic(); // 获取音乐列表以便匹配名称和歌手
    } else {
      fetchStreamers();
    }
  }, [tabValue]);

  useEffect(() => {
    if (currentAudio) {
      const updateTime = () => setCurrentTime(currentAudio.currentTime);
      const updateDuration = () => setDuration(currentAudio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        playNext(); // 自动播放下一首
      };

      currentAudio.addEventListener('timeupdate', updateTime);
      currentAudio.addEventListener('durationchange', updateDuration);
      currentAudio.addEventListener('ended', handleEnded);
      currentAudio.addEventListener('play', () => setIsPlaying(true));
      currentAudio.addEventListener('pause', () => setIsPlaying(false));

      return () => {
        currentAudio.removeEventListener('timeupdate', updateTime);
        currentAudio.removeEventListener('durationchange', updateDuration);
        currentAudio.removeEventListener('ended', handleEnded);
        currentAudio.removeEventListener('play', () => setIsPlaying(true));
        currentAudio.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, [currentAudio]);

  const togglePlay = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
      } else {
        currentAudio.play();
      }
    }
  };

  const handleSliderChange = (event, newValue) => {
    if (currentAudio) {
      currentAudio.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchMusic = async () => {
    setLoading(true);
    try {
      const res = await listMusics({ page: 1, size: 100 });
      const data = res.body.data || [];
      setMusicList(data);
      // 更新音乐详情缓存
      const newMap = { ...musicMap };
      data.forEach(m => {
        newMap[m.id] = m;
      });
      setMusicMap(newMap);
    } catch (error) {
      showSnackbar('获取音乐列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await listMusicHistories({ page: 1, size: 100 });
      const historyData = res.body.data || [];
      setHistoryList(historyData);

      // 自动补全缺失的音乐详情
      setMusicMap(prevMap => {
        const missingIds = [...new Set(historyData
          .map(h => h.music_id)
          .filter(id => !prevMap[id]))];

        if (missingIds.length > 0) {
          // 异步获取缺失详情并再次更新 map
          (async () => {
            const newDetails = {};
            await Promise.all(missingIds.map(async (id) => {
              try {
                const mRes = await findMusic({ id });
                if (mRes.body) {
                  newDetails[id] = mRes.body;
                }
              } catch (e) {
                console.error(`获取音乐 ${id} 详情失败`, e);
              }
            }));
            if (Object.keys(newDetails).length > 0) {
              setMusicMap(currentMap => ({ ...currentMap, ...newDetails }));
            }
          })();
        }
        return prevMap;
      });
    } catch (error) {
      showSnackbar('获取历史记录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamers = async (searchName = '') => {
    setLoading(true);
    try {
      const res = await listStreamers({ page: 1, size: 100, search_name: searchName });
      setStreamerList(res.body.data || []);
    } catch (error) {
      showSnackbar('获取音乐流列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const groupedHistory = useMemo(() => {
    const groups = {};
    historyList.forEach(history => {
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setFormData({ id: '', name: '', singer_name: '', album: '', band: '', streamer_id: '' });
    setOpenDialog(true);
    fetchStreamers(); // 打开弹窗时获取最新的 streamer 列表
  };

  const handleOpenEdit = (music) => {
    setDialogMode('edit');
    setFormData({
      id: music.id,
      name: music.name || '',
      singer_name: music.singer_name || '',
      album: music.album || '',
      band: music.band || '',
      streamer_id: music.streamer_id || '',
    });
    setOpenDialog(true);
    fetchStreamers(); // 打开弹窗时获取最新的 streamer 列表
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 如果改变的是 streamer_id，尝试解析文件名并自动填入
    if (name === 'streamer_id' && value) {
      const selectedStreamer = streamerList.find(s => s.id === value);
      if (selectedStreamer) {
        autoFillFromFileName(selectedStreamer.original_name);
      }
    }
  };

  const autoFillFromFileName = (fileName) => {
    if (!fileName) return;

    // 1. 移除后缀
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    // 2. 尝试按常见分隔符拆分
    const separators = [/ - /, /-/, /_/, / — /];
    let parts = [nameWithoutExt];

    for (const sep of separators) {
      const split = nameWithoutExt.split(sep);
      if (split.length >= 2) {
        parts = split.map(p => p.trim());
        break;
      }
    }

    setFormData(prev => {
      const updated = { ...prev };
      if (parts.length >= 2) {
        if (!prev.singer_name) updated.singer_name = parts[0];
        if (!prev.name) updated.name = parts[1];
      } else {
        if (!prev.name) updated.name = parts[0];
      }
      return updated;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAudio(file);
      if (res.body && res.body.id) {
        setFormData({ ...formData, streamer_id: res.body.id });
        showSnackbar('文件上传成功');
        fetchStreamers(); // 上传成功后刷新列表，确保下拉框能匹配到新上传的音频
        autoFillFromFileName(file.name); // 自动填入文件名解析结果
      } else {
        showSnackbar('上传失败：未返回 ID', 'error');
      }
    } catch (error) {
      showSnackbar('上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createMusic(formData);
        showSnackbar('添加成功');
      } else {
        await updateMusic(formData);
        showSnackbar('更新成功');
      }
      fetchMusic();
      handleCloseDialog();
    } catch (error) {
      showSnackbar('操作失败', 'error');
    }
  };

  const handleDeleteMusic = async (id) => {
    if (window.confirm('确定要删除这首歌吗？')) {
      try {
        await deleteMusic(id);
        showSnackbar('删除成功');
        fetchMusic();
      } catch (error) {
        showSnackbar('删除失败', 'error');
      }
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteMusicHistory(id);
      showSnackbar('删除成功');
      fetchHistory();
    } catch (error) {
      showSnackbar('删除失败', 'error');
    }
  };

  const handleDeleteStreamer = async (id) => {
    if (window.confirm('确定要删除这个音乐流吗？')) {
      try {
        await deleteStreamer(id);
        showSnackbar('删除成功');
        fetchStreamers();
      } catch (error) {
        showSnackbar('删除失败', 'error');
      }
    }
  };

  const handleStreamerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAudio(file);
      if (res.body && res.body.id) {
        showSnackbar('音乐流创建成功，ID: ' + res.body.id);
        if (tabValue === 2) {
          fetchStreamers();
        }
      } else {
        showSnackbar('创建失败：未返回 ID', 'error');
      }
    } catch (error) {
      showSnackbar('创建失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const playMusic = async (music) => {
    const url = getAudioUrl(music.streamer_id);
    if (!url) {
      showSnackbar('音频文件不存在', 'error');
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(url);
    audio.play().catch(e => showSnackbar('播放失败', 'error'));
    setCurrentAudio(audio);
    setCurrentMusic(music);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    // 记录播放历史
    try {
      await addMusicHistory({ music_id: music.id });
    } catch (error) {
      console.error('记录历史失败', error);
    }
  };

  const playNext = () => {
    if (!currentMusic || musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % musicList.length;
    playMusic(musicList[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentMusic || musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    playMusic(musicList[prevIndex]);
  };

  const drawerWidth = 240;
  const collapsedDrawerWidth = 64;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
            transition: 'width 0.3s',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderRight: 'none',
            backgroundColor: '#fff',
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          {sidebarOpen && (
            <Typography variant="h6" sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(45deg, #FF7675 30%, #FAB1A0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1
            }}>
              MUSIC POP
            </Typography>
          )}
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ backgroundColor: '#F7F9FC' }}>
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <Box sx={{ px: 2, mt: 2 }}>
          <List sx={{ '& .MuiListItem-root': { mb: 1 } }}>
            {[
              { label: '音乐库', icon: <MusicIcon />, value: 0 },
              { label: '播放历史', icon: <HistoryIcon />, value: 1 },
              { label: '音乐流', icon: <StreamerIcon />, value: 2 },
            ].map((item) => (
              <ListItem key={item.value} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={!sidebarOpen ? item.label : ''} placement="right">
                  <ListItemButton
                    selected={tabValue === item.value}
                    onClick={() => setTabValue(item.value)}
                    sx={{
                      minHeight: 48,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 3,
                      mx: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#fff',
                        },
                      },
                      '&:hover:not(.Mui-selected)': {
                        backgroundColor: 'rgba(255, 118, 117, 0.12)',
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 2 : 'auto',
                        justifyContent: 'center',
                        color: tabValue === item.value ? 'inherit' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {sidebarOpen && (
                      <ListItemText 
                        primary={item.label} 
                        primaryTypographyProps={{ 
                          fontWeight: tabValue === item.value ? 800 : 600,
                          fontSize: '0.95rem'
                        }} 
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 12, 
          flexGrow: 1, 
          transition: 'margin 0.3s',
          width: '100%',
        }}
      >
        {/* 内容区域开始 */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: getThemeColors().title }}>音乐管理</Typography>
                <ThemeSelector themes={themes} itemTheme={itemTheme} setItemTheme={setItemTheme} customColor={customColor} setCustomColor={setCustomColor} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMusic}>
                  刷新
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
                              <Tooltip title="播放">
                                <IconButton 
                                  onClick={() => playMusic(music)} 
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
        )}

        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: getThemeColors().title }}>最近播放</Typography>
                <ThemeSelector themes={themes} itemTheme={itemTheme} setItemTheme={setItemTheme} customColor={customColor} setCustomColor={setCustomColor} />
              </Box>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchHistory}>
                刷新
              </Button>
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
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
                  ) : historyList.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}>暂无历史记录</TableCell></TableRow>
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
                                    <HistoryIcon sx={{ color: getThemeColors().item, fontSize: 18, opacity: 0.7 }} />
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
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleDeleteHistory(history.id)} 
                                    sx={{ 
                                      bgcolor: 'rgba(255, 118, 117, 0.05)',
                                      '&:hover': { 
                                        transform: 'scale(1.1) rotate(5deg)', // 俏皮的旋转
                                        bgcolor: 'rgba(255, 118, 117, 0.1)' 
                                      },
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
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
        )}

        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: getThemeColors().title }}>音乐流管理</Typography>
                <ThemeSelector themes={themes} itemTheme={itemTheme} setItemTheme={setItemTheme} customColor={customColor} setCustomColor={setCustomColor} />
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
                  创建音乐流
                  <input type="file" hidden accept="audio/*" onChange={handleStreamerUpload} />
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
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
                  ) : streamerList.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>暂无音乐流</TableCell></TableRow>
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
        )}
      </Container>

      {/* 新增/编辑对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? '新增音乐' : '编辑音乐'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="歌名"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              name="singer_name"
              label="歌手"
              fullWidth
              value={formData.singer_name}
              onChange={handleInputChange}
            />
            <TextField
              name="album"
              label="专辑"
              fullWidth
              value={formData.album}
              onChange={handleInputChange}
            />
            <TextField
              name="band"
              label="乐队"
              fullWidth
              value={formData.band}
              onChange={handleInputChange}
            />
            <Autocomplete
              fullWidth
              options={streamerList}
              getOptionLabel={(option) => option.original_name ? `${option.original_name} (${option.id.substring(0, 8)}...)` : ''}
              value={streamerList.find(s => s.id === formData.streamer_id) || null}
              onChange={(event, newValue) => {
                handleInputChange({
                  target: {
                    name: 'streamer_id',
                    value: newValue ? newValue.id : ''
                  }
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="选择音频 (音乐流)"
                  placeholder="搜索音频名称..."
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="未找到相关音频"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                或直接上传新音频
                <input type="file" hidden accept="audio/*" onChange={handleFileUpload} />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.streamer_id}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 底部播放器 */}
      {currentMusic && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            left: { xs: 16, sm: sidebarOpen ? drawerWidth + 24 : collapsedDrawerWidth + 24 },
            right: 24,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            zIndex: 1000,
            transition: 'left 0.3s',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
          elevation={0}
        >
          <Container maxWidth="lg">
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ width: 220, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #FF7675 0%, #FAB1A0 100%)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   boxShadow: '0 4px 12px rgba(255, 118, 117, 0.3)'
                }}>
                  <AudioIcon sx={{ color: '#fff' }} />
                </Box>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {currentMusic.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontWeight: 600 }}>
                    {currentMusic.singer_name}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={playPrevious} 
                  disabled={musicList.length <= 1}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.1)',
                      boxShadow: '0 6px 12px rgba(255, 118, 117, 0.4)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled'
                    },
                    boxShadow: '0 4px 10px rgba(255, 118, 117, 0.3)',
                    transition: 'all 0.2s',
                    width: 48,
                    height: 48
                  }}
                >
                  <SkipPreviousIcon />
                </IconButton>

                <IconButton 
                  onClick={togglePlay} 
                  sx={{ 
                    backgroundColor: 'primary.main', 
                    color: '#fff',
                    '&:hover': { 
                      backgroundColor: 'primary.dark',
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 20px rgba(255, 118, 117, 0.5)'
                    },
                    width: 64,
                    height: 64,
                    boxShadow: '0 8px 16px rgba(255, 118, 117, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
                </IconButton>

                <IconButton 
                  onClick={playNext} 
                  disabled={musicList.length <= 1}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.1)',
                      boxShadow: '0 6px 12px rgba(255, 118, 117, 0.4)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled'
                    },
                    boxShadow: '0 4px 10px rgba(255, 118, 117, 0.3)',
                    transition: 'all 0.2s',
                    width: 48,
                    height: 48
                  }}
                >
                  <SkipNextIcon />
                </IconButton>
              </Box>

              <Box sx={{ flexGrow: 1, px: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 700, color: 'text.secondary' }}>
                    {formatTime(currentTime)}
                  </Typography>
                  <Slider
                    size="small"
                    value={currentTime}
                    max={duration || 0}
                    onChange={handleSliderChange}
                    sx={{
                      flexGrow: 1,
                      color: 'primary.main',
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                        backgroundColor: '#fff',
                        border: '3px solid currentColor',
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(255, 118, 117, 0.16)',
                        },
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.2,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 700, color: 'text.secondary' }}>
                    {formatTime(duration)}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', width: 140, gap: 1 }}>
                <VolumeUpIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Slider
                  size="small"
                  defaultValue={100}
                  onChange={(e, val) => {
                    if (currentAudio) currentAudio.volume = val / 100;
                  }}
                  sx={{ 
                    color: 'text.secondary',
                    '& .MuiSlider-thumb': { width: 12, height: 12 }
                  }}
                />
              </Box>
            </Stack>
          </Container>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
