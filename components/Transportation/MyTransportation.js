import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HotelIcon from '@mui/icons-material/Hotel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const useStyles = makeStyles({ uniqId: 'my-transportation' })((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
  },
  card: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    marginBottom: theme.spacing(3),
  },
  requestBox: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
}));

const statusConfig = {
  pending: { label: 'Pending Approval', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  confirmed: { label: 'Confirmed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

function MyTransportation() {
  const { classes } = useStyles();
  const { user } = useAuth();
  const theme = useTheme();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState({});

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchHotels();
    }
  }, [user]);

  const fetchHotels = async () => {
    try {
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      const hotelsMap = {};
      hotelsSnapshot.docs.forEach(doc => {
        hotelsMap[doc.id] = doc.data().name;
      });
      setHotels(hotelsMap);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'transportationRequests'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      requestsData.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching transportation requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render single request (old or new format)
  const renderSingleRequest = (request, type) => {
    const Icon = type === 'arrival' ? FlightLandIcon : FlightTakeoffIcon;
    const color = type === 'arrival' ? 'success.main' : 'primary.main';
    const bgColor = type === 'arrival' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(33, 150, 243, 0.08)';

    return (
      <Box className={classes.requestBox} sx={{ background: bgColor }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon fontSize="small" />
          {request.flightNumber || 'N/A'}
          {request.selectedHotel && hotels[request.selectedHotel] && (
            <>
              <ArrowForwardIcon fontSize="small" sx={{ opacity: 0.5 }} />
              <HotelIcon fontSize="small" />
              <span>{hotels[request.selectedHotel]}</span>
            </>
          )}
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              <strong>Airport:</strong> {request.airport || 'N/A'}
            </Typography>
            {request.terminal && (
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                <strong>Terminal:</strong> {request.terminal}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EventIcon fontSize="small" />
              {request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" />
              {request.time || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Chip 
              icon={<PeopleIcon />} 
              label={`${request.teamMembers || 0} team members`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
        <FlightTakeoffIcon sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h6">No transportation requests yet</Typography>
        <Typography variant="body2">Submit a request in the "New Application" tab</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        My Transportation Requests ({requests.length})
      </Typography>

      <Grid container spacing={3}>
        {requests.map((request) => {
          // Check if this is new format (arrivalRequests/departureRequests) or old format (arrival/departure)
          const isNewFormat = request.arrivalRequests || request.departureRequests;
          
          return (
            <Grid item xs={12} key={request.id}>
              <Card className={classes.card} elevation={0}>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Transportation Request
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Submitted: {new Date(request.submittedDate).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={statusConfig[request.status]?.label || request.status}
                        color={statusConfig[request.status]?.color || 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                      {request.isReferee && (
                        <Chip 
                          label="REFEREE" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Summary */}
                  {isNewFormat && (
                    <Box sx={{ mb: 3, p: 2, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Arrival Requests</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {request.totalArrivalRequests || request.arrivalRequests?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Departure Requests</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {request.totalDepartureRequests || request.departureRequests?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Total Team Members</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {request.totalTeamMembers || 0}
                          </Typography>
                        </Grid>
                        {request.hotelCapacity && (
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>Hotel Capacity</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {request.hotelCapacity}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3}>
                    {/* Arrival Section */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlightLandIcon />
                          Arrival {isNewFormat && `(${request.arrivalRequests?.length || 0})`}
                        </Typography>
                        
                        {isNewFormat && request.arrivalRequests ? (
                          // New format: Multiple arrival requests
                          request.arrivalRequests.map((arrivalReq, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                                Arrival #{index + 1}
                              </Typography>
                              {renderSingleRequest(arrivalReq, 'arrival')}
                            </Box>
                          ))
                        ) : (
                          // Old format: Single arrival
                          renderSingleRequest(request.arrival || {}, 'arrival')
                        )}
                      </Box>
                    </Grid>

                    {/* Departure Section */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlightTakeoffIcon />
                          Departure {isNewFormat && `(${request.departureRequests?.length || 0})`}
                        </Typography>
                        
                        {isNewFormat && request.departureRequests ? (
                          // New format: Multiple departure requests
                          request.departureRequests.map((departureReq, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                                Departure #{index + 1}
                              </Typography>
                              {renderSingleRequest(departureReq, 'departure')}
                            </Box>
                          ))
                        ) : (
                          // Old format: Single departure
                          renderSingleRequest(request.departure || {}, 'departure')
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Contact Info */}
                  {request.phoneNumber && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        <strong>Contact:</strong> {request.phoneNumber}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default MyTransportation;
