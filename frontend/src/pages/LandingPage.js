import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AutoAwesome,
  Speed,
  Security,
  TrendingUp,
  Code,
  Article,
  Email,
  Campaign,
  Star,
  ArrowForward,
  PlayArrow,
  CheckCircle,
  GitHub,
  Twitter,
  LinkedIn,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Generation',
      description: 'Generate high-quality content using advanced AI models including GPT-4, Claude, and more.',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Lightning Fast',
      description: 'Get your content generated in seconds with our optimized AI infrastructure.',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never share your content with third parties.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Analytics & Insights',
      description: 'Track your content performance and get detailed analytics on your generation patterns.',
    },
  ];

  const contentTypes = [
    { icon: <Article />, name: 'Blog Posts', color: '#2196F3' },
    { icon: <Email />, name: 'Emails', color: '#4CAF50' },
    { icon: <Campaign />, name: 'Marketing Copy', color: '#FF9800' },
    { icon: <Code />, name: 'Code', color: '#9C27B0' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Marketing Manager',
      company: 'TechCorp',
      avatar: 'S',
      content: 'IntelliContent has revolutionized our content creation process. We can now generate high-quality content 10x faster than before.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Startup Founder',
      company: 'InnovateLab',
      avatar: 'M',
      content: 'The AI models are incredibly accurate and the interface is so intuitive. It\'s like having a team of expert writers at my fingertips.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Freelance Writer',
      company: 'Creative Agency',
      avatar: 'E',
      content: 'I use IntelliContent for all my client projects. The quality is consistently excellent and it saves me hours every day.',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for individuals getting started',
      features: [
        '10 generations per month',
        'Basic AI models',
        'Standard support',
        'Basic templates',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'Ideal for professionals and small teams',
      features: [
        '500 generations per month',
        'All AI models',
        'Priority support',
        'Advanced templates',
        'Analytics dashboard',
        'Export options',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large teams and organizations',
      features: [
        'Unlimited generations',
        'All AI models + custom',
        '24/7 support',
        'Custom templates',
        'Advanced analytics',
        'API access',
        'Team collaboration',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Animated Background Elements */}
        <motion.div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            y: y1,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            y: y2,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            y: y1,
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 800,
                    color: 'white',
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  AI-Powered Content
                  <br />
                  <Box component="span" sx={{ color: '#FFD700' }}>
                    Generation
                  </Box>
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Create high-quality content in seconds with our advanced AI models.
                  From blog posts to marketing copy, we've got you covered.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate(isAuthenticated ? '/generate' : '/register')}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                        },
                      }}
                    >
                      {isAuthenticated ? 'Start Creating' : 'Get Started Free'}
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Watch Demo
                    </Button>
                  </motion.div>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: -1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} sx={{ color: '#FFD700', fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    4.9/5 from 10,000+ users
                  </Typography>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    perspective: '1000px',
                  }}
                >
                  <motion.div
                    animate={{
                      rotateY: [0, 5, -5, 0],
                      rotateX: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Paper
                      elevation={24}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Generate Amazing Content
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Try our AI-powered content generator
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        {contentTypes.map((type, index) => (
                          <Chip
                            key={type.name}
                            icon={type.icon}
                            label={type.name}
                            size="small"
                            sx={{
                              bgcolor: `${type.color}20`,
                              color: type.color,
                              border: `1px solid ${type.color}40`,
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AutoAwesome />}
                        onClick={() => navigate('/generate')}
                        sx={{ borderRadius: 2 }}
                      >
                        Generate Content
                      </Button>
                    </Paper>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <IconButton
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowDown sx={{ fontSize: 40 }} />
            </IconButton>
          </motion.div>
        </motion.div>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Why Choose IntelliContent?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                We provide everything you need to create amazing content with AI
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0px 20px 40px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 12, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                What Our Users Say
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Join thousands of satisfied users who trust IntelliContent
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      borderRadius: 3,
                      background: 'white',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role} at {testimonial.company}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                        ))}
                      </Box>
                      
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "{testimonial.content}"
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Simple, Transparent Pricing
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Choose the plan that's right for you
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      borderRadius: 3,
                      position: 'relative',
                      border: plan.popular ? '2px solid' : '1px solid',
                      borderColor: plan.popular ? 'primary.main' : 'divider',
                      transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    )}
                    
                    <CardContent>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        {plan.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                          {plan.price}
                        </Typography>
                        {plan.period && (
                          <Typography variant="h6" color="text.secondary">
                            {plan.period}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {plan.description}
                      </Typography>
                      
                      <List dense>
                        {plan.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant={plan.popular ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{ borderRadius: 2 }}
                      >
                        {plan.cta}
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Ready to Transform Your Content?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of creators who are already using IntelliContent
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                  >
                    Start Free Trial
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    View Demo
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AutoAwesome />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  IntelliContent
                </Typography>
              </Box>
              <Typography variant="body2" color="grey.400" sx={{ mb: 3 }}>
                The future of content creation is here. Generate amazing content with AI.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton sx={{ color: 'grey.400' }}>
                  <GitHub />
                </IconButton>
                <IconButton sx={{ color: 'grey.400' }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ color: 'grey.400' }}>
                  <LinkedIn />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Product
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Features" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Pricing" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="API" />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Company
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="About" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Blog" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Careers" />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Support
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Help Center" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Contact" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Status" />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="h6" gutterBottom>
                    Legal
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Privacy" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Terms" />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText primary="Security" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="grey.400">
              © 2024 IntelliContent. All rights reserved.
            </Typography>
            <Typography variant="body2" color="grey.400">
              Made with ❤️ for creators
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
