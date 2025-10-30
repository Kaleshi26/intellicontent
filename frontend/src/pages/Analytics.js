// frontend/src/pages/Analytics.js
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Button,
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  Timeline,
  Assessment,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { analyticsService } from '../services/api';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#FF9800', '#4CAF50', '#9C27B0', '#03A9F4'];

const StatCard = ({ icon, label, value, color = 'primary' }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 40, height: 40 }}>
          {icon}
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const { data: userAnalytics, isLoading: userLoading, error: userError } = useQuery(
    'userAnalytics',
    () => analyticsService.getUserAnalytics(),
    { select: (d) => d.data }
  );

  const { data: systemAnalytics, isLoading: systemLoading, error: systemError } = useQuery(
    'systemAnalytics',
    () => analyticsService.getSystemAnalytics(),
    { select: (d) => d.data }
  );

  const loading = userLoading || systemLoading;
  const hasError = userError || systemError;

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Analytics
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Track your usage and system performance
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<Assessment />} sx={{ borderRadius: 2 }}>
            Export Report
          </Button>
        </Box>
      </motion.div>

      {loading && (
        <Box>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading analytics...</Typography>
        </Box>
      )}

      {hasError && (
        <Typography color="error" sx={{ mb: 2 }}>
          Failed to load analytics. Please try again later.
        </Typography>
      )}

      {!loading && !hasError && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<AutoAwesome />}
              label="Your Total Generations"
              value={userAnalytics?.total_generations ?? 0}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<TrendingUp />}
              label="Monthly Generations"
              value={userAnalytics?.monthly_generations ?? 0}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<CheckCircle />}
              label="Success Rate"
              value={`${userAnalytics?.success_rate ?? 0}%`}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              icon={<Timeline />}
              label="Avg. Generation Time (s)"
              value={userAnalytics?.avg_generation_time_s ?? 0}
              color="info"
            />
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Generations Over Time
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={systemAnalytics?.generations_over_time || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Content Types
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={systemAnalytics?.by_content_type || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(systemAnalytics?.by_content_type || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Models Usage
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={systemAnalytics?.by_model || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#764ba2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Top Prompts
                </Typography>
                {(systemAnalytics?.top_prompts || []).slice(0, 6).map((p, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Chip label={`#${idx + 1}`} size="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.prompt}
                    </Typography>
                    <Chip label={`${p.count} uses`} size="small" variant="outlined" />
                  </Box>
                ))}
                {(!systemAnalytics?.top_prompts || systemAnalytics.top_prompts.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No prompt data available yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;
