import React, { useState } from 'react';
import {
  SwipeableDrawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CloseIcon from '@mui/icons-material/Close';
import LocaleLink from '../Link';
import { useAuth } from '../../lib/AuthContext';

const useStyles = makeStyles()((theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      width: 280,
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.98) 0%, rgba(20, 20, 40, 0.98) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 245, 250, 0.98) 100%)',
      backdropFilter: 'blur(20px)',
      borderLeft: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
    },
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    color: 'white',
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItem: {
    margin: theme.spacing(1, 2),
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      width: 0,
      height: 2,
      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      transition: 'all 0.3s ease',
      transform: 'translateX(-50%)',
    },
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(99, 102, 241, 0.15)'
        : 'rgba(99, 102, 241, 0.08)',
      transform: 'translateX(5px)',
      '&::before': {
        width: '70%',
      },
    },
    '&.active': {
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
      '&::before': {
        width: '80%',
      },
    },
  },
  icon: {
    minWidth: 50,
    '& .MuiSvgIcon-root': {
      fontSize: 24,
      transition: 'all 0.3s ease',
    },
  },
  activeIcon: {
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
      animation: 'iconBounce 0.6s ease',
    },
  },
  text: {
    '& .MuiTypography-root': {
      fontWeight: 500,
      fontSize: '0.95rem',
    },
  },
  activeText: {
    '& .MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.primary.main,
    },
  },
  divider: {
    margin: theme.spacing(2, 0),
    opacity: 0.3,
  },
  userSection: {
    padding: theme.spacing(2),
    marginTop: 'auto',
    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.05)'
      : 'rgba(99, 102, 241, 0.02)',
  },
  '@keyframes iconBounce': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '20%': {
      transform: 'translateY(-5px)',
    },
    '40%': {
      transform: 'translateY(0)',
    },
    '60%': {
      transform: 'translateY(-2px)',
    },
    '80%': {
      transform: 'translateY(0)',
    },
  },
}));

function ModernMobileMenu({ open, toggleDrawer }) {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const locale = router.query.locale || 'en';
  const currentPath = router.pathname;

  // Menu items configuration
  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      link: `/${locale}`,
    },
    {
      id: 'visa',
      label: 'Visa',
      icon: FlightIcon,
      link: `/${locale}/visa`,
    },
    {
      id: 'hotel',
      label: 'Hotel',
      icon: HotelIcon,
      link: `/${locale}/hotel`,
    },
    {
      id: 'transportation',
      label: 'Transportation',
      icon: DirectionsBusIcon,
      link: `/${locale}/transportation`,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: PersonIcon,
      link: `/${locale}/profile`,
    },
  ];

  // User menu items
  const userMenuItems = user ? [
    {
      label: 'Profile',
      icon: PersonIcon,
      link: `/${locale}/profile`,
    },
  ] : [
    {
      label: 'Login',
      icon: LoginIcon,
      link: `/${locale}/login`,
    },
    {
      label: 'Register',
      icon: HowToRegIcon,
      link: `/${locale}/register`,
    },
  ];

  const handleItemClick = (index, link) => {
    setActiveIndex(index);
    router.push(link);
    toggleDrawer();
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={toggleDrawer}
      onOpen={toggleDrawer}
      className={classes.drawer}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box className={classes.header}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Fujairah Open
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              2026 Championships
            </Typography>
          </Box>
          <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Main Navigation */}
        <List sx={{ flex: 1, py: 2 }}>
          {menuItems.map((item, index) => {
            const isActive = currentPath.includes(item.id) || activeIndex === index;
            const IconComponent = item.icon;

            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  className={cx(classes.menuItem, isActive && 'active')}
                  onClick={() => handleItemClick(index, item.link)}
                >
                  <ListItemIcon className={cx(classes.icon, isActive && classes.activeIcon)}>
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    className={cx(classes.text, isActive && classes.activeText)}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider className={classes.divider} />

        {/* User Section */}
        <Box className={classes.userSection}>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={user.photoURL}
                sx={{ 
                  width: 45, 
                  height: 45,
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.displayName || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
          
          <List disablePadding>
            {userMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    component="a"
                    href={item.link}
                    onClick={toggleDrawer}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(99, 102, 241, 0.1)'
                          : 'rgba(99, 102, 241, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <IconComponent fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}

export default ModernMobileMenu;

