import React, {
  useState,
  useRef,
  useEffect
} from 'react';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
// import AnchorLink from 'react-anchor-link-smooth-scroll';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Scrollspy from 'react-scrollspy';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Icon from '@mui/material/Icon';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import link from 'public/text/link';
import imgAPI from 'public/images/imgAPI';
import LocaleLink from '../../Link';
import useStyles from '../header-style';

// const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
//   return <AnchorLink to={props.to} {...props} />; // eslint-disable-line
// });

function MixedNav(props) {
  const {
    menuPrimary, menuSecondary, open,
    toggle, close, singleNav,
    prefix,
  } = props;
  const pathname = usePathname();
  const router = useRouter();
  const { classes } = useStyles();
  const { t, i18n } = useTranslation('common');

  const [navArr, setNavArr] = useState([]);

  const anchorRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [curURL, setCurURL] = useState('');
  const [curOrigin, setCurOrigin] = useState('');
  const [langPath, setLangPath] = useState('');
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
    toggle();
  };

  const handleDropdownOpen = (event, itemId) => {
    setDropdownAnchor(event.currentTarget);
    setActiveDropdown(itemId);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
    setActiveDropdown(null);
  };

  useEffect(() => {
    setCurURL(window.location.href);
    setCurOrigin(window.location.origin);
    setLangPath('/' + i18n.language);

    menuPrimary.map(item => setNavArr(navArray => [...navArray, item.id]));

    // Close menu when route changes
    close();
    handleDropdownClose();
  }, [pathname]);

  return (
    <Scrollspy
      className={classes.scrollactiveNav}
      items={navArr}
      currentClassName="active"
      offset={-30}
    >
      {menuPrimary.map(item => (
        <li key={item.id}>
          {item.children ? (
            // Dropdown menu item
            <>
              <Button
                onMouseEnter={(e) => handleDropdownOpen(e, item.id)}
                sx={{ position: 'relative' }}
              >
                {t(`${prefix}.${item.name}`)}
                <Icon sx={{ ml: 0.5, fontSize: '1rem' }}>arrow_drop_down</Icon>
              </Button>
              <Popper
                open={activeDropdown === item.id}
                anchorEl={dropdownAnchor}
                placement="bottom-start"
                transition
                sx={{ zIndex: 9999 }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={200}>
                    <Paper
                      onMouseLeave={handleDropdownClose}
                      sx={{
                        mt: 1,
                        minWidth: 200,
                        background: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(30, 41, 59, 0.95)' 
                          : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      }}
                    >
                      <List>
                        {item.children.map(child => (
                          <ListItem
                            key={child.id}
                            component={LocaleLink}
                            to={child.link}
                            onClick={handleDropdownClose}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                background: theme => theme.palette.mode === 'dark'
                                  ? 'rgba(99, 102, 241, 0.2)'
                                  : 'rgba(99, 102, 241, 0.1)',
                              }
                            }}
                          >
                            <ListItemText 
                              primary={t(`${prefix}.${child.name}`)}
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  fontWeight: 600,
                                  fontSize: '0.95rem'
                                } 
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </>
          ) : (
            // Regular menu item
            singleNav ? (
              <Button component={LocaleLink} to={item.link}>
                {t(`${prefix}.${item.name}`)}
              </Button>
            ) : (
              <Button component={LocaleLink} to={item.link}>
                {t(`${prefix}.${item.name}`)}
              </Button>
            )
          )}
        </li>
      ))}
    </Scrollspy>
  );
}

MixedNav.propTypes = {
  menuPrimary: PropTypes.array.isRequired,
  menuSecondary: PropTypes.array.isRequired,
  close: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  singleNav: PropTypes.bool,
  prefix: PropTypes.string.isRequired,
};

MixedNav.defaultProps = {
  singleNav: false
};

export default MixedNav;
