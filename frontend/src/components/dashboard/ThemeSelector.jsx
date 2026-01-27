import React from 'react';
import { Box, Typography, Tooltip, Fade, Divider } from '@mui/material';

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

export default ThemeSelector;
