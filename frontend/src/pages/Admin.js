
//import React from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';

const Admin = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the administration panel.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6">Users</Typography>
              <Typography variant="h3">0</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6">System Status</Typography>
              <Typography variant="body1" color="success.main">Active</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Admin;