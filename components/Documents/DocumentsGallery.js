import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  IconButton,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderIcon from '@mui/icons-material/Folder';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

const useStyles = makeStyles()((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
  },
  tabsContainer: {
    marginBottom: theme.spacing(4),
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
  },
  documentCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 40px rgba(99, 102, 241, 0.3)',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
}));

function DocumentsGallery() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, 'documentCategories'));
      const cats = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(cats);

      // Fetch documents
      const documentsSnapshot = await getDocs(
        query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'))
      );
      const docs = documentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.categoryId === activeTab);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          📄 Championship Documents
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>

      {/* Category Tabs */}
      <Box className={classes.tabsContainer}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
            },
            '& .Mui-selected': {
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
            }
          }}
        >
          <Tab label="All Documents" value="all" icon={<FolderIcon />} iconPosition="start" />
          {categories.map(cat => (
            <Tab 
              key={cat.id} 
              label={cat.name} 
              value={cat.id}
              icon={<FolderIcon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 10,
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ opacity: 0.6 }}>
            No documents available in this category
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map(doc => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card className={classes.documentCard}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {doc.title}
                      </Typography>
                      <Chip 
                        label={categories.find(c => c.id === doc.categoryId)?.name || 'General'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                    {doc.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={doc.fileType || 'PDF'} 
                      size="small" 
                      color="primary"
                    />
                    <Chip 
                      label={doc.fileSize || 'N/A'} 
                      size="small"
                    />
                    <Chip 
                      label={new Date(doc.uploadedAt).toLocaleDateString()} 
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      href={doc.fileUrl}
                      target="_blank"
                      sx={{ flex: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(doc)}
                      sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default DocumentsGallery;

