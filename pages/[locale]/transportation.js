import React, { Fragment, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { Container, Box, Tabs, Tab } from '@mui/material';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import ProtectedRoute from 'components/Utils/ProtectedRoute';
import TransportationForm from 'components/Transportation/TransportationForm';
import MyTransportation from 'components/Transportation/MyTransportation';
import MediaBanner from 'components/HeroBanner/MediaBanner';
import ParallaxDeco from 'components/Parallax3d/Ufo';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';
import imgAPI from 'public/images/imgAPI';

function Transportation() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Fragment>
      <Head>
        <title>{brand.name} - Transportation</title>
      </Head>
      <CssBaseline />
      <ProtectedRoute>
        <div className={classes.innerPage}>
          <section id="banner">
            <MediaBanner
              title="Transportation Services"
              cover={imgAPI.inner[19]}
              featured={['/images/A.jpg', '/images/B.jpg', '/images/C.jpg']}
              decoration={() => <ParallaxDeco type="scroll" />}
            />
          </section>
          
          <Container sx={{ mt: 5 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                centered
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    minWidth: 200,
                  }
                }}
              >
                <Tab label="New Application" />
                <Tab label="My Transportation" />
              </Tabs>
            </Box>

            {activeTab === 0 && <TransportationForm />}
            {activeTab === 1 && <MyTransportation />}
          </Container>
        </div>
      </ProtectedRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

Transportation.getLayout = (page, pageProps) => (
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

export default Transportation;

