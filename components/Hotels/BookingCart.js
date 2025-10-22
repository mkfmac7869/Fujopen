import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useCart } from '../../lib/CartContext';
import { useAuth } from '../../lib/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTranslation } from 'next-i18next';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';

const useStyles = makeStyles({ uniqId: 'booking-cart' })((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
  },
  cartCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
    marginBottom: theme.spacing(2),
  },
  summaryCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.1)'
      : 'rgba(99, 102, 241, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
    position: 'sticky',
    top: theme.spacing(10),
  },
}));

function BookingCart() {
  const { classes } = useStyles();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const { dialog, showDialog, closeDialog } = useCustomDialog();
  const [confirming, setConfirming] = useState(false);

  const handleConfirmAllBookings = async () => {
    if (!user) {
      showDialog({
        type: 'warning',
        message: 'Please log in to confirm bookings',
      });
      return;
    }

    if (cartItems.length === 0) {
      showDialog({
        type: 'warning',
        message: 'Cart is empty',
      });
      return;
    }

    try {
      setConfirming(true);

      // Create a SINGLE booking group document
      const groupId = `booking_${user.uid}_${Date.now()}`;
      
      // Calculate totals
      const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalRooms = cartItems.reduce((sum, item) => sum + parseInt(item.numberOfRooms), 0);
      
      // Create grouped booking document
      const bookingGroupDoc = {
        groupId: groupId,
        userId: user.uid,
        userEmail: user.email,
        userName: cartItems[0].userName, // Team name
        teamLogo: cartItems[0].teamLogo || null, // Team logo
        individualBookings: cartItems, // Array of all cart items
        totalPrice: totalPrice,
        totalRooms: totalRooms,
        numberOfBookings: cartItems.length,
        status: 'reviewing', // Initial status
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        paymentStatus: 'pending',
        paymentMethod: null,
        confirmationNumbers: {}, // Will store { hotelId: confirmationNumber }
      };
      
      // Save grouped booking - this is the critical operation
      await addDoc(collection(db, 'hotelBookings'), bookingGroupDoc);
      console.log('✅ Booking created successfully:', groupId);
      
      // IMMEDIATELY REDUCE ROOM AVAILABILITY for each booking (non-blocking)
      try {
        for (const item of cartItems) {
          const { getDoc, doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
          const hotelDoc = await getDoc(firestoreDoc(db, 'hotels', item.hotelId));
          
          if (hotelDoc.exists()) {
            const hotelData = hotelDoc.data();
            const rooms = hotelData.rooms || [];
            const roomIndex = rooms.findIndex(r => r.name === item.roomType);
            
            if (roomIndex !== -1) {
              const numberOfRoomsBooked = parseInt(item.numberOfRooms) || 1;
              rooms[roomIndex].available = Math.max(0, (rooms[roomIndex].available || 0) - numberOfRoomsBooked);
              
              await updateDoc(firestoreDoc(db, 'hotels', item.hotelId), {
                rooms: rooms,
                roomsAvailable: rooms.reduce((sum, r) => sum + (r.available || 0), 0),
              });
              
              console.log(`✅ Reduced ${numberOfRoomsBooked} room(s) from ${item.roomType} at ${item.hotelName}`);
            }
          }
        }
      } catch (roomError) {
        console.error('⚠️ Error updating room availability:', roomError);
        // Don't fail the booking if room update fails
      }

      // Send booking confirmation email via API (non-blocking)
      const bookingData = {
        hotelName: cartItems.length > 1 ? `${cartItems.length} Hotels` : cartItems[0].hotelName,
        location: cartItems.length > 1 ? 'Multiple Locations' : cartItems[0].location,
        roomType: cartItems.length > 1 ? 'Multiple Rooms' : cartItems[0].roomType,
        numberOfRooms: totalRooms,
        checkIn: cartItems[0].checkIn,
        checkOut: cartItems[0].checkOut,
        totalPrice: totalPrice,
        confirmationNumber: groupId,
        roomingList: cartItems.length === 1 ? cartItems[0].roomingList : null,
      };
      
      // Send email asynchronously - don't wait for it
      fetch('https://www.fujopen.com/api/send-hotel-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'confirmation',
          email: user.email,
          name: cartItems[0].userName,
          bookingData: bookingData,
        }),
      }).then(emailResponse => {
        if (emailResponse.ok) {
          console.log('✅ Hotel booking confirmation email sent to:', user.email);
        } else {
          console.error('❌ Failed to send booking confirmation email');
        }
      }).catch(emailError => {
        console.error('❌ Error sending booking confirmation email:', emailError);
      });

      // Clear cart and show success
      clearCart();
      
      showDialog({
        type: 'success',
        message: `Successfully submitted booking group with ${cartItems.length} reservation(s)! Rooms have been reserved. Awaiting OC review.`,
      });
      
    } catch (error) {
      console.error('❌ Error confirming bookings:', error);
      showDialog({
        type: 'error',
        message: 'Failed to confirm bookings. Please try again.',
      });
    } finally {
      setConfirming(false);
    }
  };

  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
        <ShoppingCartIcon sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h6">{t('ai-landing.hotel_empty_cart')}</Typography>
        <Typography variant="body2">
          {t('ai-landing.hotel_add_hotels')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        Booking Cart ({cartItems.length})
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card className={classes.cartCard} key={item.cartId}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {item.hotelName}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      📍 {item.hotelLocation}
                    </Typography>
                  </Box>
                  <IconButton color="error" onClick={() => removeFromCart(item.cartId)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip icon={<HotelIcon />} label={item.roomType} size="small" />
                      <Chip icon={<CalendarTodayIcon />} label={`${item.numberOfNights} nights`} size="small" />
                      <Chip label={`${item.guests?.length || 0} guests`} size="small" />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" display="block">Check-in: {new Date(item.checkInDate).toLocaleDateString()}</Typography>
                    <Typography variant="caption" display="block">Check-out: {new Date(item.checkOutDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                      ${item.totalPrice}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box className={classes.summaryCard}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Cart Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">Total Items:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {cartItems.length} booking(s)
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2">Total Amount:</Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
                ${totalPrice}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleConfirmAllBookings}
              disabled={confirming}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                fontWeight: 700,
              }}
            >
              {confirming ? 'Confirming...' : 'Confirm All Bookings'}
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', opacity: 0.7 }}>
              Bookings will be sent to admin for confirmation
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <CustomDialog {...dialog} onClose={closeDialog} />
    </Box>
  );
}

export default BookingCart;

