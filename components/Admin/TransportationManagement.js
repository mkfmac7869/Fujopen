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
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

const localizer = momentLocalizer(moment);

const useStyles = makeStyles({ uniqId: 'transportation-management' })((theme) => ({
  root: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  tableCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  filterSection: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.spacing(2),
  },
  calendarWrapper: {
    '& .rbc-calendar': {
      color: theme.palette.text.primary,
    },
    '& .rbc-header': {
      padding: '12px 3px',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: theme.palette.mode === 'dark' ? '#fff' : '#1e293b',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
        : 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    },
    '& .rbc-month-view': {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(2),
      overflow: 'hidden',
    },
    '& .rbc-day-bg': {
      border: `1px solid ${theme.palette.divider}`,
    },
    '& .rbc-off-range-bg': {
      background: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.02)',
    },
    '& .rbc-today': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(99, 102, 241, 0.15)'
        : 'rgba(99, 102, 241, 0.1)',
    },
    '& .rbc-date-cell': {
      padding: '8px',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    '& .rbc-event': {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '0.85rem',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }
    },
    '& .rbc-event-label': {
      display: 'none',
    },
    '& .rbc-event-content': {
      fontSize: '0.85rem',
      fontWeight: 600,
      whiteSpace: 'normal',
      overflow: 'visible',
    },
    '& .rbc-month-row': {
      minHeight: '100px',
    },
    '& .rbc-toolbar': {
      padding: '16px',
      marginBottom: '16px',
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.8)',
      borderRadius: theme.spacing(2),
      flexWrap: 'wrap',
      gap: '8px',
    },
    '& .rbc-toolbar button': {
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`,
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      '&:hover': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(99, 102, 241, 0.2)'
          : 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
      },
      '&.rbc-active': {
        background: '#6366f1',
        color: 'white',
        borderColor: '#6366f1',
      }
    },
    '& .rbc-toolbar-label': {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: theme.palette.text.primary,
    }
  },
}));

const statusConfig = {
  pending: { label: 'Pending Approval', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  completed: { label: 'Completed', color: 'info' },
};

const airports = [
  'Dubai International Airport (DXB)',
  'Sharjah International Airport (SHJ)',
  'Ras Al Khaimah International Airport (RKT)'
];

// Helper function to check if request is new format (multi-request)
const isNewFormat = (request) => {
  return !!(request.arrivalRequests || request.departureRequests);
};

// Helper function to get summary for display in tables
const getRequestSummary = (request) => {
  if (isNewFormat(request)) {
    return {
      arrivalCount: request.totalArrivalRequests || request.arrivalRequests?.length || 0,
      departureCount: request.totalDepartureRequests || request.departureRequests?.length || 0,
      totalTeamMembers: request.totalTeamMembers || 0,
      arrivalText: request.arrivalRequests?.length > 0 
        ? `${request.arrivalRequests.length} arrivals`
        : 'No arrivals',
      departureText: request.departureRequests?.length > 0
        ? `${request.departureRequests.length} departures`
        : 'No departures',
      firstArrival: request.arrivalRequests?.[0] || null,
      firstDeparture: request.departureRequests?.[0] || null,
    };
  } else {
    return {
      arrivalCount: 1,
      departureCount: 1,
      totalTeamMembers: Math.max(request.arrival?.teamMembers || 0, request.departure?.teamMembers || 0),
      arrivalText: request.arrival?.flightNumber || 'N/A',
      departureText: request.departure?.flightNumber || 'N/A',
      firstArrival: request.arrival || null,
      firstDeparture: request.departure || null,
    };
  }
};

function TransportationManagement() {
  const { classes } = useStyles();
  const theme = useTheme();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'teams', 'calendar'

  // Filter states
  const [filters, setFilters] = useState({
    locations: [],
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    status: 'all',
  });

  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'transportationRequests'));
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      requestsData.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      setRequests(requestsData);
      setFilteredRequests(requestsData);
    } catch (error) {
      console.error('Error fetching transportation requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(req => {
        if (isNewFormat(req)) {
          // Check all arrival and departure requests
          const hasMatchingArrival = req.arrivalRequests?.some(arr => 
            filters.locations.includes(arr.airport)
          );
          const hasMatchingDeparture = req.departureRequests?.some(dep => 
            filters.locations.includes(dep.airport)
          );
          return hasMatchingArrival || hasMatchingDeparture;
        } else {
          // Old format
          return filters.locations.includes(req.arrival?.airport) || 
                 filters.locations.includes(req.departure?.airport);
        }
      });
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(req => {
        if (isNewFormat(req)) {
          const hasMatchingArrival = req.arrivalRequests?.some(arr => 
            new Date(arr.date) >= new Date(filters.dateFrom)
          );
          const hasMatchingDeparture = req.departureRequests?.some(dep => 
            new Date(dep.date) >= new Date(filters.dateFrom)
          );
          return hasMatchingArrival || hasMatchingDeparture;
        } else {
          return new Date(req.arrival?.date) >= new Date(filters.dateFrom) ||
                 new Date(req.departure?.date) >= new Date(filters.dateFrom);
        }
      });
    }
    if (filters.dateTo) {
      filtered = filtered.filter(req => {
        if (isNewFormat(req)) {
          const hasMatchingArrival = req.arrivalRequests?.some(arr => 
            new Date(arr.date) <= new Date(filters.dateTo)
          );
          const hasMatchingDeparture = req.departureRequests?.some(dep => 
            new Date(dep.date) <= new Date(filters.dateTo)
          );
          return hasMatchingArrival || hasMatchingDeparture;
        } else {
          return new Date(req.arrival?.date) <= new Date(filters.dateTo) ||
                 new Date(req.departure?.date) <= new Date(filters.dateTo);
        }
      });
    }

    // Time range filter
    if (filters.timeFrom) {
      filtered = filtered.filter(req => {
        if (isNewFormat(req)) {
          const hasMatchingArrival = req.arrivalRequests?.some(arr => 
            arr.time >= filters.timeFrom
          );
          const hasMatchingDeparture = req.departureRequests?.some(dep => 
            dep.time >= filters.timeFrom
          );
          return hasMatchingArrival || hasMatchingDeparture;
        } else {
          return req.arrival?.time >= filters.timeFrom || req.departure?.time >= filters.timeFrom;
        }
      });
    }
    if (filters.timeTo) {
      filtered = filtered.filter(req => {
        if (isNewFormat(req)) {
          const hasMatchingArrival = req.arrivalRequests?.some(arr => 
            arr.time <= filters.timeTo
          );
          const hasMatchingDeparture = req.departureRequests?.some(dep => 
            dep.time <= filters.timeTo
          );
          return hasMatchingArrival || hasMatchingDeparture;
        } else {
          return req.arrival?.time <= filters.timeTo || req.departure?.time <= filters.timeTo;
        }
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    setFilteredRequests(filtered);
  };

  const handleLocationToggle = (airport) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(airport)
        ? prev.locations.filter(loc => loc !== airport)
        : [...prev.locations, airport]
    }));
  };

  // Export specific team to Excel
  const exportTeamToExcel = (team) => {
    const exportData = [];
    
    team.requests.forEach(req => {
      const baseInfo = {
        'Team Name': team.teamName || team.email,
        'User Email': team.email,
        'Phone Number': req.phoneNumber || 'N/A',
        'Status': statusConfig[req.status]?.label || req.status,
        'Submitted': new Date(req.submittedDate).toLocaleString(),
      };

      if (isNewFormat(req)) {
        // Process arrivals - each on separate row
        req.arrivalRequests?.forEach((arrival, index) => {
          exportData.push({
            ...baseInfo,
            'Type': 'ARRIVAL',
            'Request #': `${index + 1}/${req.arrivalRequests.length}`,
            'Flight Number': arrival.flightNumber || 'N/A',
            'Airport': arrival.airport || 'N/A',
            'Terminal': arrival.terminal || 'N/A',
            'Date': arrival.date ? new Date(arrival.date).toLocaleDateString() : 'N/A',
            'Time': arrival.time || 'N/A',
            'Team Members': arrival.teamMembers || 0,
          });
        });

        // Process departures - each on separate row
        req.departureRequests?.forEach((departure, index) => {
          exportData.push({
            ...baseInfo,
            'Type': 'DEPARTURE',
            'Request #': `${index + 1}/${req.departureRequests.length}`,
            'Flight Number': departure.flightNumber || 'N/A',
            'Airport': departure.airport || 'N/A',
            'Terminal': departure.terminal || 'N/A',
            'Date': departure.date ? new Date(departure.date).toLocaleDateString() : 'N/A',
            'Time': departure.time || 'N/A',
            'Team Members': departure.teamMembers || 0,
          });
        });
      } else {
        // Old format - separate rows for arrival and departure
        if (req.arrival) {
          exportData.push({
            ...baseInfo,
            'Type': 'ARRIVAL',
            'Request #': '1/1',
            'Flight Number': req.arrival.flightNumber || 'N/A',
            'Airport': req.arrival.airport || 'N/A',
            'Terminal': req.arrival.terminal || 'N/A',
            'Date': req.arrival.date ? new Date(req.arrival.date).toLocaleDateString() : 'N/A',
            'Time': req.arrival.time || 'N/A',
            'Team Members': req.arrival.teamMembers || 0,
          });
        }
        
        if (req.departure) {
          exportData.push({
            ...baseInfo,
            'Type': 'DEPARTURE',
            'Request #': '1/1',
            'Flight Number': req.departure.flightNumber || 'N/A',
            'Airport': req.departure.airport || 'N/A',
            'Terminal': req.departure.terminal || 'N/A',
            'Date': req.departure.date ? new Date(req.departure.date).toLocaleDateString() : 'N/A',
            'Time': req.departure.time || 'N/A',
            'Team Members': req.departure.teamMembers || 0,
          });
        }
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transportation');
    
    const teamFileName = (team.teamName || team.email).replace(/[^a-z0-9]/gi, '_');
    XLSX.writeFile(wb, `Transportation_${teamFileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export specific team to PDF
  const exportTeamToPDF = (team) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Transportation Request Report', 14, 20);
    
    // Team Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Team: ${team.teamName || team.email}`, 14, 30);
    doc.text(`Email: ${team.email}`, 14, 37);
    doc.text(`Total Requests: ${team.total}`, 14, 44);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 51);
    
    // Prepare table data - separate rows for arrivals and departures
    const tableData = [];
    team.requests.forEach(req => {
      if (isNewFormat(req)) {
        // Process arrivals - each on separate row
        req.arrivalRequests?.forEach((arrival, index) => {
          tableData.push([
            'ARRIVAL',
            `${index + 1}/${req.arrivalRequests.length}`,
            arrival.flightNumber || 'N/A',
            arrival.airport?.substring(0, 25) || 'N/A',
            arrival.terminal || 'N/A',
            arrival.date ? new Date(arrival.date).toLocaleDateString() : 'N/A',
            arrival.time || 'N/A',
            arrival.teamMembers || 0,
            req.status,
          ]);
        });

        // Process departures - each on separate row
        req.departureRequests?.forEach((departure, index) => {
          tableData.push([
            'DEPARTURE',
            `${index + 1}/${req.departureRequests.length}`,
            departure.flightNumber || 'N/A',
            departure.airport?.substring(0, 25) || 'N/A',
            departure.terminal || 'N/A',
            departure.date ? new Date(departure.date).toLocaleDateString() : 'N/A',
            departure.time || 'N/A',
            departure.teamMembers || 0,
            req.status,
          ]);
        });
      } else {
        // Old format - separate rows
        if (req.arrival) {
          tableData.push([
            'ARRIVAL',
            '1/1',
            req.arrival.flightNumber || 'N/A',
            req.arrival.airport?.substring(0, 25) || 'N/A',
            req.arrival.terminal || 'N/A',
            req.arrival.date ? new Date(req.arrival.date).toLocaleDateString() : 'N/A',
            req.arrival.time || 'N/A',
            req.arrival.teamMembers || 0,
            req.status,
          ]);
        }
        
        if (req.departure) {
          tableData.push([
            'DEPARTURE',
            '1/1',
            req.departure.flightNumber || 'N/A',
            req.departure.airport?.substring(0, 25) || 'N/A',
            req.departure.terminal || 'N/A',
            req.departure.date ? new Date(req.departure.date).toLocaleDateString() : 'N/A',
            req.departure.time || 'N/A',
            req.departure.teamMembers || 0,
            req.status,
          ]);
        }
      }
    });
    
    // Add table
    autoTable(doc, {
      startY: 60,
      head: [['Type', 'Request #', 'Flight', 'Airport', 'Terminal', 'Date', 'Time', 'Pax', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 60 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 }, // Type
        1: { cellWidth: 15 }, // Request #
        2: { cellWidth: 20 }, // Flight
        3: { cellWidth: 35 }, // Airport
        4: { cellWidth: 18 }, // Terminal
        5: { cellWidth: 22 }, // Date
        6: { cellWidth: 15 }, // Time
        7: { cellWidth: 12 }, // Pax
        8: { cellWidth: 20 }, // Status
      },
    });
    
    const teamFileName = (team.teamName || team.email).replace(/[^a-z0-9]/gi, '_');
    doc.save(`Transportation_${teamFileName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = () => {
    const exportData = [];
    
    filteredRequests.forEach(req => {
      const baseInfo = {
        'Request ID': req.id,
        'User Email': req.userEmail,
        'Team Name': req.teamName || req.fullName || 'N/A',
        'Phone Number': req.phoneNumber || 'N/A',
        'Status': statusConfig[req.status]?.label || req.status,
        'Submitted': new Date(req.submittedDate).toLocaleString(),
      };

      if (isNewFormat(req)) {
        // New format: Create separate rows for each arrival/departure
        const maxRequests = Math.max(
          req.arrivalRequests?.length || 0,
          req.departureRequests?.length || 0
        );

        for (let i = 0; i < maxRequests; i++) {
          const arrival = req.arrivalRequests?.[i];
          const departure = req.departureRequests?.[i];

          exportData.push({
            ...baseInfo,
            'Request Type': maxRequests > 1 ? `Multi-Request (${i + 1}/${maxRequests})` : 'Single',
            'Arrival Flight': arrival?.flightNumber || 'N/A',
            'Arrival Airport': arrival?.airport || 'N/A',
            'Arrival Terminal': arrival?.terminal || 'N/A',
            'Arrival Date': arrival?.date ? new Date(arrival.date).toLocaleDateString() : 'N/A',
            'Arrival Time': arrival?.time || 'N/A',
            'Arrival Team Members': arrival?.teamMembers || 0,
            'Departure Flight': departure?.flightNumber || 'N/A',
            'Departure Airport': departure?.airport || 'N/A',
            'Departure Terminal': departure?.terminal || 'N/A',
            'Departure Date': departure?.date ? new Date(departure.date).toLocaleDateString() : 'N/A',
            'Departure Time': departure?.time || 'N/A',
            'Departure Team Members': departure?.teamMembers || 0,
            'Total Team Members': req.totalTeamMembers || 0,
          });
        }
      } else {
        // Old format: Single row
        exportData.push({
          ...baseInfo,
          'Request Type': 'Single',
          'Arrival Flight': req.arrival?.flightNumber || 'N/A',
          'Arrival Airport': req.arrival?.airport || 'N/A',
          'Arrival Terminal': req.arrival?.terminal || 'N/A',
          'Arrival Date': req.arrival?.date ? new Date(req.arrival.date).toLocaleDateString() : 'N/A',
          'Arrival Time': req.arrival?.time || 'N/A',
          'Arrival Team Members': req.arrival?.teamMembers || 0,
          'Departure Flight': req.departure?.flightNumber || 'N/A',
          'Departure Airport': req.departure?.airport || 'N/A',
          'Departure Terminal': req.departure?.terminal || 'N/A',
          'Departure Date': req.departure?.date ? new Date(req.departure.date).toLocaleDateString() : 'N/A',
          'Departure Time': req.departure?.time || 'N/A',
          'Departure Team Members': req.departure?.teamMembers || 0,
          'Total Team Members': Math.max(req.arrival?.teamMembers || 0, req.departure?.teamMembers || 0),
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transportation Requests');
    
    const maxWidth = 30;
    const wscols = Object.keys(exportData[0] || {}).map(() => ({ wch: maxWidth }));
    ws['!cols'] = wscols;
    
    XLSX.writeFile(wb, `Transportation_Requests_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  // Handle calendar event click
  const handleSelectEvent = (event) => {
    console.log('📅 Calendar event clicked:', event);
    if (event && event.resource && event.resource.request) {
      console.log('✅ Opening details for request:', event.resource.request.id);
      setSelectedRequest(event.resource.request);
      setDetailsDialog(true);
    } else {
      console.warn('⚠️ Event click but no request data:', event);
    }
  };

  // Handle edit status
  const handleEditStatus = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setEditDialog(true);
  };

  // Update status in Firebase
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      setUpdating(true);
      const requestRef = doc(db, 'transportationRequests', selectedRequest.id);
      await updateDoc(requestRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      });

      setSnackbar({
        open: true,
        message: 'Status updated successfully!',
        severity: 'success',
      });

      setEditDialog(false);
      fetchRequests(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status. Please try again.',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Group by team
  const groupByTeam = () => {
    const teams = {};
    filteredRequests.forEach(req => {
      const email = req.userEmail || 'Unknown';
      if (!teams[email]) {
        teams[email] = {
          email: email,
          teamName: req.teamName || 'Unknown Team',
          requests: [],
          total: 0,
          pending: 0,
          approved: 0,
        };
      }
      teams[email].requests.push(req);
      teams[email].total++;
      if (req.status === 'approved') teams[email].approved++;
      else if (req.status === 'pending') teams[email].pending++;
    });
    return Object.values(teams);
  };

  // Calendar events
  const getCalendarEvents = () => {
    const events = [];
    filteredRequests.forEach(req => {
      try {
        const teamName = req.teamName || req.fullName || req.userEmail;
        
        if (isNewFormat(req)) {
          // New format: Multiple requests
          
          // Process all arrival requests
          if (req.arrivalRequests && Array.isArray(req.arrivalRequests)) {
            req.arrivalRequests.forEach((arrival, index) => {
              try {
                const arrivalDate = new Date(`${arrival.date}T${arrival.time}`);
                if (!isNaN(arrivalDate.getTime())) {
                  events.push({
                    title: `✈️ ARRIVAL ${req.arrivalRequests.length > 1 ? `#${index + 1} ` : ''}: ${arrival.flightNumber} (${arrival.teamMembers} pax) - ${teamName}`,
                    start: arrivalDate,
                    end: new Date(arrivalDate.getTime() + 60 * 60 * 1000), // 1 hour duration
                    resource: { type: 'arrival', request: req, specificRequest: arrival, index }
                  });
                }
              } catch (err) {
                console.error('Error creating arrival event:', err);
              }
            });
          }
          
          // Process all departure requests
          if (req.departureRequests && Array.isArray(req.departureRequests)) {
            req.departureRequests.forEach((departure, index) => {
              try {
                const departureDate = new Date(`${departure.date}T${departure.time}`);
                if (!isNaN(departureDate.getTime())) {
                  events.push({
                    title: `🛫 DEPARTURE ${req.departureRequests.length > 1 ? `#${index + 1} ` : ''}: ${departure.flightNumber} (${departure.teamMembers} pax) - ${teamName}`,
                    start: departureDate,
                    end: new Date(departureDate.getTime() + 60 * 60 * 1000), // 1 hour duration
                    resource: { type: 'departure', request: req, specificRequest: departure, index }
                  });
                }
              } catch (err) {
                console.error('Error creating departure event:', err);
              }
            });
          }
          
        } else {
          // Old format: Single arrival/departure
          
          // Arrival event
          if (req.arrival?.date && req.arrival?.time) {
            const arrivalDate = new Date(`${req.arrival.date}T${req.arrival.time}`);
            if (!isNaN(arrivalDate.getTime())) {
              events.push({
                title: `✈️ ARRIVAL: ${req.arrival.flightNumber} (${req.arrival.teamMembers} pax) - ${teamName}`,
                start: arrivalDate,
                end: new Date(arrivalDate.getTime() + 60 * 60 * 1000),
                resource: { type: 'arrival', request: req }
              });
            }
          }
          
          // Departure event
          if (req.departure?.date && req.departure?.time) {
            const departureDate = new Date(`${req.departure.date}T${req.departure.time}`);
            if (!isNaN(departureDate.getTime())) {
              events.push({
                title: `🛫 DEPARTURE: ${req.departure.flightNumber} (${req.departure.teamMembers} pax) - ${teamName}`,
                start: departureDate,
                end: new Date(departureDate.getTime() + 60 * 60 * 1000),
                resource: { type: 'departure', request: req }
              });
            }
          }
        }
      } catch (error) {
        console.error('Error creating calendar event:', error);
      }
    });
    
    console.log('📅 Generated calendar events:', events.length);
    return events;
  };

  const teamData = groupByTeam();

  return (
    <Container className={classes.root} maxWidth="xl">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4, mt: 8 }}>
        Transportation Management
      </Typography>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, val) => setViewMode(val)}>
          <Tab label="All Applications" value="all" />
          <Tab label="By Team" value="teams" />
          <Tab label="Referees" value="referees" />
          <Tab label="Calendar View" value="calendar" />
        </Tabs>
      </Box>

      {/* Filters Section */}
      <Card className={classes.filterSection} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Filters</Typography>
        </Box>
        
        <Grid container spacing={2}>
          {/* Location Checkboxes */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Airports</Typography>
            <FormGroup>
              {airports.map(airport => (
                <FormControlLabel
                  key={airport}
                  control={
                    <Checkbox
                      checked={filters.locations.includes(airport)}
                      onChange={() => handleLocationToggle(airport)}
                    />
                  }
                  label={airport}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Date Range</Typography>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          {/* Time Range */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Time Range</Typography>
            <TextField
              fullWidth
              label="From Time"
              type="time"
              value={filters.timeFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, timeFrom: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              label="To Time"
              type="time"
              value={filters.timeTo}
              onChange={(e) => setFilters(prev => ({ ...prev, timeTo: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Status</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`Total: ${filteredRequests.length}`} 
                color="primary" 
                size="small"
                sx={{ width: '100%', mb: 1 }}
              />
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchRequests}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Export Button */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={filteredRequests.length === 0}
            sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
          >
            Export to Excel
          </Button>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* All Applications View */}
          {viewMode === 'all' && (
            <TableContainer component={Paper} className={classes.tableCard} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Team/Club Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Arrival</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Departure</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Team Size</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Submitted</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const summary = getRequestSummary(request);
                    const isMulti = isNewFormat(request);
                    
                    return (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {request.teamName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {request.userEmail}
                        </Typography>
                        {isMulti && (
                          <Chip 
                            label="Multi-Request" 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.7rem', height: 18 }}
                            color="info"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {isMulti ? (
                          <Box>
                            <Chip 
                              icon={<FlightLandIcon fontSize="small" />}
                              label={summary.arrivalText}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                            {summary.firstArrival && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                                First: {summary.firstArrival.flightNumber}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <FlightLandIcon fontSize="small" color="success" />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {summary.firstArrival?.flightNumber || 'N/A'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" display="block">
                              {summary.firstArrival?.airport || 'N/A'}
                            </Typography>
                            {summary.firstArrival?.date && (
                              <Typography variant="caption" display="block">
                                {new Date(summary.firstArrival.date).toLocaleDateString()} {summary.firstArrival.time}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {isMulti ? (
                          <Box>
                            <Chip 
                              icon={<FlightTakeoffIcon fontSize="small" />}
                              label={summary.departureText}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                            {summary.firstDeparture && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                                First: {summary.firstDeparture.flightNumber}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <FlightTakeoffIcon fontSize="small" color="primary" />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {summary.firstDeparture?.flightNumber || 'N/A'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" display="block">
                              {summary.firstDeparture?.airport || 'N/A'}
                            </Typography>
                            {summary.firstDeparture?.date && (
                              <Typography variant="caption" display="block">
                                {new Date(summary.firstDeparture.date).toLocaleDateString()} {summary.firstDeparture.time}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${summary.totalTeamMembers} members`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig[request.status]?.label || request.status}
                          color={statusConfig[request.status]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(request.submittedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(request)}
                            title="View Details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditStatus(request)}
                            title="Update Status"
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* By Team View */}
          {viewMode === 'teams' && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {teamData.map((team, index) => (
                <Grid item xs={12} key={index}>
                  <Card className={classes.tableCard}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {team.teamName || team.email}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {team.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip label={`${team.total} Total`} size="small" color="primary" />
                          <Chip label={`${team.approved} Approved`} size="small" color="success" />
                          <Chip label={`${team.pending} Pending`} size="small" color="warning" />
                          
                          {/* Export Buttons */}
                          <IconButton
                            size="small"
                            onClick={() => exportTeamToExcel(team)}
                            title="Export to Excel"
                            sx={{ 
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669, #047857)',
                              }
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => exportTeamToPDF(team)}
                            title="Export to PDF"
                            sx={{ 
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                              }
                            }}
                          >
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <TableContainer sx={{ mt: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                              <TableCell sx={{ fontWeight: 700 }}>Arrival</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Departure</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Team Size</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {team.requests.map((request) => {
                              const summary = getRequestSummary(request);
                              return (
                              <TableRow key={request.id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <FlightLandIcon fontSize="small" color="success" />
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {summary.arrivalText}
                                      </Typography>
                                      {summary.firstArrival?.date && (
                                        <Typography variant="caption" display="block">
                                          {new Date(summary.firstArrival.date).toLocaleDateString()} {summary.firstArrival.time}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <FlightTakeoffIcon fontSize="small" color="primary" />
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {summary.departureText}
                                      </Typography>
                                      {summary.firstDeparture?.date && (
                                        <Typography variant="caption" display="block">
                                          {new Date(summary.firstDeparture.date).toLocaleDateString()} {summary.firstDeparture.time}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {summary.totalTeamMembers} members
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={statusConfig[request.status]?.label || request.status}
                                    color={statusConfig[request.status]?.color || 'default'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleViewDetails(request)}
                                      title="View Details"
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      onClick={() => handleEditStatus(request)}
                                      title="Update Status"
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Referees View */}
          {viewMode === 'referees' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Referees: {requests.filter(req => req.position?.toLowerCase() === 'referee').length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchRequests}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const refereeRequests = requests.filter(req => req.position?.toLowerCase() === 'referee');
                      const exportData = [];
                      
                      refereeRequests.forEach(req => {
                        const baseInfo = {
                          'Full Name': req.fullName || req.teamName || 'N/A',
                          'Position': req.position || 'N/A',
                          'User Email': req.userEmail || 'N/A',
                          'Phone Number': req.phoneNumber || 'N/A',
                          'Status': req.status || 'pending',
                          'Submitted': req.submittedDate ? new Date(req.submittedDate).toLocaleString() : 'N/A',
                        };

                        if (isNewFormat(req)) {
                          // New format: Create separate rows for each arrival/departure
                          const maxRequests = Math.max(
                            req.arrivalRequests?.length || 0,
                            req.departureRequests?.length || 0
                          );

                          for (let i = 0; i < maxRequests; i++) {
                            const arrival = req.arrivalRequests?.[i];
                            const departure = req.departureRequests?.[i];

                            exportData.push({
                              ...baseInfo,
                              'Request Type': maxRequests > 1 ? `Multi-Request (${i + 1}/${maxRequests})` : 'Single',
                              'Arrival Flight': arrival?.flightNumber || 'N/A',
                              'Arrival Airport': arrival?.airport || 'N/A',
                              'Arrival Terminal': arrival?.terminal || 'N/A',
                              'Arrival Date': arrival?.date || 'N/A',
                              'Arrival Time': arrival?.time || 'N/A',
                              'Arrival Team Members': arrival?.teamMembers || 0,
                              'Departure Flight': departure?.flightNumber || 'N/A',
                              'Departure Airport': departure?.airport || 'N/A',
                              'Departure Terminal': departure?.terminal || 'N/A',
                              'Departure Date': departure?.date || 'N/A',
                              'Departure Time': departure?.time || 'N/A',
                              'Departure Team Members': departure?.teamMembers || 0,
                              'Total Team Members': req.totalTeamMembers || 0,
                            });
                          }
                        } else {
                          // Old format: Single row
                          exportData.push({
                            ...baseInfo,
                            'Request Type': 'Single',
                            'Arrival Flight': req.arrival?.flightNumber || 'N/A',
                            'Arrival Airport': req.arrival?.airport || 'N/A',
                            'Arrival Terminal': req.arrival?.terminal || 'N/A',
                            'Arrival Date': req.arrival?.date || 'N/A',
                            'Arrival Time': req.arrival?.time || 'N/A',
                            'Arrival Team Members': req.arrival?.teamMembers || 0,
                            'Departure Flight': req.departure?.flightNumber || 'N/A',
                            'Departure Airport': req.departure?.airport || 'N/A',
                            'Departure Terminal': req.departure?.terminal || 'N/A',
                            'Departure Date': req.departure?.date || 'N/A',
                            'Departure Time': req.departure?.time || 'N/A',
                            'Departure Team Members': req.departure?.teamMembers || 0,
                            'Total Team Members': req.arrival?.teamMembers || 0,
                          });
                        }
                      });
                      
                      const ws = XLSX.utils.json_to_sheet(exportData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Referees');
                      XLSX.writeFile(wb, `Referees_Transportation_${new Date().toISOString().split('T')[0]}.xlsx`);
                    }}
                  >
                    Export Referees
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper} className={classes.tableCard} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Full Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Position</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Arrival</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Departure</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Team Size</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Submitted</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.filter(req => req.position?.toLowerCase() === 'referee').length > 0 ? (
                      filteredRequests.filter(req => req.position?.toLowerCase() === 'referee').map((request) => (
                        <TableRow 
                          key={request.id}
                          hover
                          sx={{
                            '&:hover': {
                              background: theme.palette.mode === 'dark' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.04)',
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {request.fullName || request.teamName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {request.userEmail}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="REFEREE" 
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FlightLandIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {(() => {
                                    const summary = getRequestSummary(request);
                                    return summary.arrivalText;
                                  })()}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {(() => {
                                    const summary = getRequestSummary(request);
                                    return summary.firstArrival ? `${summary.firstArrival.airport} • ${summary.firstArrival.date}` : 'N/A';
                                  })()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FlightTakeoffIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {(() => {
                                    const summary = getRequestSummary(request);
                                    return summary.departureText;
                                  })()}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {(() => {
                                    const summary = getRequestSummary(request);
                                    return summary.firstDeparture ? `${summary.firstDeparture.airport} • ${summary.firstDeparture.date}` : 'N/A';
                                  })()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${getRequestSummary(request).totalTeamMembers || 0} members`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.status}
                              color={
                                request.status === 'approved' ? 'success' :
                                request.status === 'pending' ? 'warning' :
                                request.status === 'cancelled' ? 'error' :
                                'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(request.submittedDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewDetails(request)}
                                title="View Details"
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setNewStatus(request.status);
                                  setEditDialog(true);
                                }}
                                title="Update Status"
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Box sx={{ py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                              No referee transportation requests found
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <Card className={classes.tableCard} sx={{ mt: 3, p: 3, mb: 5 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  📅 Transportation Calendar
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Click on any event to view full details
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<FlightLandIcon />}
                    label="Arrival"
                    sx={{ 
                      background: '#4caf50', 
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<FlightTakeoffIcon />}
                    label="Departure"
                    sx={{ 
                      background: '#2196f3', 
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <Box 
                className={classes.calendarWrapper} 
                sx={{ 
                  height: 800,
                  minHeight: '800px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 2,
                  padding: 2,
                  overflow: 'visible',
                }}
              >
                <Calendar
                  localizer={localizer}
                  events={getCalendarEvents()}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', minHeight: '750px' }}
                  onSelectEvent={handleSelectEvent}
                  onShowMore={(events, date) => {
                    console.log('📅 Show more clicked for date:', date, 'Events:', events.length);
                  }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.resource.type === 'arrival' ? '#4caf50' : '#2196f3',
                      color: '#ffffff',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }
                  })}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView="month"
                  popup
                  popupOffset={{ x: 0, y: 10 }}
                  showMultiDayTimes
                  tooltipAccessor={(event) => event.title}
                  selectable
                />
              </Box>
            </Card>
          )}
        </>
      )}

      {/* View Details Dialog */}
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
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Transportation Request Details
          </Typography>
          <IconButton onClick={() => setDetailsDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={3}>
              {/* General Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>General Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>User Email:</Typography>
                    <Typography variant="body2">{selectedRequest.userEmail}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {selectedRequest.position?.toLowerCase() === 'referee' ? 'Full Name:' : 'Team/Club Name:'}
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.position?.toLowerCase() === 'referee' 
                        ? (selectedRequest.fullName || selectedRequest.teamName || 'N/A')
                        : (selectedRequest.teamName || 'N/A')
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Phone Number:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {selectedRequest.phoneNumber || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Status:</Typography>
                    <Chip
                      label={statusConfig[selectedRequest.status]?.label || selectedRequest.status}
                      color={statusConfig[selectedRequest.status]?.color || 'default'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Submitted Date:</Typography>
                    <Typography variant="body2">
                      {new Date(selectedRequest.submittedDate).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Arrival Details */}
              <Grid item xs={12}>
                <Card sx={{ p: 2, background: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid #4caf50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FlightLandIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Arrival Details {isNewFormat(selectedRequest) && `(${selectedRequest.arrivalRequests?.length || 0} requests)`}
                    </Typography>
                  </Box>
                  
                  {isNewFormat(selectedRequest) ? (
                    // Multi-request format
                    selectedRequest.arrivalRequests && selectedRequest.arrivalRequests.length > 0 ? (
                      selectedRequest.arrivalRequests.map((arrival, index) => (
                        <Box key={index} sx={{ mb: index < selectedRequest.arrivalRequests.length - 1 ? 2 : 0, pb: index < selectedRequest.arrivalRequests.length - 1 ? 2 : 0, borderBottom: index < selectedRequest.arrivalRequests.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'success.dark' }}>
                            Arrival #{index + 1}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Flight:</Typography>
                              <Typography variant="body2">{arrival.flightNumber}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Airport:</Typography>
                              <Typography variant="body2">{arrival.airport}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Terminal:</Typography>
                              <Typography variant="body2">{arrival.terminal}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Date:</Typography>
                              <Typography variant="body2">{new Date(arrival.date).toLocaleDateString()}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Time:</Typography>
                              <Typography variant="body2">{arrival.time}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Team Members:</Typography>
                              <Typography variant="body2">{arrival.teamMembers} persons</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>No arrival requests</Typography>
                    )
                  ) : (
                    // Old format
                    selectedRequest.arrival ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Flight Number:</Typography>
                          <Typography variant="body2">{selectedRequest.arrival.flightNumber}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Airport:</Typography>
                          <Typography variant="body2">{selectedRequest.arrival.airport}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Terminal:</Typography>
                          <Typography variant="body2">{selectedRequest.arrival.terminal}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Date:</Typography>
                          <Typography variant="body2">
                            {new Date(selectedRequest.arrival.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Time:</Typography>
                          <Typography variant="body2">{selectedRequest.arrival.time}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Team Members:</Typography>
                          <Typography variant="body2">{selectedRequest.arrival.teamMembers} persons</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>No arrival information</Typography>
                    )
                  )}
                </Card>
              </Grid>

              {/* Departure Details */}
              <Grid item xs={12}>
                <Card sx={{ p: 2, background: 'rgba(33, 150, 243, 0.1)', borderLeft: '4px solid #2196f3' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FlightTakeoffIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Departure Details {isNewFormat(selectedRequest) && `(${selectedRequest.departureRequests?.length || 0} requests)`}
                    </Typography>
                  </Box>
                  
                  {isNewFormat(selectedRequest) ? (
                    // Multi-request format
                    selectedRequest.departureRequests && selectedRequest.departureRequests.length > 0 ? (
                      selectedRequest.departureRequests.map((departure, index) => (
                        <Box key={index} sx={{ mb: index < selectedRequest.departureRequests.length - 1 ? 2 : 0, pb: index < selectedRequest.departureRequests.length - 1 ? 2 : 0, borderBottom: index < selectedRequest.departureRequests.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.dark' }}>
                            Departure #{index + 1}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Flight:</Typography>
                              <Typography variant="body2">{departure.flightNumber}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Airport:</Typography>
                              <Typography variant="body2">{departure.airport}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Terminal:</Typography>
                              <Typography variant="body2">{departure.terminal}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Date:</Typography>
                              <Typography variant="body2">{new Date(departure.date).toLocaleDateString()}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Time:</Typography>
                              <Typography variant="body2">{departure.time}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Team Members:</Typography>
                              <Typography variant="body2">{departure.teamMembers} persons</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>No departure requests</Typography>
                    )
                  ) : (
                    // Old format
                    selectedRequest.departure ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Flight Number:</Typography>
                          <Typography variant="body2">{selectedRequest.departure.flightNumber}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Airport:</Typography>
                          <Typography variant="body2">{selectedRequest.departure.airport}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Terminal:</Typography>
                          <Typography variant="body2">{selectedRequest.departure.terminal}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Date:</Typography>
                          <Typography variant="body2">
                            {new Date(selectedRequest.departure.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Time:</Typography>
                          <Typography variant="body2">{selectedRequest.departure.time}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Team Members:</Typography>
                          <Typography variant="body2">{selectedRequest.departure.teamMembers} persons</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>No departure information</Typography>
                    )
                  )}
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)} variant="contained">
            Close
          </Button>
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
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Update Transportation Status
          </Typography>
          <IconButton onClick={() => setEditDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Update status for transportation request from <strong>{selectedRequest.userEmail}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="pending">Pending Approval</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updating || !newStatus}
          >
            {updating ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TransportationManagement;

