import { makeStyles } from 'tss-react/mui';
import { alpha, darken } from '@mui/material/styles';
import gradient from 'theme/gradient';

const sliderStyle = makeStyles({ uniqId: 'banner_slider' })((theme, _params, classes) => ({
  bannerWrap: {
    position: 'relative',
    display: 'block',
    overflow: 'visible',
    margin: '0 !important',
    padding: '0 !important',
    top: 0,
    left: 0,
    right: 0,
    '& ul[class*="slick-dots"]': {
      bottom: 0,
      left: 10,
      [theme.breakpoints.down('sm')]: {
        bottom: 0
      }
    },
  },
  carousel: {
    margin: '0 !important',
    padding: '0 !important',
    [theme.breakpoints.down('sm')]: {
      position: 'relative',
      zIndex: 5
    },
    '& [class*="slick-list"]': {
      overflow: 'visible',
      margin: 0,
      padding: 0
    },
    '& ul[class="slick-dots"]': {
      '& li': {
        width: 15,
        height: 15,
        boxShadow: `inset 0 0 0 1px ${theme.palette.text.disabled}`,
        border: 'none',
        borderRadius: 15,
        opacity: 1,
        margin: '0 4px !important',
        transition: 'width 0.5s ease-in',
        overflow: 'hidden',
        '& button': {
          background: gradient(theme).triple.light,
          opacity: 0,
          width: '100%',
          height: '100%',
          transition: 'opacity 1s ease-in',
        },
        '&[class="slick-active"]': {
          boxShadow: 'none',
          width: 40,
          '& button': {
            opacity: 1,
          },
        }
      },
      '& li button:before': {
        display: 'none'
      }
    }
  },
  btnArea: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      alignItems: 'center',
      [`&:not(.${classes.download})`]: {
        flexDirection: 'column'
      }
    },
    [`& .${classes.button}`]: {
      fontSize: 18,
      minWidth: 200,
      [theme.breakpoints.up('sm')]: {
        marginRight: theme.spacing(2)
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        marginBottom: theme.spacing(2)
      }
    },
    '& a': {
      display: 'inline-flex',
      [theme.breakpoints.down('sm')]: {
        margin: 4
      },
      '& img': {
        width: 160,
        [theme.breakpoints.down('sm')]: {
          width: '100%'
        }
      }
    }
  },
  slider: {
    zIndex: 1,
    '& div[class*="slick-current"]': {
      [theme.breakpoints.down('md')]: {
        zIndex: 1
      }
    },
  },
  slide: {
    position: 'relative',
    overflow: 'visible',
    margin: '0 !important',
    [theme.breakpoints.up('md')]: {
      height: 700,
      paddingTop: '0 !important',
      paddingBottom: theme.spacing(4)
    },
    [theme.breakpoints.down('md')]: {
      textAlign: 'center',
      padding: theme.spacing(8, 0, 4)
    },
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(2)
    },
    [`& .${classes.img}`]: {
      '& img': {
        margin: '20px auto 0',
        position: 'relative',
        zIndex: 5,
        [theme.breakpoints.down('md')]: {
          marginTop: theme.spacing(3)
        },
        [theme.breakpoints.down('sm')]: {
          marginTop: 0
        }
      }
    },
    [`&.${classes.cur}`]: {
      [`& .${classes.deco}`]: {
        transform: 'translateX(0px) scale(1)',
        opacity: 0.15,
      }
    },
    [`&.${classes.centerContent}`]: {
      [theme.breakpoints.up('md')]: {
        paddingTop: 0,
      },
      [`& .${classes.btnArea}`]: {
        justifyContent: 'center'
      }
    },
  },
  decoBanner: {
    position: 'relative',
    zIndex: 10,
    overflow: 'visible',
    [theme.breakpoints.down('lg')]: {
      left: 100
    }
  },
  parallaxScene: {
    right: 0,
    top: 0,
    transformOrigin: 'top',
    width: 1200,
    position: 'absolute',
    overflow: 'visible',
    display: 'none',
    '& > div': {
      position: 'absolute',
      right: '28%',
      top: 100,
      '& > div': {
        position: 'absolute'
      }
    },
    '& span': {
      display: 'block',
      position: 'absolute',
      '& img': {
        width: '100%'
      }
    },
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  hexa: {
    top: -300,
    left: 0,
    width: 100,
  },
  head: {
    top: -80,
    left: -350,
    width: 250
  },
  chest: {
    top: 30,
    left: 290,
    width: 300,
  },
  belt: {
    top: 150,
    left: -200,
    width: 240,
    overflow: 'visible',
    zIndex: 10
  },
  gem: {
    top: -350,
    left: 200,
    width: 140,
  },
  bar: {
    top: -120,
    left: -200,
    width: 250
  },
  pyramid: {
    top: 50,
    left: 300,
    width: 400,
  },
  shield: {
    top: 180,
    left: -200,
    width: 180
  },
  duo: {
    top: 150,
    left: -820,
    width: 1000
  },
  ring: {
    top: -100,
    left: -900,
    width: 150
  },
  pearl: {
    top: 250,
    left: -500,
    width: 150
  },
  imgSlide1: {
    [theme.breakpoints.up('md')]: {
      float: theme.direction === 'rtl' ? 'right' : 'left'
    }
  },
  imgSlide2: {
    [theme.breakpoints.up('md')]: {
      float: theme.direction === 'rtl' ? 'left' : 'right'
    }
  },
  hBanner: {
    textAlign: 'center',
    [`&.${classes.img}`]: {
      '& img': {
        margin: 0,
        position: 'absolute',
        bottom: -80,
        width: '90%',
        left: '5%',
        [theme.breakpoints.down('lg')]: {
          bottom: -180,
        },
        [theme.breakpoints.down('sm')]: {
          display: 'none'
        }
      }
    }
  },
  '@keyframes heroFloat': {
    '0%': {
      transform: 'translate(-5%, -5%) scale(1)',
    },
    '25%': {
      transform: 'translate(-3%, -7%) scale(1.02)',
    },
    '50%': {
      transform: 'translate(-7%, -3%) scale(1.05)',
    },
    '75%': {
      transform: 'translate(-4%, -6%) scale(1.03)',
    },
    '100%': {
      transform: 'translate(-5%, -5%) scale(1)',
    },
  },
  backgroundBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    [`&.${classes.img}`]: {
      '& img': {
        width: '110%',
        height: '110%',
        objectFit: 'cover',
        objectPosition: 'center center',
        opacity: 0.8,
        margin: 0,
        padding: 0,
        animation: 'heroFloat 20s ease-in-out infinite',
        animationName: '$heroFloat',
        animationDuration: '20s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        willChange: 'transform',
        [theme.breakpoints.down('md')]: {
          opacity: 0.7,
        },
        [theme.breakpoints.down('sm')]: {
          opacity: 0.6,
        }
      }
    },
  },
  inner: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    paddingTop: theme.spacing(10),
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      justifyContent: 'center',
      paddingTop: theme.spacing(12)
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(10)
    }
  },
  text: {
    direction: 'ltr',
    position: 'relative',
    zIndex: 99,
    '& h4': {
      fontWeight: theme.typography.fontWeightBold,
      marginBottom: theme.spacing(2)
    },
    '& h5': {
      marginBottom: theme.spacing(4)
    }
  },
  button: {},
  glassButton: {
    background: `${theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.25) !important'
      : 'rgba(255, 255, 255, 0.8) !important'}`,
    backdropFilter: 'saturate(220%) blur(40px) brightness(1.15) !important',
    WebkitBackdropFilter: 'saturate(220%) blur(40px) brightness(1.15) !important',
    color: `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.dark} !important`,
    fontWeight: '700 !important',
    borderRadius: '12px !important',
    textTransform: 'none !important',
    fontSize: '18px !important',
    padding: `${theme.spacing(1.5, 4)} !important`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 28px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(255, 255, 255, 0.15) !important'
      : '0 8px 28px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 1) !important',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
    '&:hover': {
      background: `${theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.35) !important'
        : 'rgba(255, 255, 255, 0.95) !important'}`,
      backdropFilter: 'saturate(240%) blur(45px) brightness(1.2) !important',
      WebkitBackdropFilter: 'saturate(240%) blur(45px) brightness(1.2) !important',
      transform: 'translateY(-3px) !important',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(255, 255, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 1px rgba(255, 255, 255, 0.2) !important'
        : '0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 0 rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 1) !important',
    }
  },
  download: {},
  slideNav: {
    display: 'flex',
    justifyContent: 'center',
    '& nav': {
      display: 'flex',
      margin: '0 auto',
      justifyContent: 'center',
      zIndex: 5,
      position: 'relative',
      padding: theme.spacing(1),
      borderRadius: '20px',
      background: theme.palette.mode === 'dark' ? alpha(darken(theme.palette.primary.dark, 0.5), 0.7) : alpha(theme.palette.background.paper, 0.7),
      backdropFilter: 'saturate(100%) blur(10px)',
    }
  },
  btnNav: {
    padding: theme.spacing(1, 3, 0.5),
    textTransform: 'none',
    height: 'auto',
    border: '1px solid transparent',
    fontWeight: theme.typography.fontWeightRegular,
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    [theme.breakpoints.down('lg')]: {
      padding: theme.spacing(1, 2, 0.5),
    },
    '& strong': {
      textTransform: 'capitalize',
      fontSize: 28,
      display: 'block',
      fontWeight: theme.typography.fontWeightMedium,
      marginLeft: -2,
      transition: 'all 0.5s ease-out',
      '&:before': {
        content: '""',
        width: 18,
        height: 18,
        opacity: 0,
        transform: 'scale(0)',
        transition: 'all 0.5s ease-out',
        background: theme.palette.mode === 'dark' ? gradient(theme).primary.light : gradient(theme).primary.dark,
        position: 'absolute',
        borderRadius: '50%',
        top: 16,
        left: 24,
        [theme.breakpoints.down('lg')]: {
          left: 16
        },
      }
    },
    '&:hover': {
      transition: 'all 0.3s ease-out',
      background: alpha(theme.palette.text.primary, 0.05),
      '& strong': {
        color: theme.palette.primary.main
      }
    },
    [`&.${classes.active}`]: {
      '& strong': {
        paddingLeft: theme.spacing(3),
        color: theme.palette.primary.main,
        background: theme.palette.mode === 'dark' ? gradient(theme).primary.light : gradient(theme).primary.dark,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        '&:before': {
          opacity: 1,
          transform: 'scale(1)'
        },
      },
    }
  },
  divider: {
    margin: theme.spacing(1, 2),
  },
}));

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default sliderStyle;
