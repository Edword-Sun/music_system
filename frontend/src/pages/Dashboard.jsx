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
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Menu,
  Autocomplete,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  PlaylistAdd as PlaylistAddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  GraphicEq as AudioIcon,
  LibraryMusic as MusicIcon,
} from '@mui/icons-material';
import {
  listMusics,
  createMusic,
  updateMusic,
  deleteMusic,
  findMusic,
  batchSyncMusic,
  listMusicHistories,
  deleteMusicHistory,
  listStreamers,
  deleteStreamer,
  createGroup,
  updateGroup,
  listGroups,
  deleteGroup,
  addMusicToGroup,
  removeMusicFromGroup,
  clearAllMusicHistory,
  getTopMusic,
} from '../api/client';
import ThemeSelector from '../components/dashboard/ThemeSelector';
import Sidebar from '../components/dashboard/Sidebar';
import PlayerControlBar from '../components/dashboard/PlayerControlBar';
import LyricsDrawer from '../components/dashboard/LyricsDrawer';
import MusicLibraryTab from '../components/dashboard/MusicLibraryTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import StreamerTab from '../components/dashboard/StreamerTab';
import GroupTab from '../components/dashboard/GroupTab';
import FavoriteTab from '../components/dashboard/FavoriteTab';
import StatsTab from '../components/dashboard/StatsTab';

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [musicList, setMusicList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [streamerList, setStreamerList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [favoriteGroup, setFavoriteGroup] = useState(null); // 收藏合集
  const [topMusic, setTopMusic] = useState([]); // 播放统计
  const [streamerSearch, setStreamerSearch] = useState('');
  const [musicSearch, setMusicSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openGroupViewDialog, setOpenGroupViewDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearch, setGroupSearch] = useState(''); // 歌单内搜索
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
  
  // 歌词相关状态
  const [lyrics, setLyrics] = useState('');
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  
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
      } else if (tabValue === 5) {
        fetchStats();
        fetchMusic();
      }
    }, [tabValue]);

  const parseLRC = (lrcContent) => {
    if (!lrcContent) return [];
    const lines = lrcContent.split('\n');
    const result = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    lines.forEach(line => {
      const content = line.replace(timeReg, '').trim();
      if (!content) return;

      let match;
      timeReg.lastIndex = 0;
      while ((match = timeReg.exec(line)) !== null) {
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = mins * 60 + secs + ms / (match[3].length === 3 ? 1000 : 100);
        result.push({ time, content });
      }
    });

    return result.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    if (currentAudio) {
      const updateTime = () => {
        const time = currentAudio.currentTime;
        setCurrentTime(time);
        
        // 更新当前歌词索引
        if (parsedLyrics.length > 0) {
          const index = parsedLyrics.findIndex((lyric, i) => {
            const nextLyric = parsedLyrics[i + 1];
            return time >= lyric.time && (!nextLyric || time < nextLyric.time);
          });
          if (index !== -1 && index !== currentLyricIndex) {
            setCurrentLyricIndex(index);
          }
        }
      };
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

  useEffect(() => {
    if (currentLyricIndex !== -1) {
      const activeElement = document.getElementById(`lyric-${currentLyricIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

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

  const seekForward = () => {
    if (currentAudio) {
      const newTime = Math.min(currentAudio.currentTime + 10, duration);
      currentAudio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const seekBackward = () => {
    if (currentAudio) {
      const newTime = Math.max(currentAudio.currentTime - 10, 0);
      currentAudio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchMusic = async (keyword = musicSearch) => {
    setLoading(true);
    try {
      const res = await listMusics({ page: 1, size: 100, keyword });
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (tabValue === 0) {
        fetchMusic();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [musicSearch]);

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

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getTopMusic(20);
      setTopMusic(res.body || []);
    } catch (error) {
      showSnackbar('获取统计数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('确定要清空所有播放历史吗？')) return;
    try {
      await clearAllMusicHistory();
      showSnackbar('历史记录已清空');
      fetchHistory();
    } catch (error) {
      showSnackbar('清空失败', 'error');
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
    setGroupSearch('');
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

  const handleSyncMusic = async () => {
    setLoading(true);
    try {
      const res = await batchSyncMusic();
      showSnackbar(res.message || '同步完成');
      fetchMusic();
    } catch (error) {
      showSnackbar('同步失败', 'error');
    } finally {
      setLoading(false);
    }
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
      await removeMusicFromGroup(group.id, musicId);
      showSnackbar('已移除');
      
      // 更新当前选中的合集视图
      if (selectedGroup && selectedGroup.id === group.id) {
        const musicIds = JSON.parse(group.content || '[]').filter(id => id !== musicId);
        setSelectedGroup({ ...group, content: JSON.stringify(musicIds) });
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
      const isFavorite = isMusicFavorite(musicId);
      
      if (isFavorite) {
        await removeMusicFromGroup(favoriteGroup.id, musicId);
        showSnackbar('已取消收藏');
      } else {
        await addMusicToGroup(favoriteGroup.id, musicId);
        showSnackbar('已加入收藏');
      }
      
      // 刷新列表以更新状态
      fetchGroups();
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
      await addMusicToGroup(group.id, selectedMusicToGroup.id);
      showSnackbar(`已添加到合集: ${group.name}`);
      fetchGroups();
      handleCloseAddToGroupMenu();
    } catch (error) {
      showSnackbar('添加失败', 'error');
    }
  };

  const handleStreamerUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (files.length === 1) {
        const res = await uploadAudio(files[0]);
        if (res.body && res.body.id) {
          showSnackbar('音乐流创建成功');
          if (tabValue === 2) {
            fetchStreamers();
          }
        } else {
          showSnackbar('创建失败', 'error');
        }
      } else {
        const res = await batchUploadAudio(files);
        const successCount = res.body?.success?.length || 0;
        const errorCount = res.body?.errors?.length || 0;
        
        if (successCount > 0) {
          showSnackbar(`成功上传 ${successCount} 个文件`);
          if (tabValue === 2) {
            fetchStreamers();
          }
        }
        if (errorCount > 0) {
          showSnackbar(`${errorCount} 个文件上传失败`, 'warning');
        }
      }
    } catch (error) {
      showSnackbar('上传过程中发生错误', 'error');
    } finally {
      setUploading(false);
      e.target.value = ''; // 清空选择
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

    // 设置并解析歌词
    const lrc = music.lyrics || '';
    setLyrics(lrc);
    setParsedLyrics(parseLRC(lrc));
    setCurrentLyricIndex(-1);

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

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽时的预览样式（可选）
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const ids = JSON.parse(selectedGroup.content || '[]');
    const newIds = [...ids];
    const [removed] = newIds.splice(draggedIndex, 1);
    newIds.splice(targetIndex, 0, removed);

    const updatedContent = JSON.stringify(newIds);
    try {
      await updateGroup({ ...selectedGroup, content: updatedContent });
      setSelectedGroup({ ...selectedGroup, content: updatedContent });
      fetchGroups();
      showSnackbar('顺序已更新');
    } catch (error) {
      showSnackbar('更新顺序失败', 'error');
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const drawerWidth = 240;
  const collapsedDrawerWidth = 64;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        tabValue={tabValue}
        setTabValue={setTabValue}
        drawerWidth={drawerWidth}
        collapsedDrawerWidth={collapsedDrawerWidth}
      />

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
          <MusicLibraryTab
            loading={loading}
            musicList={musicList}
            musicSearch={musicSearch}
            setMusicSearch={setMusicSearch}
            fetchMusic={fetchMusic}
            handleSyncMusic={handleSyncMusic}
            handleOpenCreate={handleOpenCreate}
            currentMusic={currentMusic}
            getThemeColors={getThemeColors}
            cuteFont={cuteFont}
            isMusicFavorite={isMusicFavorite}
            handleToggleFavorite={handleToggleFavorite}
            handleOpenAddToGroupMenu={handleOpenAddToGroupMenu}
            playMusic={playMusic}
            handleOpenEdit={handleOpenEdit}
            handleDeleteMusic={handleDeleteMusic}
            pulseKeyframes={pulseKeyframes}
            themes={themes}
            itemTheme={itemTheme}
            setItemTheme={setItemTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
          />
        )}

        {tabValue === 1 && (
          <HistoryTab
            loading={loading}
            historyList={historyList}
            musicList={musicList}
            fetchHistory={fetchHistory}
            handleClearHistory={handleClearHistory}
            handleDeleteHistory={handleDeleteHistory}
            musicMap={musicMap}
            getThemeColors={getThemeColors}
            themes={themes}
            itemTheme={itemTheme}
            setItemTheme={setItemTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
            cuteFont={cuteFont}
            currentMusic={currentMusic}
            playMusic={playMusic}
            isPlaying={isPlaying}
            isMusicFavorite={isMusicFavorite}
            handleToggleFavorite={handleToggleFavorite}
            pulseKeyframes={pulseKeyframes}
          />
        )}

        {tabValue === 2 && (
          <StreamerTab
            loading={loading}
            uploading={uploading}
            streamerList={streamerList}
            streamerSearch={streamerSearch}
            setStreamerSearch={setStreamerSearch}
            fetchStreamers={fetchStreamers}
            handleStreamerUpload={handleStreamerUpload}
            handleDeleteStreamer={handleDeleteStreamer}
            getThemeColors={getThemeColors}
            themes={themes}
            itemTheme={itemTheme}
            setItemTheme={setItemTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
            cuteFont={cuteFont}
          />
        )}

        {tabValue === 3 && (
          <GroupTab
            loading={loading}
            groupList={groupList}
            musicList={musicList}
            fetchGroups={fetchGroups}
            handleOpenCreateGroup={handleOpenCreateGroup}
            handleViewGroup={handleViewGroup}
            handleOpenEditGroup={handleOpenEditGroup}
            handleDeleteGroup={handleDeleteGroup}
            playMusic={playMusic}
            getThemeColors={getThemeColors}
            themes={themes}
            itemTheme={itemTheme}
            setItemTheme={setItemTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
          />
        )}

        {tabValue === 4 && (
          <FavoriteTab
            favoriteGroup={favoriteGroup}
            musicList={musicList}
            currentMusic={currentMusic}
            isPlaying={isPlaying}
            playMusic={playMusic}
            handleToggleFavorite={handleToggleFavorite}
            fetchGroups={fetchGroups}
            updateGroup={updateGroup}
            showSnackbar={showSnackbar}
            getThemeColors={getThemeColors}
            themes={themes}
            itemTheme={itemTheme}
            setItemTheme={setItemTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
            pulseKeyframes={pulseKeyframes}
            setTabValue={setTabValue}
          />
        )}

          {tabValue === 5 && (
          <StatsTab
            loading={loading}
            topMusic={topMusic}
            musicMap={musicMap}
            musicList={musicList}
            fetchStats={fetchStats}
            playMusic={playMusic}
            getThemeColors={getThemeColors}
            themes={themes}
            itemTheme={itemTheme}
            setItemTheme={setItemTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
          />
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="在歌单内搜索..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  sx={{ 
                    width: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 10,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    }
                  }}
                />
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
            </Box>
            </DialogTitle>
            <DialogContent>
              <List sx={{ mt: 2 }}>
                {(() => {
                  const ids = JSON.parse(selectedGroup.content || '[]');
                  const groupQueue = ids.map(id => musicList.find(m => m.id === id)).filter(Boolean);
                  const filteredQueue = groupQueue.filter(m => 
                    m.name.toLowerCase().includes(groupSearch.toLowerCase()) || 
                    m.singer_name.toLowerCase().includes(groupSearch.toLowerCase())
                  );
                  
                  if (filteredQueue.length === 0 && groupSearch) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">未找到匹配的音乐</Typography>
                      </Box>
                    );
                  }

                  return filteredQueue.map((music, index) => {
                    const isPlayingCurrent = currentMusic?.id === music.id;

                    return (
                      <ListItem 
                        key={music.id}
                        disablePadding
                        sx={{ 
                          mb: 1,
                          cursor: 'grab',
                          '&:active': { cursor: 'grabbing' },
                          transition: 'all 0.2s',
                          borderLeft: draggedIndex === index ? `4px solid ${getThemeColors().item}` : '4px solid transparent',
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
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

      <PlayerControlBar
        currentMusic={currentMusic}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        lyricsOpen={lyricsOpen}
        togglePlay={togglePlay}
        playPrevious={playPrevious}
        playNext={playNext}
        handleSliderChange={handleSliderChange}
        formatTime={formatTime}
        setLyricsOpen={setLyricsOpen}
        currentAudio={currentAudio}
        musicList={musicList}
        sidebarOpen={sidebarOpen}
        drawerWidth={drawerWidth}
        collapsedDrawerWidth={collapsedDrawerWidth}
      />

      <LyricsDrawer
        open={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        currentMusic={currentMusic}
        parsedLyrics={parsedLyrics}
        currentLyricIndex={currentLyricIndex}
        currentAudio={currentAudio}
      />
    </Box>
  );
};

export default Dashboard;
