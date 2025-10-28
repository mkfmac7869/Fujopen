import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import CustomDialog from '../Utils/CustomDialog';
import { useCustomDialog } from '../Utils/useCustomDialog';

const useStyles = makeStyles()((theme) => ({
  root: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  card: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
  },
}));

function DocumentsManagement() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { dialog, showDialog, closeDialog } = useCustomDialog();

  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Category Dialog
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Document Dialog
  const [documentDialog, setDocumentDialog] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      const documentsSnapshot = await getDocs(collection(db, 'documents'));
      const docs = documentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      showDialog({
        type: 'warning',
        message: 'Please enter a category name',
      });
      return;
    }

    try {
      await addDoc(collection(db, 'documentCategories'), {
        name: categoryName,
        description: categoryDescription,
        createdAt: new Date().toISOString(),
      });
      
      setSnackbar({ open: true, message: 'Category created successfully!', severity: 'success' });
      setCategoryDialog(false);
      setCategoryName('');
      setCategoryDescription('');
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      showDialog({
        type: 'error',
        message: 'Failed to create category',
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'documentCategories', categoryId));
      setSnackbar({ open: true, message: 'Category deleted!', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      showDialog({
        type: 'error',
        message: 'Failed to delete category',
      });
    }
  };

  const handleAddDocument = async () => {
    if (!documentTitle.trim() || !selectedCategory || !documentFile) {
      showDialog({
        type: 'warning',
        message: 'Please fill all required fields and select a file',
      });
      return;
    }

    try {
      setUploading(true);

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `documents/${Date.now()}_${documentFile.name}`);
      await uploadBytes(storageRef, documentFile);
      const fileUrl = await getDownloadURL(storageRef);

      // Save document metadata to Firestore
      await addDoc(collection(db, 'documents'), {
        title: documentTitle,
        description: documentDescription,
        categoryId: selectedCategory,
        fileName: documentFile.name,
        fileUrl: fileUrl,
        fileType: documentFile.type,
        fileSize: `${(documentFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
      });

      setSnackbar({ open: true, message: 'Document uploaded successfully!', severity: 'success' });
      setDocumentDialog(false);
      setDocumentTitle('');
      setDocumentDescription('');
      setSelectedCategory('');
      setDocumentFile(null);
      fetchData();
    } catch (error) {
      console.error('Error uploading document:', error);
      showDialog({
        type: 'error',
        message: 'Failed to upload document',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDoc(doc(db, 'documents', documentId));
      setSnackbar({ open: true, message: 'Document deleted!', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      showDialog({
        type: 'error',
        message: 'Failed to delete document',
      });
    }
  };

  return (
    <Container className={classes.root} maxWidth="xl">
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 4 }}>
        📁 Documents Management
      </Typography>

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Manage Documents" value={0} />
          <Tab label="Manage Categories" value={1} />
        </Tabs>
      </Box>

      {/* Documents Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              All Documents ({documents.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDocumentDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                fontWeight: 700,
              }}
            >
              Upload Document
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <TableContainer component={Paper} className={classes.card}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Document</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>File Info</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="primary" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {doc.title}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {doc.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={categories.find(c => c.id === doc.categoryId)?.name || 'N/A'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {doc.fileName}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.6 }}>
                          {doc.fileSize}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" href={doc.fileUrl} target="_blank">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              if (confirm('Delete this document?')) {
                                handleDeleteDocument(doc.id);
                              }
                            }}
                          >
                            <DeleteIcon />
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

      {/* Categories Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Document Categories ({categories.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCategoryDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                fontWeight: 700,
              }}
            >
              Add Category
            </Button>
          </Box>

          <Grid container spacing={3}>
            {categories.map(cat => (
              <Grid item xs={12} sm={6} md={4} key={cat.id}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <FolderIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          if (confirm('Delete this category?')) {
                            handleDeleteCategory(cat.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                      {cat.description || 'No description'}
                    </Typography>
                    <Chip 
                      label={`${documents.filter(d => d.categoryId === cat.id).length} documents`}
                      size="small"
                      color="primary"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Add Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCategory}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={documentDialog} onClose={() => setDocumentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Document Title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            margin="normal"
            required
            SelectProps={{ native: true }}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </TextField>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setDocumentFile(e.target.files[0])}
              style={{ width: '100%' }}
            />
            {documentFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                ✓ Selected: {documentFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddDocument}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomDialog {...dialog} onClose={closeDialog} />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default DocumentsManagement;

