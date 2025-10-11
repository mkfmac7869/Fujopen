import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HotelIcon from '@mui/icons-material/Hotel';
import SaveIcon from '@mui/icons-material/Save';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

const useStyles = makeStyles({ uniqId: 'hotel-management' })((theme) => ({
  root: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  hotelCard: {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(30px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'}`,
  },
}));

function HotelManagementPanel() {
  const { classes } = useStyles();
  const theme = useTheme();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 5,
    description: '',
    amenities: '',
    image: '',
  });

  const [roomTypes, setRoomTypes] = useState([
    { name: 'Standard Room', price: 100, available: 10, maxGuests: 2, beds: '1 King Bed' }
  ]);

  const [imageFiles, setImageFiles] = useState([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
      const hotelsData = hotelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHotels(hotelsData);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hotel = null) => {
    if (hotel) {
      setEditMode(true);
      setCurrentHotel(hotel);
      setFormData({
        name: hotel.name,
        location: hotel.location,
        rating: hotel.rating,
        description: hotel.description || '',
        amenities: hotel.amenities?.join(', ') || '',
        image: hotel.image || '',
        images: hotel.images || [],
      });
      setExistingImages(hotel.images || [hotel.image] || []);
      setCoverImageIndex(0);
      setRoomTypes(hotel.rooms || [
        { name: 'Standard Room', price: 100, available: 10, maxGuests: 2, beds: '1 King Bed' }
      ]);
    } else {
      setEditMode(false);
      setCurrentHotel(null);
      setFormData({
        name: '',
        location: '',
        rating: 5,
        description: '',
        amenities: '',
        image: '',
        images: [],
      });
      setExistingImages([]);
      setCoverImageIndex(0);
      setRoomTypes([
        { name: 'Standard Room', price: 100, available: 10, maxGuests: 2, beds: '1 King Bed' }
      ]);
    }
    setImageFiles([]);
    setDialog(true);
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { name: '', price: 0, available: 0, maxGuests: 2, beds: '' }]);
  };

  const updateRoomType = (index, field, value) => {
    const updated = [...roomTypes];
    updated[index][field] = value;
    setRoomTypes(updated);
  };

  const removeRoomType = (index) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      console.log('Starting hotel save...');

      let imageUrls = existingImages.length > 0 ? [...existingImages] : ['/images/HOTEL_A.png'];

      // Upload multiple images if new files selected
      if (imageFiles && imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} new images...`);
        const uploadedUrls = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(`Uploading image ${i + 1}/${imageFiles.length}:`, file.name);
          const imageRef = ref(storage, `hotelImages/${Date.now()}_${file.name}`);
          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          uploadedUrls.push(url);
          console.log('Image uploaded:', url);
        }
        
        // Combine existing images with newly uploaded ones
        imageUrls = editMode ? [...existingImages, ...uploadedUrls] : uploadedUrls;
      }

      // Ensure cover image is set correctly
      const coverImage = imageUrls[coverImageIndex] || imageUrls[0] || '/images/HOTEL_A.png';

      const hotelData = {
        name: formData.name,
        location: formData.location,
        rating: parseFloat(formData.rating),
        description: formData.description,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        image: coverImage, // Cover/main image selected by admin
        images: imageUrls, // All images for gallery
        rooms: roomTypes.map(room => ({
          id: room.name.toLowerCase().replace(/\s+/g, '-'),
          name: room.name,
          price: parseInt(room.price) || 0,
          available: parseInt(room.available) || 0,
          maxGuests: parseInt(room.maxGuests) || 2,
          beds: room.beds
        })),
        // Calculate totals from room types
        pricePerNight: Math.min(...roomTypes.map(r => parseInt(r.price) || 0)),
        roomsAvailable: roomTypes.reduce((sum, r) => sum + (parseInt(r.available) || 0), 0),
        maxGuests: Math.max(...roomTypes.map(r => parseInt(r.maxGuests) || 2)),
        updatedAt: new Date().toISOString(),
      };

      console.log('Hotel data to save:', hotelData);

      if (editMode && currentHotel) {
        console.log('Updating hotel:', currentHotel.id);
        await updateDoc(doc(db, 'hotels', currentHotel.id), hotelData);
        console.log('Hotel updated successfully');
        setSnackbar({ open: true, message: 'Hotel updated successfully!', severity: 'success' });
      } else {
        console.log('Adding new hotel...');
        hotelData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'hotels'), hotelData);
        console.log('Hotel added with ID:', docRef.id);
        setSnackbar({ open: true, message: 'Hotel added successfully!', severity: 'success' });
      }

      setDialog(false);
      setImageFiles([]);
      fetchHotels();
    } catch (error) {
      console.error('=== Error saving hotel ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('========================');
      
      let errorMsg = 'Failed to save hotel';
      if (error.code === 'storage/unauthorized') {
        errorMsg = 'Storage permission error. Please check Firebase Storage rules for hotelImages folder.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (hotelId) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      await deleteDoc(doc(db, 'hotels', hotelId));
      setSnackbar({ open: true, message: 'Hotel deleted successfully!', severity: 'success' });
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      setSnackbar({ open: true, message: 'Failed to delete hotel', severity: 'error' });
    }
  };

  return (
    <Container className={classes.root} maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Hotel Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            fontWeight: 700,
          }}
        >
          Add New Hotel
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {hotels.map((hotel) => (
            <Grid item xs={12} md={6} lg={4} key={hotel.id}>
              <Card className={classes.hotelCard}>
                <CardMedia
                  component="img"
                  height="200"
                  image={hotel.image || '/images/HOTEL_A.png'}
                  alt={hotel.name}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {hotel.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    📍 {hotel.location}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={`$${hotel.pricePerNight}/night`} color="primary" size="small" />
                    <Chip label={`${hotel.roomsAvailable} rooms`} size="small" />
                    <Chip label={`⭐ ${hotel.rating}`} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(hotel)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialog} 
        onClose={() => setDialog(false)} 
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
        <DialogTitle>{editMode ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Hotel Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rating (1-5)"
                type="number"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                inputProps={{ min: 1, max: 5, step: 0.5 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amenities (comma-separated)"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="e.g., Free WiFi, Pool, Gym, Restaurant"
              />
            </Grid>

            {/* Room Types Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, border: '2px dashed', borderColor: 'primary.main', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Room Types
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addRoomType}
                  >
                    Add Room Type
                  </Button>
                </Box>

                {roomTypes.map((room, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Room Type {index + 1}
                      </Typography>
                      {roomTypes.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => removeRoomType(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Room Type Name"
                          value={room.name}
                          onChange={(e) => updateRoomType(index, 'name', e.target.value)}
                          placeholder="e.g., Standard Room, Deluxe Suite"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Price ($)"
                          type="number"
                          value={room.price}
                          onChange={(e) => updateRoomType(index, 'price', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Available"
                          type="number"
                          value={room.available}
                          onChange={(e) => updateRoomType(index, 'available', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Beds Configuration"
                          value={room.beds}
                          onChange={(e) => updateRoomType(index, 'beds', e.target.value)}
                          placeholder="e.g., 1 King Bed"
                        />
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Max Guests"
                          type="number"
                          value={room.maxGuests}
                          onChange={(e) => updateRoomType(index, 'maxGuests', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                Hotel Images
              </Typography>
              
              {/* Show existing images if editing */}
              {existingImages.length > 0 && (
                <Box sx={{ mb: 3, p: 2, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Current Images (Click to select as cover)
                  </Typography>
                  <Grid container spacing={2}>
                    {existingImages.map((img, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            border: coverImageIndex === index ? '3px solid' : '2px solid',
                            borderColor: coverImageIndex === index ? 'success.main' : 'divider',
                            borderRadius: 2,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            '&:hover': {
                              borderColor: 'primary.main',
                            }
                          }}
                          onClick={() => setCoverImageIndex(index)}
                        >
                          <img src={img} alt={`Hotel ${index + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                          {coverImageIndex === index && (
                            <Chip
                              label="Cover"
                              color="success"
                              size="small"
                              sx={{ position: 'absolute', top: 4, left: 4, fontWeight: 700 }}
                            />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                    ✓ Cover image: Image {coverImageIndex + 1}
                  </Typography>
                </Box>
              )}

              {/* Upload new images */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upload New Images (Select Multiple)
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  style={{ display: 'block', marginBottom: 8 }}
                />
                {imageFiles.length > 0 && (
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                    ✓ Selected {imageFiles.length} new image(s): {imageFiles.map(f => f.name).join(', ')}
                  </Typography>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                  {editMode ? 'New images will be added to existing images' : 'Tip: Select 3-5 images for best gallery display'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? 'Saving...' : 'Save Hotel'}
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
    </Container>
  );
}

export default HotelManagementPanel;

