import React, { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
// Use this below for Server Side Render/Translation (SSR)
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// Use this below for Static Site Generation (SSG)
import { makeStaticProps } from 'lib/getStatic';
import i18nextConfig from '../../../next-i18next.config';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import ProtectedRoute from 'components/Utils/ProtectedRoute';
import HotelDetail from 'components/Hotels/HotelDetail';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';

function HotelDetailPage() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;

  return (
    <Fragment>
      <Head>
        <title>
          { brand.name + ' - Hotel Details' }
        </title>
      </Head>
      <CssBaseline />
      <ProtectedRoute>
        <div className={classes.innerPage}>
          <HotelDetail hotelId={id} />
        </div>
      </ProtectedRoute>
    </Fragment>
  );
}

// Use this below for Server Side Render/Translation (SSR)
// export const getStaticProps = async ({ locale }) => ({ props: { ...await serverSideTranslations(locale, ['common']) } });

// Use this below for Static Site Generation (SSG)
const getStaticProps = makeStaticProps(['common']);

async function getStaticPaths() {
  // For static export with dynamic routes, we need to return empty paths
  // The page will be client-side rendered when accessed
  return {
    paths: [],
    fallback: false, // Return 404 for non-existent paths, let client handle loading
  };
}

export { getStaticProps, getStaticPaths };

HotelDetailPage.getLayout = (page, pageProps) => (
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

export default HotelDetailPage;
