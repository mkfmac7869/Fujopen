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
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import * as XLSX from 'xlsx';

const useStyles = makeStyles()((theme) => ({
  root: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  filterSection: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  },
  tableCard: {
    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
}));

function UserManagement() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { dialog, showDialog, closeDialog } = useCustomDialog();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [userDetails, setUserDetails] = useState({
    visaApplications: [],
    hotelBookings: [],
    transportationRequests: [],
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [approvalAction, setApprovalAction] = useState({ open: false, user: null, action: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, positionFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by position or pending approval
    if (positionFilter === 'pending') {
      filtered = filtered.filter(user => user.approved === false && user.role !== 'admin');
    } else if (positionFilter !== 'all') {
      filtered = filtered.filter(user => user.position?.toLowerCase() === positionFilter.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullNameFujOpen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleApproveUser = async (user) => {
    if (!confirm(`Approve account for ${user.fullName}?`)) return;
    
    try {
      console.log('📝 Approving user:', user.id, user.fullName);
      
      // Update user approval status
      await updateDoc(doc(db, 'users', user.id), {
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin', // Track who approved
      });

      console.log('✅ User approved in Firestore');

      // Send approval email via API
      try {
        console.log('📧 Sending approval email to:', user.email);
        const emailResponse = await fetch('https://us-central1-fuj2026-f22a7.cloudfunctions.net/sendAccountApproved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.fullName,
          }),
        });
        
        if (emailResponse.ok) {
          console.log('✅ Approval email sent successfully');
        } else {
          const errorData = await emailResponse.json();
          console.error('❌ Failed to send approval email:', errorData);
        }
      } catch (emailError) {
        console.error('❌ Error sending approval email:', emailError);
        // Don't block the approval process if email fails
      }

      // Refresh users list
      await fetchUsers();
      showDialog({
        type: 'success',
        message: `Account approved successfully!\n\nUser: ${user.fullName}\nEmail: ${user.email}\n\nApproval email has been sent.`,
      });
    } catch (error) {
      console.error('❌ Error approving user:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to approve user. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = '🔒 Permission Denied\n\nYou don\'t have permission to approve users.\n\nPlease update your Firebase Security Rules to allow admins to update user documents.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}\n\nPlease check the console for more details.`;
      }
      
      showDialog({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const fetchUserDetails = async (userId, userEmail) => {
    try {
      setDetailsLoading(true);

      // Fetch visa applications
      const visaQuery = query(collection(db, 'visaApplications'), where('userId', '==', userId));
      const visaSnapshot = await getDocs(visaQuery);
      const visaApps = visaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch hotel bookings
      const hotelQuery = query(collection(db, 'hotelBookings'), where('userId', '==', userId));
      const hotelSnapshot = await getDocs(hotelQuery);
      const hotelBookings = hotelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch transportation requests
      const transportQuery = query(collection(db, 'transportationRequests'), where('userId', '==', userId));
      const transportSnapshot = await getDocs(transportQuery);
      const transportRequests = transportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setUserDetails({
        visaApplications: visaApps,
        hotelBookings: hotelBookings,
        transportationRequests: transportRequests,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setDetailsDialog(true);
    await fetchUserDetails(user.id, user.email);
  };

  const handleExportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      'Full Name': user.fullName || 'N/A',
      'Email': user.email || 'N/A',
      'Phone': user.phone || 'N/A',
      'Position': user.position || 'N/A',
      'Team/Club Name': user.teamName || 'N/A',
      'Country': user.country || 'N/A',
      'Registered Date': user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `Users_${positionFilter !== 'all' ? positionFilter : 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'confirmed': return 'success';
      case 'processing': return 'primary';
      case 'reviewing': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPositionColor = (position) => {
    switch (position?.toLowerCase()) {
      case 'athlete': return '#3b82f6';
      case 'coach': return '#10b981';
      case 'official': return '#8b5cf6';
      case 'referee': return '#f59e0b';
      case 'trainer': return '#06b6d4';
      case 'physiotherapist': return '#ec4899';
      case 'fan': return '#6366f1';
      default: return '#6b7280';
    }
  };

  return (
    <Container className={classes.root} maxWidth="xl">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4, mt: 8 }}>
        User Management
      </Typography>

      {/* Position Filter Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={positionFilter} onChange={(e, val) => setPositionFilter(val)}>
          <Tab label="All Users" value="all" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PendingIcon />
                Pending Approval
                <Chip 
                  label={users.filter(u => u.approved === false && u.role !== 'admin').length}
                  size="small"
                  color="warning"
                  sx={{ height: 20 }}
                />
              </Box>
            }
            value="pending" 
          />
          <Tab label="Athletes" value="athlete" />
          <Tab label="Coaches" value="coach" />
          <Tab label="Officials" value="official" />
          <Tab label="Referees" value="referee" />
          <Tab label="Trainers" value="trainer" />
          <Tab label="Physiotherapists" value="physiotherapist" />
          <Tab label="Fans" value="fan" />
        </Tabs>
      </Box>

      {/* Filter Section */}
      <Card className={classes.filterSection} elevation={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, team, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportUsers}
              >
                Export to Excel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Total Count */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Total Users: {filteredUsers.length}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <TableContainer component={Paper} className={classes.tableCard}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Position</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Team/Club</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Country</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Registered</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    hover
                    sx={{
                      '&:hover': {
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(99, 102, 241, 0.08)' 
                          : 'rgba(99, 102, 241, 0.04)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.photoURL}
                          sx={{ 
                            width: 50, 
                            height: 50,
                            border: '2px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          {user.fullName?.charAt(0) || user.email?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.position || 'N/A'}
                        size="small"
                        sx={{
                          background: getPositionColor(user.position),
                          color: '#fff',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user.teamLogo && (
                          <Avatar src={user.teamLogo} sx={{ width: 24, height: 24 }} />
                        )}
                        <Typography variant="body2">{user.teamName || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Chip 
                          label="ADMIN" 
                          size="small" 
                          color="error"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : user.approved === false ? (
                        <Chip 
                          label="PENDING" 
                          size="small" 
                          color="warning"
                          icon={<PendingIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip 
                          label="APPROVED" 
                          size="small" 
                          color="success"
                          icon={<CheckCircleIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.country || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(user)}
                          title="View Full Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {user.role !== 'admin' && user.approved === false && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveUser(user)}
                            title="Approve Account"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(50, 50, 50, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 245, 245, 0.98) 100%)',
            backdropFilter: 'blur(40px)',
            borderRadius: 4,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          color: 'white',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={selectedUser?.photoURL}
              sx={{ width: 60, height: 60, border: '3px solid white' }}
            >
              {selectedUser?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {selectedUser?.fullName || 'User Details'}
              </Typography>
              <Chip 
                label={selectedUser?.position || 'N/A'}
                size="small"
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Personal Information */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BadgeIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Full Name:</Typography>
                      <Typography variant="body2">{selectedUser?.fullName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Email:</Typography>
                      <Typography variant="body2">{selectedUser?.email || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Phone:</Typography>
                      <Typography variant="body2">{selectedUser?.phone || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PublicIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Country:</Typography>
                      <Typography variant="body2">{selectedUser?.country || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Team/Club:</Typography>
                      <Typography variant="body2">{selectedUser?.teamName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              {/* Visa Applications */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Visa Applications ({userDetails.visaApplications.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {userDetails.visaApplications.length > 0 ? (
                    <Box>
                      {userDetails.visaApplications.map((visa, index) => (
                        <Card key={visa.id} sx={{ mb: 2, p: 2, background: 'rgba(99, 102, 241, 0.05)' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Passport:</Typography>
                              <Typography variant="body2">{visa.passportNumber}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Nationality:</Typography>
                              <Typography variant="body2">{visa.nationality}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Status:</Typography>
                              <Chip 
                                label={visa.status}
                                color={getStatusColor(visa.status)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Submitted:</Typography>
                              <Typography variant="body2">
                                {new Date(visa.submittedDate).toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No visa applications found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Hotel Bookings */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HotelIcon color="secondary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Hotel Bookings ({userDetails.hotelBookings.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {userDetails.hotelBookings.length > 0 ? (
                    <Box>
                      {userDetails.hotelBookings.map((booking, index) => (
                        <Card key={booking.id} sx={{ mb: 2, p: 2, background: 'rgba(139, 92, 246, 0.05)' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {booking.individualBookings ? 'Hotels:' : 'Hotel:'}
                              </Typography>
                              <Typography variant="body2">
                                {booking.individualBookings 
                                  ? `${booking.individualBookings.length} Hotels` 
                                  : booking.hotelName}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Total Rooms:</Typography>
                              <Typography variant="body2">
                                {booking.totalRooms || booking.numberOfRooms}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Status:</Typography>
                              <Chip 
                                label={booking.status}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Total Price:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                ${booking.totalPrice}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Created:</Typography>
                              <Typography variant="body2">
                                {new Date(booking.createdAt).toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No hotel bookings found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Transportation Requests */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsBusIcon color="success" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Transportation Requests ({userDetails.transportationRequests.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {userDetails.transportationRequests.length > 0 ? (
                    <Box>
                      {userDetails.transportationRequests.map((transport, index) => (
                        <Card key={transport.id} sx={{ mb: 2, p: 2, background: 'rgba(16, 185, 129, 0.05)' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Arrival Flight:</Typography>
                              <Typography variant="body2">
                                {transport.arrival?.flightNumber} - {transport.arrival?.airport}
                              </Typography>
                              <Typography variant="caption">
                                {transport.arrival?.date} at {transport.arrival?.time}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Departure Flight:</Typography>
                              <Typography variant="body2">
                                {transport.departure?.flightNumber} - {transport.departure?.airport}
                              </Typography>
                              <Typography variant="caption">
                                {transport.departure?.date} at {transport.departure?.time}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Team Members:</Typography>
                              <Typography variant="body2">{transport.arrival?.teamMembers || 0}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Status:</Typography>
                              <Chip 
                                label={transport.status}
                                color={getStatusColor(transport.status)}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No transportation requests found</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
          <Button onClick={() => setDetailsDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <CustomDialog {...dialog} onClose={closeDialog} />
    </Container>
  );
}

export default UserManagement;

