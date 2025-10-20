import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Fab,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'next-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import KingBedIcon from '@mui/icons-material/KingBed';
import WifiIcon from '@mui/icons-material/Wifi';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PoolIcon from '@mui/icons-material/Pool';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../lib/CartContext';
import BookingForm from './BookingForm';

const useStyles = makeStyles({ uniqId: 'hotel-detail' })((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(10),
    minHeight: '100vh',
  },
  backButton: {
    marginBottom: theme.spacing(4),
  },
  hotelCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  imageGallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  mainImage: {
    gridColumn: 'span 2',
    gridRow: 'span 2',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    minHeight: 400,
    [theme.breakpoints.down('md')]: {
      gridColumn: 'span 2',
      gridRow: 'span 1',
      minHeight: 300,
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }
  },
  smallImage: {
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    height: 200,
    [theme.breakpoints.down('md')]: {
      height: 150,
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }
  },
  amenities: {
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    marginTop: theme.spacing(3),
  },
  amenityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
  },
  roomCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateX(8px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    }
  },
}));

const amenityIcons = {
  'Free WiFi': <WifiIcon />,
  'Restaurant': <RestaurantIcon />,
  'Gym': <FitnessCenterIcon />,
  'Swimming Pool': <PoolIcon />,
  'Pool': <PoolIcon />,
};

function HotelDetail({ hotelId }) {
  const { classes } = useStyles();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();
  const { cartCount } = useCart();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    if (hotelId) {
      fetchHotelData();
    }
  }, [hotelId]);

  const fetchHotelData = async () => {
    try {
      setLoading(true);
      const hotelDoc = await getDoc(doc(db, 'hotels', hotelId));
      
      if (hotelDoc.exists()) {
        const hotelData = {
          id: hotelDoc.id,
          ...hotelDoc.data(),
          // Default images if not provided
          images: hotelDoc.data().images || [
            hotelDoc.data().image || '/images/HOTEL_A.png',
            '/images/HOTEL_B.png',
            '/images/HOTEL_C.png',
            '/images/HOTEL_A.png'
          ],
          // Default rooms if not in database yet
          rooms: hotelDoc.data().rooms || [
            { id: 'standard', name: 'Standard Room', price: hotelDoc.data().pricePerNight || 100, available: hotelDoc.data().roomsAvailable || 10, maxGuests: hotelDoc.data().maxGuests || 2, beds: '1 King Bed' }
          ]
        };
        setHotel(hotelData);
      } else {
        console.error('Hotel not found');
        const locale = router.query.locale || 'en';
        router.push(`/${locale}/hotel`);
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleCloseBooking = () => {
    setShowBookingForm(false);
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <Container className={classes.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!hotel) {
    const locale = router.query.locale || 'en';
    return (
      <Container className={classes.root}>
        <Typography variant="h5">Hotel not found</Typography>
        <Button onClick={() => router.push(`/${locale}/hotel`)} variant="contained" sx={{ mt: 2 }}>
          {t('ai-landing.hotel_back_hotels')}
        </Button>
      </Container>
    );
  }

  return (
    <Container className={classes.root}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        className={classes.backButton}
        variant="outlined"
      >
        {t('ai-landing.hotel_back_hotels')}
      </Button>

      <Fade in timeout={500}>
        <Box>
          {/* Image Gallery */}
          <Box className={classes.imageGallery}>
            {hotel.images && hotel.images.length > 0 ? (
              <>
                <Box className={classes.mainImage}>
                  <img src={hotel.images[0]} alt={hotel.name} />
                </Box>
                {hotel.images.slice(1, 5).map((img, idx) => (
                  <Box 
                    key={idx} 
                    className={classes.smallImage}
                    sx={{ position: 'relative' }}
                  >
                    <img src={img} alt={`${hotel.name} ${idx + 2}`} />
                    {/* Show "See More" overlay on 5th image if there are more images */}
                    {idx === 3 && hotel.images.length > 5 && (
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
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(0, 0, 0, 0.85)',
                          }
                        }}
                        onClick={() => setShowAllImages(true)}
                      >
                        <Box sx={{ textAlign: 'center', color: 'white' }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                            +{hotel.images.length - 5} photos
                          </Typography>
                          <Typography variant="body2">
                            Click to see all
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            ) : (
              <Box className={classes.mainImage}>
                <img src={hotel.image || '/images/HOTEL_A.png'} alt={hotel.name} />
              </Box>
            )}
          </Box>

          {/* Hotel Info Card */}
          <Box className={classes.hotelCard}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                  {hotel.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating value={hotel.rating} precision={0.5} readOnly />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon />
                    <Typography variant="body1">{hotel.location}</Typography>
                  </Box>
                </Box>

                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, mt: 3 }}>
                  {hotel.description}
                </Typography>

                <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
                  Amenities
                </Typography>
                <Box className={classes.amenities}>
                  {hotel.amenities.map((amenity, index) => (
                    <Box key={index} className={classes.amenityItem}>
                      {amenityIcons[amenity] || <WifiIcon />}
                      <Typography variant="body2">{amenity}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  position: 'sticky', 
                  top: theme.spacing(2),
                  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
                  padding: theme.spacing(3),
                  borderRadius: theme.spacing(2),
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Quick Info
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Location:</strong> {hotel.location}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Rating:</strong> {hotel.rating} stars
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Rooms:</strong> {hotel.rooms.reduce((acc, r) => acc + r.available, 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Available Rooms */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 4 }}>
              Available Rooms
            </Typography>
            
            <Grid container spacing={3}>
              {hotel.rooms.map((room) => (
                <Grid item xs={12} key={room.id}>
                  <Zoom in timeout={300}>
                    <Box className={classes.roomCard}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                            {room.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              icon={<KingBedIcon />} 
                              label={room.beds} 
                              size="small"
                            />
                            <Chip 
                              icon={<PeopleIcon />} 
                              label={`${t('ai-landing.hotel_upto')} ${room.maxGuests} ${t('ai-landing.hotel_guests')}`}
                              size="small"
                            />
                            {room.available > 0 ? (
                              <Chip 
                                label={`${room.available} ${t('ai-landing.hotel_rooms')} ${t('ai-landing.hotel_available')}`}
                                color={room.available > 5 ? 'success' : 'warning'}
                                size="small"
                              />
                            ) : (
                              <Chip 
                                label={t('ai-landing.hotel_sold_out')}
                                color="error"
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
                            ${room.price}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            per night
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          {room.available > 0 ? (
                            <Button
                              variant="contained"
                              fullWidth
                              size="large"
                              onClick={() => handleBookRoom(room)}
                              sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                fontWeight: 600,
                              }}
                            >
                              {t('ai-landing.hotel_book_now')}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              fullWidth
                              size="large"
                              disabled
                              sx={{
                                background: 'rgba(150, 150, 150, 0.3)',
                                fontWeight: 600,
                              }}
                            >
                              Sold Out
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Fade>

      {/* All Images Dialog */}
      <Dialog
        open={showAllImages}
        onClose={() => setShowAllImages(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderRadius: 4,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              All Hotel Photos ({hotel?.images?.length || 0})
            </Typography>
            <IconButton onClick={() => setShowAllImages(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {hotel?.images?.map((img, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: 250,
                    '& img': {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }
                  }}
                >
                  <img src={img} alt={`${hotel.name} ${index + 1}`} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog
        open={showBookingForm}
        onClose={handleCloseBooking}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        scroll="body"
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderRadius: 4,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh',
            overflow: 'auto',
            m: 2,
          }
        }}
      >
        {selectedRoom && (
          <BookingForm
            hotel={hotel}
            room={selectedRoom}
            onClose={handleCloseBooking}
          />
        )}
      </Dialog>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <Fab 
          color="primary" 
          onClick={() => {
            const locale = router.query.locale || 'en';
            router.push(`/${locale}/hotel`);
          }}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
            },
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Badge badgeContent={cartCount} color="error" max={99}>
            <ShoppingCartIcon />
          </Badge>
        </Fab>
      )}
    </Container>
  );
}

export default HotelDetail;
