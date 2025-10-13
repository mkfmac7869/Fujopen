import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedIcon from '@mui/icons-material/Verified';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HotelIcon from '@mui/icons-material/Hotel';
import { useAuth } from '../../lib/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import countries from '../../lib/countries';

const useStyles = makeStyles({ uniqId: 'user-profile' })((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(10),
    minHeight: '100vh',
    position: 'relative',
  },
  headerCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #1a1145 0%, #0f0a23 50%, #1a1145 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
    borderRadius: theme.spacing(4),
    padding: theme.spacing(6, 4),
    marginBottom: theme.spacing(4),
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.15), transparent 50%)',
      pointerEvents: 'none',
    }
  },
  glassCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      opacity: 0.6,
    },
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  largeAvatar: {
    width: 180,
    height: 180,
    fontSize: '4rem',
    fontWeight: 800,
    background: 'transparent',
    borderRadius: 0,
    border: 'none',
    boxShadow: 'none',
    marginBottom: theme.spacing(2),
    '& img': {
      objectFit: 'contain',
      width: '100%',
      height: '100%',
    },
    [theme.breakpoints.down('sm')]: {
      width: 140,
      height: 140,
      fontSize: '3rem',
    }
  },
  cameraButton: {
    position: 'relative',
    marginTop: theme.spacing(2),
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    zIndex: 10,
    width: 56,
    height: 56,
    '&:hover': {
      background: theme.palette.primary.dark,
      transform: 'scale(1.15)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5)',
    },
    [theme.breakpoints.down('sm')]: {
      width: 48,
      height: 48,
    }
  },
  inputField: {
    width: '100%',
    '& .MuiFilledInput-root': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.8)',
      borderRadius: theme.spacing(1.5),
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
      transition: 'all 0.3s ease',
      '&::before, &::after': {
        display: 'none',
      },
      '&:hover': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.95)',
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 1)',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
      '&.Mui-disabled': {
        opacity: 0.6,
      }
    },
    '& .MuiInputBase-input': {
      padding: theme.spacing(2),
      fontWeight: 500,
      fontSize: '1rem',
    },
    '& .MuiInputLabel-root': {
      display: 'none',
    }
  },
  statCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.1)'
      : 'rgba(99, 102, 241, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    textAlign: 'center',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
    }
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.04)',
    }
  },
  infoIcon: {
    fontSize: 24,
    color: theme.palette.primary.main,
    opacity: 0.8,
  },
}));

function UserProfile() {
  const { classes } = useStyles();
  const { user, userRole } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation('common');
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    teamName: '',
    country: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              fullName: data.fullName || user.displayName || '',
              email: data.email || user.email || '',
              phone: data.phone || '',
              position: data.position || '',
              teamName: data.teamName || '',
              country: data.country || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (file) => {
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!user) {
      console.error('No user logged in');
      setSnackbar({ open: true, message: 'Please log in first', severity: 'error' });
      return;
    }

    console.log('Starting logo upload...', file.name);

    try {
      setUploading(true);
      
      // Upload to Firebase Storage
      console.log('Uploading to Firebase Storage...');
      const storageRef = ref(storage, `teamLogos/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload complete, getting URL...');
      
      const photoURL = await getDownloadURL(storageRef);
      console.log('Got download URL:', photoURL);

      // Update user profile in Firebase Auth
      console.log('Updating Firebase Auth profile...');
      await updateProfile(user, { photoURL });
      console.log('Firebase Auth updated');
      
      // Update Firestore
      console.log('Updating Firestore...');
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: photoURL,
        teamLogo: photoURL,
        updatedAt: new Date().toISOString(),
      });
      console.log('Firestore updated successfully');

      setSnackbar({ open: true, message: 'Logo updated successfully! Refreshing...', severity: 'success' });
      
      // Refresh page to update header
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('=== Logo Upload Error ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('========================');
      
      let errorMessage = 'Failed to upload logo';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage permissions error. Please check Firebase Storage rules.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      setLoading(true);
      console.log('Saving profile changes...', formData);

      // Update display name in Firebase Auth
      await updateProfile(user, { displayName: formData.fullName });
      console.log('Firebase Auth updated');

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: formData.fullName,
        phone: formData.phone,
        position: formData.position,
        teamName: formData.teamName,
        country: formData.country,
        updatedAt: new Date().toISOString(),
      });
      console.log('Firestore updated');

      setSnackbar({ open: true, message: 'Profile updated successfully! Refreshing...', severity: 'success' });
      setEditing(false);
      setLoading(false);
      
      // Refresh page to update header with new name
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('=== Error updating profile ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('==============================');
      setSnackbar({ open: true, message: `Failed to update profile: ${error.message}`, severity: 'error' });
      setLoading(false);
      setEditing(false);
    }
  };

  if (!user || !userData) {
    return (
      <Container className={classes.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  const stats = {
    visaApplications: userData.visaApplicationsCount || 0,
    hotelBookings: userData.hotelBookingsCount || 0,
    memberSince: userData.createdAt ? new Date(userData.createdAt).getFullYear() : new Date().getFullYear(),
  };

  return (
    <Container className={classes.root}>
      {/* Header Card with Avatar */}
      <Fade in timeout={500}>
        <Paper className={classes.headerCard} elevation={0}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box className={classes.avatarSection}>
                <Avatar 
                  src={user.photoURL || userData.photoURL || userData.teamLogo}
                  className={classes.largeAvatar}
                >
                  {formData.fullName ? formData.fullName[0].toUpperCase() : 'U'}
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files[0])}
                />
                <IconButton
                  className={classes.cameraButton}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <PhotoCameraIcon />}
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'white' }}>
                    {formData.fullName || 'User'}
                  </Typography>
                  <VerifiedIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2, color: 'white' }}>
                  {formData.teamName || 'Team Name'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={formData.position || 'Position'} 
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                    }} 
                  />
                  <Chip 
                    label={userRole === 'admin' ? 'ADMIN' : 'USER'} 
                    color={userRole === 'admin' ? 'error' : 'success'}
                    sx={{ 
                      fontWeight: 700,
                      backdropFilter: 'blur(10px)',
                    }} 
                  />
                  <Chip 
                    label={formData.country || 'Country'} 
                    icon={<LocationOnIcon />}
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Grow in timeout={800}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box className={classes.statCard}>
                  <AssignmentIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography className={classes.statNumber}>{stats.visaApplications}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    Visa Applications
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className={classes.statCard}>
                  <HotelIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography className={classes.statNumber}>{stats.hotelBookings}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    Hotel Bookings
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className={classes.statCard}>
                  <CalendarTodayIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography className={classes.statNumber}>{stats.memberSince}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    Member Since
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grow>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Zoom in timeout={600}>
            <Paper className={classes.glassCard} elevation={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Personal Information
                </Typography>
                {!editing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setEditing(false);
                        // Reset form data
                        setFormData({
                          fullName: userData.fullName || user.displayName || '',
                          email: userData.email || user.email || '',
                          phone: userData.phone || '',
                          position: userData.position || '',
                          teamName: userData.teamName || '',
                          country: userData.country || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveChanges}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>

               <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkIcon sx={{ fontSize: 18 }} /> Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      variant="filled"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={classes.inputField}
                      disabled={!editing}
                      placeholder="Enter your full name"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 18 }} /> Email
                    </Typography>
                    <TextField
                      fullWidth
                      variant="filled"
                      name="email"
                      value={formData.email}
                      className={classes.inputField}
                      disabled
                      placeholder="Your email address"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 18 }} /> Phone Number
                    </Typography>
                    <TextField
                      fullWidth
                      variant="filled"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={classes.inputField}
                      disabled={!editing}
                      placeholder="Enter phone number"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkIcon sx={{ fontSize: 18 }} /> Position
                    </Typography>
                    <TextField
                      fullWidth
                      variant="filled"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={classes.inputField}
                      disabled={!editing}
                      select={editing}
                      SelectProps={{
                        native: true,
                      }}
                      placeholder="Select position"
                    >
                      {editing ? (
                        <>
                          <option value="">Select Position</option>
                          <option value="athlete">ATHLETE</option>
                          <option value="coach">COACH</option>
                          <option value="official">OFFICIAL</option>
                          <option value="referee">REFEREE</option>
                          <option value="fan">FAN</option>
                          <option value="trainer">TRAINER</option>
                          <option value="physiotherapist">physiotherapist</option>
                        </>
                      ) : null}
                    </TextField>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GroupsIcon sx={{ fontSize: 18 }} /> Team or Club Name
                    </Typography>
                    <TextField
                      fullWidth
                      variant="filled"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleInputChange}
                      className={classes.inputField}
                      disabled={!editing}
                      placeholder="Enter team name"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.9rem', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 18 }} /> Country
                    </Typography>
                    {editing ? (
                      <Autocomplete
                        fullWidth
                        options={countries}
                        value={formData.country}
                        onChange={(event, newValue) => {
                          setFormData(prev => ({
                            ...prev,
                            country: newValue || ''
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="filled"
                            className={classes.inputField}
                            placeholder="Search country..."
                          />
                        )}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        variant="filled"
                        value={formData.country}
                        className={classes.inputField}
                        disabled
                        placeholder="Select country"
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Zoom>
        </Grid>

        {/* Account Details */}
        <Grid item xs={12} md={4}>
          <Zoom in timeout={900}>
            <Paper className={classes.glassCard} elevation={0}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                Account Details
              </Typography>
              
              <Box className={classes.infoRow}>
                <EmailIcon className={classes.infoIcon} />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formData.email}
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.infoRow}>
                <CalendarTodayIcon className={classes.infoIcon} />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Member Since</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.infoRow}>
                <WorkIcon className={classes.infoIcon} />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Role</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    {userRole || 'User'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UserProfile;
