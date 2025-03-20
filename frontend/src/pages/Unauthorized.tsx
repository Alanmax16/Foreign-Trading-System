import React from 'react';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          You don't have permission to access this page. This area requires additional privileges.
        </Typography>
        
        <Typography variant="body2" paragraph color="text.secondary">
          If you believe you should have access to this page, please contact your administrator.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Go Back
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized; 