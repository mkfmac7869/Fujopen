import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { useTranslation } from 'next-i18next';
import routeLink from 'public/text/link';
import { useText } from 'theme/common';
import { useAuth } from '../../lib/AuthContext';
import LocaleLink from '../Link';
import SocialAuth from './SocialAuth';
import AuthFrame from './AuthFrame';
import useStyles from './form-style';

function Login() {
  const { classes } = useStyles();
  const { classes: text } = useText();
  const { t } = useTranslation('common');
  const { login } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      if (value !== values.password) {
        return false;
      }
      return true;
    });
  });

  const [check, setCheck] = useState(false);

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
    setError(''); // Clear error on input change
  };

  const handleCheck = event => {
    setCheck(event.target.checked);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      await login(values.email, values.password);
      // Redirect to home page or previous page
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame title={t('login_title')} subtitle={t('login_subtitle')}>
      <div>
        <div className={classes.head}>
          <Typography className={text.title2}>{t('login')}</Typography>
          <Button component={LocaleLink} size="small" className={classes.buttonLink} to={routeLink.register}>
            <Icon>arrow_forward</Icon>
            {t('login_create')}
          </Button>
        </div>
        <SocialAuth />
        <div className={classes.separator}>
          <Typography>
            {t('login_or')}
          </Typography>
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <ValidatorForm
          onError={errors => console.log(errors)}
          onSubmit={handleSubmit}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextValidator
                variant="filled"
                className={classes.input}
                label={t('login_email')}
                onChange={handleChange('email')}
                name="email"
                value={values.email}
                validators={['required', 'isEmail']}
                errorMessages={['This field is required', 'Email is not valid']}
              />
            </Grid>
            <Grid item xs={12}>
              <TextValidator
                variant="filled"
                type="password"
                className={classes.input}
                label={t('login_password')}
                validators={['required']}
                onChange={handleChange('password')}
                errorMessages={['This field is required']}
                name="password"
                value={values.password}
              />
            </Grid>
          </Grid>
          <div className={classes.formHelper}>
            <FormControlLabel
              control={(
                <Checkbox
                  component="span"
                  checked={check}
                  onChange={(e) => handleCheck(e)}
                  color="secondary"
                  value={check}
                  className={classes.check}
                />
              )}
              label={(
                <span className={text.caption}>
                  {t('login_remember')}
                </span>
              )}
            />
            <Button size="small" className={classes.buttonLink} href="#">
              {t('login_forgot')}
            </Button>
          </div>
          <div className={classes.btnArea}>
            <Button 
              variant="contained" 
              fullWidth 
              type="submit" 
              color="primary" 
              size="large"
              disabled={loading}
            >
              {loading ? 'Logging in...' : t('continue')}
            </Button>
          </div>
        </ValidatorForm>
      </div>
    </AuthFrame>
  );
}

export default Login;
