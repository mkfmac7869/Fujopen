import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { useTranslation } from 'next-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import routeLink from 'public/text/link';
import { useText } from 'theme/common';
import { useAuth } from '../../lib/AuthContext';
import LocaleLink from '../Link';
import Checkbox from './Checkbox';
import SocialAuth from './SocialAuth';
import AuthFrame from './AuthFrame';
import useStyles from './form-style';
import countries from '../../lib/countries';
import countryCodes from '../../lib/countryCodes';

function Register() {
  const { classes, cx } = useStyles();
  const { classes: text } = useText();
  const { t } = useTranslation('common');
  const { signup } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: null,
    position: '',
    teamName: '',
    country: '',
    password: '',
    confirmPassword: '',
  });

  const [teamLogo, setTeamLogo] = useState(null);
  const logoInputRef = React.useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      if (value !== values.password) {
        return false;
      }
      return true;
    });
    ValidatorForm.addValidationRule('isTruthy', value => value);
  });

  const [check, setCheck] = useState(false);

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
    setError('');
  };

  const handleCheck = event => {
    setCheck(event.target.checked);
  };

  const handleLogoUpload = (file) => {
    if (file) {
      setTeamLogo(file);
    }
  };

  const handleRemoveLogo = () => {
    setTeamLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Combine country code with phone number
      const fullPhoneNumber = values.countryCode 
        ? `${values.countryCode.phone} ${values.phone}` 
        : values.phone;
      
      const userData = {
        fullName: values.fullName,
        phone: fullPhoneNumber,
        position: values.position,
        teamName: values.teamName,
        country: values.country,
        approved: false, // User needs admin approval before login
        createdAt: new Date().toISOString(),
        // Logo upload would be handled separately with Firebase Storage
      };
      
      await signup(values.email, values.password, userData);
      
      // Send welcome email via API
      try {
        const emailResponse = await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email,
            name: values.fullName,
          }),
        });
        
        if (emailResponse.ok) {
          console.log('✅ Welcome email sent to:', values.email);
        } else {
          console.error('❌ Failed to send welcome email');
        }
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
        // Don't block registration if email fails
      }

      // Send admin notification via API
      try {
        const adminNotificationResponse = await fetch('/api/send-admin-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newUser: {
              name: values.fullName,
              email: values.email,
              phone: fullPhoneNumber,
              position: values.position,
              teamName: values.teamName,
              country: values.country,
            },
          }),
        });
        
        if (adminNotificationResponse.ok) {
          console.log('✅ Admin notification sent');
        } else {
          console.error('❌ Failed to send admin notification');
        }
      } catch (adminEmailError) {
        console.error('❌ Error sending admin notification:', adminEmailError);
        // Don't block registration if email fails
      }
      
      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame title={t('register_title')} subtitle={t('register_subtitle')} type="register">
      <div>
        <div className={classes.head}>
          <Typography className={text.title2}>{t('register')}</Typography>
          <Button component={LocaleLink} size="small" className={classes.buttonLink} to={routeLink.login}>
            <Icon>arrow_forward</Icon>
            {t('register_already')}
          </Button>
        </div>
        <SocialAuth />
        <div className={classes.separator}>
          <Typography>{t('register_or')}</Typography>
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
                label="Full Name"
                onChange={handleChange('fullName')}
                name="fullName"
                value={values.fullName}
                validators={['required']}
                errorMessages={['This field is required']}
              />
            </Grid>
            <Grid item xs={12}>
              <TextValidator
                variant="filled"
                className={classes.input}
                label="Email"
                onChange={handleChange('email')}
                name="email"
                value={values.email}
                validators={['required', 'isEmail']}
                errorMessages={['This field is required', 'Email is not valid']}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, opacity: 0.9 }}>
                Phone Number <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    fullWidth
                    options={countryCodes}
                    getOptionLabel={(option) => `${option.phone} ${option.name}`}
                    value={values.countryCode}
                    onChange={(event, newValue) => {
                      setValues({ ...values, countryCode: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        label="Country Code"
                        className={classes.input}
                        placeholder="Search country..."
                        required
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 60 }}>
                            {option.phone}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {option.name}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    sx={{
                      '& .MuiAutocomplete-popupIndicator': {
                        color: '#6366f1',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextValidator
                    variant="filled"
                    className={classes.input}
                    label="Phone Number"
                    onChange={handleChange('phone')}
                    name="phone"
                    value={values.phone}
                    validators={['required']}
                    errorMessages={['This field is required']}
                    placeholder="e.g., 501234567"
                    helperText={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          📱 Enter numbers only (without country code)
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
              <Box sx={{ 
                mt: 1.5, 
                p: 1.5, 
                background: 'rgba(99, 102, 241, 0.08)', 
                borderRadius: 1,
                borderLeft: '3px solid #6366f1'
              }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5, color: '#6366f1' }}>
                  💡 How to enter your phone number:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                  1. Select your country code from the dropdown (e.g., +971 for UAE)
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                  2. Enter your phone number WITHOUT the country code
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, mt: 0.5, fontWeight: 600 }}>
                  Example: +971 501234567 (Country Code + Phone)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="filled"
                className={classes.input}
                label="Position"
                onChange={handleChange('position')}
                name="position"
                value={values.position}
                select
                required
                SelectProps={{
                  native: true,
                }}
                InputLabelProps={{ 
                  shrink: true 
                }}
              >
                <option value="">Select Position</option>
                <option value="athlete">ATHLETE</option>
                <option value="coach">COACH</option>
                <option value="official">OFFICIAL</option>
                <option value="referee">REFEREE</option>
                <option value="fan">FAN</option>
                <option value="trainer">TRAINER</option>
                <option value="physiotherapist">physiotherapist</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextValidator
                variant="filled"
                className={classes.input}
                label="Team or Club Name"
                onChange={handleChange('teamName')}
                name="teamName"
                value={values.teamName}
                validators={['required']}
                errorMessages={['This field is required']}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={countries}
                value={values.country}
                onChange={(event, newValue) => {
                  setValues({ ...values, country: newValue || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Country"
                    className={classes.input}
                    placeholder="Search and select country..."
                    required
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    color: '#6366f1',
                  },
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextValidator
                variant="filled"
                type="password"
                className={classes.input}
                label="Password"
                validators={['required']}
                onChange={handleChange('password')}
                errorMessages={['This field is required']}
                name="password"
                value={values.password}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextValidator
                variant="filled"
                type="password"
                className={classes.input}
                label="Confirm Password"
                validators={['isPasswordMatch', 'required']}
                errorMessages={['Password mismatch', 'This field is required']}
                onChange={handleChange('confirmPassword')}
                name="confirm"
                value={values.confirmPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Team or Club Logo <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    height: 160,
                    border: `2px dashed ${teamLogo ? '#4caf50' : 'rgba(255, 255, 255, 0.3)'}`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: teamLogo 
                      ? 'rgba(76, 175, 80, 0.08)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: '#6366f1',
                      background: 'rgba(99, 102, 241, 0.05)',
                    }
                  }}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {teamLogo ? (
                    <>
                      <img 
                        src={URL.createObjectURL(teamLogo)} 
                        alt="Team Logo"
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '16px'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          '&:hover': {
                            opacity: 1,
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLogo();
                        }}
                      >
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 48, opacity: 0.6, mb: 1 }} />
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Click to upload logo
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        PNG, JPG (Max 2MB)
                      </Typography>
                    </>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e.target.files[0])}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
          <div className={cx(classes.btnArea, classes.double)}>
            <FormControlLabel
              control={(
                <Checkbox
                  validators={['isTruthy']}
                  errorMessages="This field is required"
                  checked={check}
                  value={check}
                  onChange={(e) => handleCheck(e)}
                  color="primary"
                />
              )}
              label={(
                <span className={text.caption}>
                  {t('form_terms')}
                  &nbsp;
                  <a href="#">
                    {t('form_privacy')}
                  </a>
                </span>
              )}
            />
            <Button 
              variant="contained" 
              type="submit" 
              color="primary" 
              size="large"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : t('continue')}
            </Button>
          </div>
        </ValidatorForm>
      </div>
    </AuthFrame>
  );
}

export default Register;
