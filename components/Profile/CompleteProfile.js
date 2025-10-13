import React, { useState, useRef } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  Fade,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth } from '../../lib/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import ClayDeco from '../Artworks/ClayDeco';
import Title from '../Title';
import { useText, useTextAlign } from 'theme/common';

const useStyles = makeStyles({ uniqId: 'complete-profile' })((theme) => ({
  decoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    left: 0,
    top: 0,
    '& > div': {
      position: 'absolute'
    },
    '&.left': {
      left: -50,
    },
    '&.right': {
      right: -50,
    }
  },
  ball: {
    width: 160,
    height: 170,
    top: 100,
    left: 0,
    zIndex: 30,
    transform: 'rotate(-45deg)',
  },
  bom: {
    width: 60,
    height: 60,
    zIndex: 33,
    top: 160,
    left: 50,
    transform: 'rotate(-50deg)',
    filter: 'blur(5px) drop-shadow(0px 25px 12px rgba(0, 0, 0, 0.3))'
  },
  flower: {
    width: 180,
    height: 180,
    top: 300,
    right: -10,
    transform: 'rotate(-50deg)'
  },
  bowl: {
    width: 100,
    height: 100,
    top: 300,
    right: 40,
    transform: 'rotate(60deg)',
    filter: 'blur(5px) drop-shadow(20px 25px 5px rgba(0, 0, 0, 0.3))'
  },
  formBox: {
    borderRadius: 40,
    position: 'relative',
    zIndex: 22,
    background: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'saturate(180%) blur(20px)',
  },
  form: {
    textAlign: 'left',
    position: 'relative',
    padding: theme.spacing(4, 4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3, 2),
    },
  },
  inputField: {
    width: '100%',
    '& label': {
      left: theme.spacing(0.5),
      fontWeight: 600,
    },
    '& > div': {
      border: `1px solid ${alpha(theme.palette.text.primary, 0.25)}`,
      background: 'none',
      overflow: 'hidden',
      borderRadius: theme.spacing(1),
      transition: 'all 0.3s ease',
      '& input, & select': {
        paddingLeft: theme.spacing(2),
        fontWeight: 500,
        '&:focus': {
          background: alpha(theme.palette.background.paper, 0.7)
        },
        '&:hover': {
          background: alpha(theme.palette.background.paper, 0.7)
        }
      },
      '& select': {
        cursor: 'pointer',
        paddingRight: theme.spacing(4),
        '& option': {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: theme.spacing(1.5),
          fontWeight: 500,
        }
      }
    },
    '&:hover > div': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    }
  },
  uploadBox: {
    height: 180,
    border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}`,
    borderRadius: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-2px)',
    },
    '&.uploaded': {
      borderColor: theme.palette.success.main,
      borderStyle: 'solid',
      background: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.05)',
    }
  },
  uploadedImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: theme.spacing(2),
  },
}));

function CompleteProfile({ onComplete }) {
  const { classes } = useStyles();
  const { classes: text } = useText();
  const { classes: align } = useTextAlign();
  const { user } = useAuth();
  const theme = useTheme();
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    phone: '',
    position: '',
    teamName: '',
    country: '',
  });

  const [teamLogo, setTeamLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    // Validate required fields
    if (!formData.phone || !formData.position || !formData.teamName || !formData.country || !teamLogo) {
      setError('Please fill all fields and upload a logo');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let photoURL = user.photoURL;

      // Upload logo to Firebase Storage
      if (teamLogo) {
        const storageRef = ref(storage, `teamLogos/${user.uid}/${teamLogo.name}`);
        await uploadBytes(storageRef, teamLogo);
        photoURL = await getDownloadURL(storageRef);
        
        // Update Firebase Auth profile with logo
        await updateProfile(user, { photoURL });
      }

      // Update Firestore with complete profile
      await updateDoc(doc(db, 'users', user.uid), {
        phone: formData.phone,
        position: formData.position,
        teamName: formData.teamName,
        country: formData.country,
        photoURL: photoURL,
        teamLogo: photoURL,
        profileCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      // Call completion callback
      if (onComplete) {
        onComplete();
      }
      
      // Refresh to update everything
      window.location.reload();
    } catch (error) {
      console.error('Error completing profile:', error);
      setError(error.message || 'Failed to complete profile');
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`${classes.decoration} left`}>
        <div className={classes.ball}>
          <ClayDeco img="/images/decoration/clay-ball.png" color="tripleMain" />
        </div>
        <div className={classes.bom}>
          <ClayDeco img="/images/decoration/clay-bom.png" color="doubleMain" />
        </div>
      </div>
      <div className={`${classes.decoration} right`}>
        <div className={classes.flower}>
          <ClayDeco img="/images/decoration/clay-snail.png" color="primaryLight" />
        </div>
        <div className={classes.bowl}>
          <ClayDeco img="/images/decoration/clay-bowl.png" color="accent" />
        </div>
      </div>
      
      <Container maxWidth="md">
        <Paper className={classes.formBox}>
          <Fade in timeout={500}>
            <Box className={classes.form}>
              <Title text="Complete Your Profile" align="center" />
              <p className={`${align.textCenter} ${text.paragraph}`} style={{ marginBottom: '32px' }}>
                Please provide additional information to complete your account setup
              </p>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={classes.inputField}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={classes.inputField}
                    select
                    required
                    SelectProps={{
                      native: true,
                    }}
                    InputLabelProps={{ shrink: true }}
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Team or Club Name"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className={classes.inputField}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={classes.inputField}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Team or Club Logo <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Box
                    className={`${classes.uploadBox} ${teamLogo ? 'uploaded' : ''}`}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {teamLogo ? (
                      <>
                        <img 
                          src={URL.createObjectURL(teamLogo)} 
                          alt="Team Logo"
                          className={classes.uploadedImage}
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
                        <CloudUploadIcon sx={{ fontSize: 56, opacity: 0.6, mb: 1 }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Click to upload team/club logo
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
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ 
                    minHeight: 48,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    fontWeight: 700,
                  }}
                >
                  {loading ? 'Completing Profile...' : 'Complete Profile'}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Paper>
      </Container>
    </>
  );
}

export default CompleteProfile;

