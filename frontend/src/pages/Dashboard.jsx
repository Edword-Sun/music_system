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
  Menu,
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
  PlaylistAdd as PlaylistAddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import {
  listMusics,
  createMusic,
  updateMusic,
  deleteMusic,
  findMusic,
  listMusicHistories,
  deleteMusicHistory,
  addMusicHistory,
  uploadAudio,
  getAudioUrl,
  listStreamers,
  deleteStreamer,
  createGroup,
  updateGroup,
  findGroup,
  listGroups,
  deleteGroup,
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
  const [groupList, setGroupList] = useState([]);
  const [favoriteGroup, setFavoriteGroup] = useState(null); // 收藏合集
  const [streamerSearch, setStreamerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openGroupViewDialog, setOpenGroupViewDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  
  // 添加到合集菜单状态
  const [addToGroupAnchor, setAddToGroupAnchor] = useState(null);
  const [selectedMusicToGroup, setSelectedMusicToGroup] = useState(null);

  const [dialogMode, setDialogMode] = useState('create');
  const [groupDialogMode, setGroupDialogMode] = useState('create');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    singer_name: '',
    album: '',
    band: '',
    streamer_id: '',
  });
  const [groupFormData, setGroupFormData] = useState({
    id: '',
    name: '',
    music_ids: [],
  });
  const [uploading, setUploading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [playQueue, setPlayQueue] = useState([]); // 当前播放队列
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
    fetchMusic();
    fetchGroups(); // 初始加载合集列表
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchMusic();
      fetchGroups(); // 获取合集列表以便“添加到合集”功能使用
    } else if (tabValue === 1) {
      fetchHistory();
      fetchMusic(); // 获取音乐列表以便匹配名称和歌手
    } else if (tabValue === 2) {
      fetchStreamers();
    } else if (tabValue === 3) {
        fetchGroups();
        fetchMusic(); // 获取音乐列表以便选择
      } else if (tabValue === 4) {
        fetchGroups();
        fetchMusic();
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

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await listGroups({ page: 1, size: 100 });
      if (res.body && res.body.data) {
        const allGroups = res.body.data;
        const favorites = allGroups.find(g => g.name === '收藏');
        
        if (!favorites) {
          // 如果不存在收藏合集，则创建一个
          try {
            await createGroup({ name: '收藏', content: '[]' });
            // 创建成功后重新获取一次
            const refreshRes = await listGroups({ page: 1, size: 100 });
            if (refreshRes.body && refreshRes.body.data) {
              const refreshedAll = refreshRes.body.data;
              const newFavorites = refreshedAll.find(g => g.name === '收藏');
              if (newFavorites) setFavoriteGroup(newFavorites);
              setGroupList(refreshedAll.filter(g => g.name !== '收藏'));
            }
          } catch (e) {
            console.error('自动创建收藏合集失败', e);
          }
        } else {
          setFavoriteGroup(favorites);
        }
        
        // 过滤掉收藏合集，不显示在普通合集列表中
        setGroupList(allGroups.filter(g => g.name !== '收藏'));
      }
    } catch (error) {
      showSnackbar('获取合集列表失败', 'error');
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

  const handleOpenCreateGroup = () => {
    setGroupDialogMode('create');
    setGroupFormData({ id: '', name: '', music_ids: [] });
    setOpenGroupDialog(true);
  };

  const handleOpenEditGroup = (group) => {
    setGroupDialogMode('edit');
    let musicIds = [];
    try {
      musicIds = JSON.parse(group.content || '[]');
    } catch (e) {
      console.error('解析合集内容失败', e);
    }
    setGroupFormData({
      id: group.id,
      name: group.name || '',
      music_ids: musicIds,
    });
    setOpenGroupDialog(true);
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    setOpenGroupViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseGroupDialog = () => {
    setOpenGroupDialog(false);
  };

  const handleCloseGroupViewDialog = () => {
    setOpenGroupViewDialog(false);
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

  const handleGroupSubmit = async () => {
    try {
      const payload = {
        ...groupFormData,
        content: JSON.stringify(groupFormData.music_ids)
      };
      
      if (groupDialogMode === 'create') {
        await createGroup(payload);
        showSnackbar('合集创建成功');
      } else {
        await updateGroup(payload);
        showSnackbar('合集更新成功');
      }
      fetchGroups();
      handleCloseGroupDialog();
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

  const handleDeleteGroup = (group) => {
    if (group.name === '收藏') {
      showSnackbar('收藏合集不能删除哦，你可以点击“清空收藏”', 'warning');
      return;
    }
    setGroupToDelete(group);
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete || groupToDelete.name === '收藏') return;
    
    try {
      // 如果当前播放的音乐在要删除的合集中，停止播放
      if (currentMusic) {
        let musicIds = [];
        try {
          musicIds = JSON.parse(groupToDelete.content || '[]');
        } catch (e) {
          musicIds = [];
        }
        
        if (musicIds.includes(currentMusic.id)) {
          if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
          }
          setCurrentMusic(null);
          setPlayQueue([]);
          showSnackbar('由于合集被删除，已停止播放相关音乐', 'info');
        }
      }

      await deleteGroup(groupToDelete.id);
      showSnackbar('删除成功');
      setOpenDeleteConfirm(false);
      setGroupToDelete(null);
      fetchGroups();
    } catch (error) {
      showSnackbar('删除失败', 'error');
    }
  };

  // 从合集中移除音乐
  const handleRemoveFromGroup = async (group, musicId) => {
    try {
      let musicIds = [];
      try {
        musicIds = JSON.parse(group.content || '[]');
      } catch (e) {
        musicIds = [];
      }
      
      const newMusicIds = musicIds.filter(id => id !== musicId);
      const payload = {
        ...group,
        content: JSON.stringify(newMusicIds)
      };
      
      await updateGroup(payload);
      showSnackbar('已移除');
      
      // 更新当前选中的合集视图
      if (selectedGroup && selectedGroup.id === group.id) {
        setSelectedGroup({ ...group, content: payload.content });
      }
      
      fetchGroups();
    } catch (error) {
      showSnackbar('移除失败', 'error');
    }
  };

  const isMusicFavorite = (musicId) => {
     if (!favoriteGroup) return false;
     try {
       const musicIds = JSON.parse(favoriteGroup.content || '[]');
       return musicIds.includes(musicId);
     } catch (e) {
       return false;
     }
   };

  // 收藏按钮的呼吸动画
  const pulseKeyframes = {
    '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 45, 85, 0.4)' },
    '70%': { transform: 'scale(1.15)', boxShadow: '0 0 0 10px rgba(255, 45, 85, 0)' },
    '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 45, 85, 0)' },
  };

  const handleToggleFavorite = async (musicId) => {
    if (!favoriteGroup) {
      showSnackbar('收藏功能加载中，请稍候...', 'info');
      return;
    }
    
    try {
      let musicIds = [];
      try {
        musicIds = JSON.parse(favoriteGroup.content || '[]');
      } catch (e) {
        musicIds = [];
      }
      
      const isFavorite = musicIds.includes(musicId);
      let newMusicIds;
      
      if (isFavorite) {
        newMusicIds = musicIds.filter(id => id !== musicId);
      } else {
        newMusicIds = [...musicIds, musicId];
      }
      
      const payload = {
        ...favoriteGroup,
        content: JSON.stringify(newMusicIds)
      };
      
      await updateGroup(payload);
      showSnackbar(isFavorite ? '已取消收藏' : '已加入收藏');
      
      // 如果当前就在收藏页，刷新
      if (tabValue === 4) {
        fetchGroups();
      } else {
        // 否则只静默更新，不刷新整个列表以防闪烁
        fetchGroups();
      }
    } catch (error) {
      showSnackbar('操作失败', 'error');
    }
  };

  // 打开添加到合集菜单
  const handleOpenAddToGroupMenu = (event, music) => {
    setAddToGroupAnchor(event.currentTarget);
    setSelectedMusicToGroup(music);
  };

  // 关闭添加到合集菜单
  const handleCloseAddToGroupMenu = () => {
    setAddToGroupAnchor(null);
    setSelectedMusicToGroup(null);
  };

  // 将音乐添加到选定的合集
  const handleSelectGroupToAdd = async (group) => {
    try {
      let musicIds = [];
      try {
        musicIds = JSON.parse(group.content || '[]');
      } catch (e) {
        musicIds = [];
      }
      
      if (musicIds.includes(selectedMusicToGroup.id)) {
        showSnackbar('合集中已存在该音乐', 'info');
        handleCloseAddToGroupMenu();
        return;
      }
      
      const newMusicIds = [...musicIds, selectedMusicToGroup.id];
      const payload = {
        ...group,
        content: JSON.stringify(newMusicIds)
      };
      
      await updateGroup(payload);
      showSnackbar(`已添加到合集: ${group.name}`);
      fetchGroups();
      handleCloseAddToGroupMenu();
    } catch (error) {
      showSnackbar('添加失败', 'error');
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

  const playMusic = async (music, newQueue = null) => {
    const url = getAudioUrl(music.streamer_id);
    if (!url) {
      showSnackbar('音频文件不存在', 'error');
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    // 如果提供了新队列，则更新播放队列
    if (newQueue) {
      setPlayQueue(newQueue);
    } else if (playQueue.length === 0) {
      // 如果当前没有队列且没有提供新队列，默认使用整个音乐列表
      setPlayQueue(musicList);
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
    if (!currentMusic || playQueue.length === 0) return;
    const currentIndex = playQueue.findIndex(m => m.id === currentMusic.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % playQueue.length;
    playMusic(playQueue[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentMusic || playQueue.length === 0) return;
    const currentIndex = playQueue.findIndex(m => m.id === currentMusic.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
    playMusic(playQueue[prevIndex]);
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
              { label: '我的收藏', icon: <FavoriteIcon sx={{ color: '#FF7675' }} />, value: 4 },
              { label: '音乐合集', icon: <AudioIcon />, value: 3 },
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
                                        {isMusicFavorite(musicInfo.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" sx={{ stroke: '#FF2D55', strokeWidth: 1.5 }} />}
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
                                      {isPlayingCurrent && isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                                    </IconButton>
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

        {tabValue === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: getThemeColors().title }}>音乐合集</Typography>
                <ThemeSelector themes={themes} itemTheme={itemTheme} setItemTheme={setItemTheme} customColor={customColor} setCustomColor={setCustomColor} />
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
                <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 8 }}><CircularProgress /></Box>
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
        )}

        {tabValue === 4 && (
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
                    {favoriteGroup ? JSON.parse(favoriteGroup.content || '[]').length : 0} 首收藏音乐
                  </Typography>
                </Box>
                <ThemeSelector themes={themes} itemTheme={itemTheme} setItemTheme={setItemTheme} customColor={customColor} setCustomColor={setCustomColor} />
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
                  disabled={!favoriteGroup || JSON.parse(favoriteGroup.content || '[]').length === 0}
                  sx={{ borderRadius: 3 }}
                >
                  清空收藏
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<PlayArrowIcon />}
                  onClick={() => {
                    if (!favoriteGroup) return;
                    const ids = JSON.parse(favoriteGroup.content || '[]');
                    const groupQueue = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);
                    if (groupQueue.length > 0) {
                      playMusic(groupQueue[0], groupQueue);
                    } else {
                      showSnackbar('收藏夹里还没有音乐哦', 'info');
                    }
                  }}
                  disabled={!favoriteGroup || JSON.parse(favoriteGroup.content || '[]').length === 0}
                  sx={{ borderRadius: 3 }}
                >
                  播放全部
                </Button>
              </Box>
            </Box>

            {!favoriteGroup || JSON.parse(favoriteGroup.content || '[]').length === 0 ? (
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
                    {(() => {
                      const ids = JSON.parse(favoriteGroup.content || '[]');
                      const favoriteMusics = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);
                      
                      return favoriteMusics.map((music) => {
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
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{music.album_name}</TableCell>
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
                      });
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Container>

      {/* 删除确认对话框 */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          确认删除合集？
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            您确定要删除合集 <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>"{groupToDelete?.name}"</Box> 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            取消
          </Button>
          <Button 
            onClick={confirmDeleteGroup}
            variant="contained" 
            color="error"
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            确定删除
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* 新增/编辑合集对话框 */}
      <Dialog open={openGroupDialog} onClose={handleCloseGroupDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{groupDialogMode === 'create' ? '创建新合集' : '编辑合集'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="合集名称"
              fullWidth
              value={groupFormData.name}
              onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
              placeholder="输入一个好听的名字吧"
            />
            <Autocomplete
              multiple
              fullWidth
              options={musicList}
              getOptionLabel={(option) => `${option.name} - ${option.singer_name}`}
              value={musicList.filter(m => groupFormData.music_ids.includes(m.id))}
              onChange={(event, newValue) => {
                setGroupFormData({
                  ...groupFormData,
                  music_ids: newValue.map(m => m.id)
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="选择音乐"
                  placeholder="搜索并选择音乐添加到合集"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="没有找到相关的音乐"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGroupDialog}>取消</Button>
          <Button 
            onClick={handleGroupSubmit} 
            variant="contained" 
            disabled={!groupFormData.name || groupFormData.music_ids.length === 0}
          >
            保存合集
          </Button>
        </DialogActions>
      </Dialog>

      {/* 查看合集详情对话框 */}
      <Dialog 
        open={openGroupViewDialog} 
        onClose={handleCloseGroupViewDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, minHeight: '60vh' }
        }}
      >
        {selectedGroup && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255, 118, 117, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <AudioIcon sx={{ color: getThemeColors().item }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedGroup.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    共 {JSON.parse(selectedGroup.content || '[]').length} 首音乐
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  const ids = JSON.parse(selectedGroup.content || '[]');
                  const groupQueue = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);
                  if (groupQueue.length > 0) {
                    playMusic(groupQueue[0], groupQueue);
                    handleCloseGroupViewDialog();
                  }
                }}
                sx={{ borderRadius: 10 }}
              >
                播放全部
              </Button>
            </DialogTitle>
            <DialogContent>
              <List sx={{ mt: 2 }}>
                {(() => {
                  const ids = JSON.parse(selectedGroup.content || '[]');
                  const groupQueue = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);
                  
                  return groupQueue.map((music, index) => {
                    const isPlayingCurrent = currentMusic?.id === music.id;

                    return (
                      <ListItem 
                        key={music.id}
                        disablePadding
                        sx={{ mb: 1 }}
                      >
                        <ListItemButton 
                          onClick={() => playMusic(music, groupQueue)}
                          sx={{ 
                            borderRadius: 3,
                            bgcolor: isPlayingCurrent ? 'rgba(255, 118, 117, 0.05)' : 'transparent',
                            border: isPlayingCurrent ? `1px solid ${getThemeColors().item}` : '1px solid transparent',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                          }}
                        >
                          <Box sx={{ mr: 2, color: 'text.secondary', width: 24, textAlign: 'center' }}>
                            {isPlayingCurrent ? (
                              <CircularProgress size={16} thickness={6} sx={{ color: getThemeColors().item }} />
                            ) : (
                              index + 1
                            )}
                          </Box>
                          <ListItemText 
                            primary={music.name}
                            secondary={music.singer_name}
                            primaryTypographyProps={{ fontWeight: 700, color: isPlayingCurrent ? getThemeColors().item : 'text.primary' }}
                          />
                          <Stack direction="row" spacing={1}>
                            <Tooltip title={isMusicFavorite(music.id) ? "取消收藏" : "加入收藏"}>
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(music.id); }}
                                sx={{ 
                                  color: isMusicFavorite(music.id) ? '#fff' : '#FF2D55',
                                  bgcolor: isMusicFavorite(music.id) ? '#FF2D55' : 'rgba(255, 45, 85, 0.12)',
                                  border: isMusicFavorite(music.id) ? '1px solid #FF2D55' : '1.5px solid rgba(255, 45, 85, 0.6)',
                                  animation: isMusicFavorite(music.id) ? 'pulse 2s infinite' : 'none',
                                  '@keyframes pulse': pulseKeyframes,
                                  '&:hover': { 
                                    transform: 'scale(1.25) rotate(-5deg)',
                                    bgcolor: isMusicFavorite(music.id) ? '#FF3B30' : 'rgba(255, 45, 85, 0.25)',
                                    color: isMusicFavorite(music.id) ? '#fff' : '#FF2D55',
                                    border: '1px solid #FF2D55'
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                  '& .MuiSvgIcon-root': {
                                    filter: isMusicFavorite(music.id) ? 'none' : 'drop-shadow(0 0 1px rgba(255,45,85,0.8))',
                                  }
                                }}
                              >
                                {isMusicFavorite(music.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" sx={{ stroke: '#FF2D55', strokeWidth: 1.5 }} />}
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); playMusic(music, groupQueue); }}>
                              {isPlayingCurrent && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <Tooltip title="从合集中移除">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleRemoveFromGroup(selectedGroup, music.id); 
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemButton>
                      </ListItem>
                    );
                  });
                })()}
              </List>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<EditIcon />} 
                onClick={() => {
                  handleCloseGroupViewDialog();
                  handleOpenEditGroup(selectedGroup);
                }}
              >
                编辑
              </Button>
              <Button onClick={handleCloseGroupViewDialog}>关闭</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* 添加到合集的菜单 */}
      <Menu
        anchorEl={addToGroupAnchor}
        open={Boolean(addToGroupAnchor)}
        onClose={handleCloseAddToGroupMenu}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            选择要添加到的合集
          </Typography>
        </Box>
        <Divider />
        {groupList.filter(g => g.name !== '收藏').length === 0 ? (
          <MenuItem disabled>暂无其他合集</MenuItem>
        ) : (
          groupList.filter(g => g.name !== '收藏').map((group) => (
            <MenuItem key={group.id} onClick={() => handleSelectGroupToAdd(group)}>
              <ListItemIcon>
                <MusicIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={group.name} />
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem onClick={() => { handleCloseAddToGroupMenu(); handleOpenCreateGroup(); }}>
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="创建新合集..." />
        </MenuItem>
      </Menu>

      {/* 删除确认对话框 */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{
          sx: { borderRadius: 4, width: 320 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3 }}>确认删除</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
            确定要删除合集 
          </Typography>
          <Typography variant="h6" sx={{ color: getThemeColors().item, fontWeight: 800 }}>
            “{groupToDelete?.name}”
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            此操作不可撤销哦！
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenDeleteConfirm(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            取消
          </Button>
          <Button 
            onClick={confirmDeleteGroup}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, px: 3, boxShadow: '0 4px 12px rgba(214, 48, 49, 0.3)' }}
          >
            确认删除
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
