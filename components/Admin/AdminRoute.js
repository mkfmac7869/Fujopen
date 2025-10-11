import React from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  Fade,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../lib/AuthContext';

const useStyles = makeStyles({ uniqId: 'admin-route' })((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing(15),
    paddingBottom: theme.spacing(10),
  },
  accessDenied: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(4),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: theme.spacing(8, 6),
    textAlign: 'center',
    maxWidth: 600,
  },
}));

function AdminRoute({ children }) {
  const { user, userRole, loading } = useAuth();
  const { classes } = useStyles();
  const router = useRouter();
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (userRole !== 'admin') {
    return (
      <Container className={classes.root}>
        <Fade in timeout={500}>
          <Paper className={classes.accessDenied} elevation={0}>
            <BlockIcon sx={{ fontSize: 80, color: theme.palette.error.main, mb: 3 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: theme.palette.error.main }}>
              Access Denied
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
              You don't have permission to access this page. Admin access required.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Go to Home
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return children;
}

export default AdminRoute;

