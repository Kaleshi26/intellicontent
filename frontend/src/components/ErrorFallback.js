import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { ErrorOutline, Refresh } from '@mui/icons-material';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <ErrorOutline sx={{ fontSize: 80, mb: 2 }} />
          </motion.div>
          
          <Typography variant="h4" gutterBottom>
            Oops! Something went wrong
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            We're sorry, but something unexpected happened. Don't worry, our team has been notified.
          </Typography>
          
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                bgcolor: 'rgba(0,0,0,0.2)',
                p: 2,
                borderRadius: 2,
                mb: 3,
                textAlign: 'left',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="body2" color="error">
                {error.message}
              </Typography>
            </Box>
          )}
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={resetErrorBoundary}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Try Again
            </Button>
          </motion.div>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ErrorFallback;
