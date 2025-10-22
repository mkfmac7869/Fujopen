import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  TextField,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useTranslation } from 'next-i18next';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InvoiceGenerator from '../Admin/InvoiceGenerator';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';

const useStyles = makeStyles({ uniqId: 'my-bookings' })((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
  },
  bookingCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    marginBottom: theme.spacing(3),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 16px 50px rgba(0, 0, 0, 0.12)',
    }
  },
}));

const statusConfig = {
  reviewing: { label: 'Reviewing by OC', color: 'info' },
  approved: { label: 'Approved - Awaiting Payment', color: 'warning' },
  payment_uploaded: { label: 'Payment Proof Uploaded', color: 'primary' },
  confirmed: { label: 'Confirmed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  completed: { label: 'Completed', color: 'info' },
};

function MyBookings() {
  const { classes } = useStyles();
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { dialog, showDialog, closeDialog } = useCustomDialog();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [payOnSiteDialog, setPayOnSiteDialog] = useState(false);
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [onSiteReason, setOnSiteReason] = useState('');
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const paymentFileRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'hotelBookings'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async () => {
    if (!paymentFile || !selectedBooking) return;

    try {
      setUploading(true);
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../../lib/firebase');
      const { updateDoc, doc } = await import('firebase/firestore');

      // Upload payment proof
      const paymentRef = ref(storage, `paymentProofs/${selectedBooking.id}_${Date.now()}.pdf`);
      await uploadBytes(paymentRef, paymentFile);
      const paymentUrl = await getDownloadURL(paymentRef);

      // Update booking
      await updateDoc(doc(db, 'hotelBookings', selectedBooking.id), {
        paymentProofFile: paymentUrl,
        status: 'payment_uploaded',
        paymentUploadedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      showDialog({
        type: 'success',
        message: 'Payment proof uploaded successfully!',
        onConfirm: () => setPaymentDialog(false),
      });
      setPaymentFile(null);
      fetchMyBookings();
    } catch (error) {
      console.error('Error uploading payment:', error);
      showDialog({
        type: 'error',
        message: 'Failed to upload payment proof',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRequestPayOnSite = async () => {
    if (!onSiteReason.trim() || !selectedBooking) {
      showDialog({
        type: 'warning',
        message: 'Please provide a reason for pay on site request',
      });
      return;
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');

      await updateDoc(doc(db, 'hotelBookings', selectedBooking.id), {
        payOnSiteRequest: {
          requested: true,
          reason: onSiteReason,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      });

      showDialog({
        type: 'success',
        message: 'Pay on site request submitted! Awaiting admin approval.',
        onConfirm: () => setPayOnSiteDialog(false),
      });
      setOnSiteReason('');
      fetchMyBookings();
    } catch (error) {
      console.error('Error requesting pay on site:', error);
      showDialog({
        type: 'error',
        message: 'Failed to submit request',
      });
    }
  };

  const handleViewInvoice = (booking) => {
    // Convert grouped booking to invoice format
    if (booking.individualBookings && booking.individualBookings.length > 0) {
      const invoiceBooking = {
        ...booking,
        isTeamInvoice: true,
        teamBookings: booking.individualBookings,
      };
      setSelectedInvoice(invoiceBooking);
    } else {
      setSelectedInvoice(booking);
    }
    setInvoiceDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
        <HotelIcon sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h6">No bookings yet</Typography>
        <Typography variant="body2">
          Your hotel bookings will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        My Hotel Bookings
      </Typography>

      <Grid container spacing={3}>
        {bookings.map((booking, bookingIndex) => (
          <Grid item xs={12} key={booking.id}>
            <Card className={classes.bookingCard} elevation={0}>
              <CardContent>
                <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    Booking #{bookingIndex + 1} - {booking.userName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${booking.numberOfBookings || booking.individualBookings?.length || 1} ${t('ai-landing.hotel_reservation')}`} 
                      size="small"
                      color="primary"
                    />
                    <Chip 
                      label={`${booking.totalRooms || booking.numberOfRooms} ${t('ai-landing.hotel_total_rooms')}`} 
                      size="small"
                    />
                    <Chip 
                      label={`${t('ai-landing.hotel_created')}: ${new Date(booking.createdAt).toLocaleDateString()}`} 
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* Show all individual bookings in this group */}
                {(booking.individualBookings || [booking]).map((individualBooking, idx) => (
                  <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < (booking.individualBookings?.length || 1) - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {individualBooking.hotelName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          📍 {individualBooking.hotelLocation}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          <Chip icon={<HotelIcon />} label={individualBooking.roomType} size="small" />
                          <Chip label={`${individualBooking.numberOfRooms} room(s)`} size="small" />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" display="block">
                          {new Date(individualBooking.checkInDate).toLocaleDateString()} - {new Date(individualBooking.checkOutDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {individualBooking.numberOfNights} nights • {individualBooking.guests?.length || 0} guests
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                          ${individualBooking.totalPrice}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
                        {t('ai-landing.hotel_grand_total')}: ${booking.totalPrice}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Chip 
                        label={statusConfig[booking.status]?.label || booking.status}
                        color={statusConfig[booking.status]?.color || 'default'}
                        sx={{ mb: 2, fontWeight: 700, width: '100%' }}
                      />
                      
                      {/* Invoice Button - Show for approved or confirmed */}
                      {(booking.status === 'approved' || booking.status === 'payment_uploaded' || booking.status === 'confirmed') && (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          color="primary"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewInvoice(booking)}
                          sx={{ mb: 1, background: '#155289', '&:hover': { background: '#0d3a5f' } }}
                        >
                          {booking.status === 'confirmed' ? t('ai-landing.hotel_view_invoice') : t('ai-landing.hotel_view_invoice')}
                        </Button>
                      )}
                      
                      {/* Action buttons based on status */}
                      {booking.status === 'approved' && !booking.payOnSiteRequest?.requested && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            color="success"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setPaymentDialog(true);
                            }}
                          >
                            Upload Payment
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            onClick={() => {
                              setSelectedBooking(booking);
                              setPayOnSiteDialog(true);
                            }}
                          >
                            Request Pay on Site
                          </Button>
                        </Box>
                      )}
                      
                      {booking.payOnSiteRequest?.requested && (
                        <Chip 
                          label={`Pay on Site: ${booking.payOnSiteRequest.status}`}
                          size="small"
                          color={booking.payOnSiteRequest.status === 'approved' ? 'success' : 'warning'}
                          sx={{ mb: 1, width: '100%' }}
                        />
                      )}
                      
                      {booking.confirmationNumber && (
                        <Chip 
                          label={`Confirmation: ${booking.confirmationNumber}`}
                          size="small"
                          color="success"
                          sx={{ mb: 1, width: '100%', fontWeight: 700 }}
                        />
                      )}
                      
                      {booking.confirmationNumbers && Object.keys(booking.confirmationNumbers).length > 0 && (
                        <Chip 
                          label={`${Object.keys(booking.confirmationNumbers).length} ${t('ai-landing.hotel_confirmations')}`}
                          size="small"
                          color="success"
                          sx={{ mb: 1, width: '100%', fontWeight: 700 }}
                        />
                      )}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setDetailsDialog(true);
                      }}
                    >
                      {t('ai-landing.hotel_view_details')}
                    </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)} 
        maxWidth="md" 
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
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('ai-landing.hotel_booking_details')}</Typography>
            <Chip 
              label={statusConfig[selectedBooking?.status]?.label || 'N/A'} 
              color={statusConfig[selectedBooking?.status]?.color || 'default'}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('ai-landing.hotel_reservation_details')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption">{t('ai-landing.hotel_total_reservations')}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedBooking.numberOfBookings || selectedBooking.individualBookings?.length || 1}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption">{t('ai-landing.hotel_total_rooms')}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedBooking.totalRooms || selectedBooking.numberOfRooms}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Show all individual bookings */}
              {(selectedBooking.individualBookings || [selectedBooking]).map((booking, idx) => (
                <Box key={idx} sx={{ mb: 3, p: 2, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {t('ai-landing.hotel_reservation')} {idx + 1}
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption">{t('ai-landing.hotel_hotel')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{booking.hotelName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">{t('ai-landing.hotel_location')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{booking.hotelLocation}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">{t('ai-landing.hotel_room_type')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{booking.roomType}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">{t('ai-landing.hotel_number_of_rooms')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{booking.numberOfRooms}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">{t('ai-landing.hotel_check_in')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">{t('ai-landing.hotel_check_out')}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {booking.guests && booking.guests.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                        {t('ai-landing.hotel_rooming_list')}
                      </Typography>
                      {/* Group guests by room number */}
                      {Array.from({ length: parseInt(booking.numberOfRooms) || 1 }, (_, roomIndex) => {
                        const roomNumber = roomIndex + 1;
                        const roomGuests = booking.guests.filter(g => g.roomNumber === roomNumber) || [];
                        
                        if (roomGuests.length === 0) return null;
                        
                        return (
                          <Box 
                            key={roomNumber}
                            sx={{ 
                              mb: 3, 
                              p: 3, 
                              background: 'rgba(99, 102, 241, 0.08)',
                              borderRadius: 2,
                              border: '2px solid rgba(99, 102, 241, 0.2)',
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                              {t('ai-landing.hotel_room')} {roomNumber} - {roomGuests.length} {t('ai-landing.hotel_guest')}(s)
                            </Typography>
                            
                            {roomGuests.map((guest, guestIndex) => (
                              <Box key={guestIndex} sx={{ mb: guestIndex < roomGuests.length - 1 ? 2 : 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  {t('ai-landing.hotel_guest')} {guestIndex + 1}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>{t('ai-landing.hotel_name')}:</strong> {guest.fullName}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>{t('ai-landing.hotel_passport')}:</strong> {guest.passportNumber}
                                </Typography>
                                {guestIndex < roomGuests.length - 1 && (
                                  <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 1.5 }} />
                                )}
                              </Box>
                            ))}
                          </Box>
                        );
                      })}
                    </>
                  )}

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, color: 'primary.main' }}>
                    {t('ai-landing.hotel_reservation_total')}: ${booking.totalPrice}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ p: 3, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Payment Summary
                </Typography>
                <Grid container>
                  <Grid item xs={6}><Typography>Total Price:</Typography></Grid>
                  <Grid item xs={6}>
                    <Typography align="right" variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                      ${selectedBooking.totalPrice}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)} variant="contained">{t('ai-landing.hotel_close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Payment Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Please upload proof of payment for booking at {selectedBooking?.hotelName}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ my: 2 }}>
              Amount: ${selectedBooking?.totalPrice}
            </Typography>
            <input
              ref={paymentFileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setPaymentFile(e.target.files[0])}
              style={{ display: 'block', marginTop: 16 }}
            />
            {paymentFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                ✓ Selected: {paymentFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUploadPayment}
            disabled={!paymentFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Payment Proof'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay on Site Request Dialog */}
      <Dialog open={payOnSiteDialog} onClose={() => setPayOnSiteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Pay on Site</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Please provide a reason for requesting to pay on site:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason"
              value={onSiteReason}
              onChange={(e) => setOnSiteReason(e.target.value)}
              placeholder="e.g., Our organization doesn't allow bank transfers, Cash payment preferred, etc."
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayOnSiteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleRequestPayOnSite}
            disabled={!onSiteReason.trim()}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog */}
      <InvoiceGenerator 
        booking={selectedInvoice}
        open={invoiceDialog}
        onClose={() => {
          setInvoiceDialog(false);
          setSelectedInvoice(null);
        }}
      />
      
      <CustomDialog {...dialog} onClose={closeDialog} />
    </Box>
  );
}

export default MyBookings;

