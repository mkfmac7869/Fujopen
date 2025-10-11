import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Tab,
  Tabs,
  Typography,
  Button,
  Fab,
  useTheme,
  useMediaQuery,
  Zoom,
  Fade,
  Grow
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'next-i18next';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ApplicationForm from './ApplicationForm';
import TeamMembersList from './TeamMembersList';
import Title from '../Title';

const useStyles = makeStyles({ uniqId: 'visa-application' })((theme) => ({
  root: {
    position: 'relative',
    paddingTop: theme.spacing(15),
    paddingBottom: theme.spacing(15),
    minHeight: '100vh',
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(12),
      paddingBottom: theme.spacing(12),
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(10),
      paddingBottom: theme.spacing(10),
    }
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1400,
  },
  glassCard: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
    backdropFilter: 'saturate(180%) blur(40px)',
    WebkitBackdropFilter: 'saturate(180%) blur(40px)',
    borderRadius: theme.spacing(4),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
      : '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1)',
    padding: theme.spacing(5),
    marginTop: theme.spacing(8),
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      borderRadius: theme.spacing(3),
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, transparent)`,
      opacity: 0.6,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: theme.palette.mode === 'dark'
        ? 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.1), transparent 50%)'
        : 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.03), transparent 50%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.03), transparent 50%)',
      pointerEvents: 'none',
      zIndex: 0,
    }
  },
  tabsContainer: {
    marginBottom: theme.spacing(5),
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      : '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)',
    position: 'relative',
    zIndex: 1,
  },
  tab: {
    minHeight: 72,
    textTransform: 'none',
    fontSize: '1.05rem',
    fontWeight: 700,
    letterSpacing: '0.3px',
    borderRadius: theme.spacing(2),
    margin: theme.spacing(0.5),
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      minHeight: 60,
      fontSize: '0.95rem',
    },
    '&.Mui-selected': {
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.25) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 28px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
        : '0 8px 28px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(255, 255, 255, 1), inset 0 1px 1px rgba(255, 255, 255, 1)',
      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.main,
    },
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-2px)',
    }
  },
  tabIcon: {
    marginRight: theme.spacing(1),
  },
  floatingButton: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
    }
  },
  decorativeBlob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: 0.3,
    animation: 'float 20s ease-in-out infinite',
  },
  blob1: {
    width: 400,
    height: 400,
    background: theme.palette.primary.main,
    top: -200,
    left: -200,
  },
  blob2: {
    width: 300,
    height: 300,
    background: theme.palette.secondary.main,
    bottom: -150,
    right: -150,
    animationDelay: '-5s',
  },
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0) rotate(0deg)',
    },
    '50%': {
      transform: 'translateY(-20px) rotate(180deg)',
    }
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: theme.spacing(6),
  },
  statsBox: {
    display: 'flex',
    gap: theme.spacing(3),
    justifyContent: 'center',
    marginTop: theme.spacing(6),
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(2),
    }
  },
  statItem: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(3),
    padding: theme.spacing(4, 5),
    minWidth: 180,
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      minWidth: 150,
      padding: theme.spacing(3, 4),
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      opacity: 0.8,
    },
    '&:hover': {
      transform: 'translateY(-6px) scale(1.02)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        : '0 20px 60px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)',
    }
  },
  statNumber: {
    fontSize: '2.75rem',
    fontWeight: 800,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.25rem',
    }
  },
  statLabel: {
    fontSize: '0.95rem',
    fontWeight: 600,
    opacity: 0.85,
    marginTop: theme.spacing(0.5),
    letterSpacing: '0.3px',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
    }
  }
}));

function VisaApplication() {
  const { classes, cx } = useStyles();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddMember = (memberData) => {
    const newMember = {
      ...memberData,
      id: Date.now(),
      status: 'reviewing',
      submittedDate: new Date().toISOString(),
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowForm(false);
    setActiveTab(1); // Switch to team members tab
  };

  const pendingCount = teamMembers.filter(m => ['reviewing', 'submitted', 'processing'].includes(m.status)).length;
  const approvedCount = teamMembers.filter(m => m.status === 'approved').length;
  const totalCount = teamMembers.length;

  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <Fade in timeout={1000}>
          <div className={classes.titleSection}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 2,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Visa Application Portal
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 500,
                opacity: 0.8,
                maxWidth: 700,
                margin: '0 auto',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6,
                letterSpacing: '0.3px',
              }}
            >
              Streamline your team's visa application process with real-time tracking and seamless management
            </Typography>
            
            <Grow in timeout={1500}>
              <Box className={classes.statsBox}>
                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>{totalCount}</Typography>
                  <Typography className={classes.statLabel}>Total Applications</Typography>
                </div>
                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>{pendingCount}</Typography>
                  <Typography className={classes.statLabel}>In Progress</Typography>
                </div>
                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>{approvedCount}</Typography>
                  <Typography className={classes.statLabel}>Approved Visas</Typography>
                </div>
              </Box>
            </Grow>
          </div>
        </Fade>

        <Box className={classes.glassCard}>
          <div className={cx(classes.decorativeBlob, classes.blob1)} />
          <div className={cx(classes.decorativeBlob, classes.blob2)} />
          
          <Box className={classes.tabsContainer}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              TabIndicatorProps={{ style: { display: 'none' } }}
            >
              <Tab 
                className={classes.tab}
                icon={<AssignmentIcon className={classes.tabIcon} />}
                label="New Application" 
              />
              <Tab 
                className={classes.tab}
                icon={<GroupIcon className={classes.tabIcon} />}
                label={`Team Members (${teamMembers.length})`}
              />
            </Tabs>
          </Box>

          <Box sx={{ position: 'relative', minHeight: 400 }}>
            {activeTab === 0 && (
              <Fade in timeout={500}>
                <div>
                  {showForm ? (
                    <ApplicationForm 
                      onSubmit={handleAddMember}
                      onCancel={() => setShowForm(false)}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: { xs: 6, md: 10 },
                        px: { xs: 2, md: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <PersonAddIcon 
                          sx={{ 
                            fontSize: { xs: 64, md: 80 },
                            opacity: 0.2,
                            mb: 2,
                            color: theme.palette.primary.main
                          }} 
                        />
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.25rem' },
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Start a New Application
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            opacity: 0.7,
                            maxWidth: 500,
                            margin: '0 auto',
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            lineHeight: 1.6,
                          }}
                        >
                          Apply for visa approval for your team members. Fill in the required information and upload necessary documents to begin the process.
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => setShowForm(true)}
                        startIcon={<PersonAddIcon />}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.3)',
                          padding: { xs: '14px 32px', md: '16px 40px' },
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: 'none',
                          letterSpacing: '0.3px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            boxShadow: '0 16px 50px rgba(99, 102, 241, 0.4)',
                          }
                        }}
                      >
                        Add New Team Member
                      </Button>
                    </Box>
                  )}
                </div>
              </Fade>
            )}
            
            {activeTab === 1 && (
              <Fade in timeout={500}>
                <div>
                  <TeamMembersList 
                    members={teamMembers}
                    onUpdateMember={(updatedMember) => {
                      setTeamMembers(teamMembers.map(m => 
                        m.id === updatedMember.id ? updatedMember : m
                      ));
                    }}
                  />
                </div>
              </Fade>
            )}
          </Box>
        </Box>

        <Zoom in={activeTab === 1 && !showForm} timeout={300}>
          <Fab
            className={classes.floatingButton}
            color="primary"
            onClick={() => {
              setActiveTab(0);
              setShowForm(true);
            }}
          >
            <PersonAddIcon />
          </Fab>
        </Zoom>
      </Container>
    </div>
  );
}

export default VisaApplication;
