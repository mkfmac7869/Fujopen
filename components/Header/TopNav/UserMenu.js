import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import link from 'public/text/link';
import { useAuth } from '../../../lib/AuthContext';
import LocaleLink from '../../Link';
import Settings from './Settings';
import useStyles from '../header-style';

function UserMenu(props) {
  const { classes } = useStyles();
  const theme = useTheme();
  const { onToggleDark, onToggleDir } = props;
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const { t } = useTranslation('common');
  const { user, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={classes.userMenu}>
      { isDesktop && (
        <div>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              {userRole === 'admin' && (
                <Button
                  component={LocaleLink}
                  to="/admin"
                  variant="contained"
                  size="small"
                  startIcon={<DashboardIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(168, 85, 247, 0.4)',
                    }
                  }}
                >
                  Admin
                </Button>
              )}
              <Avatar 
                src={user.photoURL} 
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
              >
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Hello, {user.displayName || 'User'}
              </Typography>
              <IconButton 
                onClick={handleLogout}
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.1)',
                  }
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
              <span className={classes.vDivider} />
            </Box>
          ) : (
            <>
              <Button color="primary" component={LocaleLink} to={link.login}>{t('login')}</Button>
              <Button variant="contained" component={LocaleLink} color="primaryLight" to={link.register}>{t('register')}</Button>
              <span className={classes.vDivider} />
            </>
          )}
        </div>
      )}
      <Settings toggleDark={onToggleDark} toggleDir={onToggleDir} />
    </div>
  );
}

UserMenu.propTypes = {
  onToggleDark: PropTypes.func.isRequired,
  onToggleDir: PropTypes.func.isRequired
};

export default UserMenu;
