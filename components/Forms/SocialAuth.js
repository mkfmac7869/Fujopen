import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../lib/AuthContext';
import useStyles from './form-style';

function SocialAuth() {
  const { classes } = useStyles();
  const { signInWithGoogle, profileCompleted } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      
      // Check if profile needs to be completed
      // Note: profileCompleted will be updated by AuthContext after sign-in
      // We'll redirect to complete-profile page which will check and redirect accordingly
      router.push('/complete-profile');
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={classes.socmedSideLogin}>
      <Button
        variant="contained"
        className={classes.redBtn}
        type="button"
        size="large"
        fullWidth
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
        ) : (
          <i className="ion-logo-google" />
        )}
        {loading ? 'Signing in...' : 'Google'}
      </Button>
    </div>
  );
}

export default SocialAuth;
