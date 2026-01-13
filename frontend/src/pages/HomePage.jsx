import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  AppBar,
  Toolbar,
  Avatar,
  Button,
  Slider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Favorite,
  FavoriteBorder,
  Home,
  Search,
  LibraryMusic,
  VolumeUp,
  Shuffle,
  Repeat,
  Person,
  MusicNote,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { listMusics, updateMusic, addMusicHistory, findMusic } from '../api/client';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [musicList, setMusicList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef(new Audio());
  const drawerWidth = 240;

  useEffect(() => {
    fetchMusic();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (currentTrack?.streamer_id) {
      const audio = audioRef.current;
      audio.src = `/streamer/audio?id=${currentTrack.streamer_id}`;
      if (isPlaying) {
        audio.play().catch(err => console.error("Playback error:", err));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error("Playback error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const fetchMusic = async () => {
    try {
      const response = await listMusics({ page: 1, size: 20 });
      const list = response.body.data || [];
      setMusicList(list);
      if (list.length > 0 && !currentTrack) {
        setCurrentTrack(list[0]);
      }
    } catch (error) {
      console.error('获取音乐失败:', error);
    }
  };

  const recordPlayback = async (music) => {
    if (!music) return;
    
    try {
      // 1. 增加播放次数
      const response = await findMusic({ id: music.id });
      const latestMusic = response.body;
      if (latestMusic) {
        const updatedMusic = {
          ...latestMusic,
          visit_count: (latestMusic.visit_count || 0) + 1
        };
        await updateMusic(updatedMusic);
        
        // 更新本地列表中的点击次数
        setMusicList(prev => prev.map(m => m.id === music.id ? updatedMusic : m));
      }

      // 2. 记录播放历史
      if (user) {
        await addMusicHistory({
          music_id: music.id,
          user_id: user.id,
          description: `在首页播放了歌曲: ${music.name}`
        });
      }
    } catch (error) {
      console.error('记录播放数据失败:', error);
    }
  };

  const handlePlayPause = () => {
    if (!currentTrack) return;
    const nextPlayingState = !isPlaying;
    setIsPlaying(nextPlayingState);
    
    // 如果是从暂停变为播放，记录一次
    if (nextPlayingState) {
      recordPlayback(currentTrack);
    }
  };

  const handleNext = () => {
    if (musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % musicList.length;
    const nextTrack = musicList[nextIndex];
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    recordPlayback(nextTrack);
  };

  const handlePrevious = () => {
    if (musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    const prevTrack = musicList[prevIndex];
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    recordPlayback(prevTrack);
  };

  const handleSeek = (event, newValue) => {
    audioRef.current.currentTime = newValue;
    setCurrentTime(newValue);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const menuItems = [
    { text: '首页', icon: <Home />, path: '/' },
    { text: '用户管理', icon: <Person />, path: '/user' },
    { text: '音乐管理', icon: <MusicNote />, path: '/music' },
    { text: '我的收藏', icon: <FavoriteIcon />, path: '/favorites' },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* 侧边栏 */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#000000',
            color: 'white',
            borderRight: '1px solid #282828',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 3, color: '#1DB954' }}>
            Music System
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#282828',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 主内容区 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pb: 12 }}>
        <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 'none', mb: 3 }}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'white',
                borderRadius: 20,
                mr: 2,
                '&:hover': {
                  borderColor: '#1DB954',
                  color: '#1DB954',
                },
              }}
            >
              升级到专业版
            </Button>
            <Avatar 
              sx={{ bgcolor: '#1DB954', cursor: 'pointer' }}
              onClick={() => navigate('/user')}
            >
              U
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* 最近播放/所有音乐 */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          音乐库
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {musicList.map((music) => (
            <Grid item xs={12} sm={6} md={3} key={music.id}>
              <Card
                sx={{
                  bgcolor: '#181818',
                  color: 'white',
                  transition: '0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#282828',
                    transform: 'translateY(-4px)',
                  },
                  border: currentTrack?.id === music.id ? '1px solid #1DB954' : 'none'
                }}
                onClick={() => {
                  setCurrentTrack(music);
                  setIsPlaying(true);
                  recordPlayback(music);
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: '#282828',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MusicNote sx={{ fontSize: 80, color: '#535353' }} />
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" noWrap sx={{ color: currentTrack?.id === music.id ? '#1DB954' : 'white' }}>
                    {music.name || '未命名'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                    {music.singer_name || '未知歌手'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {musicList.length === 0 && (
            <Grid item xs={12}>
              <Typography sx={{ color: '#b3b3b3', textAlign: 'center', py: 5 }}>
                音乐库暂无音乐，请前往“音乐管理”上传
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* 底部播放控制栏 */}
      {currentTrack && (
        <AppBar
          position="fixed"
          sx={{
            top: 'auto',
            bottom: 0,
            bgcolor: '#181818',
            borderTop: '1px solid #282828',
            zIndex: 1201
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', height: '100px', px: 2 }}>
            {/* 当前播放歌曲信息 */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '30%' }}>
              <Avatar
                variant="square"
                sx={{ width: 56, height: 56, mr: 2, bgcolor: '#282828' }}
              >
                <MusicNote />
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle1" noWrap>
                  {currentTrack.name || '未命名'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }} noWrap>
                  {currentTrack.singer_name || '未知歌手'}
                </Typography>
              </Box>
              <IconButton sx={{ ml: 1, color: 'white' }}>
                <FavoriteBorder />
              </IconButton>
            </Box>

            {/* 播放控制 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton sx={{ color: 'white' }} size="small">
                  <Shuffle />
                </IconButton>
                <IconButton sx={{ color: 'white' }} onClick={handlePrevious}>
                  <SkipPrevious />
                </IconButton>
                <IconButton
                  sx={{
                    color: 'black',
                    bgcolor: 'white',
                    p: 1,
                    mx: 2,
                    '&:hover': { 
                      bgcolor: '#1DB954',
                      transform: 'scale(1.05)'
                    },
                  }}
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton sx={{ color: 'white' }} onClick={handleNext}>
                  <SkipNext />
                </IconButton>
                <IconButton sx={{ color: 'white' }} size="small">
                  <Repeat />
                </IconButton>
              </Box>
              {/* 进度条 */}
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: 35 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Slider
                  size="small"
                  value={currentTime}
                  max={duration || 0}
                  onChange={handleSeek}
                  sx={{
                    color: '#1DB954',
                    height: 4,
                    '& .MuiSlider-thumb': {
                      width: 0,
                      height: 0,
                      transition: '0.3s',
                      '&:hover, &.Mui-focusVisible, &.Mui-active': {
                        width: 12,
                        height: 12,
                        boxShadow: 'none'
                      },
                    },
                    '& .MuiSlider-rail': {
                      bgcolor: '#4f4f4f',
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: 35 }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>

            {/* 音量控制 */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '30%', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton sx={{ color: 'white' }} size="small">
                <VolumeUp />
              </IconButton>
              <Slider
                size="small"
                value={volume * 100}
                onChange={(e, v) => setVolume(v / 100)}
                sx={{
                  width: 100,
                  color: 'white',
                  '&:hover': { color: '#1DB954' },
                  '& .MuiSlider-thumb': {
                    width: 0,
                    height: 0,
                    '&:hover, &.Mui-focusVisible, &.Mui-active': {
                      width: 10,
                      height: 10,
                    },
                  },
                }}
              />
            </Box>
          </Toolbar>
        </AppBar>
      )}
    </Box>
  );
};

export default HomePage;