// LoadingScreen.js
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'white',
            mb: 3,
          }}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Typography variant="h5" gutterBottom>
          Loading IntelliContent
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Please wait while we prepare everything for you...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;
