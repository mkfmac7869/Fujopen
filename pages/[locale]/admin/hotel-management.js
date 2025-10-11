import React, { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import AdminRoute from 'components/Admin/AdminRoute';
import HotelManagementPanel from 'components/Admin/HotelManagementPanel';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';

function HotelManagementPage() {
  const { classes } = useSpacing();

  return (
    <Fragment>
      <Head>
        <title>{brand.name + ' - Hotel Management'}</title>
      </Head>
      <CssBaseline />
      <AdminRoute>
        <div className={classes.innerPage}>
          <HotelManagementPanel />
        </div>
      </AdminRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

HotelManagementPage.getLayout = (page, pageProps) => (
  <HomeLayout home menu={singleMenu.main} footerDeco={FooterDeco} prefix="ai-landing" {...pageProps}>
    {page}
  </HomeLayout>
);

export default HotelManagementPage;

