import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Avatar,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Grow
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'next-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GetAppIcon from '@mui/icons-material/GetApp';

const useStyles = makeStyles({ uniqId: 'team-members-list' })((theme) => ({
  root: {
    position: 'relative',
  },
  memberCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
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
      transform: 'translateY(-6px) scale(1.01)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        : '0 20px 60px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)',
      border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(99, 102, 241, 0.3)'}`,
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  avatar: {
    width: 72,
    height: 72,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    fontSize: '1.75rem',
    fontWeight: 800,
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
    border: `3px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
    letterSpacing: '0.5px',
    [theme.breakpoints.down('sm')]: {
      width: 56,
      height: 56,
      fontSize: '1.25rem',
    }
  },
  statusChip: {
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  detailsBox: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(255, 255, 255, 0.9)'}`,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    }
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '& svg': {
      fontSize: 20,
      opacity: 0.7,
    }
  },
  timelineStepper: {
    '& .MuiStepLabel-root': {
      cursor: 'pointer',
    },
    '& .MuiStepConnector-line': {
      borderLeft: `2px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)'}`,
      minHeight: 40,
    },
    '& .Mui-completed .MuiStepConnector-line': {
      borderColor: theme.palette.success.main,
    },
    '& .Mui-active .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    }
  },
  actionButton: {
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    }
  },
  downloadAllButton: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.common.white,
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.spacing(1.5),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(12, 2),
    opacity: 0.7,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(8, 2),
    }
  },
  dialogContent: {
    background: theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : '#f5f5f5',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(0, 123, 255, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(0, 123, 255, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(0, 123, 255, 0)',
    }
  },
  processingIndicator: {
    animation: 'pulse 2s infinite',
  }
}));

const statusConfig = {
  reviewing: {
    label: 'Reviewing by OC',
    color: 'info',
    icon: <AssignmentIcon />,
  },
  submitted: {
    label: 'Submitted to GRFA',
    color: 'warning',
    icon: <AccessTimeIcon />,
  },
  processing: {
    label: 'In Process',
    color: 'primary',
    icon: <AccessTimeIcon />,
  },
  additional: {
    label: 'Additional Docs Required',
    color: 'error',
    icon: <AttachFileIcon />,
  },
  approved: {
    label: 'Approved',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  rejected: {
    label: 'Rejected',
    color: 'error',
    icon: <ErrorIcon />,
  }
};

const statusSteps = [
  'reviewing',
  'submitted',
  'processing',
  'additional',
  'approved'
];

function TeamMembersList({ members, onUpdateMember }) {
  const { classes, cx } = useStyles();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const toggleCardExpansion = (memberId) => {
    setExpandedCards(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setDetailsDialog(true);
  };

  const handleDownloadVisa = (member) => {
    // In production, this would download the actual visa document
    console.log('Downloading visa for:', member.fullNameEnglish);
  };

  const handleDownloadAll = () => {
    const approvedMembers = members.filter(m => m.status === 'approved');
    console.log('Downloading visas for:', approvedMembers.length, 'members');
  };

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  if (members.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <PersonIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No team members yet
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Start by adding your first team member's visa application
        </Typography>
      </Box>
    );
  }

  const approvedCount = members.filter(m => m.status === 'approved').length;

  return (
    <Box className={classes.root}>
      {approvedCount > 0 && (
        <Fade in timeout={500}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              className={classes.downloadAllButton}
              startIcon={<GetAppIcon />}
              onClick={handleDownloadAll}
            >
              Download All Approved Visas ({approvedCount})
            </Button>
          </Box>
        </Fade>
      )}

      <Grid container spacing={3}>
        {members.map((member, index) => (
          <Grid item xs={12} key={member.id}>
            <Zoom in timeout={300 + index * 100}>
              <Card className={classes.memberCard}>
                <CardContent>
                  <Box className={classes.cardHeader}>
                    <Box className={classes.memberInfo}>
                      <Avatar className={classes.avatar}>
                        {member.fullNameEnglish.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {member.fullNameEnglish}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {member.passportNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        className={cx(classes.statusChip, 
                          member.status === 'processing' && classes.processingIndicator
                        )}
                        label={statusConfig[member.status].label}
                        color={statusConfig[member.status].color}
                        icon={statusConfig[member.status].icon}
                      />
                      <IconButton
                        size="small"
                        onClick={() => toggleCardExpansion(member.id)}
                        sx={{
                          transform: expandedCards[member.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expandedCards[member.id]} timeout="auto">
                    <Box className={classes.detailsBox}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box className={classes.detailItem}>
                            <CalendarTodayIcon />
                            <Typography variant="body2">
                              DOB: {new Date(member.dateOfBirth).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box className={classes.detailItem}>
                            <LocationOnIcon />
                            <Typography variant="body2">
                              Place of Birth: {member.placeOfBirth}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box className={classes.detailItem}>
                            <AccessTimeIcon />
                            <Typography variant="body2">
                              Submitted: {new Date(member.submittedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box className={classes.detailItem}>
                            <FingerprintIcon />
                            <Typography variant="body2">
                              ID: {member.id}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Application Timeline
                      </Typography>
                      
                      <Stepper 
                        className={classes.timelineStepper}
                        activeStep={getStatusIndex(member.status)}
                        orientation="vertical"
                      >
                        {statusSteps.map((step, index) => (
                          <Step key={step} completed={index < getStatusIndex(member.status)}>
                            <StepLabel
                              icon={statusConfig[step].icon}
                              StepIconProps={{
                                color: index <= getStatusIndex(member.status) 
                                  ? statusConfig[step].color 
                                  : 'disabled'
                              }}
                            >
                              {statusConfig[step].label}
                            </StepLabel>
                            {step === member.status && (
                              <StepContent>
                                <Typography variant="body2" color="textSecondary">
                                  Current status - Last updated: {new Date().toLocaleDateString()}
                                </Typography>
                                {member.status === 'additional' && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="error">
                                      Required: {member.additionalDocs || 'Additional documents needed'}
                                    </Typography>
                                  </Box>
                                )}
                                {member.status === 'rejected' && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="error">
                                      Reason: {member.rejectionReason || 'Contact admin for details'}
                                    </Typography>
                                  </Box>
                                )}
                              </StepContent>
                            )}
                          </Step>
                        ))}
                      </Stepper>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.actionButton}
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(member)}
                        >
                          View Details
                        </Button>
                        {member.status === 'approved' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            className={classes.actionButton}
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadVisa(member)}
                          >
                            Download Visa
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Zoom>
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
              ? 'rgba(30, 30, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }
        }}
      >
        {selectedMember && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar className={classes.avatar}>
                  {selectedMember.fullNameEnglish.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.fullNameEnglish}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedMember.fullNameArabic}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <FingerprintIcon />
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Passport Number"
                    secondary={selectedMember.passportNumber}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <CalendarTodayIcon />
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Date of Birth"
                    secondary={new Date(selectedMember.dateOfBirth).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <LocationOnIcon />
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Place of Birth"
                    secondary={selectedMember.placeOfBirth}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <AccessTimeIcon />
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Application Status"
                    secondary={statusConfig[selectedMember.status].label}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              {selectedMember.status === 'approved' && (
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    handleDownloadVisa(selectedMember);
                    setDetailsDialog(false);
                  }}
                >
                  Download Visa
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default TeamMembersList;
