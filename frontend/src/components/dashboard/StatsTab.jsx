import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import ThemeSelector from './ThemeSelector';

const StatsTab = ({
  loading,
  topMusic,
  musicMap,
  musicList,
  fetchStats,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: 3, 
            bgcolor: 'rgba(84, 160, 255, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <BarChartIcon sx={{ color: '#54A0FF', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: getThemeColors().title, fontWeight: 800 }}>播放统计</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              看看你最近最爱听哪些歌
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
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStats}>
          刷新统计
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : topMusic.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.5)', border: '2px dashed rgba(84, 160, 255, 0.2)' }}>
          <BarChartIcon sx={{ fontSize: 64, color: '#54A0FF', mb: 2, opacity: 0.3 }} />
          <Typography color="text.secondary" variant="h6" sx={{ fontWeight: 700 }}>暂无统计数据</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            快去播放几首音乐吧，听得越多，统计越准哦！
          </Typography>
        </Paper>
      ) : (
        <Box>
          {/* 可视化图表 */}
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 4, 
              background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#2D3436', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon sx={{ color: 'primary.main' }} />
              前 10 名播放量排行
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topMusic.slice(0, 10).map((stat, index) => {
                const music = musicMap[stat.music_id] || musicList.find(m => m.id === stat.music_id) || {};
                const maxCount = topMusic[0]?.count || 1;
                const percentage = (stat.count / maxCount) * 100;
                
                return (
                  <Box key={stat.music_id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ width: 24, fontWeight: 800, color: index < 3 ? 'primary.main' : 'text.disabled', fontSize: '0.9rem' }}>
                      {index + 1}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#2D3436' }}>
                          {music.name || '未知歌曲'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {stat.count} 次
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        height: 8, 
                        width: '100%', 
                        bgcolor: 'rgba(0,0,0,0.04)', 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          bgcolor: index < 3 ? 'primary.main' : 'primary.light',
                          borderRadius: 4,
                          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: index < 3 ? '0 0 10px rgba(255, 118, 117, 0.3)' : 'none'
                        }} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
            {topMusic.map((stat, index) => {
              const music = musicMap[stat.music_id] || musicList.find(m => m.id === stat.music_id) || {};
              return (
                <Paper 
                  key={stat.music_id} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
                  }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(84, 160, 255, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#54A0FF'
                  }}>
                    {index + 1}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{music.name || '未知歌曲'}</Typography>
                    <Typography variant="caption" color="text.secondary">{music.singer_name || '未知歌手'}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {stat.count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      次播放
                    </Typography>
                  </Box>
                  <IconButton 
                    color="primary" 
                    onClick={() => playMusic(music, musicList)}
                    sx={{ bgcolor: 'rgba(255, 118, 117, 0.1)' }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StatsTab;
