import React from 'react';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import HomeLayout from 'components/Layouts/Home';
import CertificateGenerator from 'components/Certificates/CertificateGenerator';
import ProtectedRoute from 'components/Utils/ProtectedRoute';
import singleMenu from 'components/Header/data/single';

function CertificatesPage() {
  return (
    <ProtectedRoute>
      <div>
        <Head>
          <title>Certificates - Fujairah Open 2026</title>
        </Head>
        <CssBaseline />
        <CertificateGenerator />
      </div>
    </ProtectedRoute>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

CertificatesPage.getLayout = (page, pageProps) => (
  <HomeLayout
    menu={singleMenu.main}
    prefix="ai-landing"
    {...pageProps}
  >
    {page}
  </HomeLayout>
);

export default CertificatesPage;

