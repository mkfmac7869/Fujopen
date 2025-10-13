import React, { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import AdminRoute from 'components/Admin/AdminRoute';
import TransportationManagement from 'components/Admin/TransportationManagement';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';

function TransportationManagementPage() {
  return (
    <Fragment>
      <Head>
        <title>{brand.name} - Transportation Management</title>
      </Head>
      <CssBaseline />
      <AdminRoute>
        <TransportationManagement />
      </AdminRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

TransportationManagementPage.getLayout = (page, pageProps) => (
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

export default TransportationManagementPage;

