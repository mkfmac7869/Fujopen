import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CssBaseline from '@mui/material/CssBaseline';
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
        <HomeLayout
          menu={singleMenu}
          footer
        >
          <CertificateGenerator />
        </HomeLayout>
      </div>
    </ProtectedRoute>
  );
}

CertificatesPage.propTypes = {
  onToggleDark: PropTypes.func.isRequired,
  onToggleDir: PropTypes.func.isRequired,
};

export default CertificatesPage;

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

