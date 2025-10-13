import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  bottomNav: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1300,
    maxWidth: 500,
    width: 'calc(100% - 32px)',
    background: theme.palette.mode === 'dark'
      ? 'rgba(30, 30, 50, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: 40,
    padding: theme.spacing(1.5, 2),
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  },
  menu: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  menuItem: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1, 1.5),
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 16,
    minWidth: 64,
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(99, 102, 241, 0.1)'
        : 'rgba(99, 102, 241, 0.05)',
    },
    '&.active': {
      '& $icon': {
        color: '#6366f1',
        animation: '$iconBounce 0.6s ease',
      },
      '& $text': {
        color: '#6366f1',
        fontWeight: 700,
      },
      '&::after': {
        width: 'var(--lineWidth, 40px)',
        opacity: 1,
      },
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 4,
      left: '50%',
      transform: 'translateX(-50%)',
      height: 2,
      width: 0,
      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      opacity: 0,
    },
  },
  icon: {
    fontSize: 24,
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
    transition: 'all 0.3s ease',
  },
  text: {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
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

function BottomMobileNav() {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const textRefs = useRef([]);

  const locale = router.query.locale || 'en';

  // Menu items
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
      label: 'Transport',
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

  // Update active state based on current route
  useEffect(() => {
    const currentPath = router.pathname;
    const currentIndex = menuItems.findIndex(item => 
      currentPath.includes(item.id) || 
      (item.id === 'home' && currentPath === '/[locale]')
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [router.pathname]);

  // Set line width for active item
  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex]);

  const handleItemClick = (index, link) => {
    setActiveIndex(index);
    router.push(link);
  };

  return (
    <Paper className={classes.bottomNav} elevation={8}>
      <Box className={classes.menu}>
        {menuItems.map((item, index) => {
          const isActive = index === activeIndex;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              className={cx(classes.menuItem, isActive && 'active')}
              onClick={() => handleItemClick(index, item.link)}
              ref={(el) => (itemRefs.current[index] = el)}
              style={{ '--lineWidth': '0px' }}
            >
              <IconComponent className={classes.icon} />
              <strong
                className={classes.text}
                ref={(el) => (textRefs.current[index] = el)}
              >
                {item.label}
              </strong>
            </button>
          );
        })}
      </Box>
    </Paper>
  );
}

export default BottomMobileNav;

