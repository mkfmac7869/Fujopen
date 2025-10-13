import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Collapse,
  Alert,
  Paper,
  Container,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'next-i18next';
import { useText, useTextAlign } from 'theme/common';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ClayDeco from '../Artworks/ClayDeco';
import Title from '../Title';
import countries from '../../lib/countries';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyDRF9lnA2pbq1tSfZ5xi-pWHcZaF60GL4A');

const useStyles = makeStyles({ uniqId: 'application-form' })((theme) => ({
  decoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    left: 0,
    top: 0,
    '& > div': {
      position: 'absolute'
    },
    '&.left': {
      left: -50,
    },
    '&.right': {
      right: -50,
    }
  },
  ball: {
    width: 160,
    height: 170,
    top: 100,
    left: 0,
    zIndex: 30,
    transform: 'rotate(-45deg)',
  },
  bom: {
    width: 60,
    height: 60,
    zIndex: 33,
    top: 160,
    left: 50,
    transform: 'rotate(-50deg)',
    filter: 'blur(5px) drop-shadow(0px 25px 12px rgba(0, 0, 0, 0.3))'
  },
  flower: {
    width: 180,
    height: 180,
    top: 300,
    right: -10,
    transform: 'rotate(-50deg)'
  },
  bowl: {
    width: 100,
    height: 100,
    top: 300,
    right: 40,
    transform: 'rotate(60deg)',
    filter: 'blur(5px) drop-shadow(20px 25px 5px rgba(0, 0, 0, 0.3))'
  },
  formBox: {
    borderRadius: 40,
    position: 'relative',
    zIndex: 22,
    background: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'saturate(180%) blur(20px)',
  },
  form: {
    textAlign: 'left',
    position: 'relative',
    padding: theme.spacing(4, 4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3, 2),
    },
  },
  inputField: {
    width: '100%',
    '& label': {
      left: theme.spacing(0.5),
      fontWeight: 600,
    },
    '& > div': {
      border: `1px solid ${alpha(theme.palette.text.primary, 0.25)}`,
      background: 'none',
      overflow: 'hidden',
      borderRadius: theme.spacing(1),
      transition: 'all 0.3s ease',
      '& input, & textarea, & select': {
        paddingLeft: theme.spacing(2),
        fontWeight: 500,
        '&:focus': {
          background: alpha(theme.palette.background.paper, 0.7)
        },
        '&:hover': {
          background: alpha(theme.palette.background.paper, 0.7)
        }
      },
      '& select': {
        cursor: 'pointer',
        paddingRight: theme.spacing(4),
        '& option': {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: theme.spacing(1.5),
          fontWeight: 500,
        }
      },
      '& .MuiSelect-icon': {
        color: theme.palette.primary.main,
        fontSize: '1.5rem',
      }
    },
    '&:hover > div': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    }
  },
  uploadSection: {
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.06)'}`,
    height: '100%',
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    }
  },
  uploadBox: {
    position: 'relative',
    height: 150,
    border: `2px dashed ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.15)'}`,
    borderRadius: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(255, 255, 255, 0.5)',
    [theme.breakpoints.down('sm')]: {
      height: 140,
    },
    '&:hover': {
      borderColor: theme.palette.primary.main,
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    },
    '&.uploaded': {
      borderColor: theme.palette.success.main,
      borderStyle: 'solid',
      background: theme.palette.mode === 'dark'
        ? 'rgba(76, 175, 80, 0.08)'
        : 'rgba(76, 175, 80, 0.05)',
    }
  },
  uploadIcon: {
    fontSize: 42,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.5),
    opacity: 0.6,
  },
  uploadedImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.spacing(2),
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&:hover': {
      opacity: 1,
    }
  },
  actionButtons: {
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      '& .MuiButton-root': {
        width: '100%'
      }
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
    '& button': {
      minHeight: 48,
    }
  },
  glassButton: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.95)',
    }
  },
  primaryButton: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-2px)',
    }
  },
  ocrProgress: {
    padding: theme.spacing(2.5),
    background: theme.palette.mode === 'dark'
      ? 'rgba(99, 102, 241, 0.08)'
      : 'rgba(99, 102, 241, 0.05)',
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(99, 102, 241, 0.2)' 
      : 'rgba(99, 102, 241, 0.15)'}`,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)',
  },
  statusChip: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  }
}));

function ApplicationForm({ onSubmit, onCancel }) {
  const { classes, cx } = useStyles();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    fullNameEnglish: '',
    fullNameArabic: '',
    passportNumber: '',
    expiryDate: '',
    placeOfBirth: '',
    dateOfBirth: '',
    nationality: '',
    gender: '',
    position: '',
  });

  const [files, setFiles] = useState({
    passport: null,
    photo: null,
    license: null,
    nationalId: null,
  });

  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRefs = {
    passport: useRef(null),
    photo: useRef(null),
    license: useRef(null),
    nationalId: useRef(null),
  };

  // Check if National ID is required based on nationality
  const requiresNationalId = ['Iran', 'Iraq', 'Afghanistan', 'Pakistan'].includes(formData.nationality);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;

    setFiles(prev => ({
      ...prev,
      [type]: file
    }));

    // If passport is uploaded, perform OCR
    if (type === 'passport' && file) {
      performOCR(file);
    }
  };

  const performOCR = async (file) => {
    setIsProcessing(true);
    setOcrStatus('🤖 Processing...');
    setOcrProgress(30);

    try {
      // Compress and convert image to base64 for faster upload
      const compressedImage = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize if too large (max 1200px width for faster processing)
            let width = img.width;
            let height = img.height;
            const maxWidth = 1200;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression
            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            resolve(base64.split(',')[1]);
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setOcrProgress(50);

      // Initialize Gemini model (using flash-lite for fastest processing)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 400,
          topP: 0.8,
          topK: 20,
        }
      });

      const prompt = `Extract passport data. Return ONLY this JSON (no text, no markdown):
{"fullNameEnglish":"name in Latin","fullNameArabic":"name in Arabic if visible","passportNumber":"passport#","dateOfBirth":"YYYY-MM-DD","expiryDate":"YYYY-MM-DD","placeOfBirth":"city, country","nationality":"country","gender":"male/female"}
Use null for missing fields. Dates must be YYYY-MM-DD. Gender: male or female only.`;

      const imageParts = [{
        inlineData: {
          data: compressedImage,
          mimeType: 'image/jpeg'
        }
      }];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = response.text();

      setOcrProgress(90);

      console.log('=== Gemini AI Response ===');
      console.log(text);
      console.log('==========================');

      // Parse JSON response
      let extractedData = {};
      try {
        // Remove markdown code blocks if present
        let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Remove any text before the first {
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        }
        extractedData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Attempted to parse:', text);
        throw new Error('Failed to parse AI response');
      }

      // Clean and validate extracted data
      const cleanedData = {};
      
      if (extractedData.fullNameEnglish && extractedData.fullNameEnglish !== 'null' && extractedData.fullNameEnglish !== null) {
        cleanedData.fullNameEnglish = extractedData.fullNameEnglish;
      }
      
      if (extractedData.fullNameArabic && extractedData.fullNameArabic !== 'null' && extractedData.fullNameArabic !== null) {
        cleanedData.fullNameArabic = extractedData.fullNameArabic;
      } else if (cleanedData.fullNameEnglish) {
        // If no Arabic name detected, translate English name to Arabic
        try {
          setOcrStatus('🌐 Translating name to Arabic...');
          const translateModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
          const translatePrompt = `Translate this name to Arabic script: "${cleanedData.fullNameEnglish}". Return ONLY the Arabic translation, nothing else.`;
          const translateResult = await translateModel.generateContent(translatePrompt);
          const arabicName = translateResult.response.text().trim();
          
          if (arabicName && arabicName.length > 0) {
            cleanedData.fullNameArabic = arabicName;
            console.log('Translated to Arabic:', arabicName);
          }
        } catch (error) {
          console.error('Translation error:', error);
          // Continue without Arabic name if translation fails
        }
      }
      
      if (extractedData.passportNumber && extractedData.passportNumber !== 'null' && extractedData.passportNumber !== null) {
        cleanedData.passportNumber = extractedData.passportNumber;
      }
      
      if (extractedData.dateOfBirth && extractedData.dateOfBirth !== 'null' && extractedData.dateOfBirth !== null) {
        cleanedData.dateOfBirth = extractedData.dateOfBirth;
      }
      
      if (extractedData.expiryDate && extractedData.expiryDate !== 'null' && extractedData.expiryDate !== null) {
        cleanedData.expiryDate = extractedData.expiryDate;
      }
      
      if (extractedData.placeOfBirth && extractedData.placeOfBirth !== 'null' && extractedData.placeOfBirth !== null) {
        cleanedData.placeOfBirth = extractedData.placeOfBirth;
      }
      
      if (extractedData.nationality && extractedData.nationality !== 'null' && extractedData.nationality !== null) {
        cleanedData.nationality = extractedData.nationality;
      }
      
      if (extractedData.gender && extractedData.gender !== 'null' && extractedData.gender !== null) {
        cleanedData.gender = extractedData.gender.toLowerCase();
      }

      console.log('=== Cleaned Data ===');
      console.log(cleanedData);
      console.log('====================');

      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        ...cleanedData
      }));

      setOcrProgress(100);
      const fieldsExtracted = Object.keys(cleanedData).length;
      setOcrStatus(`✅ Extracted ${fieldsExtracted} field(s)! Review the details.`);
      
      setTimeout(() => {
        setOcrStatus('');
        setOcrProgress(0);
      }, 3000);
    } catch (error) {
      console.error('=== Gemini AI Error ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('=======================');
      
      setOcrStatus(`❌ Extraction failed. Please enter manually.`);
      setTimeout(() => {
        setOcrStatus('');
        setOcrProgress(0);
      }, 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullNameEnglish) newErrors.fullNameEnglish = 'Required';
    if (!formData.fullNameArabic) newErrors.fullNameArabic = 'Required';
    if (!formData.passportNumber) newErrors.passportNumber = 'Required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
    if (!formData.placeOfBirth) newErrors.placeOfBirth = 'Required';
    if (!formData.position) newErrors.position = 'Required';
    if (!files.passport) newErrors.passport = 'Passport scan required';
    if (!files.photo) newErrors.photo = 'Personal photo required';
    
    // Require National ID for specific countries
    if (requiresNationalId && !files.nationalId) {
      newErrors.nationalId = 'National ID required for this nationality';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Starting application submission...');
      
      // Upload files to Firebase Storage first
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../../lib/firebase');
      const { auth } = await import('../../lib/firebase');
      
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to submit application');
        setIsSubmitting(false);
        return;
      }

      console.log('User authenticated:', user.uid);
      const fileUrls = {};

      // Upload passport
      if (files.passport) {
        console.log('Uploading passport...');
        const passportRef = ref(storage, `visaDocuments/${user.uid}/passport_${Date.now()}.jpg`);
        await uploadBytes(passportRef, files.passport);
        const url = await getDownloadURL(passportRef);
        fileUrls.passportFile = url;
        console.log('Passport uploaded:', url);
      }

      // Upload photo
      if (files.photo) {
        console.log('Uploading photo...');
        const photoRef = ref(storage, `visaDocuments/${user.uid}/photo_${Date.now()}.jpg`);
        await uploadBytes(photoRef, files.photo);
        const url = await getDownloadURL(photoRef);
        fileUrls.photoFile = url;
        console.log('Photo uploaded:', url);
      }

      // Upload license (optional)
      if (files.license) {
        console.log('Uploading license...');
        const licenseRef = ref(storage, `visaDocuments/${user.uid}/license_${Date.now()}.jpg`);
        await uploadBytes(licenseRef, files.license);
        const url = await getDownloadURL(licenseRef);
        fileUrls.licenseFile = url;
        console.log('License uploaded:', url);
      }

      // Upload National ID (required for specific countries)
      if (files.nationalId) {
        console.log('Uploading National ID...');
        const nationalIdRef = ref(storage, `visaDocuments/${user.uid}/nationalId_${Date.now()}.jpg`);
        await uploadBytes(nationalIdRef, files.nationalId);
        const url = await getDownloadURL(nationalIdRef);
        fileUrls.nationalIdFile = url;
        console.log('National ID uploaded:', url);
      }

      console.log('All files uploaded. File URLs:', fileUrls);

      // Submit with file URLs
      onSubmit({
        ...formData,
        ...fileUrls
      });
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('=== Error uploading files ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('===========================');
      alert(`Failed to upload documents: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({ type, icon, label, required = false }) => (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 600, fontSize: '0.875rem' }}>
        {label} {required && <span style={{ color: theme.palette.error.main }}>*</span>}
      </Typography>
      <Box
        className={cx(classes.uploadBox, files[type] && 'uploaded')}
        onClick={() => fileInputRefs[type].current?.click()}
      >
        {files[type] ? (
          <>
            {type === 'photo' || type === 'passport' ? (
              <img 
                src={URL.createObjectURL(files[type])} 
                alt={label}
                className={classes.uploadedImage}
              />
            ) : (
              <CheckCircleIcon className={classes.uploadIcon} color="success" />
            )}
            <Box className={classes.uploadOverlay}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles(prev => ({ ...prev, [type]: null }));
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Chip
              className={classes.statusChip}
              label="✓"
              color="success"
              size="small"
            />
          </>
        ) : (
          <>
            {icon}
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
              Click to upload
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
              JPG, PNG or PDF (Max 5MB)
            </Typography>
          </>
        )}
        <input
          ref={fileInputRefs[type]}
          type="file"
          hidden
          accept="image/*,.pdf"
          onChange={(e) => handleFileUpload(type, e.target.files[0])}
        />
      </Box>
      {errors[type] && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {errors[type]}
        </Typography>
      )}
    </Box>
  );

  const { classes: text } = useText();
  const { classes: align } = useTextAlign();

  return (
    <>
      <div className={`${classes.decoration} left`}>
        <div className={classes.ball}>
          <ClayDeco img="/images/decoration/clay-ball.png" color="tripleMain" />
        </div>
        <div className={classes.bom}>
          <ClayDeco img="/images/decoration/clay-bom.png" color="doubleMain" />
        </div>
      </div>
      <div className={`${classes.decoration} right`}>
        <div className={classes.flower}>
          <ClayDeco img="/images/decoration/clay-snail.png" color="primaryLight" />
        </div>
        <div className={classes.bowl}>
          <ClayDeco img="/images/decoration/clay-bowl.png" color="accent" />
        </div>
      </div>
      <Container>
        <Paper className={classes.formBox}>
          <Fade in timeout={500}>
            <Box className={classes.form}>
              <Title text={t('ai-landing.visa_form_title')} align="center" />
              <p className={`${align.textCenter} ${text.paragraph}`}>
                {t('ai-landing.visa_form_upload_passport')}
              </p>

              {/* OCR Progress - Moved to Top */}
              <Collapse in={isProcessing || !!ocrStatus}>
                <Box className={classes.ocrProgress} sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {ocrStatus}
                  </Typography>
                  {isProcessing && (
                    <LinearProgress 
                      variant="determinate" 
                      value={ocrProgress}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Box>
              </Collapse>

              <Grid container spacing={4} sx={{ mt: 2 }}>
                {/* Left Side - Documents */}
                <Grid item xs={12} md={5}>
                  <Box className={classes.uploadSection}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 0.5,
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      📎 {t('ai-landing.visa_form_documents')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2.5,
                        opacity: 0.7,
                        fontSize: '0.9rem',
                      }}
                    >
                      {t('ai-landing.visa_form_upload_quality')}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FileUploadBox
                          type="passport"
                          icon={<DescriptionIcon className={classes.uploadIcon} />}
                          label={t('ai-landing.visa_form_passport_scan')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FileUploadBox
                          type="photo"
                          icon={<PhotoCameraIcon className={classes.uploadIcon} />}
                          label={t('ai-landing.visa_form_personal_photo')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FileUploadBox
                          type="license"
                          icon={<BadgeIcon className={classes.uploadIcon} />}
                          label={t('ai-landing.visa_form_global_license')}
                        />
                      </Grid>
                      {requiresNationalId && (
                        <Grid item xs={12}>
                          <FileUploadBox
                            type="nationalId"
                            icon={<DescriptionIcon className={classes.uploadIcon} />}
                            label={t('ai-landing.visa_form_national_id')}
                            required
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Right Side - Personal Information */}
                <Grid item xs={12} md={7} sx={{ 
                  borderLeft: { md: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}` },
                  pl: { md: 4 }
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 700,
                    }}
                  >
                    {t('ai-landing.visa_form_personal_info')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_full_name_en')}
                        name="fullNameEnglish"
                        value={formData.fullNameEnglish}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        error={!!errors.fullNameEnglish}
                        helperText={errors.fullNameEnglish}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_full_name_ar')}
                        name="fullNameArabic"
                        value={formData.fullNameArabic}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        error={!!errors.fullNameArabic}
                        helperText={errors.fullNameArabic}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_passport_number')}
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        error={!!errors.passportNumber}
                        helperText={errors.passportNumber}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_dob')}
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_passport_expiry')}
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        error={!!errors.expiryDate}
                        helperText={errors.expiryDate}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_pob')}
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        error={!!errors.placeOfBirth}
                        helperText={errors.placeOfBirth}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={countries}
                        value={formData.nationality}
                        onChange={(event, newValue) => {
                          setFormData(prev => ({
                            ...prev,
                            nationality: newValue || ''
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="filled"
                            label={t('ai-landing.visa_form_nationality')}
                            className={classes.inputField}
                            placeholder="Search country..."
                          />
                        )}
                        sx={{
                          '& .MuiAutocomplete-popupIndicator': {
                            color: theme.palette.primary.main,
                          },
                          '& .MuiFilledInput-root': {
                            background: 'none',
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.25)}`,
                            borderRadius: theme.spacing(1),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        select
                        SelectProps={{
                          native: true,
                        }}
                        InputLabelProps={{ 
                          shrink: true 
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label={t('ai-landing.visa_form_position')}
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className={classes.inputField}
                        select
                        required
                        SelectProps={{
                          native: true,
                        }}
                        InputLabelProps={{ 
                          shrink: true 
                        }}
                      >
                        <option value="">Select Position</option>
                        <option value="athlete">ATHLETE</option>
                        <option value="coach">COACH</option>
                        <option value="official">OFFICIAL</option>
                        <option value="referee">REFEREE</option>
                        <option value="fan">FAN</option>
                        <option value="trainer">TRAINER</option>
                        <option value="physiotherapist">physiotherapist</option>
                      </TextField>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Box className={classes.actionButtons}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  color="primary"
                  disabled={isProcessing || isSubmitting}
                  sx={{ minHeight: 48 }}
                >
                  {isSubmitting ? t('ai-landing.visa_form_submitting') : t('ai-landing.visa_form_submit')}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Paper>
      </Container>
    </>
  );
}

export default ApplicationForm;
