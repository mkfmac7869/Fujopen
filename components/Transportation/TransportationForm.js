import React, { useState, useEffect } from 'react';
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
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  requestCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.08)'
      : 'rgba(99, 102, 241, 0.04)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
  },
}));

function TransportationForm({ onSuccess }) {
  const { classes } = useStyles();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // User data
  const [userData, setUserData] = useState(null);
  const [isReferee, setIsReferee] = useState(false);
  
  // Hotel bookings
  const [hotelBookings, setHotelBookings] = useState([]);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);
  
  // Form data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [arrivalRequests, setArrivalRequests] = useState([{
    id: Date.now(),
    flightNumber: '',
    airport: '',
    terminal: '',
    teamMembers: 1,
    date: '',
    time: '',
    selectedHotel: '',
  }]);
  const [departureRequests, setDepartureRequests] = useState([{
    id: Date.now() + 1,
    flightNumber: '',
    airport: '',
    terminal: '',
    teamMembers: 1,
    date: '',
    time: '',
    selectedHotel: '',
  }]);

  // Fetch user data and hotel bookings
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user data
        const userQuery = query(collection(db, 'users'), where('__name__', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userInfo = userDoc.data();
          setUserData(userInfo);
          
          // Check if user is referee
          const referee = userInfo.position?.toLowerCase() === 'referee';
          setIsReferee(referee);
          
          console.log('👤 User position:', userInfo.position, '| Is Referee:', referee);
        }

        // Fetch hotel bookings
        const bookingsQuery = query(
          collection(db, 'hotelBookings'),
          where('userId', '==', user.uid)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('📋 Found hotel bookings:', bookings.length);

        // Filter confirmed bookings
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        setHotelBookings(confirmedBookings);
        setHasConfirmedBooking(confirmedBookings.length > 0);

        // Calculate total capacity (total guests across all confirmed bookings)
        let capacity = 0;
        confirmedBookings.forEach(booking => {
          if (booking.individualBookings && Array.isArray(booking.individualBookings)) {
            booking.individualBookings.forEach(individual => {
              capacity += individual.guests?.length || 0;
            });
          }
        });
        setTotalCapacity(capacity);

        console.log('✅ Total team member capacity:', capacity);
        console.log('✅ Confirmed bookings:', confirmedBookings.length);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load your information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate total team members requested
  const calculateTotalTeamMembers = () => {
    const arrivalTotal = arrivalRequests.reduce((sum, req) => sum + (parseInt(req.teamMembers) || 0), 0);
    const departureTotal = departureRequests.reduce((sum, req) => sum + (parseInt(req.teamMembers) || 0), 0);
    return Math.max(arrivalTotal, departureTotal); // Use the maximum
  };

  // Add request handlers
  const addArrivalRequest = () => {
    setArrivalRequests([...arrivalRequests, {
      id: Date.now(),
      flightNumber: '',
      airport: '',
      terminal: '',
      teamMembers: 1,
      date: '',
      time: '',
      selectedHotel: '',
    }]);
  };

  const addDepartureRequest = () => {
    setDepartureRequests([...departureRequests, {
      id: Date.now(),
      flightNumber: '',
      airport: '',
      terminal: '',
      teamMembers: 1,
      date: '',
      time: '',
      selectedHotel: '',
    }]);
  };

  // Remove request handlers
  const removeArrivalRequest = (id) => {
    if (arrivalRequests.length > 1) {
      setArrivalRequests(arrivalRequests.filter(req => req.id !== id));
    }
  };

  const removeDepartureRequest = (id) => {
    if (departureRequests.length > 1) {
      setDepartureRequests(departureRequests.filter(req => req.id !== id));
    }
  };

  // Update request handlers
  const updateArrivalRequest = (id, field, value) => {
    setArrivalRequests(arrivalRequests.map(req =>
      req.id === id ? { ...req, [field]: value } : req
    ));
  };

  const updateDepartureRequest = (id, field, value) => {
    setDepartureRequests(departureRequests.map(req =>
      req.id === id ? { ...req, [field]: value } : req
    ));
  };

  // Validation
  const validateForm = () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return false;
    }

    // Validate arrival requests
    for (const req of arrivalRequests) {
      if (!req.flightNumber || !req.airport || !req.terminal || !req.date || !req.time) {
        setError('Please fill all fields for all arrival requests');
        return false;
      }
      if (!isReferee && !req.selectedHotel) {
        setError('Please select a hotel for each arrival request');
        return false;
      }
    }

    // Validate departure requests
    for (const req of departureRequests) {
      if (!req.flightNumber || !req.airport || !req.terminal || !req.date || !req.time) {
        setError('Please fill all fields for all departure requests');
        return false;
      }
      if (!isReferee && !req.selectedHotel) {
        setError('Please select a hotel for each departure request');
        return false;
      }
    }

    // Validate team members against capacity (non-referees only)
    if (!isReferee) {
      const totalRequested = calculateTotalTeamMembers();
      if (totalRequested > totalCapacity) {
        setError(`Total team members (${totalRequested}) exceeds your hotel booking capacity (${totalCapacity})`);
        return false;
      }
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!user) {
      setError('Please login to submit a transportation request');
      return;
    }

    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const transportationDoc = {
        userId: user.uid,
        userEmail: user.email,
        teamName: userData?.teamName || '',
        fullName: userData?.fullName || '',
        position: userData?.position || '',
        phoneNumber: phoneNumber,
        isReferee: isReferee,
        
        // Transportation requests
        arrivalRequests: arrivalRequests,
        departureRequests: departureRequests,
        
        // Summary
        totalTeamMembers: calculateTotalTeamMembers(),
        totalArrivalRequests: arrivalRequests.length,
        totalDepartureRequests: departureRequests.length,
        
        // Hotel info (for non-referees)
        hotelBookingIds: !isReferee ? hotelBookings.map(b => b.id) : [],
        hotelCapacity: !isReferee ? totalCapacity : null,
        
        status: 'pending',
        submittedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      await addDoc(collection(db, 'transportationRequests'), transportationDoc);

      console.log('✅ Transportation request submitted successfully');
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        setSuccess(false);
        // Reset to initial state
        setArrivalRequests([{
          id: Date.now(),
          flightNumber: '',
          airport: '',
          terminal: '',
          teamMembers: 1,
          date: '',
          time: '',
          selectedHotel: '',
        }]);
        setDepartureRequests([{
          id: Date.now() + 1,
          flightNumber: '',
          airport: '',
          terminal: '',
          teamMembers: 1,
          date: '',
          time: '',
          selectedHotel: '',
        }]);
        setPhoneNumber('');
      }, 3000);

    } catch (error) {
      console.error('Error submitting transportation request:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Check if non-referee has confirmed bookings
  if (!isReferee && !hasConfirmedBooking) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.formBox}>
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <WarningIcon sx={{ fontSize: 100, color: 'warning.main', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Confirmed Hotel Booking Required
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
              You need to have at least one <strong>confirmed hotel booking</strong> before you can apply for transportation services.
            </Typography>
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                📌 How to apply for transportation:
              </Typography>
              <Typography variant="body2" component="div" sx={{ textAlign: 'left' }}>
                1. Book a hotel from the Hotels page<br/>
                2. Wait for admin to confirm your booking<br/>
                3. Return here to apply for transportation
              </Typography>
            </Alert>
            <Button
              variant="contained"
              size="large"
              href="/hotel"
              sx={{ mt: 3 }}
            >
              Go to Hotels
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Title align="center">
        🚍 Airport Transportation Request
      </Title>

      {/* Success Message */}
      {success && (
        <Fade in={success}>
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ 
              mb: 3, 
              fontSize: '1.1rem', 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
            }}
          >
            Transportation request submitted successfully! Redirecting...
          </Alert>
        </Fade>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Hotel Booking Info (Non-Referees) */}
      {!isReferee && hotelBookings.length > 0 && (
        <Paper className={classes.formBox} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HotelIcon /> Your Confirmed Hotel Bookings
          </Typography>
          
          {hotelBookings.map((booking, bookingIndex) => {
            return (
              <Box key={booking.id} sx={{ mb: 3 }}>
                {/* Individual Hotels */}
                <Grid container spacing={2}>
                  {booking.individualBookings && booking.individualBookings.map((hotel, hotelIndex) => {
                    // Get individual hotel confirmation number
                    const hotelConfirmation = booking.confirmationNumbers?.[hotel.hotelId] || 'Pending';
                    
                    return (
                    <Grid item xs={12} md={6} key={hotelIndex}>
                      <Card sx={{ 
                        height: '100%',
                        background: theme => theme.palette.mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(16, 185, 129, 0.25)'}`,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.2)',
                          transform: 'translateY(-8px)',
                          border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(16, 185, 129, 0.4)'}`,
                        }
                      }}>
                        <CardContent>
                          {/* Hotel Name */}
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5, mb: 1.5 }}>
                            <HotelIcon sx={{ fontSize: 32, color: 'success.main', mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3, color: theme => theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                                {hotel.hotelName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#cbd5e1' : '#64748b', fontWeight: 500 }}>
                                {hotel.hotelLocation || 'Fujairah, UAE'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Confirmation Number */}
                          <Box sx={{ 
                            mb: 2, 
                            p: 1.5, 
                            background: theme => theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))'
                              : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            borderRadius: 1.5,
                            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(134, 239, 172, 0.3)' : '1px solid #86efac',
                            backdropFilter: 'blur(10px)',
                          }}>
                            <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#86efac' : '#166534', fontWeight: 700, display: 'block', mb: 0.5 }}>
                              CONFIRMATION NUMBER
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 800, 
                              color: theme => theme.palette.mode === 'dark' ? '#4ade80' : '#15803d',
                              letterSpacing: '0.1em'
                            }}>
                              {hotelConfirmation}
                            </Typography>
                          </Box>

                          {/* Hotel Details */}
                          <Grid container spacing={1.5}>
                            <Grid item xs={6}>
                              <Box sx={{ 
                                p: 1.5, 
                                background: theme => theme.palette.mode === 'dark'
                                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))'
                                  : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 1.5,
                                textAlign: 'center',
                                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(187, 247, 208, 0.2)' : '1px solid #bbf7d0'
                              }}>
                                <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#86efac' : '#166534', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                  Capacity
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: theme => theme.palette.mode === 'dark' ? '#4ade80' : '#15803d' }}>
                                  {hotel.guests?.length || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#86efac' : '#166534', fontWeight: 600 }}>
                                  guests
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ 
                                p: 1.5, 
                                background: theme => theme.palette.mode === 'dark'
                                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1))'
                                  : 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 1.5,
                                textAlign: 'center',
                                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(196, 181, 253, 0.2)' : '1px solid #c4b5fd'
                              }}>
                                <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#c4b5fd' : '#5b21b6', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                  Rooms
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: theme => theme.palette.mode === 'dark' ? '#a78bfa' : '#6d28d9' }}>
                                  {hotel.numberOfRooms || 1}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#c4b5fd' : '#5b21b6', fontWeight: 600 }}>
                                  room{hotel.numberOfRooms > 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ 
                                p: 1.5, 
                                background: theme => theme.palette.mode === 'dark'
                                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))'
                                  : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 1.5,
                                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(252, 211, 77, 0.2)' : '1px solid #fcd34d'
                              }}>
                                <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#fcd34d' : '#78350f', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                  Check-in / Check-out
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: theme => theme.palette.mode === 'dark' ? '#fbbf24' : '#92400e' }}>
                                  {hotel.checkInDate ? new Date(hotel.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} → {hotel.checkOutDate ? new Date(hotel.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#fcd34d' : '#78350f', fontWeight: 600 }}>
                                  {hotel.numberOfNights || 0} night{hotel.numberOfNights > 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                    );
                  })}
                </Grid>
              </Box>
            );
          })}

          <Divider sx={{ my: 3 }} />
          
          {/* Total Capacity Summary */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
            borderRadius: 2,
            border: '2px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Total Team Member Capacity
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Combined capacity across all confirmed bookings
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Chip 
                  label={totalCapacity} 
                  sx={{ 
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    height: 48,
                    px: 2
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                  ⚠️ Your transportation requests cannot exceed this capacity
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Main Form */}
      <Paper className={classes.formBox}>
        {/* Phone Number */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📱 Contact Information
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            label="Phone Number"
            placeholder="+971 50 123 4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={classes.inputField}
            required
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* ARRIVAL SECTION */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" className={classes.sectionTitle}>
              <FlightLandIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              Arrival Transportation
            </Typography>
            <Button
              startIcon={<AddCircleIcon />}
              onClick={addArrivalRequest}
              variant="outlined"
              color="primary"
            >
              Add Arrival
            </Button>
          </Box>

          {arrivalRequests.map((request, index) => (
            <Box key={request.id} className={classes.requestCard}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Arrival #{index + 1}
                </Typography>
                {arrivalRequests.length > 1 && (
                  <IconButton 
                    color="error" 
                    onClick={() => removeArrivalRequest(request.id)}
                    size="small"
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>

              {/* Route Display */}
              {!isReferee && request.airport && request.selectedHotel && (
                <Alert severity="info" icon={<ArrowForwardIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.airport} → {hotelBookings
                      .flatMap(b => b.individualBookings || [])
                      .find(h => h.hotelId === request.selectedHotel)?.hotelName || 'Hotel'}
                  </Typography>
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Hotel Selection (Non-Referees Only) */}
                {!isReferee && hotelBookings.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155' }}>
                      Select Destination Hotel *
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      variant="filled"
                      value={request.selectedHotel}
                      onChange={(e) => updateArrivalRequest(request.id, 'selectedHotel', e.target.value)}
                      className={classes.inputField}
                      required
                      placeholder="Choose which hotel for this arrival"
                      InputLabelProps={{ shrink: false }}
                    >
                      {hotelBookings.flatMap(booking => 
                        booking.individualBookings?.map(hotel => (
                          <MenuItem key={hotel.hotelId} value={hotel.hotelId}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HotelIcon fontSize="small" />
                              {hotel.hotelName} ({hotel.guests?.length || 0} guests)
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Flight Number"
                    placeholder="e.g., EK123"
                    value={request.flightNumber}
                    onChange={(e) => updateArrivalRequest(request.id, 'flightNumber', e.target.value)}
                    className={classes.inputField}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155' }}>
                    Airport *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    value={request.airport}
                    onChange={(e) => updateArrivalRequest(request.id, 'airport', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: false }}
                  >
                    {airports.map((airport) => (
                      <MenuItem key={airport} value={airport}>
                        {airport}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155' }}>
                    Terminal *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    value={request.terminal}
                    onChange={(e) => updateArrivalRequest(request.id, 'terminal', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: false }}
                  >
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal} value={terminal}>
                        {terminal}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    variant="filled"
                    label="Arrival Date"
                    value={request.date}
                    onChange={(e) => updateArrivalRequest(request.id, 'date', e.target.value)}
                    className={classes.inputField}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="time"
                    variant="filled"
                    label="Arrival Time"
                    value={request.time}
                    onChange={(e) => updateArrivalRequest(request.id, 'time', e.target.value)}
                    className={classes.inputField}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    variant="filled"
                    label="Number of Team Members"
                    value={request.teamMembers}
                    onChange={(e) => updateArrivalRequest(request.id, 'teamMembers', e.target.value)}
                    className={classes.inputField}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* DEPARTURE SECTION */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" className={classes.sectionTitle}>
              <FlightTakeoffIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
              Departure Transportation
            </Typography>
            <Button
              startIcon={<AddCircleIcon />}
              onClick={addDepartureRequest}
              variant="outlined"
              color="secondary"
            >
              Add Departure
            </Button>
          </Box>

          {departureRequests.map((request, index) => (
            <Box key={request.id} className={classes.requestCard}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Departure #{index + 1}
                </Typography>
                {departureRequests.length > 1 && (
                  <IconButton 
                    color="error" 
                    onClick={() => removeDepartureRequest(request.id)}
                    size="small"
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                )}
              </Box>

              {/* Route Display */}
              {!isReferee && request.selectedHotel && request.airport && (
                <Alert severity="info" icon={<ArrowForwardIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {hotelBookings
                      .flatMap(b => b.individualBookings || [])
                      .find(h => h.hotelId === request.selectedHotel)?.hotelName || 'Hotel'} → {request.airport}
                  </Typography>
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Hotel Selection (Non-Referees Only) */}
                {!isReferee && hotelBookings.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155' }}>
                      Select Departure Hotel *
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      variant="filled"
                      value={request.selectedHotel}
                      onChange={(e) => updateDepartureRequest(request.id, 'selectedHotel', e.target.value)}
                      className={classes.inputField}
                      required
                      placeholder="Choose which hotel for this departure"
                      InputLabelProps={{ shrink: false }}
                    >
                      {hotelBookings.flatMap(booking => 
                        booking.individualBookings?.map(hotel => (
                          <MenuItem key={hotel.hotelId} value={hotel.hotelId}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HotelIcon fontSize="small" />
                              {hotel.hotelName} ({hotel.guests?.length || 0} guests)
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Flight Number"
                    placeholder="e.g., EK456"
                    value={request.flightNumber}
                    onChange={(e) => updateDepartureRequest(request.id, 'flightNumber', e.target.value)}
                    className={classes.inputField}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155' }}>
                    Airport *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    value={request.airport}
                    onChange={(e) => updateDepartureRequest(request.id, 'airport', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: false }}
                  >
                    {airports.map((airport) => (
                      <MenuItem key={airport} value={airport}>
                        {airport}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155' }}>
                    Terminal *
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    variant="filled"
                    value={request.terminal}
                    onChange={(e) => updateDepartureRequest(request.id, 'terminal', e.target.value)}
                    className={classes.inputField}
                    required
                    InputLabelProps={{ shrink: false }}
                  >
                    {terminals.map((terminal) => (
                      <MenuItem key={terminal} value={terminal}>
                        {terminal}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    variant="filled"
                    label="Departure Date"
                    value={request.date}
                    onChange={(e) => updateDepartureRequest(request.id, 'date', e.target.value)}
                    className={classes.inputField}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="time"
                    variant="filled"
                    label="Departure Time"
                    value={request.time}
                    onChange={(e) => updateDepartureRequest(request.id, 'time', e.target.value)}
                    className={classes.inputField}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    variant="filled"
                    label="Number of Team Members"
                    value={request.teamMembers}
                    onChange={(e) => updateDepartureRequest(request.id, 'teamMembers', e.target.value)}
                    className={classes.inputField}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>

        {/* Summary */}
        <Box sx={{ mb: 3, p: 2.5, background: 'rgba(99, 102, 241, 0.08)', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📊 Request Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Arrival Requests:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{arrivalRequests.length}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Departure Requests:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{departureRequests.length}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Team Members:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{calculateTotalTeamMembers()}</Typography>
            </Grid>
            {!isReferee && (
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Capacity Remaining:</Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: (totalCapacity - calculateTotalTeamMembers()) >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {totalCapacity - calculateTotalTeamMembers()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={submitting || success}
          sx={{
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            }
          }}
        >
          {submitting ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            '✈️ Submit Transportation Request'
          )}
        </Button>
      </Paper>
    </Container>
  );
}

export default TransportationForm;
