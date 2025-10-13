import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  MenuItem,
  Alert,
  Fade,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import Title from '../Title';

const airports = [
  'Dubai International Airport (DXB)',
  'Sharjah International Airport (SHJ)',
  'Ras Al Khaimah International Airport (RKT)'
];

const terminals = ['Terminal 1', 'Terminal 2', 'Terminal 3'];

const useStyles = makeStyles({ uniqId: 'transportation-form' })((theme) => ({
  formBox: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    fontWeight: 700,
  },
  inputField: {
    '& .MuiFilledInput-root': {
      borderRadius: theme.spacing(1.5),
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    }
  },
}));

function TransportationForm() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    arrival: {
      flightNumber: '',
      airport: '',
      terminal: '',
      teamMembers: 1,
      date: '',
      time: ''
    },
    departure: {
      flightNumber: '',
      airport: '',
      terminal: '',
      teamMembers: 1,
      date: '',
      time: ''
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit transportation request');
      return;
    }

    // Basic validation
    if (!formData.phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    if (!formData.arrival.flightNumber || !formData.arrival.airport || !formData.arrival.date) {
      alert('Please fill in all required arrival information');
      return;
    }

    if (!formData.departure.flightNumber || !formData.departure.airport || !formData.departure.date) {
      alert('Please fill in all required departure information');
      return;
    }

    try {
      setSubmitting(true);

      // Fetch user's team name, full name, and position from Firestore
      const { getDoc, doc } = await import('firebase/firestore');
      let teamName = user.displayName || 'Unknown Team';
      let fullName = user.displayName || '';
      let position = '';
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          teamName = userData.teamName || user.displayName || 'Unknown Team';
          fullName = userData.fullName || user.displayName || '';
          position = userData.position || '';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      const transportationDoc = {
        userId: user.uid,
        userEmail: user.email,
        teamName: teamName,
        fullName: fullName,
        position: position,
        phoneNumber: formData.phoneNumber,
        arrival: formData.arrival,
        departure: formData.departure,
        status: 'pending',
        submittedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      await addDoc(collection(db, 'transportationRequests'), transportationDoc);

      setSuccess(true);
      setFormData({
        phoneNumber: '',
        arrival: {
          flightNumber: '',
          airport: '',
          terminal: '',
          teamMembers: 1,
          date: '',
          time: ''
        },
        departure: {
          flightNumber: '',
          airport: '',
          terminal: '',
          teamMembers: 1,
          date: '',
          time: ''
        }
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting transportation request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Paper className={classes.formBox}>
        <Fade in timeout={500}>
          <Box>
            <Title text="Transportation Request" align="center" />
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, opacity: 0.8 }}>
              Request airport transportation for your team's arrival and departure
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
                Transportation request submitted successfully! You can view it in the "My Transportation" tab.
              </Alert>
            )}

            {/* Contact Information */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Contact Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className={classes.inputField}
                    required
                    placeholder="e.g., +971 50 123 4567"
                    helperText="Include country code"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Arrival Section */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" className={classes.sectionTitle} color="primary">
                <FlightLandIcon />
                Arrival Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Flight Number"
                    value={formData.arrival.flightNumber}
                    onChange={(e) => handleInputChange('arrival', 'flightNumber', e.target.value)}
                    className={classes.inputField}
                    required
                    placeholder="e.g., EK202"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Airport"
                    value={formData.arrival.airport}
                    onChange={(e) => handleInputChange('arrival', 'airport', e.target.value)}
                    className={classes.inputField}
                    required
                  >
                    {airports.map((airport) => (
                      <MenuItem key={airport} value={airport}>{airport}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Terminal"
                    value={formData.arrival.terminal}
                    onChange={(e) => handleInputChange('arrival', 'terminal', e.target.value)}
                    className={classes.inputField}
                  >
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal} value={terminal}>{terminal}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Total Team Members"
                    value={formData.arrival.teamMembers}
                    onChange={(e) => handleInputChange('arrival', 'teamMembers', e.target.value)}
                    className={classes.inputField}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="date"
                    label="Arrival Date"
                    value={formData.arrival.date}
                    onChange={(e) => handleInputChange('arrival', 'date', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="time"
                    label="Arrival Time"
                    value={formData.arrival.time}
                    onChange={(e) => handleInputChange('arrival', 'time', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Departure Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" className={classes.sectionTitle} color="secondary">
                <FlightTakeoffIcon />
                Departure Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Flight Number"
                    value={formData.departure.flightNumber}
                    onChange={(e) => handleInputChange('departure', 'flightNumber', e.target.value)}
                    className={classes.inputField}
                    required
                    placeholder="e.g., EK203"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Airport"
                    value={formData.departure.airport}
                    onChange={(e) => handleInputChange('departure', 'airport', e.target.value)}
                    className={classes.inputField}
                    required
                  >
                    {airports.map((airport) => (
                      <MenuItem key={airport} value={airport}>{airport}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    select
                    label="Terminal"
                    value={formData.departure.terminal}
                    onChange={(e) => handleInputChange('departure', 'terminal', e.target.value)}
                    className={classes.inputField}
                  >
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal} value={terminal}>{terminal}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Total Team Members"
                    value={formData.departure.teamMembers}
                    onChange={(e) => handleInputChange('departure', 'teamMembers', e.target.value)}
                    className={classes.inputField}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="date"
                    label="Departure Date"
                    value={formData.departure.date}
                    onChange={(e) => handleInputChange('departure', 'date', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="time"
                    label="Departure Time"
                    value={formData.departure.time}
                    onChange={(e) => handleInputChange('departure', 'time', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? null : <CheckCircleIcon />}
                sx={{
                  minWidth: 200,
                  minHeight: 56,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Paper>
    </Container>
  );
}

export default TransportationForm;

