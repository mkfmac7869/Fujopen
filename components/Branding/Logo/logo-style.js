import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles({ uniqId: 'logo' })(theme => ({
  logo: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
  },
  landscape: {
    alignItems: 'center',
    position: 'relative',
    top: -2,
    display: 'flex',
    '& img': {
      marginRight: theme.spacing(1)
    }
  },
  portrait: {
    display: 'block',
    margin: '0 auto 8px',
    '& img': {
      margin: `0 auto ${theme.spacing(1)}`,
      display: 'block'
    }
  },
  small: {
    fontSize: 16,
    '& img': {
      maxWidth: 34,
      height: 34
    }
  },
  medium: {
    fontSize: 18,
    '& img': {
      maxWidth: '162px !important',
      minWidth: '162px !important',
      width: '162px !important',
      height: '162px !important',
      maxHeight: '162px !important',
      minHeight: '162px !important',
      objectFit: 'contain !important',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100px !important',
        minWidth: '100px !important',
        width: '100px !important',
        height: '100px !important',
        maxHeight: '100px !important',
        minHeight: '100px !important',
      }
    }
  },
  large: {
    fontSize: 28,
    '& img': {
      maxWidth: 64,
      height: 64
    }
  },
  only: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      display: 'block !important',
      margin: '0 !important',
      maxHeight: '162px !important',
      minHeight: '162px !important',
      height: '162px !important',
      width: 'auto !important',
      maxWidth: '162px !important',
      objectFit: 'contain !important',
      transition: 'all 0.3s ease',
      [theme.breakpoints.down('md')]: {
        maxHeight: '120px !important',
        minHeight: '120px !important',
        height: '120px !important',
        maxWidth: '120px !important',
      },
      [theme.breakpoints.down('sm')]: {
        maxHeight: '100px !important',
        minHeight: '100px !important',
        height: '100px !important',
        maxWidth: '100px !important',
      }
    }
  },
  landscape: {
    alignItems: 'center',
    position: 'relative',
    top: -2,
    display: 'flex',
    '& img': {
      marginRight: theme.spacing(1),
      maxHeight: '162px !important',
      minHeight: '162px !important',
      height: '162px !important',
      width: 'auto !important',
      maxWidth: '162px !important',
      objectFit: 'contain !important',
      [theme.breakpoints.down('sm')]: {
        maxHeight: '100px !important',
        minHeight: '100px !important',
        height: '100px !important',
        maxWidth: '100px !important',
      }
    }
  }
}));

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
