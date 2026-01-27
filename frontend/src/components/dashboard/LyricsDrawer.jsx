import React from 'react';
import { Drawer, Box, Typography } from '@mui/material';

const LyricsDrawer = ({
  open,
  onClose,
  currentMusic,
  parsedLyrics,
  currentLyricIndex,
  currentAudio
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          {currentMusic?.name || '未在播放'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
          {currentMusic?.singer_name || '-'}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          textAlign: 'center',
          py: 10,
          px: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2 }
        }}
      >
        {parsedLyrics.length > 0 ? (
          parsedLyrics.map((lyric, index) => (
             <Typography
               key={index}
               id={`lyric-${index}`}
               sx={{
                 py: 1.5,
                fontSize: index === currentLyricIndex ? '1.4rem' : '1.1rem',
                fontWeight: index === currentLyricIndex ? 800 : 500,
                color: index === currentLyricIndex ? 'primary.main' : 'text.secondary',
                opacity: index === currentLyricIndex ? 1 : 0.6,
                transition: 'all 0.3s ease-out',
                transform: index === currentLyricIndex ? 'scale(1.1)' : 'scale(1)',
                cursor: 'pointer',
                '&:hover': { opacity: 1 }
              }}
              onClick={() => {
                if (currentAudio) currentAudio.currentTime = lyric.time;
              }}
            >
              {lyric.content}
            </Typography>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic', mt: 10 }}>
            暂无歌词
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default LyricsDrawer;
