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
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { alpha } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../lib/AuthContext';

const useStyles = makeStyles({ uniqId: 'protected-route' })((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing(15),
    paddingBottom: theme.spacing(10),
  },
  lockCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(4),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
      : '0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 1)',
    padding: theme.spacing(8, 6),
    textAlign: 'center',
    maxWidth: 600,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      opacity: 0.8,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(6, 4),
    }
  },
  lockIcon: {
    fontSize: 80,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(3),
    opacity: 0.8,
  },
  title: {
    fontWeight: 800,
    fontSize: '2.5rem',
    marginBottom: theme.spacing(2),
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    }
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.8,
    marginBottom: theme.spacing(4),
    lineHeight: 1.6,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    }
  },
  loginButton: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.common.white,
    fontWeight: 700,
    padding: theme.spacing(1.5, 4),
    fontSize: '1rem',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
    }
  },
  registerButton: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.9)',
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    fontWeight: 700,
    padding: theme.spacing(1.5, 4),
    fontSize: '1rem',
    '&:hover': {
      transform: 'translateY(-2px)',
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 1)',
    }
  },
}));

function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const { classes } = useStyles();
  const router = useRouter();
  const theme = useTheme();

  if (loading) {
    return null; // or a loading spinner
  }

  if (requireAuth && !user) {
    return (
      <Container className={classes.root}>
        <Fade in timeout={500}>
          <Paper className={classes.lockCard} elevation={0}>
            <LockIcon className={classes.lockIcon} />
            <Typography className={classes.title}>
              Login Required
            </Typography>
            <Typography className={classes.subtitle}>
              Please log in to access this page and manage your visa applications and hotel bookings.
            </Typography>
            <Box className={classes.buttonGroup}>
              <Button
                variant="contained"
                size="large"
                className={classes.loginButton}
                startIcon={<LoginIcon />}
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                size="large"
                className={classes.registerButton}
                startIcon={<PersonAddIcon />}
                onClick={() => router.push('/register')}
              >
                Register
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return children;
}

export default ProtectedRoute;

