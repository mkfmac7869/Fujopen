import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ScrollAnimation from 'react-scroll-animation-wrapper';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from 'tss-react/mui';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import KingBedIcon from '@mui/icons-material/KingBed';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTranslation } from 'next-i18next';

const useStyles = makeStyles({ uniqId: 'hotel-gallery' })(theme => ({
  root: {
    position: 'relative',
    zIndex: 10,
    minHeight: 600,
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  listContainer: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  hotelCard: {
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
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
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
    '&:hover': {
      transform: 'translateX(12px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        : '0 20px 60px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)',
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.3)'}`,
    }
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: `${theme.spacing(3)} !important`,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    }
  },
  imageSection: {
    flexShrink: 0,
    position: 'relative',
    width: 320,
    height: 220,
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    }
  },
  hotelImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  priceChip: {
    position: 'absolute',
    top: theme.spacing(1.5),
    right: theme.spacing(1.5),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    fontWeight: 800,
    fontSize: '1.15rem',
    padding: theme.spacing(1.5, 2.5),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    color: theme.palette.primary.main,
  },
  availabilityChip: {
    position: 'absolute',
    bottom: theme.spacing(1.5),
    left: theme.spacing(1.5),
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  infoSection: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  hotelName: {
    fontWeight: 800,
    fontSize: '2rem',
    marginBottom: theme.spacing(0.5),
    letterSpacing: '-0.01em',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
    }
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    opacity: 0.85,
    fontSize: '1rem',
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  features: {
    display: 'flex',
    gap: theme.spacing(3),
    marginTop: theme.spacing(1),
    flexWrap: 'wrap',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.8),
    fontSize: '0.95rem',
    fontWeight: 500,
    '& svg': {
      fontSize: 22,
      opacity: 0.7,
      color: theme.palette.primary.main,
    }
  },
  actionSection: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      width: '100%',
      alignItems: 'stretch',
    }
  },
  bookButton: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.common.white,
    fontWeight: 700,
    padding: theme.spacing(1.5, 4),
    fontSize: '1.05rem',
    borderRadius: theme.spacing(1.5),
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
    }
  },
}));

function HotelGallery() {
  const { classes } = useStyles();
  const { t } = useTranslation('common');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      console.log('Fetching hotels from Firebase...');
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      console.log('Hotels fetched. Count:', hotelsSnapshot.size);
      
      const hotelsData = hotelsSnapshot.docs.map(doc => {
        console.log('Hotel data:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      
      console.log('Total hotels to display:', hotelsData.length);
      setHotels(hotelsData);
    } catch (error) {
      console.error('=== Error fetching hotels ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('============================');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (hotelId) => {
    const locale = router.query.locale || 'en';
    router.push(`/${locale}/hotel/${hotelId}`);
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (hotels.length === 0) {
    return (
      <Box className={classes.root}>
        <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
          <KingBedIcon sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h6">
            No hotels available
          </Typography>
          <Typography variant="body2">
            Hotels will appear here once added by admin
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.listContainer}>
        {hotels.map((hotel, index) => (
          <ScrollAnimation
            key={hotel.id}
            animateOnce
            animateIn="fadeInUpShort"
            delay={index * 100}
            duration={0.4}
          >
            <Card className={classes.hotelCard} elevation={0}>
              <CardContent className={classes.cardContent}>
                {/* Left - Hotel Image */}
                <Box className={classes.imageSection}>
                  <img 
                    src={hotel.image}
                    alt={hotel.name}
                    className={classes.hotelImage}
                  />
                  <Chip
                    className={classes.priceChip}
                    label={`$${hotel.pricePerNight}`}
                  />
                  <Chip
                    className={classes.availabilityChip}
                    label={`${hotel.roomsAvailable} ${t('ai-landing.hotel_rooms_left')}`}
                    color={hotel.roomsAvailable > 10 ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                {/* Middle - Hotel Info */}
                <Box className={classes.infoSection}>
                  <Typography className={classes.hotelName}>
                    {hotel.name}
                  </Typography>
                  
                  <Box className={classes.location}>
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body1">{hotel.location}</Typography>
                  </Box>

                  <Box className={classes.ratingBox}>
                    <Rating value={hotel.rating} precision={0.5} readOnly size="medium" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ({hotel.rating} stars)
                    </Typography>
                  </Box>

                  <Box className={classes.features}>
                    <Box className={classes.featureItem}>
                      <PeopleIcon />
                      <span>{t('ai-landing.hotel_upto')} {hotel.maxGuests} {t('ai-landing.hotel_guests')}</span>
                    </Box>
                    <Box className={classes.featureItem}>
                      <KingBedIcon />
                      <span>{hotel.rooms?.length || 1} {t('ai-landing.hotel_room_types')}</span>
                    </Box>
                  </Box>
                </Box>

                {/* Right - Action Button */}
                <Box className={classes.actionSection}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.5,
                      [theme.breakpoints.down('md')]: { display: 'none' }
                    }}
                  >
                    From ${hotel.pricePerNight}/night
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    className={classes.bookButton}
                    onClick={() => handleBookNow(hotel.id)}
                  >
                    {t('ai-landing.hotel_book_now')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </ScrollAnimation>
        ))}
      </Box>
    </Box>
  );
}

export default HotelGallery;
