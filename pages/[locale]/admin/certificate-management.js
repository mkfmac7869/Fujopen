import React from 'react';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CssBaseline from '@mui/material/CssBaseline';
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
        <HomeLayout
          menu={singleMenu}
          footer
        >
          <CertificateManagement />
        </HomeLayout>
      </div>
    </AdminRoute>
  );
}

export default CertificateManagementPage;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { locale: 'en' } },
      { params: { locale: 'ar' } },
      { params: { locale: 'de' } },
      { params: { locale: 'pt' } },
      { params: { locale: 'id' } },
      { params: { locale: 'zh' } },
    ],
    fallback: false,
  };
}

