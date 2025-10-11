import React, { Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import AdminRoute from 'components/Admin/AdminRoute';
import VisaManagement from 'components/Admin/VisaManagement';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';

function VisaManagementPage() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');

  return (
    <Fragment>
      <Head>
        <title>
          { brand.name + ' - Visa Management' }
        </title>
      </Head>
      <CssBaseline />
      <AdminRoute>
        <div className={classes.innerPage}>
          <VisaManagement />
        </div>
      </AdminRoute>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

VisaManagementPage.getLayout = (page, pageProps) => (
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

export default VisaManagementPage;

