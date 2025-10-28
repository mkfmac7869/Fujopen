import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Fade,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PDFDocument, rgb } from 'pdf-lib';
import { useAuth } from '../../lib/AuthContext';
import Title from '../Title';

const useStyles = makeStyles({ uniqId: 'certificate-generator' })((theme) => ({
  root: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
  },
  formBox: {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: theme.spacing(4),
  },
  inputField: {
    '& .MuiFilledInput-root': {
      borderRadius: theme.spacing(1.5),
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
    }
  },
}));

function CertificateGenerator() {
  const { classes } = useStyles();
  const { user } = useAuth();
  
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [templateUrl, setTemplateUrl] = useState(null);

  const handleSearch = async () => {
    if (!licenseNumber.trim()) {
      setError('Please enter your Global License Number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCertificateData(null);

      // Search for license number in certificates collection
      const q = query(
        collection(db, 'certificates'),
        where('licenseNumber', '==', licenseNumber.trim().toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No certificate found with this Global License Number. Please check and try again.');
        setLoading(false);
        return;
      }

      // Get certificate data
      const certDoc = querySnapshot.docs[0];
      const certData = certDoc.data();
      
      console.log('✅ Certificate found:', certData);
      setCertificateData(certData);

      // Get template URL from settings
      const settingsQuery = await getDocs(collection(db, 'certificateSettings'));
      if (!settingsQuery.empty) {
        const settings = settingsQuery.docs[0].data();
        setTemplateUrl(settings.templateUrl);
      }

    } catch (error) {
      console.error('Error searching certificate:', error);
      setError('Failed to search for certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!certificateData) return;

    try {
      console.log('🎯 Starting certificate generation...');
      console.log('📄 Participant:', certificateData.fullName);

      // Create canvas to draw on image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load the certificate template image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = '/images/Certificate of Participant.png';
      });

      console.log('✅ Template image loaded');

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the template image
      ctx.drawImage(img, 0, 0);

      // Add participant name (centered below "THIS IS TO CERTIFY THAT")
      ctx.font = 'bold 80px "Times New Roman", serif';
      ctx.fillStyle = '#1e3a8a'; // Dark blue color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position: X=35.59%, Y=49.12% (exact positioning)
      const nameX = canvas.width * 0.3559;
      const nameY = canvas.height * 0.4912;
      
      ctx.fillText(certificateData.fullName.toUpperCase(), nameX, nameY);

      console.log('✅ Name added to certificate');

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        try {
          // Create PDF from image
          const pdfDoc = await PDFDocument.create();
          const imageBytes = await blob.arrayBuffer();
          const image = await pdfDoc.embedPng(imageBytes);
          
          // Add page with same dimensions as image (landscape A4)
          const page = pdfDoc.addPage([842, 595]); // A4 landscape
          const { width, height } = page.getSize();
          
          // Scale image to fit page
          const imageAspectRatio = image.width / image.height;
          const pageAspectRatio = width / height;
          
          let drawWidth, drawHeight;
          if (imageAspectRatio > pageAspectRatio) {
            drawWidth = width;
            drawHeight = width / imageAspectRatio;
          } else {
            drawHeight = height;
            drawWidth = height * imageAspectRatio;
          }
          
          page.drawImage(image, {
            x: (width - drawWidth) / 2,
            y: (height - drawHeight) / 2,
            width: drawWidth,
            height: drawHeight,
          });

          // Save PDF
          const pdfBytes = await pdfDoc.save();
          
          // Download
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Certificate_${certificateData.licenseNumber}_${certificateData.fullName.replace(/\s/g, '_')}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          console.log('✅ Certificate downloaded successfully!');
        } catch (error) {
          console.error('❌ Error creating PDF:', error);
          setError(`Failed to generate PDF: ${error.message}`);
        }
      }, 'image/png');

    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      setError(`Failed to generate certificate: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Title align="center">
        🏆 Certificate Generator
      </Title>

      <Paper className={classes.formBox}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmojiEventsIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Download Your Certificate
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Enter your Global License Number to generate and download your certificate
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search Form */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Global License Number
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="filled"
              placeholder="Enter your license number (e.g., TKD2026-12345)"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
              className={classes.inputField}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </Box>

        {/* Certificate Preview */}
        {certificateData && (
          <Fade in={!!certificateData}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              mb: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <EmojiEventsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Certificate Found!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Your certificate is ready to download
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  p: 3, 
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 2,
                  mb: 3
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, textAlign: 'center', color: '#1e3a8a' }}>
                    {certificateData.fullName}
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', mb: 1, fontStyle: 'italic' }}>
                    {certificateData.teamOrCountry}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', opacity: 0.7 }}>
                    License: {certificateData.licenseNumber}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={generateCertificate}
                  startIcon={<DownloadIcon />}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    }
                  }}
                >
                  Download Certificate (PDF)
                </Button>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Help Info */}
        <Alert severity="info">
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            📌 How to get your certificate:
          </Typography>
          <Typography variant="body2" component="div">
            1. Enter your Global License Number<br/>
            2. Click "Search" to find your certificate<br/>
            3. Click "Download Certificate" to get your PDF<br/>
            4. Your certificate will be saved to your downloads folder
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}

export default CertificateGenerator;

