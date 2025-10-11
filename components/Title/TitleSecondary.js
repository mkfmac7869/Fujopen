import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import useStyles from './title-style';

export default function TitleSecondary(props) {
  const { classes, cx } = useStyles();
  const { text, align, color } = props;
  const setAlign = alignment => {
    switch (alignment) {
      case 'right':
        return classes.right;
      case 'center':
        return classes.center;
      default:
        return classes.left;
    }
  };
  return (
    <div className={cx(classes.titleSecondary, classes[color], setAlign(align))}>
      <Typography variant="h4">
        {text}
      </Typography>
    </div>
  );
}

TitleSecondary.propTypes = {
  text: PropTypes.string.isRequired,
  align: PropTypes.string,
  color: PropTypes.string,
};

TitleSecondary.defaultProps = {
  align: 'left',
  color: 'primary'
};
