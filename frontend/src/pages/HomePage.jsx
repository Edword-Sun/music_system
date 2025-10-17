import React from 'react';
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

// 模拟数据
const recentlyPlayed = [
  { id: 1, title: '晴天', artist: '周杰伦', album: '叶惠美', cover: 'https://i.scdn.co/image/ab67616d0000b273f7f74100d5cc850e01172cbf' },
  { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', cover: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96' },
  { id: 3, title: '起风了', artist: '买辣椒也用券', album: '起风了', cover: 'https://i.scdn.co/image/ab67616d0000b2739cc4583e3489f902ca81e35f' },
  { id: 4, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
];

const recommendedPlaylists = [
  { id: 1, title: '华语流行精选', description: '最热华语歌曲合集', cover: 'https://i.scdn.co/image/ab67706f00000002ca5a7517156021292e5663a6' },
  { id: 2, title: 'Global Top 50', description: '全球热门歌曲', cover: 'https://i.scdn.co/image/ab67706f000000025c2cc3ffa5144b857c3c8be0' },
  { id: 3, title: '怀旧经典', description: '永恒的华语经典', cover: 'https://i.scdn.co/image/ab67706f000000025ba1f2b4c9e528e89bb20896' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTrack, setCurrentTrack] = React.useState(recentlyPlayed[0]);

  const drawerWidth = 240;

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
      <Box component="main" sx={{ flexGrow: 1, p: 3, pb: 10 }}>
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

        {/* 最近播放 */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          最近播放
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {recentlyPlayed.map((track) => (
            <Grid item xs={12} sm={6} md={3} key={track.id}>
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
                }}
                onClick={() => setCurrentTrack(track)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={track.cover}
                  alt={track.title}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {track.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                    {track.artist}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 推荐歌单 */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          为你推荐
        </Typography>
        <Grid container spacing={2}>
          {recommendedPlaylists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} key={playlist.id}>
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
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={playlist.cover}
                  alt={playlist.title}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {playlist.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                    {playlist.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 底部播放控制栏 */}
      <AppBar
        position="fixed"
        sx={{
          top: 'auto',
          bottom: 0,
          bgcolor: '#181818',
          borderTop: '1px solid #282828',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: '90px' }}>
          {/* 当前播放歌曲信息 */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '30%' }}>
            <CardMedia
              component="img"
              sx={{ width: 56, height: 56, mr: 2 }}
              image={currentTrack.cover}
              alt={currentTrack.title}
            />
            <Box>
              <Typography variant="subtitle1" noWrap>
                {currentTrack.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ color: '#b3b3b3' }}>
                {currentTrack.artist}
              </Typography>
            </Box>
            <IconButton sx={{ ml: 1, color: 'white' }}>
              <FavoriteBorder />
            </IconButton>
          </Box>

          {/* 播放控制 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton sx={{ color: 'white' }}>
                <Shuffle />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <SkipPrevious />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'white',
                  p: 1,
                  '&:hover': { bgcolor: '#1DB954' },
                }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause sx={{ color: '#000' }} /> : <PlayArrow sx={{ color: '#000' }} />}
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <SkipNext />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <Repeat />
              </IconButton>
            </Box>
            {/* 进度条 */}
            <Box
              sx={{
                width: '100%',
                height: 4,
                bgcolor: '#4f4f4f',
                borderRadius: 2,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  '& .progress-bar': {
                    bgcolor: '#1DB954',
                  },
                },
              }}
            >
              <Box
                className="progress-bar"
                sx={{
                  width: '30%',
                  height: '100%',
                  bgcolor: '#1DB954',
                  borderRadius: 2,
                  transition: 'background-color 0.2s',
                }}
              />
            </Box>
          </Box>

          {/* 音量控制 */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '30%', justifyContent: 'flex-end' }}>
            <IconButton sx={{ color: 'white' }}>
              <VolumeUp />
            </IconButton>
            <Box
              sx={{
                width: 100,
                height: 4,
                bgcolor: '#4f4f4f',
                borderRadius: 2,
                ml: 1,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  '& .volume-bar': {
                    bgcolor: '#1DB954',
                  },
                },
              }}
            >
              <Box
                className="volume-bar"
                sx={{
                  width: '70%',
                  height: '100%',
                  bgcolor: '#1DB954',
                  borderRadius: 2,
                  transition: 'background-color 0.2s',
                }}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default HomePage;