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

  const handleToggle = (event) => {
    setAnchorEl(event.currentTarget);
    toggle();
  };

  useEffect(() => {
    setCurURL(window.location.href);
    setCurOrigin(window.location.origin);
    setLangPath('/' + i18n.language);

    menuPrimary.map(item => setNavArr(navArray => [...navArray, item.id]));

    // Close menu when route changes
    close();
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
          {singleNav ? (
            <Button component={LocaleLink} to={item.link}>
              {t(`${prefix}.header_` + item.id)}
            </Button>
          ) : (
            <Button component={LocaleLink} to={item.link}>
              {t(`${prefix}.header_` + item.id)}
            </Button>
          )}
        </li>
      ))}
      {/* All Pages dropdown removed */}
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
