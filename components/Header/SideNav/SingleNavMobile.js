import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import link from 'public/text/link';
import LocaleLink from '../../Link';
import useStyles from '../sidenav-style';

function SingleNavMobile(props) {
  const { classes, cx } = useStyles();
  const {
    menu, toggleDrawer,
    open, singleNav, prefix
  } = props;
  const { t, i18n } = useTranslation('common');
  const router = useRouter();

  const [curURL, setCurURL] = useState('');
  const [curOrigin, setCurOrigin] = useState('');
  const [langPath, setLangPath] = useState('');

  useEffect(() => {
    setCurURL(window.location.href);
    setCurOrigin(window.location.origin);
    setLangPath('/' + i18n.language);
  }, []);

  const SideList = () => {
    const locale = router.query.locale || 'en';
    
    return (
    <div
      className={classes.mobileNav}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <div className={cx(classes.menu, open && classes.menuOpen)}>
        <List className={classes.sideSinglelv}>
          {menu.map(item => (
            <Fragment key={item.id}>
              {item.link ? (
                <ListItem
                  button
                  component="a"
                  href={item.link}
                  onClick={toggleDrawer}
                >
                  <ListItemText primary={t(`ai-landing.${item.name}`)} className={classes.menuList} />
                </ListItem>
              ) : singleNav ? (
                <ListItem
                  button
                  component="a"
                  href={item.link}
                  onClick={toggleDrawer}
                >
                  <ListItemText primary={t(`ai-landing.${item.name}`)} className={classes.menuList} />
                </ListItem>
              ) : (
                <ListItem
                  button
                  component={LocaleLink}
                  to={item.link}
                >
                  <ListItemText primary={t(`ai-landing.${item.name}`)} className={classes.menuList} />
                </ListItem>
              )}
            </Fragment>
          ))}
        </List>
        <Divider />
        <List className={classes.userMenu}>
          {['login', 'register'].map((text, index) => (
            <ListItem
              key={index.toString()}
              className={cx(classes.noChild, curURL === curOrigin + langPath + '/' + text + '/' ? classes.current : '')}
              component={LocaleLink}
              to={link[text]}
              button
            >
              <ListItemText className={classes.menuList} primary={t('' + text)} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
    );
  };

  return (
    <SwipeableDrawer
      open={open}
      onClose={toggleDrawer}
      onOpen={toggleDrawer}
      anchor="right"
      classes={{
        paper: classes.paperNav
      }}
    >
      <SideList />
    </SwipeableDrawer>
  );
}

SingleNavMobile.propTypes = {
  menu: PropTypes.array.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  singleNav: PropTypes.bool,
  prefix: PropTypes.string,
};

SingleNavMobile.defaultProps = {
  singleNav: false,
  prefix: 'ai-landing'
};

export default SingleNavMobile;
