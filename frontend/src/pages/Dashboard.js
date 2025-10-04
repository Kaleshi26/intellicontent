// frontend/src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { authService, contentService } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byType: [],
    byModel: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, contentsData] = await Promise.all([
        authService.getCurrentUser(),
        contentService.getContents()
      ]);
      
      setUser(userData);
      setContents(contentsData);
      
      // Calculate statistics
      const typeCount = {};
      const modelCount = {};
      
      contentsData.forEach(content => {
        typeCount[content.content_type] = (typeCount[content.content_type] || 0) + 1;
        modelCount[content.model_used] = (modelCount[content.model_used] || 0) + 1;
      });
      
      setStats({
        total: contentsData.length,
        byType: Object.entries(typeCount).map(([name, value]) => ({ name, value })),
        byModel: Object.entries(modelCount).map(([name, value]) => ({ name, value }))
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.username}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Generations
              </Typography>
              <Typography variant="h3">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Account Created
              </Typography>
              <Typography variant="h6">
                {new Date(user?.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="h6">
                {user?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Content Types Distribution
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={stats.byType}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Models Used
            </Typography>
            <BarChart width={400} height={300} data={stats.byModel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;