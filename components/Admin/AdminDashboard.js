import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  useTheme,
  Fade,
  Grow,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'next-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const useStyles = makeStyles({ uniqId: 'admin-dashboard' })((theme) => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(10),
    minHeight: '100vh',
  },
  headerSection: {
    marginBottom: theme.spacing(6),
  },
  title: {
    fontWeight: 900,
    fontSize: '3rem',
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: theme.spacing(1),
  },
  statCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    padding: theme.spacing(3),
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    }
  },
  statNumber: {
    fontSize: '3rem',
    fontWeight: 800,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
    '&:hover': {
      transform: 'translateY(-12px) scale(1.02)',
      boxShadow: '0 24px 60px rgba(99, 102, 241, 0.2)',
    }
  },
}));

function AdminDashboard() {
  const { classes } = useStyles();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisaApplications: 0,
    pendingVisas: 0,
    approvedVisas: 0,
    totalHotels: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        // Fetch visa applications
        const visasSnapshot = await getDocs(collection(db, 'visaApplications'));
        const pendingVisasQuery = query(collection(db, 'visaApplications'), where('status', 'in', ['reviewing', 'submitted', 'processing']));
        const pendingVisasSnapshot = await getDocs(pendingVisasQuery);
        const approvedVisasQuery = query(collection(db, 'visaApplications'), where('status', '==', 'approved'));
        const approvedVisasSnapshot = await getDocs(approvedVisasQuery);
        
        // Fetch hotel bookings
        const bookingsSnapshot = await getDocs(collection(db, 'hotelBookings'));
        const pendingBookingsQuery = query(collection(db, 'hotelBookings'), where('status', '==', 'pending'));
        const pendingBookingsSnapshot = await getDocs(pendingBookingsQuery);
        
        // Fetch hotels
        const hotelsSnapshot = await getDocs(collection(db, 'hotels'));

        setStats({
          totalUsers: usersSnapshot.size,
          totalVisaApplications: visasSnapshot.size,
          pendingVisas: pendingVisasSnapshot.size,
          approvedVisas: approvedVisasSnapshot.size,
          totalHotels: hotelsSnapshot.size,
          totalBookings: bookingsSnapshot.size,
          pendingBookings: pendingBookingsSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const navigationCards = [
    {
      title: 'Visa Management',
      description: 'Manage all visa applications, change status, review documents',
      icon: <AssignmentIcon sx={{ fontSize: 64 }} />,
      path: '/admin/visa-management',
      color: theme.palette.primary.main,
      stats: `${stats.pendingVisas} Pending`,
    },
    {
      title: 'Hotel Management',
      description: 'Add, edit, delete hotels and manage room availability',
      icon: <AddBusinessIcon sx={{ fontSize: 64 }} />,
      path: '/admin/hotel-management',
      color: theme.palette.secondary.main,
      stats: `${stats.totalHotels} Hotels`,
    },
    {
      title: 'Booking Management',
      description: 'View and manage all hotel bookings, confirm reservations',
      icon: <HotelIcon sx={{ fontSize: 64 }} />,
      path: '/admin/booking-management',
      color: theme.palette.success.main,
      stats: `${stats.pendingBookings} Pending`,
    },
    {
      title: 'User Management',
      description: 'View all users, change roles, manage accounts',
      icon: <PeopleIcon sx={{ fontSize: 64 }} />,
      path: '/admin/user-management',
      color: theme.palette.info.main,
      stats: `${stats.totalUsers} Users`,
    },
  ];

  if (loading) {
    return (
      <Container className={classes.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container className={classes.root}>
      <Fade in timeout={500}>
        <Box className={classes.headerSection}>
          <Typography className={classes.title}>
            <DashboardIcon sx={{ fontSize: '3rem', mr: 2, verticalAlign: 'middle' }} />
            Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8 }}>
            Manage your platform from one central location
          </Typography>
        </Box>
      </Fade>

      {/* Overview Statistics */}
      <Grow in timeout={700}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.statCard}>
              <AssignmentIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Typography className={classes.statNumber}>{stats.totalVisaApplications}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Total Visa Applications
              </Typography>
              <Chip label={`${stats.pendingVisas} Pending`} color="warning" size="small" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.statCard}>
              <HotelIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 1 }} />
              <Typography className={classes.statNumber}>{stats.totalBookings}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Hotel Bookings
              </Typography>
              <Chip label={`${stats.pendingBookings} To Confirm`} color="info" size="small" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.statCard}>
              <AddBusinessIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 1 }} />
              <Typography className={classes.statNumber}>{stats.totalHotels}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Active Hotels
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box className={classes.statCard}>
              <PeopleIcon sx={{ fontSize: 48, color: theme.palette.info.main, mb: 1 }} />
              <Typography className={classes.statNumber}>{stats.totalUsers}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Registered Users
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Grow>

      {/* Navigation Cards */}
      <Grid container spacing={4}>
        {navigationCards.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Fade in timeout={800 + index * 100}>
              <Card 
                className={classes.navCard}
                onClick={() => router.push(card.path)}
                elevation={0}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ color: card.color, mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                    {card.description}
                  </Typography>
                  <Chip 
                    label={card.stats} 
                    sx={{ 
                      fontWeight: 600,
                      background: `${card.color}20`,
                      color: card.color,
                    }} 
                  />
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth
                    variant="contained"
                    sx={{
                      background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                      fontWeight: 700,
                    }}
                  >
                    Manage
                  </Button>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default AdminDashboard;

