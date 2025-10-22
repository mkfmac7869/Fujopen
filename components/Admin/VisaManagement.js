import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import FolderIcon from '@mui/icons-material/Folder';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import * as XLSX from 'xlsx';
import FoldersManagement from './FoldersManagement';

const useStyles = makeStyles({ uniqId: 'visa-management' })((theme) => ({
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
  submitted: { label: 'Submitted to GRFA', color: 'warning' },
  processing: { label: 'In Process', color: 'primary' },
  additional: { label: 'Additional Docs Required', color: 'error' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
};

function VisaManagement() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { dialog, showDialog, closeDialog } = useCustomDialog();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [visaFile, setVisaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const visaFileRef = React.useRef(null);
  const [viewMode, setViewMode] = useState('applicants'); // 'applicants' or 'teams'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamViewDialog, setTeamViewDialog] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [folders, setFolders] = useState([]);

  // Fetch visa applications from Firestore
  useEffect(() => {
    fetchApplications();
    fetchFolders();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const applicationsSnapshot = await getDocs(collection(db, 'visaApplications'));
      const apps = applicationsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Application data:', data); // Debug log
        console.log('Team Name:', data.teamName);
        console.log('Team Logo:', data.teamLogo);
        return {
          id: doc.id,
          ...data
        };
      });
      setApplications(apps);
      setFilteredApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setSnackbar({ open: true, message: 'Failed to load applications', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const foldersSnapshot = await getDocs(collection(db, 'visaFolders'));
      const foldersData = foldersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(foldersData);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Get folder name for an application
  const getFolderName = (applicationId) => {
    const folder = folders.find(f => f.applicationIds?.includes(applicationId));
    return folder ? folder.name : null;
  };

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.fullNameEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [filterStatus, searchTerm, applications]);

  const handleUpdateStatus = async () => {
    if (!selectedApplication || !newStatus) {
      showDialog({
        type: 'warning',
        message: 'Please select a status',
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Starting status update to:', newStatus);
      console.log('Application ID:', selectedApplication.id);
      
      const updateData = {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin',
      };

      // If status is "additional", save the notes about required documents
      if (newStatus === 'additional') {
        if (!additionalNotes) {
          showDialog({
            type: 'warning',
            message: 'Please specify what additional documents are required',
          });
          setUploading(false);
          return;
        }
        updateData.additionalNotes = additionalNotes;
        updateData.additionalDocsRequired = true;
        console.log('Additional docs required. Notes:', additionalNotes);
      } else {
        updateData.additionalNotes = additionalNotes || null;
        updateData.additionalDocsRequired = false;
      }

      // If status is "approved", upload visa document
      if (newStatus === 'approved' && visaFile) {
        console.log('Uploading approved visa file:', visaFile.name);
        
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../../lib/firebase');
        
        const visaRef = ref(storage, `approvedVisas/${selectedApplication.id}_${Date.now()}.pdf`);
        console.log('Uploading to storage...');
        
        await uploadBytes(visaRef, visaFile);
        console.log('File uploaded. Getting download URL...');
        
        const visaUrl = await getDownloadURL(visaRef);
        console.log('Got URL:', visaUrl);
        
        updateData.approvedVisaFile = visaUrl;
        updateData.visaApprovedDate = new Date().toISOString();
      }

      console.log('Updating Firestore with data:', updateData);
      await updateDoc(doc(db, 'visaApplications', selectedApplication.id), updateData);
      console.log('Firestore updated successfully');

      // Send status update email via Firebase Cloud Function
      try {
        const emailPayload = {
          email: selectedApplication.userEmail,
          name: selectedApplication.fullNameEnglish,
          status: newStatus,
          applicantName: selectedApplication.fullNameEnglish,
        };

        // Include visa document URL if approved and document exists
        if (newStatus === 'approved' && updateData.approvedVisaFile) {
          emailPayload.visaDocumentUrl = updateData.approvedVisaFile;
        }

        console.log('📧 Sending email with payload:', emailPayload);
        const emailResponse = await fetch('/api/send-visa-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        });
        
        console.log('📧 Email response status:', emailResponse.status);
        console.log('📧 Email response ok:', emailResponse.ok);
        
        let responseData = null;
        const responseText = await emailResponse.text();
        console.log('📧 Raw response:', responseText);
        
        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError);
          responseData = { error: 'Invalid response format', raw: responseText };
        }
        
        console.log('📧 Email API response:', responseData);
        
        if (emailResponse.ok) {
          console.log('✅ Visa email sent to:', selectedApplication.userEmail);
        } else {
          console.error('❌ Failed to send visa email. Status:', emailResponse.status, 'Response:', responseData);
        }
      } catch (emailError) {
        console.error('❌ Error sending visa email:', emailError);
      }

      setSnackbar({ open: true, message: 'Status updated successfully! Email sent to applicant.', severity: 'success' });
      setEditDialog(false);
      setVisaFile(null);
      setAdditionalNotes('');
      fetchApplications(); // Refresh data
    } catch (error) {
      console.error('=== Error updating status ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('===========================');
      
      let errorMsg = 'Failed to update status';
      if (error.code === 'storage/unauthorized') {
        errorMsg = 'Storage permission error. Please check Firebase Storage rules for approvedVisas folder.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleExportApplicants = () => {
    const exportData = filteredApplications.map(app => ({
      'Full Name (English)': app.fullNameEnglish,
      'Full Name (Arabic)': app.fullNameArabic || '',
      'Passport Number': app.passportNumber,
      'Date of Birth': app.dateOfBirth || '',
      'Passport Expiry Date': app.expiryDate || '',
      'Place of Birth': app.placeOfBirth || '',
      'Nationality': app.nationality || '',
      'Gender': app.gender || '',
      'Position': app.position || '',
      'Team/Club Name': app.teamName || '',
      'User Email': app.userEmail || '',
      'Status': app.status,
      'Submitted Date': new Date(app.submittedDate).toLocaleString(),
      'Last Updated': app.lastUpdated ? new Date(app.lastUpdated).toLocaleString() : '',
      'Updated By': app.updatedBy || '',
      'Visa Approved Date': app.visaApprovedDate ? new Date(app.visaApprovedDate).toLocaleString() : '',
      'Additional Notes': app.additionalNotes || '',
      'Passport File': app.passportFile || '',
      'Photo File': app.photoFile || '',
      'License File': app.licenseFile || '',
      'National ID File': app.nationalIdFile || '',
      'Additional Docs Uploaded': app.additionalDocsUploaded ? 'Yes' : 'No',
      'Approved Visa File': app.approvedVisaFile || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const maxWidth = 50;
    const cols = Object.keys(exportData[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = cols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visa Applications');
    
    const fileName = `Visa_Applications_Complete_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    setSnackbar({ open: true, message: `Exported ${exportData.length} applications to Excel!`, severity: 'success' });
  };

  const handleExportTeams = () => {
    const exportData = teamData.map(team => ({
      'Team/Club Name': team.name,
      'Total Members': team.total,
      'Approved': team.approved,
      'Pending': team.pending + team.processing,
      'Rejected': team.rejected,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams Summary');
    
    const fileName = `Teams_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    setSnackbar({ open: true, message: 'Excel file downloaded successfully!', severity: 'success' });
  };

  const handleExportSingleTeam = (team) => {
    const exportData = team.applications.map(app => ({
      'Full Name (English)': app.fullNameEnglish,
      'Full Name (Arabic)': app.fullNameArabic || '',
      'Passport Number': app.passportNumber,
      'Date of Birth': app.dateOfBirth || '',
      'Passport Expiry Date': app.expiryDate || '',
      'Place of Birth': app.placeOfBirth || '',
      'Nationality': app.nationality || '',
      'Gender': app.gender || '',
      'Position': app.position || '',
      'User Email': app.userEmail || '',
      'Status': app.status,
      'Submitted Date': new Date(app.submittedDate).toLocaleString(),
      'Last Updated': app.lastUpdated ? new Date(app.lastUpdated).toLocaleString() : '',
      'Passport File': app.passportFile || '',
      'Photo File': app.photoFile || '',
      'License File': app.licenseFile || '',
      'National ID File': app.nationalIdFile || '',
      'Approved Visa File': app.approvedVisaFile || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const cols = Object.keys(exportData[0] || {}).map(() => ({ wch: 50 }));
    worksheet['!cols'] = cols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, team.name);
    
    const fileName = `${team.name.replace(/\s+/g, '_')}_Members_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    setSnackbar({ open: true, message: `Exported ${exportData.length} team members to Excel!`, severity: 'success' });
  };

  const handleDownloadDocument = async (url, filename) => {
    try {
      setSnackbar({ open: true, message: 'Starting download...', severity: 'info' });
      
      // Fetch the file
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename); // Force download attribute
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after a delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 200);
      
      setSnackbar({ open: true, message: 'Document downloaded!', severity: 'success' });
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({ open: true, message: 'Download failed. Try right-click > Save Image As', severity: 'error' });
    }
  };

  // Group applications by team
  const groupByTeam = () => {
    const teams = {};
    applications.forEach(app => {
      const teamName = app.teamName || 'Unknown Team';
      if (!teams[teamName]) {
        teams[teamName] = {
          name: teamName,
          logo: app.teamLogo || null, // Get team logo from first application
          applications: [],
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          processing: 0,
        };
      }
      teams[teamName].applications.push(app);
      teams[teamName].total++;
      if (app.status === 'approved') teams[teamName].approved++;
      else if (app.status === 'rejected') teams[teamName].rejected++;
      else if (app.status === 'processing') teams[teamName].processing++;
      else teams[teamName].pending++;
    });
    return Object.values(teams);
  };

  const teamData = groupByTeam();

  return (
    <Container className={classes.root} maxWidth="xl">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
        Visa Applications Management
      </Typography>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, val) => setViewMode(val)}>
          <Tab label="All Applicants" value="applicants" />
          <Tab label="By Teams" value="teams" />
          <Tab label="Referees" value="referees" />
          <Tab label="Folders" value="folders" />
        </Tabs>
      </Box>

      {viewMode === 'applicants' && (
        <>
          {/* Search Bar with Actions */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              placeholder="Search by name, passport, or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Total: ${filteredApplications.length}`} color="primary" sx={{ fontWeight: 700, fontSize: '0.9rem' }} />
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchApplications}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleExportApplicants}
              >
                Export Excel
              </Button>
            </Box>
          </Box>

          {/* Status Filter Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={filterStatus}
              onChange={(e, val) => setFilterStatus(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 3,
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                }
              }}
            >
              <Tab label="ALL" value="all" />
              <Tab label="PENDING" value="pending" />
              <Tab label="REVIEWING BY OC" value="reviewing" />
              <Tab label="SUBMITTED TO GRFA" value="submitted" />
              <Tab label="IN PROCESS" value="processing" />
              <Tab label="ADDITIONAL DOCS REQUIRED" value="additional" />
              <Tab label="APPROVED" value="approved" />
              <Tab label="REJECTED" value="rejected" />
            </Tabs>
          </Box>

      {/* Applications Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <TableContainer component={Paper} className={classes.tableCard}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Team/Club</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Folder</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ width: 32, height: 32, fontSize: '0.9rem' }}
                      src={app.photoFile || null}
                    >
                      {app.fullNameEnglish?.[0] || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {app.fullNameEnglish}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {app.passportNumber}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                  <TableCell>{app.teamName || '-'}</TableCell>
                  <TableCell>
                    <Chip label={app.position || '-'} size="small" />
                  </TableCell>
                  <TableCell>
                    {getFolderName(app.id) ? (
                      <Chip 
                        label={getFolderName(app.id)} 
                        size="small" 
                        icon={<FolderIcon />}
                        sx={{ 
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusConfig[app.status]?.label || app.status}
                      color={statusConfig[app.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedApplication(app);
                        setDetailsDialog(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedApplication(app);
                        setNewStatus(app.status);
                        setEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
        </>
      )}

      {viewMode === 'teams' && (
        /* Teams View */
        <Box>
          {/* Search Bar and Export for Teams */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search teams by name..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
              }}
            />
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleExportTeams}
              sx={{ minWidth: 150 }}
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
              {teamData
                .filter(team => team.name.toLowerCase().includes(teamSearch.toLowerCase()))
                .map((team, index) => (
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
                      setTeamViewDialog(true);
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {team.logo && (
                          <Avatar 
                            src={team.logo}
                            sx={{ 
                              width: 56, 
                              height: 56,
                              border: `2px solid ${theme.palette.primary.main}`,
                              '& img': {
                                objectFit: 'contain',
                                padding: '4px',
                              }
                            }}
                          >
                            {team.name[0]}
                          </Avatar>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', flex: 1 }}>
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
                          label={`${team.approved} Approved`} 
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip 
                          label={`${team.pending + team.processing} Pending`} 
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 700 }}
                        />
                        {team.rejected > 0 && (
                          <Chip 
                            label={`${team.rejected} Rejected`} 
                            size="small"
                            color="error"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<VisibilityIcon />}
                      >
                        View {team.total} Member{team.total !== 1 ? 's' : ''}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {viewMode === 'referees' && (
        <>
          {/* Referees View */}
          <Box>
            {/* Search Bar and Export for Referees */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search by name, passport, or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchApplications}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const refereeApps = applications.filter(app => 
                      app.position?.toLowerCase() === 'referee'
                    );
                    const exportData = refereeApps.map(app => ({
                      'Full Name (English)': app.fullNameEnglish,
                      'Full Name (Arabic)': app.fullNameArabic || '',
                      'Passport Number': app.passportNumber,
                      'Date of Birth': app.dateOfBirth || '',
                      'Passport Expiry Date': app.expiryDate || '',
                      'Place of Birth': app.placeOfBirth || '',
                      'Nationality': app.nationality || '',
                      'Gender': app.gender || '',
                      'Position': app.position || '',
                      'Team/Club Name': app.teamName || '',
                      'User Email': app.userEmail || '',
                      'Status': app.status,
                      'Submitted Date': new Date(app.submittedDate).toLocaleString(),
                      'Last Updated': app.lastUpdated ? new Date(app.lastUpdated).toLocaleString() : '',
                      'Updated By': app.updatedBy || '',
                      'Visa Approved Date': app.visaApprovedDate ? new Date(app.visaApprovedDate).toLocaleString() : '',
                      'Additional Notes': app.additionalNotes || '',
                    }));
                    
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Referees');
                    XLSX.writeFile(wb, `Referees_${new Date().toISOString().split('T')[0]}.xlsx`);
                  }}
                >
                  Export Referees
                </Button>
              </Box>
            </Box>

            {/* Filter Status Tabs */}
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={filterStatus}
                onChange={(e, val) => setFilterStatus(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 'auto',
                    px: 3,
                    fontWeight: 600,
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                  }
                }}
              >
                <Tab label="ALL" value="all" />
                <Tab label="PENDING" value="pending" />
                <Tab label="REVIEWING BY OC" value="reviewing" />
                <Tab label="SUBMITTED TO GRFA" value="submitted" />
                <Tab label="IN PROCESS" value="processing" />
                <Tab label="ADDITIONAL DOCS REQUIRED" value="additional" />
                <Tab label="APPROVED" value="approved" />
                <Tab label="REJECTED" value="rejected" />
              </Tabs>
            </Box>

            {/* Total Count */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Total Referees: {applications.filter(app => 
                app.position?.toLowerCase() === 'referee' &&
                (filterStatus === 'all' || app.status === filterStatus) &&
                (searchTerm === '' || 
                  app.fullNameEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
                )
              ).length}
            </Typography>

            {/* Referees Table */}
            <TableContainer component={Paper} sx={{ 
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
                  }}>
                    <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Team/Club</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Folder</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications
                    .filter(app => 
                      app.position?.toLowerCase() === 'referee' &&
                      (filterStatus === 'all' || app.status === filterStatus) &&
                      (searchTerm === '' || 
                        app.fullNameEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )
                    .map((app) => (
                      <TableRow 
                        key={app.id}
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
                              src={app.photoFile}
                              sx={{ 
                                width: 50, 
                                height: 50,
                                border: '2px solid',
                                borderColor: 'primary.main',
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {app.fullNameEnglish}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {app.passportNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {app.teamLogo && (
                              <Avatar
                                src={app.teamLogo}
                                sx={{ width: 30, height: 30 }}
                              />
                            )}
                            <Typography variant="body2">{app.teamName || 'N/A'}</Typography>
                          </Box>
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
                          {getFolderName(app.id) ? (
                            <Chip 
                              label={getFolderName(app.id)} 
                              size="small" 
                              icon={<FolderIcon />}
                              sx={{ 
                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ opacity: 0.5 }}>-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={app.status} 
                            color={
                              app.status === 'approved' ? 'success' :
                              app.status === 'processing' ? 'primary' :
                              app.status === 'reviewing' ? 'info' :
                              app.status === 'rejected' ? 'error' :
                              'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(app.submittedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedApplication(app);
                                setDetailsDialog(true);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => {
                                setSelectedApplication(app);
                                setNewStatus(app.status);
                                setEditDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {applications.filter(app => 
              app.position?.toLowerCase() === 'referee' &&
              (filterStatus === 'all' || app.status === filterStatus) &&
              (searchTerm === '' || 
                app.fullNameEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
              )
            ).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No referee applications found
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {viewMode === 'folders' && (
        <FoldersManagement />
      )}

      {/* Team Members Dialog */}
      <Dialog
        open={teamViewDialog}
        onClose={() => setTeamViewDialog(false)}
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {selectedTeam?.name} - Team Members
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTeam.applications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            sx={{ width: 32, height: 32, fontSize: '0.9rem' }}
                            src={app.photoFile || null}
                          >
                            {app.fullNameEnglish?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {app.fullNameEnglish}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {app.passportNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={app.position || '-'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusConfig[app.status]?.label || app.status}
                          color={statusConfig[app.status]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedApplication(app);
                            setDetailsDialog(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedApplication(app);
                            setNewStatus(app.status);
                            setEditDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamViewDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExportSingleTeam(selectedTeam)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              fontWeight: 700,
            }}
          >
            Export Team to Excel
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
            borderRadius: 4,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        <DialogTitle>Update Visa Status</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Applicant: {selectedApplication.fullNameEnglish}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
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

              {/* Show file upload when status is "approved" */}
              {newStatus === 'approved' && (
                <Box sx={{ mt: 3, p: 2, border: '2px dashed', borderColor: 'success.main', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'success.main' }}>
                    Upload Approved Visa Document
                  </Typography>
                  <input
                    ref={visaFileRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setVisaFile(e.target.files[0])}
                    style={{ marginTop: 8 }}
                  />
                  {visaFile && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                      ✓ Selected: {visaFile.name}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Show required notes field when status is "additional" */}
              {newStatus === 'additional' && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  Please specify which additional documents are required below
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label={newStatus === 'additional' ? 'Required Documents (Required)' : 'Additional Notes (Optional)'}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                required={newStatus === 'additional'}
                sx={{ mt: 2 }}
                placeholder={newStatus === 'additional' ? 'e.g., Updated passport photo, Birth certificate, etc.' : 'Optional notes about this application...'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog(false);
            setVisaFile(null);
            setAdditionalNotes('');
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            disabled={uploading}
          >
            {uploading ? 'Updating...' : 'Update Status'}
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
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Application Details</Typography>
            <Chip 
              label={selectedApplication?.status?.toUpperCase() || 'N/A'} 
              color={statusConfig[selectedApplication?.status]?.color || 'default'}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 2 }}>
              {/* Applicant Information */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Personal Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Full Name (English)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.fullNameEnglish}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Full Name (Arabic)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.fullNameArabic || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Passport Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.passportNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.dateOfBirth || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Passport Expiry
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.expiryDate || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Place of Birth
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.placeOfBirth || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Nationality
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.nationality || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Gender
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {selectedApplication.gender || '-'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Team Information */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Team Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Team/Club Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.teamName || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Position
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      {selectedApplication.position || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Submitted Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedApplication.submittedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Uploaded Documents */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Uploaded Documents
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Passport Scan
                    </Typography>
                    {selectedApplication.passportFile ? (
                      <Box>
                        <img 
                          src={selectedApplication.passportFile} 
                          alt="Passport"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 8 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            fullWidth 
                            href={selectedApplication.passportFile}
                            target="_blank"
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            fullWidth
                            startIcon={<GetAppIcon />}
                            onClick={() => handleDownloadDocument(
                              selectedApplication.passportFile, 
                              `passport_${selectedApplication.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not uploaded</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Personal Photo
                    </Typography>
                    {selectedApplication.photoFile ? (
                      <Box>
                        <img 
                          src={selectedApplication.photoFile} 
                          alt="Photo"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 8 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            fullWidth 
                            href={selectedApplication.photoFile}
                            target="_blank"
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            fullWidth
                            startIcon={<GetAppIcon />}
                            onClick={() => handleDownloadDocument(
                              selectedApplication.photoFile, 
                              `photo_${selectedApplication.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not uploaded</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Global License
                    </Typography>
                    {selectedApplication.licenseFile ? (
                      <Box>
                        <img 
                          src={selectedApplication.licenseFile} 
                          alt="License"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 8 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            fullWidth 
                            href={selectedApplication.licenseFile}
                            target="_blank"
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            fullWidth
                            startIcon={<GetAppIcon />}
                            onClick={() => handleDownloadDocument(
                              selectedApplication.licenseFile, 
                              `license_${selectedApplication.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">Optional - Not uploaded</Typography>
                    )}
                  </Box>
                </Grid>
                {selectedApplication.nationalIdFile && (
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        National ID
                      </Typography>
                      <Box>
                        <img 
                          src={selectedApplication.nationalIdFile} 
                          alt="National ID"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 8 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            fullWidth 
                            href={selectedApplication.nationalIdFile}
                            target="_blank"
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            fullWidth
                            startIcon={<GetAppIcon />}
                            onClick={() => handleDownloadDocument(
                              selectedApplication.nationalIdFile, 
                              `nationalId_${selectedApplication.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Additional Notes */}
              {selectedApplication.additionalNotes && (
                <Box sx={{ mt: 3, p: 2, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Additional Notes from Admin
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication.additionalNotes}
                  </Typography>
                </Box>
              )}

              {/* Approved Visa Document */}
              {selectedApplication.status === 'approved' && selectedApplication.approvedVisaFile && (
                <Box sx={{ mt: 3, p: 3, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                    ✅ Approved Visa Document
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Approved Visa
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mb: 2, opacity: 0.7 }}>
                          Approved on: {new Date(selectedApplication.visaApprovedDate).toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" fullWidth href={selectedApplication.approvedVisaFile} target="_blank">
                            View
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success"
                            fullWidth
                            startIcon={<GetAppIcon />}
                            onClick={() => handleDownloadDocument(
                              selectedApplication.approvedVisaFile, 
                              `approved_visa_${selectedApplication.fullNameEnglish?.replace(/\s+/g, '_')}.pdf`
                            )}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Additional Documents Uploaded by User */}
              {selectedApplication.additionalDocuments && selectedApplication.additionalDocuments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Additional Documents Uploaded
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedApplication.additionalDocuments.map((doc, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {doc.filename}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 1, opacity: 0.7 }}>
                            Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" fullWidth href={doc.url} target="_blank">
                              View
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              fullWidth
                              startIcon={<GetAppIcon />}
                              onClick={() => handleDownloadDocument(doc.url, doc.filename)}
                            >
                              Download
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setDetailsDialog(false);
              setNewStatus(selectedApplication?.status || '');
              setEditDialog(true);
            }}
          >
            Edit Status
          </Button>
        </DialogActions>
      </Dialog>

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

export default VisaManagement;

