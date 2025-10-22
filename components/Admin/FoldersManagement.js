import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';
import { db } from '../../lib/firebase';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const useStyles = makeStyles({ uniqId: 'folders-management' })((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
  },
  folderCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(2),
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
  reviewing: { label: 'Reviewing', color: 'info' },
  submitted: { label: 'Submitted', color: 'warning' },
  processing: { label: 'Processing', color: 'primary' },
  additional: { label: 'Additional Docs', color: 'error' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
};

function FoldersManagement() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { dialog, showDialog, closeDialog } = useCustomDialog();

  const [folders, setFolders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  const [downloadingDocs, setDownloadingDocs] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [visaFile, setVisaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const visaFileRef = React.useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch folders
      const foldersSnapshot = await getDocs(collection(db, 'visaFolders'));
      const foldersData = foldersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(foldersData);

      // Fetch all applications
      const appsSnapshot = await getDocs(collection(db, 'visaApplications'));
      const appsData = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(appsData);

      // Group by teams
      const teamsList = {};
      appsData.forEach(app => {
        const teamName = app.teamName || 'Unknown';
        if (!teamsList[teamName]) {
          teamsList[teamName] = { name: teamName, logo: app.teamLogo, members: [] };
        }
        teamsList[teamName].members.push(app.id);
      });
      setTeams(Object.values(teamsList));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      showDialog({
        type: 'warning',
        message: 'Please enter folder name',
      });
      return;
    }

    try {
      await addDoc(collection(db, 'visaFolders'), {
        name: folderName,
        applicationIds: [],
        createdAt: new Date().toISOString(),
      });
      
      setSnackbar({ open: true, message: 'Folder created successfully!', severity: 'success' });
      setCreateDialog(false);
      setFolderName('');
      fetchData();
    } catch (error) {
      console.error('Error creating folder:', error);
      setSnackbar({ open: true, message: 'Failed to create folder', severity: 'error' });
    }
  };

  const handleAddToFolder = async (type) => {
    if (type === 'individual' && selectedApplicants.length === 0) {
      showDialog({
        type: 'warning',
        message: 'Please select at least one applicant',
      });
      return;
    }
    if (type === 'team' && selectedTeams.length === 0) {
      showDialog({
        type: 'warning',
        message: 'Please select at least one team',
      });
      return;
    }

    try {
      const currentFolder = folders[activeFolder];
      let newApplicationIds = [...(currentFolder.applicationIds || [])];

      if (type === 'individual') {
        newApplicationIds = [...newApplicationIds, ...selectedApplicants];
      } else {
        // Add all members from selected teams
        selectedTeams.forEach(teamName => {
          const team = teams.find(t => t.name === teamName);
          if (team) {
            newApplicationIds = [...newApplicationIds, ...team.members];
          }
        });
      }

      // Remove duplicates
      newApplicationIds = [...new Set(newApplicationIds)];

      await updateDoc(doc(db, 'visaFolders', currentFolder.id), {
        applicationIds: newApplicationIds,
      });

      setSnackbar({ open: true, message: 'Applications added to folder!', severity: 'success' });
      setAddDialog(false);
      setSelectedApplicants([]);
      setSelectedTeams([]);
      fetchData();
    } catch (error) {
      console.error('Error adding to folder:', error);
      setSnackbar({ open: true, message: 'Failed to add applications', severity: 'error' });
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('Are you sure you want to delete this folder?')) return;

    try {
      await deleteDoc(doc(db, 'visaFolders', folderId));
      setSnackbar({ open: true, message: 'Folder deleted successfully!', severity: 'success' });
      setActiveFolder(0);
      fetchData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setSnackbar({ open: true, message: 'Failed to delete folder', severity: 'error' });
    }
  };

  const handleRemoveFromFolder = async (applicationId) => {
    if (!confirm('Remove this application from the folder?')) return;

    try {
      const currentFolder = folders[activeFolder];
      const newApplicationIds = currentFolder.applicationIds.filter(id => id !== applicationId);

      await updateDoc(doc(db, 'visaFolders', currentFolder.id), {
        applicationIds: newApplicationIds,
      });

      setSnackbar({ open: true, message: 'Application removed from folder!', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error removing from folder:', error);
      setSnackbar({ open: true, message: 'Failed to remove application', severity: 'error' });
    }
  };

  const handleExportFolder = (folder) => {
    const folderApps = applications.filter(app => folder.applicationIds?.includes(app.id));
    
    if (folderApps.length === 0) {
      showDialog({
        type: 'info',
        message: 'No applications in this folder to export',
      });
      return;
    }

    const exportData = folderApps.map(app => ({
      'Full Name (English)': app.fullNameEnglish,
      'Full Name (Arabic)': app.fullNameArabic || '',
      'Passport Number': app.passportNumber,
      'Date of Birth': app.dateOfBirth || '',
      'Nationality': app.nationality || '',
      'Position': app.position || '',
      'Team/Club': app.teamName || '',
      'Status': app.status,
      'Submitted Date': new Date(app.submittedDate).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const cols = Object.keys(exportData[0] || {}).map(() => ({ wch: 50 }));
    worksheet['!cols'] = cols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, folder.name);
    
    XLSX.writeFile(workbook, `${folder.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setSnackbar({ open: true, message: 'Folder exported to Excel!', severity: 'success' });
  };

  const getFolderApplications = (folder) => {
    return applications.filter(app => folder.applicationIds?.includes(app.id));
  };

  // Get applications that are not in any folder
  const getAvailableApplications = () => {
    const allFolderAppIds = folders.flatMap(folder => folder.applicationIds || []);
    return applications.filter(app => !allFolderAppIds.includes(app.id));
  };

  const handleSelectAll = () => {
    const available = getAvailableApplications();
    setSelectedApplicants(available.map(app => app.id));
  };

  const handleDeselectAll = () => {
    setSelectedApplicants([]);
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
    }
  };

  const handleBulkDownload = async (documentType) => {
    try {
      setDownloadingDocs(true);
      setDownloadMenuAnchor(null);
      
      const folderApps = getFolderApplications(folders[activeFolder]);
      const zip = new JSZip();
      let count = 0;

      for (const app of folderApps) {
        let url = null;
        let fileName = '';
        
        switch(documentType) {
          case 'passports':
            url = app.passportFile;
            fileName = `passport_${app.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`;
            break;
          case 'photos':
            url = app.photoFile;
            fileName = `photo_${app.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`;
            break;
          case 'licenses':
            url = app.licenseFile;
            fileName = `license_${app.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`;
            break;
          case 'nationalIds':
            url = app.nationalIdFile;
            fileName = `nationalId_${app.fullNameEnglish?.replace(/\s+/g, '_')}.jpg`;
            break;
          case 'approvedVisas':
            url = app.approvedVisaFile;
            fileName = `visa_${app.fullNameEnglish?.replace(/\s+/g, '_')}.pdf`;
            break;
        }

        if (url) {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(fileName, blob);
            count++;
          } catch (error) {
            console.error(`Failed to download ${fileName}:`, error);
          }
        }
      }

      if (count === 0) {
        showDialog({
          type: 'info',
          message: `No ${documentType} found in this folder`,
        });
        setDownloadingDocs(false);
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folders[activeFolder].name}_${documentType}_${new Date().toISOString().split('T')[0]}.zip`);
      
      setSnackbar({ open: true, message: `Downloaded ${count} ${documentType} as ZIP file!`, severity: 'success' });
    } catch (error) {
      console.error('Error creating zip:', error);
      setSnackbar({ open: true, message: 'Failed to create ZIP file', severity: 'error' });
    } finally {
      setDownloadingDocs(false);
    }
  };

  const handleEditStatus = async () => {
    if (!selectedApplication || !newStatus) {
      showDialog({
        type: 'warning',
        message: 'Please select a status',
      });
      return;
    }

    try {
      setUploading(true);
      
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
      } else {
        updateData.additionalNotes = additionalNotes || null;
        updateData.additionalDocsRequired = false;
      }

      // If status is "approved", upload visa document
      if (newStatus === 'approved' && visaFile) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../../lib/firebase');
        
        const visaRef = ref(storage, `approvedVisas/${selectedApplication.id}_${Date.now()}.pdf`);
        await uploadBytes(visaRef, visaFile);
        const visaUrl = await getDownloadURL(visaRef);
        
        updateData.approvedVisaFile = visaUrl;
        updateData.visaApprovedDate = new Date().toISOString();
      }

      await updateDoc(doc(db, 'visaApplications', selectedApplication.id), updateData);

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
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header with Create Folder Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Organize Applications into Folders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            fontWeight: 700,
          }}
        >
          Create Folder
        </Button>
      </Box>

      {folders.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 10,
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
          borderRadius: 3,
        }}>
          <FolderIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>No Folders Yet</Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
            Create your first folder to organize visa applications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Create First Folder
          </Button>
        </Box>
      ) : (
        <>
          {/* Folder Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeFolder} onChange={(e, val) => setActiveFolder(val)} variant="scrollable">
              {folders.map((folder, index) => (
                <Tab 
                  key={folder.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderIcon />
                      {folder.name}
                      <Chip 
                        label={getFolderApplications(folder).length} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                  }
                  value={index}
                />
              ))}
            </Tabs>
          </Box>

          {/* Current Folder Content */}
          {folders[activeFolder] && (
            <Box>
              {/* Folder Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAddDialog(true)}
                  >
                    Add Applications
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExportFolder(folders[activeFolder])}
                  >
                    Export to Excel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={downloadingDocs ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CloudUploadIcon />}
                    onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
                    disabled={downloadingDocs}
                    sx={{
                      background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                      fontWeight: 700,
                    }}
                  >
                    {downloadingDocs ? 'Downloading...' : 'Download Documents'}
                  </Button>
                </Box>
                <IconButton
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                    setSelectedFolder(folders[activeFolder]);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
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
              {getFolderApplications(folders[activeFolder]).filter(app => 
                filterStatus === 'all' || app.status === filterStatus
              ).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ opacity: 0.6 }}>
                    No applications in this folder
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAddDialog(true)}
                    sx={{ mt: 2 }}
                  >
                    Add Applications
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} className={classes.tableCard}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Team/Club</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFolderApplications(folders[activeFolder])
                        .filter(app => filterStatus === 'all' || app.status === filterStatus)
                        .map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ width: 32, height: 32 }}
                                src={app.photoFile || null}
                              >
                                {app.fullNameEnglish?.[0] || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {app.fullNameEnglish}
                                </Typography>
                                <Typography variant="caption">
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
                            <Chip 
                              label={statusConfig[app.status]?.label || app.status}
                              color={statusConfig[app.status]?.color || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(app.submittedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setDetailsDialog(true);
                                }}
                                title="View Details"
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
                                title="Edit Status"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFromFolder(app.id)}
                                title="Remove from Folder"
                              >
                                <RemoveCircleOutlineIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </>
      )}

      {/* Create Folder Dialog */}
      <Dialog 
        open={createDialog} 
        onClose={() => setCreateDialog(false)}
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
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g., VISA ONE, Athletes, Coaches"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFolder}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add Applications Dialog */}
      <Dialog 
        open={addDialog} 
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
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
        <DialogTitle>Add Applications to Folder</DialogTitle>
        <DialogContent>
          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label="Individual" />
            <Tab label="By Team" />
          </Tabs>
          
          {/* Individual Selection */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Select Applicants:</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleSelectAll}>Select All</Button>
                <Button size="small" onClick={handleDeselectAll}>Deselect All</Button>
              </Box>
            </Box>
            <FormControl fullWidth>
              <Select
                multiple
                value={selectedApplicants}
                onChange={(e) => setSelectedApplicants(e.target.value)}
                renderValue={(selected) => `${selected.length} selected`}
              >
                {getAvailableApplications().map((app) => (
                  <MenuItem key={app.id} value={app.id}>
                    <Checkbox checked={selectedApplicants.indexOf(app.id) > -1} />
                    <ListItemText primary={app.fullNameEnglish} secondary={app.teamName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Or Select Teams:</Typography>
            <FormControl fullWidth>
              <Select
                multiple
                value={selectedTeams}
                onChange={(e) => setSelectedTeams(e.target.value)}
                renderValue={(selected) => `${selected.length} team(s) selected`}
              >
                {teams.map((team) => (
                  <MenuItem key={team.name} value={team.name}>
                    <Checkbox checked={selectedTeams.indexOf(team.name) > -1} />
                    <ListItemText 
                      primary={team.name} 
                      secondary={`${team.members.length} members`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleAddToFolder(selectedApplicants.length > 0 ? 'individual' : 'team')}
          >
            Add to Folder
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog - Complete like All Applicants */}
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
            borderRadius: 4,
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
              {/* Personal Information */}
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
                      Nationality
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.nationality || '-'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Team Information */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Team Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Team/Club Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.teamName || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Position
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedApplication.position || '-'}
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
                            startIcon={<DownloadIcon />}
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
                            startIcon={<DownloadIcon />}
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
                            startIcon={<DownloadIcon />}
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
                            startIcon={<DownloadIcon />}
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

              {/* Approved Visa Document */}
              {selectedApplication.status === 'approved' && selectedApplication.approvedVisaFile && (
                <Box sx={{ mt: 4, p: 3, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
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
                          Approved on: {selectedApplication.visaApprovedDate ? new Date(selectedApplication.visaApprovedDate).toLocaleString() : 'Recently'}
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
                            startIcon={<DownloadIcon />}
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
            borderRadius: 4,
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
            onClick={handleEditStatus}
            disabled={uploading}
          >
            {uploading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Documents Menu */}
      <Menu 
        anchorEl={downloadMenuAnchor} 
        open={Boolean(downloadMenuAnchor)} 
        onClose={() => setDownloadMenuAnchor(null)}
        PaperProps={{
          sx: {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(40px)',
          }
        }}
      >
        <MenuItem onClick={() => handleBulkDownload('passports')}>
          <DownloadIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> Download All Passports
        </MenuItem>
        <MenuItem onClick={() => handleBulkDownload('photos')}>
          <DownloadIcon sx={{ mr: 1, color: theme.palette.secondary.main }} /> Download All Photos
        </MenuItem>
        <MenuItem onClick={() => handleBulkDownload('licenses')}>
          <DownloadIcon sx={{ mr: 1, color: theme.palette.info.main }} /> Download All Licenses
        </MenuItem>
        <MenuItem onClick={() => handleBulkDownload('nationalIds')}>
          <DownloadIcon sx={{ mr: 1, color: theme.palette.warning.main }} /> Download All National IDs
        </MenuItem>
        <MenuItem onClick={() => handleBulkDownload('approvedVisas')}>
          <DownloadIcon sx={{ mr: 1, color: theme.palette.success.main }} /> Download All Approved Visas
        </MenuItem>
      </Menu>

      {/* Folder Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => {
          setMenuAnchor(null);
          handleDeleteFolder(selectedFolder?.id);
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Folder
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      
      <CustomDialog {...dialog} onClose={closeDialog} />
    </Box>
  );
}

export default FoldersManagement;

