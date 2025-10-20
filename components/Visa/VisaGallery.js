import React, { useState, useEffect } from 'react';
import ScrollAnimation from 'react-scroll-animation-wrapper';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { makeStyles } from 'tss-react/mui';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import TimelineIcon from '@mui/icons-material/Timeline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useTranslation } from 'next-i18next';
import ApplicationForm from './ApplicationForm';

const useStyles = makeStyles({ uniqId: 'visa-gallery' })(theme => ({
  root: {
    position: 'relative',
    zIndex: 10,
    minHeight: 600
  },
  tabLabel: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeightMedium,
    letterSpacing: 0,
    padding: theme.spacing(0, 4),
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  indicator: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light,
    height: 5,
    borderRadius: '4px 4px 0 0'
  },
  listContainer: {
    maxWidth: 900,
    margin: '0 auto',
  },
  visaCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'}`,
    borderRadius: theme.spacing(2),
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: theme.spacing(3),
    '&:hover': {
      transform: 'translateX(8px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
        : '0 12px 40px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 1)',
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 1)'}`,
    }
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: `${theme.spacing(3)} !important`,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      textAlign: 'center',
    }
  },
  newApplicationCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.08)'
      : 'rgba(99, 102, 241, 0.05)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.4)'}`,
    borderRadius: theme.spacing(2),
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
      : '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2.5, 3),
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      padding: theme.spacing(2),
    },
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.mode === 'dark' 
        ? 'rgba(99, 102, 241, 0.15)' 
        : 'rgba(99, 102, 241, 0.1)',
      transform: 'translateX(8px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 12px 40px rgba(99, 102, 241, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
        : '0 12px 40px rgba(99, 102, 241, 0.2), inset 0 1px 1px rgba(255, 255, 255, 1)',
    }
  },
  avatarSection: {
    flexShrink: 0,
  },
  statusAvatar: {
    width: 80,
    height: 80,
    fontSize: '2rem',
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    border: `3px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
    [theme.breakpoints.down('sm')]: {
      width: 70,
      height: 70,
      fontSize: '1.75rem',
    }
  },
  infoSection: {
    flex: 1,
    minWidth: 0,
  },
  actionSection: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    alignItems: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      alignItems: 'stretch',
    }
  },
}));

function VisaGallery() {
  const { classes } = useStyles();
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [value, setValue] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch visa applications from Firebase
  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching applications for user:', user.uid);
      
      // Fetch applications for the current user (without orderBy to avoid index requirement)
      const q = query(
        collection(db, 'visaApplications'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      console.log('Found applications:', querySnapshot.size);
      
      const apps = querySnapshot.docs.map(doc => {
        console.log('Application data:', doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      
      // Sort by submittedDate in JavaScript (newest first)
      apps.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
      
      setApplications(apps);
      console.log('Applications set:', apps.length);
    } catch (error) {
      console.error('Error fetching applications:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, category) => {
    setValue(category);
    // Filtering is now handled by rendering logic
  };

  const handleStartApplication = () => {
    setShowApplicationForm(true);
  };

  const handleViewDetails = (application) => {
    setSelectedMember(application);
    setShowDetailsDialog(true);
  };

  const handleCloseForm = () => {
    setShowApplicationForm(false);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedMember(null);
  };

  const handleUploadAdditionalDocs = async (files) => {
    if (!files || files.length === 0 || !selectedMember) {
      alert('Please select files to upload');
      return;
    }

    try {
      setUploadingAdditional(true);
      console.log('Starting additional docs upload for application:', selectedMember.id);
      console.log('Files to upload:', files.length);
      
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../../lib/firebase');
      const { updateDoc, doc } = await import('firebase/firestore');

      const uploadedUrls = [];

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);
        
        const fileRef = ref(storage, `additionalDocuments/${selectedMember.id}/${file.name}_${Date.now()}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        
        console.log('File uploaded:', url);
        
        uploadedUrls.push({
          filename: file.name,
          url: url,
          uploadedAt: new Date().toISOString()
        });
      }

      console.log('All files uploaded. Updating Firestore...');

      // Update Firestore with additional documents
      await updateDoc(doc(db, 'visaApplications', selectedMember.id), {
        additionalDocuments: uploadedUrls,
        additionalDocsUploaded: true,
        status: 'processing', // Move back to processing after upload
        lastUpdated: new Date().toISOString(),
      });

      console.log('Firestore updated successfully');
      alert('Additional documents uploaded successfully!');
      fetchApplications();
      handleCloseDetails();
    } catch (error) {
      console.error('=== Error uploading additional documents ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('=========================================');
      
      let errorMessage = 'Failed to upload documents.';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage permissions error. Please check Firebase Storage rules for additionalDocuments folder.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploadingAdditional(false);
    }
  };

  const handleDownloadDocument = async (url, filename) => {
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (error) {
      console.error('Download error:', error);
      window.open(url, '_blank');
    }
  };

  const handleDownloadAllApprovedVisas = async () => {
    const approvedApps = applications.filter(app => app.status === 'approved' && app.approvedVisaFile);
    
    if (approvedApps.length === 0) {
      alert('No approved visas available to download');
      return;
    }

    try {
      setDownloadingAll(true);
      
      for (const app of approvedApps) {
        await handleDownloadDocument(
          app.approvedVisaFile,
          `approved_visa_${app.fullNameEnglish?.replace(/\s+/g, '_')}.pdf`
        );
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      alert(`Successfully downloaded ${approvedApps.length} approved visa(s)!`);
    } catch (error) {
      console.error('Error downloading all visas:', error);
      alert('Some downloads may have failed. Please try individual downloads.');
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleSubmitApplication = async (formData) => {
    try {
      // Save to Firestore
      const { addDoc } = await import('firebase/firestore');
      const { getDoc, doc } = await import('firebase/firestore');
      
      // Fetch user's team data from their profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const newApplication = {
        userId: user.uid,
        userEmail: user.email,
        fullNameEnglish: formData.fullNameEnglish,
        fullNameArabic: formData.fullNameArabic,
        passportNumber: formData.passportNumber,
        dateOfBirth: formData.dateOfBirth,
        expiryDate: formData.expiryDate,
        placeOfBirth: formData.placeOfBirth,
        nationality: formData.nationality,
        gender: formData.gender,
        position: formData.position,
        teamName: userData.teamName || user.displayName || 'Team Name', // From user profile teamName field
        teamLogo: userData.teamLogo || userData.photoURL || null, // Team logo
        // Document file URLs from Firebase Storage
        passportFile: formData.passportFile || null,
        photoFile: formData.photoFile || null,
        licenseFile: formData.licenseFile || null,
        nationalIdFile: formData.nationalIdFile || null,
        status: 'reviewing',
        submittedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      console.log('Submitting application with files:', newApplication);

      await addDoc(collection(db, 'visaApplications'), newApplication);
      
      // Send visa application confirmation email via Firebase Cloud Function
      try {
        const emailResponse = await fetch('https://www.fujopen.com/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: formData.fullNameEnglish || user.displayName,
          }),
        });
        
        if (emailResponse.ok) {
          console.log('✅ Visa application email sent to:', user.email);
        } else {
          console.error('❌ Failed to send visa application email');
        }
      } catch (emailError) {
        console.error('❌ Error sending visa application email:', emailError);
      }
      
      // Refresh applications list
      fetchApplications();
      setShowApplicationForm(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'processing': return 'primary';
      case 'submitted': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'processing': return <AccessTimeIcon />;
      case 'submitted': return <DescriptionIcon />;
      default: return <AccessTimeIcon />;
    }
  };

  // New Application Card for List View
  const NewApplicationCardList = () => (
    <Box className={classes.newApplicationCard} onClick={handleStartApplication} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <PersonAddIcon sx={{ fontSize: 48, opacity: 0.5 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t('ai-landing.visa_new_application')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.8 }}>
            {t('ai-landing.visa_apply_new')}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        startIcon={<PersonAddIcon />}
        onClick={(e) => {
          e.stopPropagation();
          handleStartApplication();
        }}
      >
        {t('ai-landing.visa_start_application')}
      </Button>
    </Box>
  );

  // New Application Card for Grid View
  const NewApplicationCardGrid = () => (
    <Card className={classes.visaCard} elevation={0} sx={{ height: '100%', minHeight: 350 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3, textAlign: 'center' }}>
        <PersonAddIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {t('ai-landing.visa_new_application')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.8, mb: 3 }}>
          {t('ai-landing.visa_apply_new')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={<PersonAddIcon />}
          onClick={handleStartApplication}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            fontWeight: 700,
          }}
        >
          {t('ai-landing.visa_start_application').toUpperCase()}
        </Button>
      </CardContent>
    </Card>
  );

  // Compact List View Card
  const VisaApplicationListCard = ({ application }) => (
    <Card className={classes.visaCard} elevation={0} sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          {/* Mobile Layout - Stacked */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar 
              src={application.photoFile || null}
              sx={{ width: 56, height: 56 }}
            >
              {application.fullNameEnglish ? application.fullNameEnglish.split(' ').map(n => n[0]).join('') : 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {application.fullNameEnglish}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {application.passportNumber}
              </Typography>
            </Box>
            <Chip
              icon={getStatusIcon(application.status)}
              label={application.status}
              color={getStatusColor(application.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="textSecondary">{t('ai-landing.visa_position')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {application.position || '-'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="textSecondary">{t('ai-landing.visa_submitted')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(application.submittedDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DescriptionIcon />}
            onClick={() => handleViewDetails(application)}
          >
            {t('ai-landing.visa_view')}
          </Button>
        </Box>

        {/* Desktop/Tablet Layout - Horizontal */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item sm={1}>
              <Avatar 
                src={application.photoFile || null}
                sx={{ width: 48, height: 48 }}
              >
                {application.fullNameEnglish ? application.fullNameEnglish.split(' ').map(n => n[0]).join('') : 'U'}
              </Avatar>
            </Grid>
            <Grid item sm={4}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {application.fullNameEnglish}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {application.passportNumber}
              </Typography>
            </Grid>
            <Grid item sm={2}>
              <Typography variant="caption" display="block" color="textSecondary">{t('ai-landing.visa_position')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {application.position || '-'}
              </Typography>
            </Grid>
            <Grid item sm={2}>
              <Typography variant="caption" display="block" color="textSecondary">{t('ai-landing.visa_submitted')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {new Date(application.submittedDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item sm={2}>
              <Chip
                icon={getStatusIcon(application.status)}
                label={application.status.toUpperCase()}
                color={getStatusColor(application.status)}
                size="small"
                sx={{ fontWeight: 600, width: '100%' }}
              />
            </Grid>
            <Grid item sm={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleViewDetails(application)}
                fullWidth
              >
                {t('ai-landing.visa_view')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );

  // Grid View Card (4 columns)
  const VisaApplicationGridCard = ({ application }) => (
    <Card className={classes.visaCard} elevation={0} sx={{ height: '100%', minHeight: 350 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Avatar 
            src={application.photoFile || null}
            sx={{ width: 64, height: 64, margin: '0 auto', mb: 1 }}
          >
            {application.fullNameEnglish ? application.fullNameEnglish.split(' ').map(n => n[0]).join('') : 'U'}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            {application.fullNameEnglish}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            {application.passportNumber}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" display="block" color="textSecondary">{t('ai-landing.visa_position')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {application.position || '-'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" display="block" color="textSecondary">{t('ai-landing.visa_submitted')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {new Date(application.submittedDate).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Chip
            icon={getStatusIcon(application.status)}
            label={application.status.toUpperCase()}
            color={getStatusColor(application.status)}
            size="small"
            sx={{ fontWeight: 600, width: '100%', mb: 1 }}
          />
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<DescriptionIcon />}
            onClick={() => handleViewDetails(application)}
          >
            {t('ai-landing.visa_view')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Filter applications based on selected tab
  const filteredApplications = value === 'all' 
    ? applications 
    : applications.filter(app => {
        if (value === 'pending') return app.status === 'reviewing' || app.status === 'submitted';
        if (value === 'processing') return app.status === 'processing';
        if (value === 'additional') return app.status === 'additional';
        if (value === 'approved') return app.status === 'approved';
        if (value === 'rejected') return app.status === 'rejected';
        return true;
      });

  const allItems = [{ type: 'new' }, ...filteredApplications];

  const approvedVisasCount = applications.filter(app => app.status === 'approved' && app.approvedVisaFile).length;

  return (
    <Container className={classes.root}>
      <Box mt={{ sm: 5 }}>
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', md: 'center' }, 
          gap: 2, 
          mb: 3 
        }}>
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            aria-label="view mode"
            fullWidth={isMobile}
          >
            <ToggleButton value="list" aria-label="list view" sx={{ flex: isMobile ? 1 : 'none' }}>
              <ViewListIcon sx={{ mr: { xs: 0, sm: 1 } }} /> 
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('ai-landing.visa_list_view')}</Box>
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view" sx={{ flex: isMobile ? 1 : 'none' }}>
              <GridViewIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('ai-landing.visa_grid_view')}</Box>
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchApplications}
              disabled={loading}
              fullWidth={isMobile}
              size={isMobile ? 'large' : 'medium'}
            >
              {loading ? t('ai-landing.visa_form_submitting') : t('ai-landing.visa_refresh')}
            </Button>
            {approvedVisasCount > 0 && (
              <Button
                variant="contained"
                startIcon={downloadingAll ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <DownloadIcon />}
                onClick={handleDownloadAllApprovedVisas}
                disabled={downloadingAll}
                fullWidth={isMobile}
                size={isMobile ? 'large' : 'medium'}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c, #2e7d32)',
                  }
                }}
              >
                {downloadingAll ? t('ai-landing.visa_form_submitting') : isMobile ? `${t('ai-landing.visa_download')} (${approvedVisasCount})` : `${t('ai-landing.visa_download_all')} (${approvedVisasCount})`}
              </Button>
            )}
          </Box>
        </Box>

        <Tabs
          centered={!isTablet}
          variant={isTablet ? 'scrollable' : 'fullWidth'}
          scrollButtons={isTablet}
          value={value}
          onChange={handleChange}
          classes={{
            indicator: classes.indicator
          }}
        >
            <Tab value="all" classes={{ root: classes.tabLabel }} label={t('ai-landing.visa_status_all')} />
          <Tab value="pending" classes={{ root: classes.tabLabel }} label={t('ai-landing.visa_status_pending')} />
          <Tab value="processing" classes={{ root: classes.tabLabel }} label={t('ai-landing.visa_status_processing')} />
          <Tab value="additional" classes={{ root: classes.tabLabel }} label={t('ai-landing.visa_status_additional')} />
          <Tab value="approved" classes={{ root: classes.tabLabel }} label={t('ai-landing.visa_status_approved')} />
          <Tab value="rejected" classes={{ root: classes.tabLabel }} label={t('ai-landing.visa_status_rejected')} />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : viewMode === 'list' ? (
          /* List View */
          <Box mt={5}>
            <NewApplicationCardList />
            {filteredApplications.map((item, index) => (
              <ScrollAnimation
                key={item.id}
                animateOnce
                animateIn="fadeInUpShort"
                delay={index * 50}
                duration={0.3}
              >
                <VisaApplicationListCard application={item} />
              </ScrollAnimation>
            ))}
            
            {!loading && filteredApplications.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
                <DescriptionIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">
                  No applications found
                </Typography>
                <Typography variant="body2">
                  Start by creating your first visa application
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          /* Grid View - 4 Columns */
          <Box mt={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <NewApplicationCardGrid />
              </Grid>
              {filteredApplications.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <ScrollAnimation
                    animateOnce
                    animateIn="fadeInUpShort"
                    delay={index * 50}
                    duration={0.3}
                  >
                    <VisaApplicationGridCard application={item} />
                  </ScrollAnimation>
                </Grid>
              ))}
            </Grid>
            
            {!loading && filteredApplications.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
                <DescriptionIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">
                  No applications found
                </Typography>
                <Typography variant="body2">
                  Start by creating your first visa application
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Application Form Dialog */}
      <Dialog
        open={showApplicationForm}
        onClose={handleCloseForm}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        scroll="body"
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
            maxHeight: '90vh',
            overflow: 'auto',
            m: 2,
          }
        }}
      >
        <ApplicationForm
          onSubmit={handleSubmitApplication}
          onCancel={handleCloseForm}
        />
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={handleCloseDetails}
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
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          pb: 2
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {t('ai-landing.visa_application_details')}
            </Typography>
            <Button 
              onClick={handleCloseDetails} 
              startIcon={<CloseIcon />}
              variant="outlined"
              size="small"
            >
              {t('ai-landing.visa_close')}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box pt={2}>
              {/* Show approved visa download if available - MOVED TO TOP */}
              {selectedMember.status === 'approved' && selectedMember.approvedVisaFile && (
                <Box sx={{ mb: 4, p: 3, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', mb: 2 }}>
                    ✅ {t('ai-landing.visa_your_visa_approved')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2, opacity: 0.8 }}>
                    {t('ai-landing.visa_approved_on')}: {selectedMember.visaApprovedDate ? new Date(selectedMember.visaApprovedDate).toLocaleString() : 'Recently'}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="success"
                    fullWidth
                    size="large"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleDownloadDocument(
                      selectedMember.approvedVisaFile,
                      `approved_visa_${selectedMember.fullNameEnglish?.replace(/\s+/g, '_')}.pdf`
                    )}
                  >
                    {t('ai-landing.visa_download_visa')}
                  </Button>
                </Box>
              )}

              <Box display="flex" alignItems="center" mb={3}>
                <Avatar 
                  sx={{ width: 80, height: 80, mr: 2, fontSize: '2rem' }}
                  src={selectedMember.photoFile || null}
                >
                  {selectedMember.fullNameEnglish ? selectedMember.fullNameEnglish.split(' ').map(n => n[0]).join('') : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedMember.fullNameEnglish}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedMember.status)}
                    label={selectedMember.status.toUpperCase()}
                    color={getStatusColor(selectedMember.status)}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Status Timeline - Horizontal */}
              <Box sx={{ my: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon /> {t('ai-landing.visa_application_progress')}
                </Typography>
                <Box sx={{ 
                  position: 'relative', 
                  p: 4,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
                  overflow: 'hidden',
                }}>
                  {/* Horizontal Timeline */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                    {/* Timeline Line */}
                    <Box sx={{
                      position: 'absolute',
                      left: '10%',
                      right: '10%',
                      top: 24,
                      height: 4,
                      background: 'linear-gradient(90deg, #6366f1 0%, rgba(99, 102, 241, 0.3) 100%)',
                      borderRadius: 2,
                      zIndex: 0,
                    }} />
                    
                    {/* Submitted */}
                    <Box sx={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                        mb: 2,
                      }}>
                        <DescriptionIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {t('ai-landing.visa_submitted')}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        {new Date(selectedMember.submittedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
                        {new Date(selectedMember.submittedDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>

                    {/* Processing/Updated */}
                    <Box sx={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: selectedMember.lastUpdated && selectedMember.lastUpdated !== selectedMember.submittedDate
                          ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                          : 'rgba(150, 150, 150, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: selectedMember.lastUpdated && selectedMember.lastUpdated !== selectedMember.submittedDate 
                          ? '0 4px 20px rgba(255, 152, 0, 0.4)' 
                          : 'none',
                        mb: 2,
                      }}>
                        <AccessTimeIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {t('ai-landing.visa_status_processing')}
                      </Typography>
                      {selectedMember.lastUpdated && selectedMember.lastUpdated !== selectedMember.submittedDate ? (
                        <>
                          <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                            {new Date(selectedMember.lastUpdated).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
                            {new Date(selectedMember.lastUpdated).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                          {t('ai-landing.visa_status_pending')}
                        </Typography>
                      )}
                    </Box>

                    {/* Approved */}
                    <Box sx={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: selectedMember.status === 'approved'
                          ? 'linear-gradient(135deg, #4caf50, #388e3c)'
                          : selectedMember.status === 'rejected'
                          ? 'linear-gradient(135deg, #f44336, #d32f2f)'
                          : 'rgba(150, 150, 150, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: selectedMember.status === 'approved' 
                          ? '0 4px 20px rgba(76, 175, 80, 0.4)'
                          : selectedMember.status === 'rejected'
                          ? '0 4px 20px rgba(244, 67, 54, 0.4)' 
                          : 'none',
                        mb: 2,
                      }}>
                        <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {selectedMember.status === 'approved' ? t('ai-landing.visa_status_approved_check') : selectedMember.status === 'rejected' ? t('ai-landing.visa_status_rejected_x') : t('ai-landing.visa_decision')}
                      </Typography>
                      {selectedMember.visaApprovedDate ? (
                        <>
                          <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                            {new Date(selectedMember.visaApprovedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
                            {new Date(selectedMember.visaApprovedDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                          {t('ai-landing.visa_awaiting')}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Current Status Badge */}
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Chip 
                      label={`${t('ai-landing.visa_current_status')}: ${selectedMember.status.toUpperCase()}`}
                      color={getStatusColor(selectedMember.status)}
                      sx={{ fontWeight: 700, fontSize: '0.9rem', px: 2, py: 2.5 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Full Name (Arabic)</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.fullNameArabic || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Passport Number</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.passportNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.dateOfBirth || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Passport Expiry</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.expiryDate || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Place of Birth</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.placeOfBirth || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Nationality</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.nationality || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Position</Typography>
                  <Typography variant="body1" gutterBottom>{selectedMember.position || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Submission Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedMember.submittedDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Show additional documents request if status is "additional" */}
              {selectedMember.status === 'additional' && selectedMember.additionalNotes && (
                <Box sx={{ mt: 4, p: 3, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'warning.main' }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      ⚠️ Additional Documents Required
                    </Typography>
                    <Typography variant="body2">
                      {selectedMember.additionalNotes}
                    </Typography>
                  </Alert>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                    Upload Required Documents
                  </Typography>
                  <input
                    id="additional-docs-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'block', marginBottom: '16px' }}
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    fullWidth
                    disabled={uploadingAdditional}
                    onClick={() => {
                      const input = document.getElementById('additional-docs-upload');
                      if (input && input.files && input.files.length > 0) {
                        handleUploadAdditionalDocs(input.files);
                      } else {
                        alert('Please select files to upload');
                      }
                    }}
                  >
                    {uploadingAdditional ? 'Uploading...' : 'Upload Documents'}
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                    Select one or more files (PDF, JPG, PNG) and click Upload
                  </Typography>
                </Box>
              )}

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} variant="contained" color="primary">
            {t('ai-landing.visa_close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default VisaGallery;
    