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
}));

const statusConfig = {
  pending: { label: 'Pending Approval', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

function MyTransportation() {
  const { classes } = useStyles();
  const { user } = useAuth();
  const theme = useTheme();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

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
        My Transportation Requests
      </Typography>

      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card className={classes.card} elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Transportation Request
                  </Typography>
                  <Chip 
                    label={statusConfig[request.status]?.label || request.status}
                    color={statusConfig[request.status]?.color || 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Grid container spacing={3}>
                  {/* Arrival */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlightLandIcon />
                        Arrival
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Flight:</strong> {request.arrival.flightNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Airport:</strong> {request.arrival.airport}
                      </Typography>
                      {request.arrival.terminal && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Terminal:</strong> {request.arrival.terminal}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" />
                        <strong>Team Members:</strong> {request.arrival.teamMembers}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventIcon fontSize="small" />
                        {new Date(request.arrival.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" />
                        {request.arrival.time}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Departure */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, background: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlightTakeoffIcon />
                        Departure
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Flight:</strong> {request.departure.flightNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Airport:</strong> {request.departure.airport}
                      </Typography>
                      {request.departure.terminal && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Terminal:</strong> {request.departure.terminal}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" />
                        <strong>Team Members:</strong> {request.departure.teamMembers}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventIcon fontSize="small" />
                        {new Date(request.departure.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" />
                        {request.departure.time}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
                  Submitted: {new Date(request.submittedDate).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default MyTransportation;

