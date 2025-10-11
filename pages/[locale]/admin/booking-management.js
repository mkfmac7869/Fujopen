import React, { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import AdminRoute from 'components/Admin/AdminRoute';
import BookingManagement from 'components/Admin/BookingManagement';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';

function BookingManagementPage() {
  const { classes } = useSpacing();

  return (
    <Fragment>
      <Head>
        <title>{brand.name + ' - Booking Management'}</title>
      </Head>
      <CssBaseline />
      <AdminRoute>
        <div className={classes.innerPage}>
          <BookingManagement />
        </div>
      </AdminRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

BookingManagementPage.getLayout = (page, pageProps) => (
  <HomeLayout home menu={singleMenu.main} footerDeco={FooterDeco} prefix="ai-landing" {...pageProps}>
    {page}
  </HomeLayout>
);

export default BookingManagementPage;

