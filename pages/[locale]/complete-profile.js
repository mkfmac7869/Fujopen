import React, { Fragment, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// Use this below for Static Site Generation (SSG)
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import CompleteProfile from 'components/Profile/CompleteProfile';
import FooterDeco from 'components/Footer/Decoration/General';
import { useAuth } from '../../lib/AuthContext';
import brand from 'public/text/brand';

function CompleteProfilePage() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');
  const { user, profileCompleted, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (profileCompleted) {
        // Profile already completed, redirect to home
        router.push('/');
      }
    }
  }, [user, profileCompleted, loading, router]);

  if (loading || !user || profileCompleted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>
          { brand.name + ' - Complete Your Profile' }
        </title>
      </Head>
      <CssBaseline />
      <div className={classes.containerGeneral} style={{ paddingTop: '120px', minHeight: '100vh' }}>
        <CompleteProfile onComplete={() => router.push('/')} />
      </div>
    </Fragment>
  );
}

// Use this below for Static Site Generation (SSG)
const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

CompleteProfilePage.getLayout = (page, pageProps) => (
  <HomeLayout
    home
    menu={singleMenu.main}
    footerDeco={FooterDeco}
    prefix="ai-landing"
    {...pageProps}
  >
    {page}
  </HomeLayout>
);

export default CompleteProfilePage;

