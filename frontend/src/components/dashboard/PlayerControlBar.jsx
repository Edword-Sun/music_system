import React from 'react';
import { 
  Paper, Box, Container, Stack, Typography, IconButton, Slider, Tooltip 
} from '@mui/material';
import {
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  MusicNote as AudioIcon
} from '@mui/icons-material';

const PlayerControlBar = ({
  currentMusic,
  isPlaying,
  currentTime,
  duration,
  lyricsOpen,
  togglePlay,
  playPrevious,
  playNext,
  handleSliderChange,
  formatTime,
  setLyricsOpen,
  currentAudio,
  musicList,
  sidebarOpen,
  drawerWidth,
  collapsedDrawerWidth
}) => {
  if (!currentMusic) return null;

  return (
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

          <Box sx={{ display: 'flex', alignItems: 'center', width: 200, gap: 1 }}>
            <VolumeUpIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Slider
              size="small"
              defaultValue={100}
              onChange={(e, val) => {
                if (currentAudio) currentAudio.volume = val / 100;
              }}
              sx={{ 
                color: 'text.secondary',
                flexGrow: 1,
                '& .MuiSlider-thumb': { width: 12, height: 12 }
              }}
            />
            <Tooltip title="歌词">
              <IconButton 
                onClick={() => setLyricsOpen(!lyricsOpen)}
                sx={{ 
                  color: lyricsOpen ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <AudioIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Container>
    </Paper>
  );
};

export default PlayerControlBar;
