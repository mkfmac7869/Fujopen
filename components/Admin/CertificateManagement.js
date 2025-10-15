import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import * as XLSX from 'xlsx';

const useStyles = makeStyles({ uniqId: 'certificate-management' })((theme) => ({
  root: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  card: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
}));

function CertificateManagement() {
  const { classes } = useStyles();
  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
    fetchTemplate();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'certificates'));
      const certs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCertificates(certs);
      console.log('✅ Loaded certificates:', certs.length);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplate = async () => {
    try {
      const settingsSnapshot = await getDocs(collection(db, 'certificateSettings'));
      if (!settingsSnapshot.empty) {
        const settings = settingsSnapshot.docs[0].data();
        setTemplateUrl(settings.templateUrl || '');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n').filter(row => row.trim());
          
          // Skip header row
          const dataRows = rows.slice(1);
          
          let imported = 0;
          let failed = 0;

          for (const row of dataRows) {
            const columns = row.split(',').map(col => col.trim());
            
            if (columns.length >= 3 && columns[0]) {
              try {
                await addDoc(collection(db, 'certificates'), {
                  licenseNumber: columns[0].toUpperCase(),
                  fullName: columns[1] || '',
                  teamOrCountry: columns[2] || '',
                  uploadedAt: new Date().toISOString(),
                });
                imported++;
              } catch (err) {
                console.error('Error importing row:', columns, err);
                failed++;
              }
            }
          }

          setSuccess(`✅ Successfully imported ${imported} certificates${failed > 0 ? ` (${failed} failed)` : ''}`);
          fetchCertificates();
        } catch (error) {
          console.error('Error parsing CSV:', error);
          setError('Failed to parse CSV file. Please check format.');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setError('Failed to upload CSV file');
      setUploading(false);
    }

    // Reset file input
    event.target.value = null;
  };

  const handleTemplateUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📤 Uploading template file:', file.name, 'Type:', file.type, 'Size:', file.size);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG)');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      console.log('1️⃣ Creating storage reference...');
      // Upload to Firebase Storage
      const storageRef = ref(storage, `certificateTemplates/template_${Date.now()}.${file.name.split('.').pop()}`);
      
      console.log('2️⃣ Uploading file to Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('✅ Upload result:', uploadResult);
      
      console.log('3️⃣ Getting download URL...');
      const url = await getDownloadURL(storageRef);
      console.log('✅ Download URL:', url);

      console.log('4️⃣ Saving URL to Firestore...');
      // Save URL to Firestore settings
      const settingsRef = doc(db, 'certificateSettings', 'default');
      await setDoc(settingsRef, {
        templateUrl: url,
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ URL saved to Firestore');

      setTemplateUrl(url);
      setSuccess('✅ Certificate template uploaded successfully!');
      console.log('🎉 Template upload complete!');
    } catch (error) {
      console.error('❌ Error uploading template:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'storage/unauthorized') {
        setError('Failed to upload template: Storage permission denied. Please check Firebase Storage rules.');
      } else if (error.code === 'permission-denied') {
        setError('Failed to upload template: Firestore permission denied. Please check Firestore rules.');
      } else {
        setError(`Failed to upload template: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }

    // Reset file input
    event.target.value = null;
  };

  const handleDeleteCertificate = async (id) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      await deleteDoc(doc(db, 'certificates', id));
      setSuccess('Certificate deleted successfully');
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      setError('Failed to delete certificate');
    }
  };

  const handleClearAll = async () => {
    if (!confirm(`Are you sure you want to delete ALL ${certificates.length} certificates? This cannot be undone!`)) return;

    try {
      setUploading(true);
      for (const cert of certificates) {
        await deleteDoc(doc(db, 'certificates', cert.id));
      }
      setSuccess(`✅ Deleted all ${certificates.length} certificates`);
      fetchCertificates();
    } catch (error) {
      console.error('Error clearing certificates:', error);
      setError('Failed to clear certificates');
    } finally {
      setUploading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.teamOrCountry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" className={classes.root}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          🏆 Certificate Management
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Upload certificates data via CSV and manage certificate templates
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Upload Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CSV Upload */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Upload Certificates Data
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    CSV file with license numbers and details
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  CSV Format (3 columns):
                </Typography>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  License Number, Full Name, Team/Country<br/>
                  TKD2026-12345, John Doe, UAE National Team<br/>
                  TKD2026-12346, Jane Smith, Dubai Tigers
                </Typography>
              </Alert>

              <Button
                variant="contained"
                component="label"
                fullWidth
                size="large"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                sx={{
                  py: 2,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }
                }}
              >
                {uploading ? 'Uploading...' : 'Upload CSV File'}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleCSVUpload}
                />
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Template Upload */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <EmojiEventsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Certificate Template
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Upload background image (PNG/JPG)
                  </Typography>
                </Box>
              </Box>

              {templateUrl && (
                <Box sx={{ 
                  mb: 2, 
                  p: 1.5, 
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Typography variant="caption" sx={{ flex: 1, fontWeight: 600, color: 'success.main' }}>
                    ✅ Template uploaded
                  </Typography>
                  <IconButton size="small" onClick={() => window.open(templateUrl, '_blank')}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              <Button
                variant="contained"
                component="label"
                fullWidth
                size="large"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                sx={{
                  py: 2,
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  '&:hover': { background: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                }}
              >
                {uploading ? 'Uploading...' : templateUrl ? 'Replace Template' : 'Upload Template'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleTemplateUpload}
                />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Certificates Table */}
      <Card className={classes.card}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Uploaded Certificates ({certificates.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 250 }}
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClearAll}
                disabled={certificates.length === 0}
              >
                Clear All
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>License Number</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Full Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Team/Country</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Uploaded</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCertificates.length > 0 ? (
                    filteredCertificates.map((cert) => (
                      <TableRow key={cert.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            {cert.licenseNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cert.fullName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cert.teamOrCountry}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {cert.uploadedAt ? new Date(cert.uploadedAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCertificate(cert.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 8 }}>
                          <EmojiEventsIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No certificates uploaded yet
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            Upload a CSV file to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className={classes.card} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📋 Instructions
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. Prepare CSV File
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Create a CSV file with 3 columns:<br/>
                • Column 1: Global License Number (unique)<br/>
                • Column 2: Full Name (participant name)<br/>
                • Column 3: Team or Country name
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                2. Upload Certificate Template
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Upload a background image for the certificate (PNG or JPG recommended). The system will overlay participant data on this template.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                3. Upload CSV Data
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Upload the CSV file with all certificates data. Each row will create a certificate entry in the database.
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                4. Users Access Certificates
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Users can go to the Certificates page, enter their Global License Number, and download their certificate as PDF.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}

export default CertificateManagement;

