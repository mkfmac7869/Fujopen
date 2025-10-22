import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import InvoiceGenerator from './InvoiceGenerator';
import * as XLSX from 'xlsx';

const useStyles = makeStyles({ uniqId: 'booking-management' })((theme) => ({
  root: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  filterSection: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
  },
  tableCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
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

function BookingManagement() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { dialog, showDialog, closeDialog } = useCustomDialog();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [confirmationNumbers, setConfirmationNumbers] = useState({}); // For grouped bookings
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'teams'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDialog, setTeamDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch bookings from Firestore
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings from Firebase...');
      const bookingsSnapshot = await getDocs(collection(db, 'hotelBookings'));
      console.log('Bookings fetched. Count:', bookingsSnapshot.size);
      
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      console.log('Bookings loaded:', bookingsData.length);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setSnackbar({ open: true, message: 'Failed to load bookings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  }, [filterStatus, searchTerm, bookings]);

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      const { getDoc, doc: firestoreDoc } = await import('firebase/firestore');
      
      // RESTORE ROOMS if cancelling a booking
      if (newStatus === 'cancelled' && selectedBooking.status !== 'cancelled') {
        const hotelDoc = await getDoc(firestoreDoc(db, 'hotels', selectedBooking.hotelId));
        
        if (hotelDoc.exists()) {
          const hotelData = hotelDoc.data();
          const rooms = hotelData.rooms || [];
          const roomIndex = rooms.findIndex(r => r.name === selectedBooking.roomType);
          
          if (roomIndex !== -1) {
            const numberOfRoomsBooked = parseInt(selectedBooking.numberOfRooms) || 1;
            // RESTORE room availability
            rooms[roomIndex].available = (rooms[roomIndex].available || 0) + numberOfRoomsBooked;
            
            await updateDoc(firestoreDoc(db, 'hotels', selectedBooking.hotelId), {
              rooms: rooms,
              roomsAvailable: rooms.reduce((sum, r) => sum + (r.available || 0), 0),
            });
            
            console.log(`Restored ${numberOfRoomsBooked} room(s) to ${selectedBooking.roomType}`);
          }
        }
      }

      const updateData = {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin',
      };

      // Add timestamps based on status
      if (newStatus === 'approved') {
        updateData.approvedBy = 'admin';
        updateData.approvedAt = new Date().toISOString();
      } else if (newStatus === 'confirmed') {
        // Handle grouped bookings with multiple hotels
        if (selectedBooking.individualBookings && selectedBooking.individualBookings.length > 0) {
          // Get unique hotels
          const uniqueHotels = [...new Set(selectedBooking.individualBookings.map(b => b.hotelId))];
          
          // Check if all hotels have confirmation numbers
          const allNumbersEntered = uniqueHotels.every(hotelId => confirmationNumbers[hotelId]?.trim());
          
          if (!allNumbersEntered) {
            showDialog({
              type: 'warning',
              message: 'Please enter confirmation numbers for all hotels',
            });
            return;
          }
          
          updateData.confirmationNumbers = confirmationNumbers;
        } else {
          // Single booking
          if (!confirmationNumber.trim()) {
            showDialog({
              type: 'warning',
              message: 'Please enter a confirmation number for confirmed bookings',
            });
            return;
          }
          updateData.confirmationNumber = confirmationNumber.trim();
        }
        
        updateData.confirmedBy = 'admin';
        updateData.confirmedAt = new Date().toISOString();
        updateData.paymentStatus = 'paid';
      }

      await updateDoc(doc(db, 'hotelBookings', selectedBooking.id), updateData);

      // Send status update email via API
      const bookingData = selectedBooking.individualBookings && selectedBooking.individualBookings.length > 0
        ? {
            hotelName: `${selectedBooking.individualBookings.length} Hotels`,
            location: 'Multiple Locations',
          }
        : {
            hotelName: selectedBooking.hotelName,
            location: selectedBooking.location,
          };
      
      try {
        const emailResponse = await fetch('/api/send-hotel-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'status',
            email: selectedBooking.userEmail,
            name: selectedBooking.userName,
            status: newStatus,
            bookingData: bookingData,
          }),
        });
        
        if (emailResponse.ok) {
          console.log('✅ Hotel status update email sent to:', selectedBooking.userEmail);
        } else {
          console.error('❌ Failed to send hotel status email');
        }
      } catch (emailError) {
        console.error('❌ Error sending hotel status email:', emailError);
      }

      setSnackbar({ open: true, message: 'Booking status updated successfully! Email sent to guest.', severity: 'success' });
      setEditDialog(false);
      setConfirmationNumber('');
      setConfirmationNumbers({});
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      setSnackbar({ open: true, message: 'Failed to update booking', severity: 'error' });
    }
  };

  const handleGenerateInvoice = (booking) => {
    // Convert grouped booking to invoice format
    if (booking.individualBookings && booking.individualBookings.length > 0) {
      const invoiceBooking = {
        ...booking,
        isTeamInvoice: true,
        teamBookings: booking.individualBookings,
      };
      setSelectedBooking(invoiceBooking);
    } else {
      setSelectedBooking(booking);
    }
    setInvoiceDialog(true);
  };

  const handleBulkStatusUpdate = async (team, status) => {
    if (!confirm(`Update all ${team.total} booking(s) to ${status}?`)) return;

    try {
      setLoading(true);
      
      for (const booking of team.bookings) {
        await updateDoc(doc(db, 'hotelBookings', booking.id), {
          status: status,
          lastUpdated: new Date().toISOString(),
          confirmedBy: status === 'confirmed' ? 'admin' : null,
          confirmedAt: status === 'confirmed' ? new Date().toISOString() : null,
        });

        // Reduce room availability if confirming
        if (status === 'confirmed' && booking.status !== 'confirmed') {
          const { getDoc, doc: firestoreDoc } = await import('firebase/firestore');
          const hotelDoc = await getDoc(firestoreDoc(db, 'hotels', booking.hotelId));
          if (hotelDoc.exists()) {
            const hotelData = hotelDoc.data();
            const rooms = hotelData.rooms || [];
            const roomIndex = rooms.findIndex(r => r.name === booking.roomType);
            if (roomIndex !== -1) {
              const numberOfRoomsBooked = parseInt(booking.numberOfRooms) || 1;
              rooms[roomIndex].available = (rooms[roomIndex].available || 0) - numberOfRoomsBooked;
              await updateDoc(firestoreDoc(db, 'hotels', booking.hotelId), {
                rooms: rooms,
                roomsAvailable: rooms.reduce((sum, r) => sum + (r.available || 0), 0),
              });
            }
          }
        }
      }

      setSnackbar({ open: true, message: `Updated ${team.total} booking(s) successfully!`, severity: 'success' });
      setTeamDialog(false);
      fetchBookings();
    } catch (error) {
      console.error('Error bulk updating:', error);
      setSnackbar({ open: true, message: 'Failed to update bookings', severity: 'error' });
      setLoading(false);
    }
  };

  const handleGenerateTeamInvoice = (team) => {
    // Flatten all individual bookings from all booking groups
    const allIndividualBookings = team.bookings.flatMap(booking => 
      booking.individualBookings || [booking]
    );
    
    const uniqueHotels = [...new Set(allIndividualBookings.map(b => b.hotelName))];
    const uniqueLocations = [...new Set(allIndividualBookings.map(b => b.hotelLocation))].filter(Boolean);
    
    // Show all hotel names separated by commas
    const hotelDisplay = uniqueHotels.join(', ');
    const locationDisplay = uniqueLocations.join(', ');
    
    const combinedBooking = {
      id: `team-${Date.now()}`,
      userName: team.name,
      userEmail: team.bookings[0]?.userEmail || '',
      hotelName: hotelDisplay,
      hotelLocation: locationDisplay,
      isTeamInvoice: true, // Flag to identify team invoices
      teamBookings: allIndividualBookings, // All individual bookings flattened
      numberOfRooms: allIndividualBookings.reduce((sum, b) => sum + (parseInt(b.numberOfRooms) || 0), 0),
      totalPrice: team.totalRevenue,
      guests: allIndividualBookings.flatMap(b => b.guests || []),
      status: 'confirmed',
      paymentStatus: team.bookings[0]?.paymentStatus || 'pending',
    };
    
    setSelectedBooking(combinedBooking);
    setInvoiceDialog(true);
  };

  // Group bookings by team
  const groupByTeam = () => {
    const teams = {};
    bookings.forEach(booking => {
      const teamName = booking.userName || 'Unknown Team';
      if (!teams[teamName]) {
        teams[teamName] = {
          name: teamName,
          logo: booking.teamLogo || null, // Get team logo from first booking
          bookings: [],
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          totalRevenue: 0,
        };
      }
      teams[teamName].bookings.push(booking);
      teams[teamName].total++;
      if (booking.status === 'confirmed') teams[teamName].confirmed++;
      else if (booking.status === 'cancelled') teams[teamName].cancelled++;
      else teams[teamName].pending++;
      teams[teamName].totalRevenue += booking.totalPrice || 0;
    });
    return Object.values(teams);
  };

  const teamData = groupByTeam();

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = [];
    
    filteredBookings.forEach((booking) => {
      const bookings = booking.individualBookings || [booking];
      
      bookings.forEach((individualBooking, idx) => {
        // Add each guest as a row
        individualBooking.guests?.forEach((guest, guestIdx) => {
          exportData.push({
            'Team/Club': booking.userName,
            'Email': booking.userEmail,
            'Booking Group ID': booking.groupId || booking.id,
            'Reservation #': idx + 1,
            'Hotel': individualBooking.hotelName,
            'Location': individualBooking.hotelLocation,
            'Room Type': individualBooking.roomType,
            'Room Price': individualBooking.roomPrice,
            'Number of Rooms': individualBooking.numberOfRooms,
            'Check-in': new Date(individualBooking.checkInDate).toLocaleDateString(),
            'Check-out': new Date(individualBooking.checkOutDate).toLocaleDateString(),
            'Nights': individualBooking.numberOfNights,
            'Guest #': guestIdx + 1,
            'Guest Name': guest.fullName,
            'Passport Number': guest.passportNumber,
            'Room Number': guest.roomNumber,
            'Reservation Total': individualBooking.totalPrice,
            'Grand Total': booking.totalPrice,
            'Status': statusConfig[booking.status]?.label || booking.status,
            'Payment Status': booking.paymentStatus || 'pending',
            'Confirmation Number': booking.confirmationNumber || Object.values(booking.confirmationNumbers || {}).join(', ') || 'N/A',
            'Created Date': new Date(booking.createdAt).toLocaleString(),
            'Last Updated': new Date(booking.lastUpdated).toLocaleString(),
          });
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hotel Bookings');
    
    // Auto-size columns
    const maxWidth = 50;
    const wscols = Object.keys(exportData[0] || {}).map(() => ({ wch: maxWidth }));
    ws['!cols'] = wscols;
    
    XLSX.writeFile(wb, `Hotel_Bookings_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Export single team to Excel
  const handleExportTeam = (team) => {
    const exportData = [];
    
    team.bookings.forEach((booking) => {
      const bookings = booking.individualBookings || [booking];
      
      bookings.forEach((individualBooking, idx) => {
        individualBooking.guests?.forEach((guest, guestIdx) => {
          exportData.push({
            'Team/Club': team.name,
            'Email': booking.userEmail,
            'Booking Group ID': booking.groupId || booking.id,
            'Reservation #': idx + 1,
            'Hotel': individualBooking.hotelName,
            'Location': individualBooking.hotelLocation,
            'Room Type': individualBooking.roomType,
            'Room Price': individualBooking.roomPrice,
            'Number of Rooms': individualBooking.numberOfRooms,
            'Check-in': new Date(individualBooking.checkInDate).toLocaleDateString(),
            'Check-out': new Date(individualBooking.checkOutDate).toLocaleDateString(),
            'Nights': individualBooking.numberOfNights,
            'Guest #': guestIdx + 1,
            'Guest Name': guest.fullName,
            'Passport Number': guest.passportNumber,
            'Room Number': guest.roomNumber,
            'Reservation Total': individualBooking.totalPrice,
            'Grand Total': booking.totalPrice,
            'Status': statusConfig[booking.status]?.label || booking.status,
            'Payment Status': booking.paymentStatus || 'pending',
            'Confirmation Number': booking.confirmationNumber || Object.values(booking.confirmationNumbers || {}).join(', ') || 'N/A',
            'Created Date': new Date(booking.createdAt).toLocaleString(),
            'Last Updated': new Date(booking.lastUpdated).toLocaleString(),
          });
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, team.name);
    
    const maxWidth = 50;
    const wscols = Object.keys(exportData[0] || {}).map(() => ({ wch: maxWidth }));
    ws['!cols'] = wscols;
    
    XLSX.writeFile(wb, `${team.name}_Hotel_Bookings_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Export single booking as PDF
  const handleExportPDF = async (booking) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header Background
      doc.setFillColor(30, 58, 138); // Dark blue
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Title
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text('HOTEL BOOKING REPORT', pageWidth / 2, 20, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('13th Fujairah Open International Taekwondo Championships 2026', pageWidth / 2, 30, { align: 'center' });
      
      // Report Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' });
      
      let yPos = 55;
      
      // Team Info Section
      doc.setFillColor(245, 247, 250);
      doc.rect(10, yPos, pageWidth - 20, 40, 'F');
      
      // Border for info box
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.rect(10, yPos, pageWidth - 20, 40);
      
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('Team/Club:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(booking.userName || 'N/A', 60, yPos);
      
      yPos += 8;
      doc.setFont(undefined, 'bold');
      doc.text('Email:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(booking.userEmail || 'N/A', 60, yPos);
      
      yPos += 8;
      doc.setFont(undefined, 'bold');
      doc.text('Booking Status:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(16, 185, 129); // Green for status
      doc.text(statusConfig[booking.status]?.label || booking.status, 60, yPos);
      doc.setTextColor(0, 0, 0);
      
      yPos += 8;
      doc.setFont(undefined, 'bold');
      doc.text('Booking ID:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(booking.groupId || booking.id || 'N/A', 60, yPos);
      
      yPos += 18;
      
      // Individual Bookings
      const bookings = booking.individualBookings || [booking];
      
      for (let idx = 0; idx < bookings.length; idx++) {
        const individualBooking = bookings[idx];
        
        // Add page if needed
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        // Reservation Header with background
        doc.setFillColor(99, 102, 241);
        doc.rect(10, yPos - 3, pageWidth - 20, 10, 'F');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(`RESERVATION ${idx + 1}`, 15, yPos + 4);
        doc.setFont(undefined, 'normal');
        yPos += 12;
        
        // Hotel details table
        autoTable(doc, {
          startY: yPos,
          head: [['Details', 'Information']],
          body: [
            ['Hotel Name', individualBooking.hotelName || 'N/A'],
            ['Location', individualBooking.hotelLocation || 'N/A'],
            ['Room Type', individualBooking.roomType || 'N/A'],
            ['Number of Rooms', String(individualBooking.numberOfRooms || 1)],
            ['Check-in Date', individualBooking.checkInDate ? new Date(individualBooking.checkInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'],
            ['Check-out Date', individualBooking.checkOutDate ? new Date(individualBooking.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'],
            ['Number of Nights', String(individualBooking.numberOfNights || 0)],
            ['Price per Night', `$${individualBooking.roomPrice || 0}`],
            ['Total Amount', `$${individualBooking.totalPrice || 0}`],
          ],
          theme: 'grid',
          headStyles: { 
            fillColor: [30, 58, 138], 
            textColor: 255, 
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'center'
          },
          styles: { 
            fontSize: 10, 
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 65, fillColor: [249, 250, 251] },
            1: { cellWidth: 115 }
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255]
          }
        });
        
        yPos = doc.lastAutoTable.finalY + 12;
        
        // Guest List
        if (individualBooking.guests && individualBooking.guests.length > 0) {
          // Add page if needed
          if (yPos > 220) {
            doc.addPage();
            yPos = 20;
          }
          
          // Guest List Header
          doc.setFillColor(16, 185, 129); // Green
          doc.rect(10, yPos - 3, pageWidth - 20, 8, 'F');
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');
          doc.text('GUEST LIST', 15, yPos + 3);
          doc.setFont(undefined, 'normal');
          yPos += 10;
          
          const guestData = individualBooking.guests.map((guest, gIdx) => [
            String(gIdx + 1),
            guest.fullName || 'N/A',
            guest.passportNumber || 'N/A',
            `Room ${guest.roomNumber || 'N/A'}`,
          ]);
          
          autoTable(doc, {
            startY: yPos,
            head: [['No.', 'Guest Name', 'Passport Number', 'Room Assignment']],
            body: guestData,
            theme: 'striped',
            headStyles: { 
              fillColor: [16, 185, 129],
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'center'
            },
            styles: { 
              fontSize: 9, 
              cellPadding: 3,
              lineColor: [200, 200, 200],
              lineWidth: 0.1
            },
            columnStyles: {
              0: { halign: 'center', cellWidth: 15 },
              1: { cellWidth: 70 },
              2: { cellWidth: 50 },
              3: { halign: 'center', cellWidth: 35 }
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251]
            }
          });
          
          yPos = doc.lastAutoTable.finalY + 15;
        }
      }
      
      // Add page if needed for total
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Grand Total Section
      yPos += 5;
      doc.setFillColor(30, 58, 138);
      doc.rect(10, yPos - 3, pageWidth - 20, 18, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text(`GRAND TOTAL: $${booking.totalPrice}`, pageWidth / 2, yPos + 9, { align: 'center' });
      
      // Footer
      yPos = pageHeight - 20;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text('13th Fujairah Open International Taekwondo Championships 2026', pageWidth / 2, yPos, { align: 'center' });
      doc.text('www.fujopen.com | info@fujairahopen.com', pageWidth / 2, yPos + 5, { align: 'center' });
      
      // Divider line above footer
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);
      
      // Save PDF with better filename
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Hotel_Booking_${booking.userName?.replace(/\s+/g, '_')}_${dateStr}.pdf`;
      doc.save(fileName);
      
      // Show success dialog
      showDialog({
        type: 'success',
        message: 'PDF downloaded successfully!',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message, error.stack);
      showDialog({
        type: 'error',
        message: `Failed to generate PDF. Error: ${error.message || 'Unknown error'}`,
      });
    }
  };

  return (
    <Container className={classes.root} maxWidth="xl">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
        Hotel Booking Management
      </Typography>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, val) => setViewMode(val)}>
          <Tab label="All Bookings" value="all" />
          <Tab label="By Teams" value="teams" />
        </Tabs>
      </Box>

      {viewMode === 'all' ? (
        <>
          {/* Filters */}
          <Box className={classes.filterSection}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search by name, hotel, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Tabs
              value={filterStatus}
              onChange={(e, val) => setFilterStatus(val)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" value="all" />
              <Tab label="Pending" value="pending" />
              <Tab label="Confirmed" value="confirmed" />
              <Tab label="Cancelled" value="cancelled" />
              <Tab label="Completed" value="completed" />
            </Tabs>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Chip label={`Total: ${filteredBookings.length}`} color="primary" />
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchBookings}
                disabled={loading}
                size="small"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
                disabled={filteredBookings.length === 0}
                size="small"
                sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
              >
                Excel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Bookings Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <TableContainer component={Paper} className={classes.tableCard}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Team/Club</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hotel</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Guests</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => {
                // Handle both grouped and legacy booking structures
                const bookings = booking.individualBookings || [booking];
                const uniqueHotels = [...new Set(bookings.map(b => b.hotelName))];
                const totalGuests = bookings.reduce((sum, b) => sum + (b.guests?.length || 0), 0);
                
                return (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {booking.userName}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {booking.userEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {uniqueHotels.length === 1 ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {uniqueHotels[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {bookings[0].hotelLocation}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {booking.numberOfBookings || bookings.length} Reservations
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Multiple Hotels
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {uniqueHotels.length === 1 ? (
                      bookings[0].roomType
                    ) : (
                      <Chip label={`${booking.totalRooms || booking.numberOfRooms} Rooms`} size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {uniqueHotels.length === 1 ? (
                      <>
                        <Typography variant="caption" display="block">
                          In: {new Date(bookings[0].checkInDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Out: {new Date(bookings[0].checkOutDate).toLocaleDateString()}
                        </Typography>
                        <Chip label={`${bookings[0].numberOfNights} nights`} size="small" sx={{ mt: 0.5 }} />
                      </>
                    ) : (
                      <Chip label={`${bookings.length} Reservations`} size="small" color="primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    {totalGuests} guest(s)
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                      ${booking.totalPrice}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusConfig[booking.status]?.label || booking.status}
                      color={statusConfig[booking.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setDetailsDialog(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setNewStatus(booking.status);
                        setConfirmationNumber(booking.confirmationNumber || '');
                        setConfirmationNumbers(booking.confirmationNumbers || {});
                        setEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      sx={{ color: '#dc2626' }}
                      onClick={() => handleExportPDF(booking)}
                      title="Export PDF Report"
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                    {booking.status === 'confirmed' && (
                      <IconButton 
                        size="small"
                        color="success"
                        onClick={() => handleGenerateInvoice(booking)}
                        title="Generate Invoice"
                      >
                        <ReceiptIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
        </>
      ) : (
        /* Teams View */
        <Box>
          {/* Export Button for Teams */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Chip label={`Total Teams: ${teamData.length}`} color="primary" />
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              disabled={bookings.length === 0}
              size="small"
              sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
            >
              Export Excel
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {teamData.map((team, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    className={classes.tableCard}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
                      }
                    }}
                    onClick={() => {
                      setSelectedTeam(team);
                      setTeamDialog(true);
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {team.logo && (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '2px solid',
                              borderColor: 'primary.main',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'white',
                            }}
                          >
                            <img
                              src={team.logo}
                              alt={team.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          </Box>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {team.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${team.total} Total`} 
                          size="small"
                          sx={{ background: 'rgba(99, 102, 241, 0.15)', color: theme.palette.primary.main, fontWeight: 700 }}
                        />
                        <Chip 
                          label={`${team.confirmed} Confirmed`} 
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip 
                          label={`${team.pending} Pending`} 
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 700 }}
                        />
                        {team.cancelled > 0 && (
                          <Chip 
                            label={`${team.cancelled} Cancelled`} 
                            size="small"
                            color="error"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Box>

                      <Box sx={{ mb: 2, p: 1.5, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                          Total Revenue
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#4caf50' }}>
                          ${team.totalRevenue}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<VisibilityIcon />}
                      >
                        View {team.total} Booking{team.total !== 1 ? 's' : ''}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Team Bookings Dialog */}
      <Dialog
        open={teamDialog}
        onClose={() => setTeamDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(40px)',
            borderRadius: 4,
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {selectedTeam?.name} - Hotel Bookings
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Hotel</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Room Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Guests</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTeam.bookings.map((booking) => {
                    // Handle grouped booking structure
                    const bookings = booking.individualBookings || [booking];
                    const uniqueHotels = [...new Set(bookings.map(b => b.hotelName))];
                    const totalGuests = bookings.reduce((sum, b) => sum + (b.guests?.length || 0), 0);
                    
                    return (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        {uniqueHotels.length === 1 ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {uniqueHotels[0]}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {bookings[0].hotelLocation}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {bookings.length} Reservations
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              Multiple Hotels
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {uniqueHotels.length === 1 ? (
                          bookings[0].roomType
                        ) : (
                          <Chip label={`${booking.totalRooms || booking.numberOfRooms} Rooms`} size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {uniqueHotels.length === 1 ? (
                          <>
                            <Typography variant="caption" display="block">
                              {new Date(bookings[0].checkInDate).toLocaleDateString()} - {new Date(bookings[0].checkOutDate).toLocaleDateString()}
                            </Typography>
                            <Chip label={`${bookings[0].numberOfNights} nights`} size="small" />
                          </>
                        ) : (
                          <Chip label={`${bookings.length} Reservations`} size="small" color="primary" />
                        )}
                      </TableCell>
                      <TableCell>{totalGuests} guest(s)</TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                          ${booking.totalPrice}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusConfig[booking.status]?.label || booking.status}
                          color={statusConfig[booking.status]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDetailsDialog(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setNewStatus(booking.status);
                            setConfirmationNumber(booking.confirmationNumber || '');
                            setConfirmationNumbers(booking.confirmationNumbers || {});
                            setEditDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          sx={{ color: '#dc2626' }}
                          onClick={() => handleExportPDF(booking)}
                          title="Export PDF Report"
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                        {booking.status === 'confirmed' && (
                          <IconButton 
                            size="small"
                            color="success"
                            onClick={() => handleGenerateInvoice(booking)}
                            title="Generate Invoice"
                          >
                            <ReceiptIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setTeamDialog(false)}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportTeam(selectedTeam)}
                sx={{ color: '#10b981', borderColor: '#10b981', '&:hover': { borderColor: '#059669', background: 'rgba(16, 185, 129, 0.08)' } }}
              >
                Export Excel
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleBulkStatusUpdate(selectedTeam, 'confirmed')}
                startIcon={<CheckCircleIcon />}
              >
                Confirm All
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleBulkStatusUpdate(selectedTeam, 'cancelled')}
                startIcon={<CancelIcon />}
              >
                Cancel All
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleGenerateTeamInvoice(selectedTeam)}
                startIcon={<ReceiptIcon />}
                sx={{ fontWeight: 700 }}
              >
                Generate Team Invoice
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)} 
        maxWidth="sm" 
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
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Team/Club: {selectedBooking.userName}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                Hotel: {selectedBooking.hotelName}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Confirmation Number Input (Required for Confirmed status) */}
              {newStatus === 'confirmed' && (
                <>
                  {selectedBooking.individualBookings && selectedBooking.individualBookings.length > 0 ? (
                    // Multiple hotels - show input for each unique hotel
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                        Enter Confirmation Numbers for Each Hotel:
                      </Typography>
                      {[...new Map(selectedBooking.individualBookings.map(b => [b.hotelId, { id: b.hotelId, name: b.hotelName }])).values()].map((hotel) => (
                        <TextField
                          key={hotel.id}
                          fullWidth
                          label={`${hotel.name} - Confirmation Number`}
                          value={confirmationNumbers[hotel.id] || ''}
                          onChange={(e) => setConfirmationNumbers(prev => ({ ...prev, [hotel.id]: e.target.value }))}
                          required
                          placeholder="e.g., CONF-12345"
                          sx={{ mb: 2 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    // Single booking
                    <TextField
                      fullWidth
                      label="Confirmation Number"
                      value={confirmationNumber}
                      onChange={(e) => setConfirmationNumber(e.target.value)}
                      required
                      placeholder="e.g., CONF-12345, HTL-ABC123"
                      sx={{ mt: 2 }}
                      helperText="Enter the hotel confirmation number for this booking"
                    />
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog(false);
            setConfirmationNumber('');
            setConfirmationNumbers({});
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)} 
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
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Booking Details</Typography>
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
              {/* Team/Booking Information */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Booking Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Team/Club Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedBooking.userName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedBooking.userEmail}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Booking Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Reservations in Group
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedBooking.numberOfBookings || selectedBooking.individualBookings?.length || 1}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* All Individual Bookings */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                All Reservations ({selectedBooking.numberOfBookings || selectedBooking.individualBookings?.length || 1})
              </Typography>
              {(selectedBooking.individualBookings || [selectedBooking]).map((booking, idx) => (
                <Box 
                  key={idx}
                  sx={{ 
                    mb: 3, 
                    p: 3, 
                    background: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                    borderRadius: 2,
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
                    Reservation {idx + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          Hotel
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {booking.hotelName}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {booking.hotelLocation}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          Room Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {booking.roomType}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          ${booking.roomPrice}/night
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          Number of Rooms
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {booking.numberOfRooms} room(s)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          Check-in Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          Check-out Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          Number of Nights
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {booking.numberOfNights} night(s)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Rooming List - Grouped by Room */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                    Rooming List
                  </Typography>
                  {/* Group guests by room number */}
                  {Array.from({ length: parseInt(booking.numberOfRooms) || 1 }, (_, roomIndex) => {
                    const roomNumber = roomIndex + 1;
                    const roomGuests = booking.guests?.filter(g => g.roomNumber === roomNumber) || [];
                
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
                      Room {roomNumber} - {roomGuests.length} Guest(s)
                    </Typography>
                    
                    {roomGuests.map((guest, guestIndex) => (
                      <Box key={guestIndex} sx={{ mb: guestIndex < roomGuests.length - 1 ? 2 : 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Guest {guestIndex + 1}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Name:</strong> {guest.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Passport:</strong> {guest.passportNumber}
                        </Typography>
                        {guestIndex < roomGuests.length - 1 && (
                          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 1.5 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                    );
                  })}

                  {/* Reservation Price */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      Reservation Total: ${booking.totalPrice}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* Payment Proof */}
              {selectedBooking.paymentProofFile && (
                <Box sx={{ mb: 3, p: 3, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                    💳 Payment Proof Uploaded
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    Uploaded on: {selectedBooking.paymentUploadedAt ? new Date(selectedBooking.paymentUploadedAt).toLocaleString() : 'Recently'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      href={selectedBooking.paymentProofFile}
                      target="_blank"
                    >
                      View Payment Proof
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success"
                      onClick={() => window.open(selectedBooking.paymentProofFile, '_blank')}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Pay on Site Request */}
              {selectedBooking.payOnSiteRequest?.requested && (
                <Box sx={{ mb: 3, p: 3, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'warning.main' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'warning.main' }}>
                    🏢 Pay on Site Request
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Status:</strong> {selectedBooking.payOnSiteRequest.status}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Reason:</strong> {selectedBooking.payOnSiteRequest.reason}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2, opacity: 0.7 }}>
                    Requested on: {new Date(selectedBooking.payOnSiteRequest.requestedAt).toLocaleString()}
                  </Typography>
                  
                  {selectedBooking.payOnSiteRequest.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={async () => {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          await updateDoc(doc(db, 'hotelBookings', selectedBooking.id), {
                            'payOnSiteRequest.status': 'approved',
                            'payOnSiteRequest.approvedBy': 'admin',
                            'payOnSiteRequest.approvedAt': new Date().toISOString(),
                          });
                          showDialog({
                            type: 'success',
                            message: 'Pay on site request approved!',
                          });
                          fetchBookings();
                          setDetailsDialog(false);
                        }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="error"
                        onClick={async () => {
                          const { updateDoc, doc } = await import('firebase/firestore');
                          await updateDoc(doc(db, 'hotelBookings', selectedBooking.id), {
                            'payOnSiteRequest.status': 'rejected',
                            'payOnSiteRequest.rejectedBy': 'admin',
                            'payOnSiteRequest.rejectedAt': new Date().toISOString(),
                          });
                          showDialog({
                            type: 'success',
                            message: 'Pay on site request rejected!',
                          });
                          fetchBookings();
                          setDetailsDialog(false);
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Payment Summary */}
              <Box sx={{ p: 3, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Payment Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Total Reservations:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">{selectedBooking.numberOfBookings || selectedBooking.individualBookings?.length || 1}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Total Rooms:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">{selectedBooking.totalRooms || selectedBooking.numberOfRooms}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Grand Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right" color="primary" sx={{ fontWeight: 800 }}>
                      ${selectedBooking.totalPrice}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              setDetailsDialog(false);
              setNewStatus(selectedBooking?.status || '');
              setConfirmationNumber(selectedBooking?.confirmationNumber || '');
              setConfirmationNumbers(selectedBooking?.confirmationNumbers || {});
              setEditDialog(true);
            }}
          >
            Change Status
          </Button>
          {selectedBooking?.status === 'confirmed' && (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<ReceiptIcon />}
              onClick={() => handleGenerateInvoice(selectedBooking)}
            >
              Generate Invoice
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Invoice Generator Dialog */}
      <InvoiceGenerator
        booking={selectedBooking}
        open={invoiceDialog}
        onClose={() => setInvoiceDialog(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      
      <CustomDialog {...dialog} onClose={closeDialog} />
    </Container>
  );
}

export default BookingManagement;

