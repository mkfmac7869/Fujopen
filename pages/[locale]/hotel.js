import React, { Fragment, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { Container, Box, Tabs, Tab, Fab, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// Use this below for Server Side Render/Translation (SSR)
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// Use this below for Static Site Generation (SSG)
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import ProtectedRoute from 'components/Utils/ProtectedRoute';
import HotelGallery from 'components/Hotels/HotelGallery';
import MyBookings from 'components/Hotels/MyBookings';
import BookingCart from 'components/Hotels/BookingCart';
import MediaBanner from 'components/HeroBanner/MediaBanner';
import ParallaxDeco from 'components/Parallax3d/Ufo';
import FooterDeco from 'components/Footer/Decoration/General';
import { useCart } from '../../lib/CartContext';
import brand from 'public/text/brand';
import imgAPI from 'public/images/imgAPI';

function Hotel() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Fragment>
      <Head>
        <title>
          { brand.name + ' - Hotel Booking' }
        </title>
      </Head>
      <CssBaseline />
      <ProtectedRoute>
        <div className={classes.innerPage}>
          <section id="banner">
            <MediaBanner
              title={t('ai-landing.hotel_portal_title')}
              cover={imgAPI.inner[19]}
              featured={['/images/HOTEL_A.png', '/images/HOTEL_B.png', '/images/HOTEL_C.png']}
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
                    minWidth: 150,
                  }
                }}
              >
                <Tab label={t('ai-landing.hotel_new_booking')} />
                <Tab label={t('ai-landing.hotel_my_bookings')} />
                <Tab label={t('ai-landing.hotel_cart')} />
              </Tabs>
            </Box>

            {activeTab === 0 && <HotelGallery />}
            {activeTab === 1 && <MyBookings />}
            {activeTab === 2 && <BookingCart />}
          </Container>
        </div>

        {/* Floating Cart Button */}
        {activeTab !== 2 && cartCount > 0 && (
          <Fab 
            color="primary" 
            onClick={() => handleTabChange(null, 2)}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              },
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Badge badgeContent={cartCount} color="error" max={99}>
              <ShoppingCartIcon />
            </Badge>
          </Fab>
        )}
      </ProtectedRoute>
    </Fragment>
  );
}

// Use this below for Server Side Render/Translation (SSR)
// export const getStaticProps = async ({ locale }) => ({ props: { ...await serverSideTranslations(locale, ['common']) } });

// Use this below for Static Site Generation (SSG)
const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

Hotel.getLayout = (page, pageProps) => (
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

export default Hotel;

