import React, { useState } from 'react'
import { checkHealth } from '../api/client.js'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

export default function HealthPage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    const res = await checkHealth()
    setHealth(res)
    setLoading(false)
  }

  return (
    <Box sx={{ maxWidth: '100%', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#fff' }}>
        健康检查
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCheck} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : '检查后端健康'}
      </Button>
      {health && (
        <Card sx={{ mt: 4, backgroundColor: '#181818' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>健康状态</Typography>
            <pre style={{ backgroundColor: '#121212', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
              {JSON.stringify(health, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}