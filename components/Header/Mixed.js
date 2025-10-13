import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import link from 'public/text/link';
import Logo from '../Branding/Logo';
import BottomMobileNav from './BottomMobileNav';
import HeaderMenu from './TopNav/MixedNav';
import UserMenu from './TopNav/UserMenu';
import useStyles from './header-style';
import samplePages from './data/sample-pages';
import LocaleLink from '../Link';

function Mixed(props) {
  const [fixed, setFixed] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const {
    onToggleDark, onToggleDir,
    menu, home, prefix
  } = props;
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  let flagFixed = false;

  const handleScroll = () => {
    const doc = document.documentElement;
    const scroll = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    const newFlagFixed = (scroll > 80);
    if (flagFixed !== newFlagFixed) {
      setFixed(newFlagFixed);
      flagFixed = newFlagFixed;
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
  }, []);

  const handleOpenDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleToggle = () => {
    setOpenMenu((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpenMenu(false);
  };

  return (
    <Fragment>
      {isMobile && <BottomMobileNav />}
      <AppBar
        position="absolute"
        id="header"
        elevation={0}
        sx={{
          backgroundColor: 'transparent !important',
          backgroundImage: 'none !important',
          '&::before': {
            display: 'none'
          }
        }}
        className={cx(
          classes.header,
          openMenu && classes.noShadow,
          fixed && classes.fixed,
          openDrawer && classes.openDrawer
        )}
      >
        <Container fixed={isDesktop}>
          <div className={classes.headerContent}>
            <nav className={classes.navMenu}>
              <div className={classes.logo}>
                <LocaleLink to={link.home}>
                  <Logo type="only" />
                </LocaleLink>
              </div>
              {isDesktop && (
                <div className={classes.mainMenu}>
                  <HeaderMenu
                    open={openMenu}
                    menuPrimary={menu}
                    menuSecondary={samplePages}
                    toggle={handleToggle}
                    close={handleClose}
                    singleNav={home}
                    prefix={prefix}
                  />
                </div>
              )}
            </nav>
            <UserMenu onToggleDark={onToggleDark} onToggleDir={onToggleDir} />
          </div>
        </Container>
      </AppBar>
    </Fragment>
  );
}

Mixed.propTypes = {
  onToggleDark: PropTypes.func.isRequired,
  onToggleDir: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  menu: PropTypes.array.isRequired,
  home: PropTypes.bool
};

Mixed.defaultProps = {
  home: false
};

export default Mixed;
