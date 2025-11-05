import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Favorite as FavoriteIcon } from '@mui/icons-material';

const FavoritesPage = () => {
  const navigate = useNavigate();

  // 占位数据：后续可接入真实收藏列表
  const favorites = [];

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh', color: 'white', pb: 6 }}>
      <Container maxWidth="lg">
        {/* 顶部返回与标题 */}
        <Box sx={{ pt: 2, pb: 4, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white', mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            我的收藏
          </Typography>
        </Box>

        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <FavoriteIcon sx={{ fontSize: 64, color: '#1DB954', mb: 2 }} />
            <Typography variant="h6">还没有收藏内容</Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mt: 1 }}>
              去音乐页添加你喜欢的歌曲吧！
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {favorites.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card sx={{ bgcolor: '#181818' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                      {item.artist}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default FavoritesPage;