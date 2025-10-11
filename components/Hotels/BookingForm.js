import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  IconButton,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'next-i18next';
import { useText, useTextAlign } from 'theme/common';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../lib/AuthContext';
import { useCart } from '../../lib/CartContext';
import ClayDeco from '../Artworks/ClayDeco';
import Title from '../Title';

const useStyles = makeStyles({ uniqId: 'booking-form' })((theme) => ({
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
    },
    '& > div': {
      border: `1px solid ${alpha(theme.palette.text.primary, 0.25)}`,
      background: 'none',
      overflow: 'hidden',
      '& input': {
        paddingLeft: theme.spacing(2),
        '&:focus': {
          background: alpha(theme.palette.background.paper, 0.7)
        },
        '&:hover': {
          background: alpha(theme.palette.background.paper, 0.7)
        }
      }
    }
  },
  roomingSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.06)'}`,
  },
  guestCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
  },
  summaryCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.08)'
      : 'rgba(99, 102, 241, 0.05)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(99, 102, 241, 0.2)' 
      : 'rgba(99, 102, 241, 0.15)'}`,
  },
}));

function BookingForm({ hotel, room, onClose }) {
  const { classes } = useStyles();
  const { t } = useTranslation('common');
  const { classes: text } = useText();
  const { classes: align } = useTextAlign();
  const theme = useTheme();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [submitting, setSubmitting] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    numberOfRooms: 1,
  });

  // Initialize guests based on room's max guests
  const initializeGuests = () => {
    const maxGuestsPerRoom = room.maxGuests || 2;
    const initialGuests = [];
    for (let i = 0; i < maxGuestsPerRoom; i++) {
      initialGuests.push({
        fullName: '',
        passportNumber: '',
        roomNumber: 1
      });
    }
    return initialGuests;
  };

  const [guests, setGuests] = useState(initializeGuests());

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    
    // Check if enough rooms available
    if (name === 'numberOfRooms') {
      const requestedRooms = parseInt(value) || 1;
      if (requestedRooms > room.available) {
        alert(`Only ${room.available} room(s) available for this room type!`);
        return;
      }
    }
    
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate guest list when number of rooms changes
    if (name === 'numberOfRooms') {
      const numRooms = parseInt(value) || 1;
      const maxGuestsPerRoom = room.maxGuests || 2;
      
      // Create guest entries for all rooms
      const newGuests = [];
      for (let i = 0; i < numRooms; i++) {
        // Add max guests for each room
        for (let j = 0; j < maxGuestsPerRoom; j++) {
          newGuests.push({
            fullName: '',
            passportNumber: '',
            roomNumber: i + 1
          });
        }
      }
      setGuests(newGuests);
    }
  };

  const handleGuestChange = (index, field, value) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const addGuest = () => {
    setGuests([...guests, { fullName: '', passportNumber: '', roomNumber: bookingData.numberOfRooms }]);
  };

  const removeGuest = (index) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to make a booking');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Validate at least 1 guest per room
    const numRooms = parseInt(bookingData.numberOfRooms);
    for (let roomNum = 1; roomNum <= numRooms; roomNum++) {
      const roomGuests = guests.filter(g => g.roomNumber === roomNum && g.fullName && g.passportNumber);
      if (roomGuests.length === 0) {
        alert(`Please add at least one guest for Room ${roomNum}`);
        return;
      }
    }

    // Filter out empty guest entries
    const validGuests = guests.filter(g => g.fullName && g.passportNumber);

    if (validGuests.length === 0) {
      alert('Please add at least one guest with name and passport number');
      return;
    }

    // Fetch user's team name from Firestore
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../../lib/firebase');
    
    let teamName = user.displayName;
    let teamLogo = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        teamName = userData.teamName || user.displayName;
        teamLogo = userData.teamLogo || null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    const bookingItem = {
      userId: user.uid,
      userEmail: user.email,
      userName: teamName, // Now uses team name from user profile
      teamLogo: teamLogo, // Team logo for display
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      hotelImage: hotel.image,
      roomType: room.name,
      roomPrice: room.price,
      checkInDate: bookingData.checkIn,
      checkOutDate: bookingData.checkOut,
      numberOfRooms: parseInt(bookingData.numberOfRooms),
      numberOfNights: calculateTotalNights(),
      totalPrice: totalPrice,
      guests: validGuests,
    };

    const success = addToCart(bookingItem);
    
    if (success) {
      alert('Booking added to cart! Go to Cart tab to confirm your booking.');
      onClose();
    }
  };

  const calculateTotalNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const start = new Date(bookingData.checkIn);
      const end = new Date(bookingData.checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const totalPrice = calculateTotalNights() * room.price * bookingData.numberOfRooms;

  return (
    <>
      <Container>
        <Paper className={classes.formBox}>
          <Fade in timeout={500}>
            <Box className={classes.form}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Title text={`Book ${room.name}`} align="left" />
                <IconButton onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <p className={`${text.paragraph}`} style={{ marginBottom: '24px' }}>
                {hotel.name} - {hotel.location}
              </p>

              {/* Booking Details */}
              <Box py={2}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Booking Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="filled"
                      label={t('ai-landing.hotel_check_in')}
                      name="checkIn"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={handleBookingChange}
                      className={classes.inputField}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="filled"
                      label={t('ai-landing.hotel_check_out')}
                      name="checkOut"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={handleBookingChange}
                      className={classes.inputField}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="filled"
                      label={t('ai-landing.hotel_number_of_rooms')}
                      name="numberOfRooms"
                      type="number"
                      value={bookingData.numberOfRooms}
                      onChange={handleBookingChange}
                      className={classes.inputField}
                      required
                      inputProps={{ min: 1, max: room.available }}
                      helperText={`${room.available} ${t('ai-landing.hotel_rooms')} ${t('ai-landing.hotel_available')}`}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Rooming List */}
              <Box className={classes.roomingSection}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('ai-landing.hotel_rooming_list')}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {room.maxGuests} guest(s) per room - Please fill at least 1 guest for each room
                  </Typography>
                </Box>

                {/* Group guests by room */}
                {Array.from({ length: parseInt(bookingData.numberOfRooms) }, (_, roomIndex) => {
                  const roomNumber = roomIndex + 1;
                  const roomGuests = guests.filter(g => g.roomNumber === roomNumber);
                  
                  return (
                    <Box 
                      key={roomNumber}
                      sx={{ 
                        mb: 3, 
                        p: 3, 
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(99, 102, 241, 0.08)' 
                          : 'rgba(99, 102, 241, 0.05)',
                        borderRadius: 2,
                        border: `2px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(99, 102, 241, 0.2)' 
                          : 'rgba(99, 102, 241, 0.15)'}`,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
                        {t('ai-landing.hotel_room')} {roomNumber} - {room.maxGuests} {t('ai-landing.hotel_guest')}(s)
                      </Typography>
                      
                      {roomGuests.map((guest, guestIndex) => {
                        const overallIndex = guests.indexOf(guest);
                        return (
                          <Box key={guestIndex} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, opacity: 0.8 }}>
                              {t('ai-landing.hotel_guest')} {guestIndex + 1}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  variant="filled"
                                  label={t('ai-landing.hotel_full_name')}
                                  value={guest.fullName}
                                  onChange={(e) => handleGuestChange(overallIndex, 'fullName', e.target.value)}
                                  className={classes.inputField}
                                  required={guestIndex === 0}
                                  placeholder={guestIndex === 0 ? "Required" : "Optional"}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  variant="filled"
                                  label={t('ai-landing.hotel_passport')}
                                  value={guest.passportNumber}
                                  onChange={(e) => handleGuestChange(overallIndex, 'passportNumber', e.target.value)}
                                  className={classes.inputField}
                                  required={guestIndex === 0}
                                  placeholder={guestIndex === 0 ? "Required" : "Optional"}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>

              {/* Booking Summary */}
              <Box className={classes.summaryCard}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  {t('ai-landing.hotel_booking_summary')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">{t('ai-landing.hotel_room_type')}:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" sx={{ fontWeight: 600 }}>
                      {room.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{t('ai-landing.hotel_number_of_rooms')}:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" sx={{ fontWeight: 600 }}>
                      {bookingData.numberOfRooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{t('ai-landing.hotel_number_of_nights')}:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" sx={{ fontWeight: 600 }}>
                      {calculateTotalNights()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{t('ai-landing.hotel_price_per_night')}:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" sx={{ fontWeight: 600 }}>
                      ${room.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('ai-landing.hotel_total_price')}:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right" color="primary" sx={{ fontWeight: 800 }}>
                      ${totalPrice}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={onClose}
                  sx={{ minWidth: 120 }}
                >
                  {t('ai-landing.hotel_cancel')}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{ 
                    minHeight: 48,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    fontWeight: 700,
                  }}
                >
                  {submitting ? t('ai-landing.visa_form_submitting') : `${t('ai-landing.hotel_add_to_cart')} - $${totalPrice}`}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Paper>
      </Container>
    </>
  );
}

export default BookingForm;
