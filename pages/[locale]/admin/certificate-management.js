import React from 'react';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import HomeLayout from 'components/Layouts/Home';
import AdminRoute from 'components/Admin/AdminRoute';
import CertificateManagement from 'components/Admin/CertificateManagement';
import singleMenu from 'components/Header/data/single';

function CertificateManagementPage() {
  return (
    <AdminRoute>
      <div>
        <Head>
          <title>Certificate Management - Fujairah Open 2026</title>
        </Head>
        <CssBaseline />
        <CertificateManagement />
      </div>
    </AdminRoute>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

CertificateManagementPage.getLayout = (page, pageProps) => (
  <HomeLayout
    menu={singleMenu.main}
    prefix="ai-landing"
    {...pageProps}
  >
    {page}
  </HomeLayout>
);

export default CertificateManagementPage;

