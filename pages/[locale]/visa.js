import React, { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
// Use this below for Server Side Render/Translation (SSR)
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// Use this below for Static Site Generation (SSG)
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import ProtectedRoute from 'components/Utils/ProtectedRoute';
import VisaGallery from 'components/Visa/VisaGallery';
import MediaBanner from 'components/HeroBanner/MediaBanner';
import ParallaxDeco from 'components/Parallax3d/Ufo';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';
import imgAPI from 'public/images/imgAPI';

function Visa() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');

  return (
    <Fragment>
      <Head>
        <title>
          { brand.name + ' - Visa Application' }
        </title>
      </Head>
      <CssBaseline />
      <ProtectedRoute>
        <div className={classes.innerPage}>
          <section id="banner">
            <MediaBanner
              title={t('ai-landing.visa_portal_title')}
              cover={imgAPI.inner[19]}
              featured={['/images/A.jpg', '/images/B.jpg', '/images/C.jpg']}
              decoration={() => <ParallaxDeco type="scroll" />}
            />
          </section>
          <div id="gallery">
            <VisaGallery />
          </div>
        </div>
      </ProtectedRoute>
    </Fragment>
  );
}

// Use this below for Server Side Render/Translation (SSR)
// export const getStaticProps = async ({ locale }) => ({ props: { ...await serverSideTranslations(locale, ['common']) } });

// Use this below for Static Site Generation (SSG)
const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

Visa.getLayout = (page, pageProps) => (
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

export default Visa;