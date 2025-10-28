import React, { Fragment, useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Container, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import ProtectedRoute from 'components/Utils/ProtectedRoute';
import DocumentsGallery from 'components/Documents/DocumentsGallery';
import MediaBanner from 'components/HeroBanner/MediaBanner';
import ParallaxDeco from 'components/Parallax3d/Ufo';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';
import imgAPI from 'public/images/imgAPI';

function Documents() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // Wait for router to be ready with locale
  if (!router.isReady) {
    return null;
  }

  return (
    <Fragment>
      <Head>
        <title>{brand.name} - Documents</title>
      </Head>
      <CssBaseline />
      <ProtectedRoute>
        <div className={classes.innerPage}>
          <section id="banner">
            <MediaBanner
              title="Championship Documents"
              cover={imgAPI.inner[19]}
              featured={['/images/A.jpg', '/images/B.jpg', '/images/C.jpg']}
              decoration={() => <ParallaxDeco type="scroll" />}
            />
          </section>
          
          <Container sx={{ mt: 5 }}>
            <DocumentsGallery />
          </Container>
        </div>
      </ProtectedRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

Documents.getLayout = (page, pageProps) => (
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

export default Documents;

