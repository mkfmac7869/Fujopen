import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles()((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      borderRadius: theme.spacing(3),
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
        : '0 20px 60px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 1)',
      minWidth: 400,
      maxWidth: 600,
      [theme.breakpoints.down('sm')]: {
        minWidth: 'calc(100vw - 32px)',
        margin: theme.spacing(2),
      },
    },
  },
  title: {
    padding: theme.spacing(3, 3, 2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    position: 'relative',
  },
  titleText: {
    fontWeight: 700,
    fontSize: '1.5rem',
    flex: 1,
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%)'
      : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  content: {
    padding: theme.spacing(2, 3, 3),
  },
  message: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.87)',
    whiteSpace: 'pre-line',
  },
  actions: {
    padding: theme.spacing(2, 3, 3),
    gap: theme.spacing(2),
  },
  button: {
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
    },
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
    },
  },
  secondaryButton: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(99, 102, 241, 0.1)',
    color: theme.palette.mode === 'dark' ? '#fff' : '#6366f1',
    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#6366f1'}`,
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(99, 102, 241, 0.15)',
    },
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    flexShrink: 0,
  },
  successIcon: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
  },
  errorIcon: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
  },
  warningIcon: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
  },
  infoIcon: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
  },
}));

/**
 * Custom Dialog Component with Glassmorphism Design
 * 
 * @param {object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {function} props.onClose - Callback when dialog closes
 * @param {string} props.title - Dialog title (optional)
 * @param {string} props.message - Dialog message content
 * @param {string} props.type - Dialog type: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {string} props.confirmText - Confirm button text (default: 'OK')
 * @param {string} props.cancelText - Cancel button text (optional, shows cancel button if provided)
 * @param {function} props.onConfirm - Callback when confirm button is clicked
 * @param {function} props.onCancel - Callback when cancel button is clicked
 */
function CustomDialog({
  open = false,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
}) {
  const { classes, cx } = useStyles();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 28 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 28 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 28 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 28 }} />;
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'success':
        return classes.successIcon;
      case 'error':
        return classes.errorIcon;
      case 'warning':
        return classes.warningIcon;
      default:
        return classes.infoIcon;
    }
  };

  const getDefaultTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      className={classes.dialog}
      keepMounted
    >
      <DialogTitle className={classes.title}>
        <Box className={cx(classes.iconWrapper, getIconClass())}>
          {getIcon()}
        </Box>
        <Typography className={classes.titleText}>
          {getDefaultTitle()}
        </Typography>
        {onClose && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent className={classes.content}>
        <Typography className={classes.message}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions className={classes.actions}>
        {cancelText && (
          <Button
            onClick={handleCancel}
            className={cx(classes.button, classes.secondaryButton)}
            variant="outlined"
          >
            {cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          className={cx(classes.button, classes.primaryButton)}
          variant="contained"
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomDialog;

