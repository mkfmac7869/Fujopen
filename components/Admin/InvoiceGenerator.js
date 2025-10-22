import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';

function InvoiceGenerator({ booking, open, onClose }) {
  const theme = useTheme();
  const [generating, setGenerating] = useState(false);
  const { dialog, showDialog, closeDialog } = useCustomDialog();

  if (!booking) return null;

  const invoiceNumber = `INV-${booking.id.substring(0, 8).toUpperCase()}`;
  const invoiceDate = new Date().toLocaleDateString();
  
  // Check if this is a combined team invoice
  const isTeamInvoice = booking.isTeamInvoice || false;

  const handleDownloadPDF = async () => {
    try {
      setGenerating(true);
      const invoiceElement = document.getElementById('invoice-content');
      
      // Convert HTML to canvas
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // A4 dimensions in mm with proper margins
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // 10mm margins
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }
      
      // Download PDF
      const fileName = `Invoice_${booking.userName?.replace(/\s+/g, '_')}_${invoiceNumber}.pdf`;
      pdf.save(fileName);
      
      setGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showDialog({
        type: 'error',
        message: 'Failed to generate PDF. Please try again.',
      });
      setGenerating(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
      <DialogContent sx={{ p: 0 }}>
        <Box id="invoice-content" sx={{ 
          p: 5, 
          background: '#ffffff', 
          color: '#000000',
          maxWidth: '210mm',
          margin: '0 auto',
          minHeight: '297mm',
        }}>
          {/* Invoice Header */}
          <Box sx={{ mb: 4, pb: 3, borderBottom: '3px solid #155289' }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img 
                    src="/images/13th Fuj. OITC.png" 
                    alt="Fujairah Taekwondo"
                    style={{ width: 80, height: 80, objectFit: 'contain' }}
                  />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#155289' }}>
                      INVOICE
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                      Fujairah Open International Taekwondo
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item sx={{ textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
                  {invoiceNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Date: {invoiceDate}
                </Typography>
                {(booking.confirmationNumber || (booking.confirmationNumbers && Object.keys(booking.confirmationNumbers).length > 0)) && (
                  <>
                    {booking.confirmationNumber && (
                      <Typography variant="body2" sx={{ color: '#155289', fontWeight: 700, mt: 1 }}>
                        Confirmation: {booking.confirmationNumber}
                      </Typography>
                    )}
                    {booking.status === 'confirmed' && (
                      <Chip 
                        label="PAID" 
                        color="success"
                        sx={{ mt: 1, fontWeight: 800 }}
                      />
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Bill To Section */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#155289' }}>
                BILL TO:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                {booking.userName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#000000' }}>
                {booking.userEmail}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#155289' }}>
                HOTEL{isTeamInvoice && booking.teamBookings?.length > 1 ? 'S' : ''}:
              </Typography>
              {isTeamInvoice ? (
                // List all unique hotels vertically
                [...new Set(booking.teamBookings?.map(b => JSON.stringify({ name: b.hotelName, location: b.hotelLocation })))]
                  .map(hotelStr => JSON.parse(hotelStr))
                  .map((hotel, index) => (
                    <Box key={index} sx={{ mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                        {hotel.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {hotel.location}
                      </Typography>
                    </Box>
                  ))
              ) : (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                    {booking.hotelName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    {booking.hotelLocation}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>

          {/* Booking Details Table */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#155289' }}>
            BOOKING DETAILS
          </Typography>
          <Table sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
            <TableHead>
              <TableRow sx={{ background: '#f3f4f6' }}>
                <TableCell sx={{ fontWeight: 700, color: '#000000' }}>Hotel & Room</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#000000' }}>Check-in / Check-out</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#000000' }} align="right">Rooms × Nights</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#000000' }} align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isTeamInvoice ? (
                // Show all bookings separately for team invoice
                booking.teamBookings?.map((b, index) => (
                  <TableRow key={index} sx={{ borderBottom: '1px solid #e5e7eb' }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                        {b.hotelName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {b.roomType} - {b.hotelLocation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        In: {new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        Out: {new Date(b.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        {b.numberOfRooms} Room(s)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        {b.numberOfNights} Night(s)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        ${b.roomPrice}/night
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#000000' }}>
                        ${b.totalPrice}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Single booking
                <TableRow>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#000000' }}>
                      {booking.hotelName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {booking.roomType} - {booking.hotelLocation}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#000000' }}>
                      In: {new Date(booking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#000000' }}>
                      Out: {new Date(booking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: '#000000' }}>
                      {booking.numberOfRooms} Room(s)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#000000' }}>
                      {booking.numberOfNights} Night(s)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      ${booking.roomPrice}/night
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#000000' }}>
                      ${booking.totalPrice}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>


          {/* Guest List - Grouped by Booking and Room */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#155289' }}>
              ROOMING LIST
            </Typography>
            {isTeamInvoice ? (
              // For team invoice, group by booking
              booking.teamBookings?.map((b, bookingIndex) => {
                const bookingRooms = Array.from({ length: b.numberOfRooms || 1 }, (_, roomIndex) => {
                  const roomNumber = roomIndex + 1;
                  const roomGuests = b.guests?.filter(g => g.roomNumber === roomNumber) || [];
                  
                  if (roomGuests.length === 0) return null;
                  
                  return (
                    <Box 
                      key={`${bookingIndex}-${roomNumber}`}
                      sx={{ 
                        mb: 2.5, 
                        p: 2.5, 
                        background: '#f9fafb', 
                        borderRadius: 1,
                        border: '1px solid #e5e7eb',
                        pageBreakInside: 'avoid',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: '#155289' }}>
                        Room {roomNumber} - {roomGuests.length} Guest(s)
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ color: '#6b7280', mb: 1 }}>
                        {b.hotelName} • {b.roomType} • {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                      </Typography>
                      {roomGuests.map((guest, guestIndex) => (
                        <Box key={guestIndex} sx={{ ml: 2, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                            {guestIndex + 1}. {guest.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', ml: 2 }}>
                            Passport: {guest.passportNumber}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                });
                
                return bookingRooms;
              })
            ) : (
              // Single booking
              Array.from({ length: booking.numberOfRooms || 1 }, (_, roomIndex) => {
                const roomNumber = roomIndex + 1;
                const roomGuests = booking.guests?.filter(g => g.roomNumber === roomNumber) || [];
                
                if (roomGuests.length === 0) return null;
                
                return (
                  <Box 
                    key={roomNumber}
                    sx={{ 
                      mb: 2.5, 
                      p: 2.5, 
                      background: '#f9fafb', 
                      borderRadius: 1,
                      border: '1px solid #e5e7eb',
                      pageBreakInside: 'avoid',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: '#155289' }}>
                      Room {roomNumber} - {roomGuests.length} Guest(s)
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#6b7280', mb: 1 }}>
                      {booking.hotelName} • {booking.roomType} • {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </Typography>
                    {roomGuests.map((guest, guestIndex) => (
                      <Box key={guestIndex} sx={{ ml: 2, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                          {guestIndex + 1}. {guest.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', ml: 2 }}>
                          Passport: {guest.passportNumber}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                );
              })
            )}
          </Box>

          <Divider sx={{ my: 3, borderColor: '#e5e7eb' }} />

          {/* Bank Transfer Information - Show only for approved status (awaiting payment) */}
          {booking.status === 'approved' && (
            <>
              {/* Force page break before bank info */}
              <Box sx={{ pageBreakAfter: 'always', height: 0 }} />
              
              <Box sx={{ 
                pageBreakBefore: 'always',
                pageBreakInside: 'avoid',
                pageBreakAfter: 'avoid',
                mb: 0, 
                mt: 0,
                p: 3, 
                background: '#f0f9ff', 
                borderRadius: 2, 
                border: '3px solid #155289',
                minHeight: '240mm',
                maxHeight: '277mm',
              }}>
              {/* Logo and Title for Bank Info Page */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img 
                  src="/images/13th Fuj. OITC.png" 
                  alt="Fujairah Taekwondo"
                  style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#155289', mt: 1 }}>
                  Fujairah Open International Taekwondo
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: '#155289', borderWidth: 2 }} />
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: '#155289', textAlign: 'center' }}>
                💳 INTERNATIONAL TRANSFER INFORMATION
              </Typography>
              <Typography variant="caption" sx={{ mb: 2, textAlign: 'center', color: '#6b7280', fontStyle: 'italic', display: 'block' }}>
                Please use the following details to complete your payment
              </Typography>
              
              <Table sx={{ border: '2px solid #155289', tableLayout: 'fixed' }}>
                <TableBody>
                  <TableRow sx={{ background: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', width: '35%', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      Customer Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 0.75, fontSize: '0.85rem' }}>
                      ASEC Investment Group
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      Swift Code
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 0.75, fontSize: '0.85rem' }}>
                      ABDIAEAD
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ background: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      Bank Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 0.75, fontSize: '0.85rem' }}>
                      Abu Dhabi Islamic Bank
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      Branch Bank
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 0.75, fontSize: '0.85rem' }}>
                      Hamad Bin Abdulla Rd – Fujairah
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ background: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      IBAN
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900, color: '#155289', fontSize: '0.95rem', letterSpacing: 0.5, py: 0.75 }}>
                      AE20050000000000016074648
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      Currency
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 0.75, fontSize: '0.85rem' }}>
                      AED (United Arab Emirates Dirham)
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ background: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#155289', borderRight: '1px solid #e5e7eb', py: 0.75, fontSize: '0.85rem' }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 0.75, fontSize: '0.85rem' }}>
                      15th floor Creative Tower, Unit 1504-1505, Hamad Bin Abdulla Rd, Fujairah, UAE, 7771
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <Box sx={{ mt: 3, p: 2, background: '#fff3cd', borderRadius: 2, border: '2px solid #ffc107' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#856404', textAlign: 'center', mb: 0.5 }}>
                  ⚠️ IMPORTANT INSTRUCTIONS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404', textAlign: 'center' }}>
                  After completing the payment, please upload the payment proof in your booking page
                </Typography>
              </Box>
            </Box>
            </>
          )}

          {/* Confirmation Numbers (if any) */}
          {booking.confirmationNumbers && Object.keys(booking.confirmationNumbers).length > 0 && (
            <Box sx={{ mb: 3, p: 3, background: '#f9fafb', borderRadius: 2, border: '2px solid #155289' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#155289' }}>
                CONFIRMATION NUMBERS
              </Typography>
              {Object.entries(booking.confirmationNumbers).map(([hotelId, number], index) => {
                // Find hotel name from teamBookings
                const bookingWithHotel = booking.teamBookings?.find(b => b.hotelId === hotelId);
                const hotelName = bookingWithHotel?.hotelName || `Hotel ${index + 1}`;
                return (
                  <Typography key={index} variant="body2" sx={{ mb: 1, color: '#000000' }}>
                    <strong>{hotelName}:</strong> {number}
                  </Typography>
                );
              })}
            </Box>
          )}
          
          {/* Single booking confirmation */}
          {!isTeamInvoice && booking.confirmationNumber && (
            <Box sx={{ mb: 3, p: 3, background: '#f9fafb', borderRadius: 2, border: '2px solid #155289' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#155289' }}>
                CONFIRMATION NUMBER
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#000000' }}>
                {booking.confirmationNumber}
              </Typography>
            </Box>
          )}

          {/* Total Amount */}
          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#155289' }}>
              TOTAL: ${booking.totalPrice}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              All amounts in USD
            </Typography>
            {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
              <Chip 
                label="PAID" 
                color="success"
                sx={{ ml: 2, fontWeight: 800, display: 'block', mt: 1 }}
              />
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ pt: 4, mt: 4, borderTop: '2px solid #e5e7eb' }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
                  Fujairah Open International Taekwondo Championship 2026
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>
                  Thank you for your booking!
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>
                  For inquiries, please contact: info@fujairahopen.com
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <img 
                  src="/images/13th Fuj. OITC.png" 
                  alt="Logo"
                  style={{ width: 60, height: 60, objectFit: 'contain', opacity: 0.7 }}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Action Buttons (Not Printed) */}
        <Box sx={{ p: 2, background: '#f3f4f6', display: 'flex', gap: 2, justifyContent: 'flex-end', '@media print': { display: 'none' } }}>
          <Button variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={generating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={generating}
            sx={{ background: '#155289', '&:hover': { background: '#0d3a5f' } }}
          >
            {generating ? 'Generating PDF...' : 'Download as PDF'}
          </Button>
        </Box>

         {/* Print Styles */}
         <style jsx global>{`
           @media print {
             @page {
               size: A4;
               margin: 20mm;
             }
             body {
               print-color-adjust: exact;
               -webkit-print-color-adjust: exact;
             }
             .page-break-before {
               page-break-before: always;
               page-break-inside: avoid;
             }
             .no-break {
               page-break-inside: avoid;
             }
           }
         `}</style>
      </DialogContent>
      
      <CustomDialog {...dialog} onClose={closeDialog} />
    </Dialog>
  );
}

export default InvoiceGenerator;

