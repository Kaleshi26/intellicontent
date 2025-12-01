import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const SharedContent = () => {
  // Get the shareToken from the URL (defined in App.js as /shared/:shareToken)
  const { shareToken } = useParams();

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shared Content
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Viewing content for token: <strong>{shareToken}</strong>
        </Typography>
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2">
            content placeholder... (Connect to backend to fetch real data)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SharedContent;