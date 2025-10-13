import { makeStyles } from 'tss-react/mui';
import { alpha } from '@mui/material/styles';
import gradient from 'theme/gradient';
import flag from 'public/images/flag-logo.png';

const flagIcon = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  display: 'inline-block',
  position: 'relative',
  marginRight: 5,
  top: 1,
  background: `url(${flag}) no-repeat transparent`,
  backgroundSize: '16px auto',
  '&[class="ar"]': {
    backgroundPosition: '0 3px'
  },
  '&[class="zh"]': {
    backgroundPosition: '0 -12px'
  },
  '&[class="en"]': {
    backgroundPosition: '0 -28px'
  },
  '&[class="de"]': {
    backgroundPosition: '0 -44px'
  },
  '&[class="id"]': {
    backgroundPosition: '0 -62px'
  },
  '&[class="pt"]': {
    backgroundPosition: '0 -79px'
  },
};

const headerStyles = makeStyles({ uniqId: 'header' })((theme, _params, classes) => ({
  header: {
    position: 'absolute !important',
    color: `${theme.palette.common.white} !important`,
    background: `${theme.palette.mode === 'dark' 
      ? 'rgba(15, 10, 35, 0.15)' 
      : 'linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(67, 56, 202, 0.85) 50%, rgba(109, 40, 217, 0.85) 100%)'} !important`,
    backgroundColor: `${theme.palette.mode === 'dark' 
      ? 'rgba(15, 10, 35, 0.15)' 
      : 'transparent'} !important`,
    backgroundImage: theme.palette.mode === 'light' ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(67, 56, 202, 0.85) 50%, rgba(109, 40, 217, 0.85) 100%)' : 'none',
    backdropFilter: theme.palette.mode === 'light' ? 'saturate(180%) blur(40px)' : 'saturate(220%) blur(50px) brightness(1.15)',
    WebkitBackdropFilter: theme.palette.mode === 'light' ? 'saturate(180%) blur(40px)' : 'saturate(220%) blur(50px) brightness(1.15)',
    boxShadow: `${theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 0 rgba(255, 255, 255, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.08)'
      : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 0 rgba(255, 255, 255, 1), inset 0 1px 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.9)'} !important`,
    borderBottom: `${theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.18)'
      : '1px solid rgba(255, 255, 255, 0.6)'} !important`,
    borderTop: `${theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.12)'
      : '1px solid rgba(255, 255, 255, 0.9)'} !important`,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important',
    zIndex: '100 !important',
    top: 0,
    left: 0,
    right: 0,
    margin: '0 !important',
    padding: '0 !important',
    overflow: 'visible !important',
    minHeight: '75px !important',
    maxHeight: '75px !important',
    height: '75px !important',
    '& a, & button': {
      color: theme.palette.common.white,
      textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
    },
    [`&.${classes.fixed}`]: {
      position: 'fixed !important',
      background: `${theme.palette.mode === 'dark' 
        ? 'rgba(20, 15, 40, 0.35)' 
        : 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(67, 56, 202, 0.9) 50%, rgba(109, 40, 217, 0.9) 100%)'} !important`,
      backgroundColor: `${theme.palette.mode === 'dark' 
        ? 'rgba(20, 15, 40, 0.35)' 
        : 'transparent'} !important`,
      backgroundImage: theme.palette.mode === 'light' ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(67, 56, 202, 0.9) 50%, rgba(109, 40, 217, 0.9) 100%)' : 'none',
      backdropFilter: theme.palette.mode === 'light' ? 'saturate(180%) blur(40px)' : 'saturate(240%) blur(60px) brightness(1.2)',
      WebkitBackdropFilter: theme.palette.mode === 'light' ? 'saturate(180%) blur(40px)' : 'saturate(240%) blur(60px) brightness(1.2)',
      boxShadow: `${theme.palette.mode === 'dark'
        ? '0 4px 30px rgba(0, 0, 0, 0.4), 0 1px 0 0 rgba(255, 255, 255, 0.18), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 4px 30px rgba(0, 0, 0, 0.1), 0 1px 0 0 rgba(255, 255, 255, 1), inset 0 1px 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 1px 0 rgba(255, 255, 255, 1)'} !important`,
      borderBottom: `${theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.2)'
        : '1px solid rgba(255, 255, 255, 0.7)'} !important`,
      '& a, & button': {
        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
        textShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.4)' : 'none',
      },
      [`& .${classes.logo}`]: {
        '& img': {
          maxHeight: '140px !important',
          minHeight: '140px !important',
          height: '140px !important',
          width: 'auto !important',
          objectFit: 'contain !important',
        }
      },
      '& nav': {
        padding: theme.spacing(1, 0),
      },
      [`& .${classes.vDivider}`]: {
        minHeight: theme.spacing(3)
      }
    },
    [`&.${classes.openDrawer}`]: {
      zIndex: 1600,
      boxShadow: 'none',
    }
  },
  noShadow: {
    background: theme.palette.background.paper,
    boxShadow: 'none !important',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '75px',
    maxHeight: '75px',
    height: '75px',
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between',
    },
    '& nav': {
      transition: 'all 0.3s ease',
      alignItems: 'center',
      padding: '0 8px',
      height: '75px',
      [theme.breakpoints.down('lg')]: {
        flex: 1,
        padding: '0',
      },
      display: 'flex'
    }
  },
  settingMenu: {
    width: 240
  },
  logo: {
    position: 'relative',
    zIndex: 101,
    height: '75px',
    display: 'flex',
    alignItems: 'center',
    '& a': {
      textDecoration: 'none',
      display: 'flex !important',
      alignItems: 'center',
      height: '75px',
      padding: '0',
    },
    '& img': {
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important',
      filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important',
      maxHeight: '162px !important',
      minHeight: '162px !important',
      height: '162px !important',
      width: 'auto !important',
      objectFit: 'contain !important',
      position: 'relative',
      marginTop: '0',
      marginBottom: '0',
      '&:hover': {
        transform: 'scale(1.02)',
        filter: 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important',
      }
    }
  },
  navMenu: {
    [theme.breakpoints.up('lg')]: {
      '& > *': {
        margin: theme.spacing(0, 1),
      },
    },
    '& ul li': {
      overflow: 'visible'
    }
  },
  mainMenu: {
    '& > ul': {
      listStyle: 'none',
      position: 'relative',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      '& > li': {
        display: 'inline-block',
        position: 'relative',
        margin: theme.spacing(0, 0.5),
        listStyle: 'none',
        flexShrink: 0,
        '& a, button': {
          color: 'inherit',
          textTransform: 'capitalize',
          fontWeight: 500,
          fontSize: '15px',
          padding: theme.spacing(1, 2),
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          letterSpacing: '0.01em',
        },
        '&:hover': {
          '& a, button': {
            background: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'saturate(200%) blur(30px) brightness(1.15)',
            WebkitBackdropFilter: 'saturate(200%) blur(30px) brightness(1.15)',
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 -1px 1px rgba(255, 255, 255, 0.1)'
              : '0 8px 24px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 0.9)',
          },
        },
        '&[class="active"]': {
          '& a, button': {
            background: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'saturate(220%) blur(35px) brightness(1.2)',
            WebkitBackdropFilter: 'saturate(220%) blur(35px) brightness(1.2)',
            fontWeight: 600,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 20px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(255, 255, 255, 0.15)'
              : '0 8px 20px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 1)',
          },
        }
      }
    }
  },
  scrollactiveNav: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    '& li': {
      flexShrink: 0,
      '& a, button': {
        padding: theme.spacing(0.5, 1.5),
        fontSize: 15,
        whiteSpace: 'nowrap',
      },
    }
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    height: '75px',
    padding: '0',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    '& .MuiButton-root': {
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '15px',
      padding: theme.spacing(1, 2.5),
      letterSpacing: '0.01em',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&.MuiButton-text': {
        color: theme.palette.common.white,
        '&:hover': {
          background: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }
      },
      '&.MuiButton-contained': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'saturate(220%) blur(40px) brightness(1.15)',
        WebkitBackdropFilter: 'saturate(220%) blur(40px) brightness(1.15)',
        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.dark,
        fontWeight: 700,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 28px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(255, 255, 255, 0.15)'
          : '0 8px 28px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 1)',
        '&:hover': {
          background: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.35)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'saturate(240%) blur(45px) brightness(1.2)',
          WebkitBackdropFilter: 'saturate(240%) blur(45px) brightness(1.2)',
          transform: 'translateY(-3px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(255, 255, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 1px rgba(255, 255, 255, 0.2)'
            : '0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 0 rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 1)',
        }
      }
    }
  },
  langMenu: {
    textTransform: 'capitalize',
    '& i': {
      ...flagIcon
    }
  },
  mobileMenu: {
    marginRight: theme.spacing(1),
    padding: 0,
    transform: 'scale(-1)',
    [`& .${classes.bar}`]: {
      backgroundColor: theme.palette.text.secondary,
      '&:after, &:before': {
        backgroundColor: theme.palette.text.secondary
      },
    }
  },
  vDivider: {
    margin: theme.spacing(0, 1, 0, 2),
    borderLeft: `1px solid ${theme.palette.text.disabled}`,
    height: '100%',
    opacity: 0.5,
    minHeight: theme.spacing(6)
  },
  icon: {},
  setting: {
    [`& .${classes.icon}`]: {
      transition: 'all 0.3s ease'
    },
    [`& .${classes.active}`]: {
      transform: 'rotate(30deg)'
    }
  },
  modeSwitch: {
    '& .MuiSwitch-switchBase': {
      color: theme.palette.primary.main
    },
    '& .MuiSwitch-track': {
      backgroundColor: theme.palette.primary.main
    }
  },
  bar: {},
  menu: {},
  megaMenuRoot: {
    width: '100%',
    zIndex: 100,
  },
  multiMenuRoot: {
    minWidth: 200,
    zIndex: 100,
    '& ul': {
      padding: theme.spacing(1),
      '& li': {
        borderRadius: theme.rounded.small,
        minHeight: 48,
        padding: theme.spacing(1),
        '& svg': {
          fill: theme.palette.text.hint,
          transform: theme.direction === 'rtl' ? 'scale(-1)' : 'inherit',
        }
      }
    }
  },
  multiMenu: {
    '& a, button': {
      fontSize: 13,
      lineHeight: '16px',
      padding: theme.spacing(0, 1),
      margin: theme.spacing(0.5, 0)
    }
  },
  megaMenu: {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(30, 20, 60, 0.85)' 
      : 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'saturate(200%) blur(30px)',
    WebkitBackdropFilter: 'saturate(200%) blur(30px)',
    padding: theme.spacing(4, 0),
    borderRadius: '12px',
    maxHeight: 500,
    overflow: 'auto',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(0, 0, 0, 0.05)',
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(0, 0, 0, 0.06)',
  },
  thumbMenu: {
    width: '100%',
    height: 78,
    borderRadius: theme.rounded.small,
    margin: theme.spacing(0, 1, 1),
    overflow: 'hidden',
    position: 'relative',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  },
  titleMega: {
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
    textTransform: 'uppercase',
    fontWeight: theme.typography.fontWeightBold + '!important',
    fontSize: '11px !important'
  },
  menuItem: {
    borderRadius: theme.rounded.small
  },
  thumbLink: {
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    fontSize: 14,
  },
  link: {
    padding: '0 !important',
    '&:hover': {
      backgroundColor: 'transparent !important'
    }
  },
  current: {
    background: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
  },
  /* Search */
  flex: {
    flex: 1
  },
  search: {
    position: 'relative',
    display: 'flex',
    maxWidth: 600,
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      flex: 1
    },
    '& form': {
      width: '100%'
    },
    alignItems: 'center',
    [`&.${classes.short}`]: {
      width: 260
    },
    [`& .${classes.input}`]: {
      width: '100%',
      paddingRight: theme.spacing(2),
      background: theme.palette.background.paper,
      paddingLeft: theme.spacing(5),
      borderRadius: 24,
      '& input': {
        maxHeight: 'none',
        padding: theme.spacing(1.5, 0)
      },
      '&:hover': {
        '& fieldset': {
          borderColor: theme.palette.primary.main
        }
      }
    }
  },
  searchIcon: {
    position: 'absolute',
    top: 12,
    left: theme.spacing(1)
  },
  /* Hamburger */
  invert: {},
  navLogo: {
    width: '100%',
    [`&.${classes.invert}`]: {
      [`& .${classes.logo}`]: {
        '& a': {
          color: theme.palette.text.primary,
        }
      },
      [`& .${classes.mobileMenu}`]: {
        [`& .${classes.bar}`]: {
          [theme.breakpoints.down('md')]: {
            backgroundColor: theme.palette.text.secondary,
            '&:after, &:before': {
              backgroundColor: theme.palette.text.secondary
            },
          }
        }
      },
    }
  },
  paperNav: {
    background: theme.palette.background.paper,
    backdropFilter: 'saturate(180%) blur(20px)',
    width: '100%',
    position: 'fixed',
    zIndex: 50,
    height: '100%',
  },
  mobileNav: {
    [`& .${classes.menu}`]: {
      padding: theme.spacing(0, 2),
      overflow: 'auto',
      top: theme.spacing(15),
      width: '100%',
      position: 'absolute',
      height: 'calc(100% - 80px)',
      listStyle: 'none',
      '& li': {
        textAlign: 'center',
        animationTimingFunction: 'ease',
        '& a': {
          fontSize: 24,
          padding: theme.spacing(1, 4),
          marginBottom: theme.spacing(),
          '&:before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 6,
            opacity: 0.2,
            background: `linear-gradient(120deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            height: '75%',
            width: 0,
            borderRadius: theme.rounded.big,
            transition: 'all 0.2s cubic-bezier(0, 0, 0.14, 0.97)'
          },
          '&:hover': {
            color: theme.palette.primary.main,
            background: 'none',
            '&:before': {
              width: '100%'
            },
          }
        }
      }
    }
  },
  menuList: {
    padding: '6px 0',
    textTransform: 'capitalize',
    fontSize: 13
  }
}));

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default headerStyles;
