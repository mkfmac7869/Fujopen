import React, { Fragment } from 'react';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import HomeLayout from 'components/Layouts/Home';
import AdminRoute from 'components/Admin/AdminRoute';
import DocumentsManagement from 'components/Admin/DocumentsManagement';
import singleMenu from 'components/Header/data/single';
import brand from 'public/text/brand';

function DocumentsManagementPage() {
  const { classes } = useSpacing();

  return (
    <Fragment>
      <Head>
        <title>{brand.name} - Documents Management</title>
      </Head>
      <CssBaseline />
      <AdminRoute>
        <div className={classes.innerPage}>
          <DocumentsManagement />
        </div>
      </AdminRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

DocumentsManagementPage.getLayout = (page, pageProps) => (
  <HomeLayout
    menu={singleMenu.main}
    prefix="ai-landing"
    {...pageProps}
  >
    {page}
  </HomeLayout>
);

export default DocumentsManagementPage;

