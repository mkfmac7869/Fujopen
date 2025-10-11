import React from 'react';
import { Head } from 'next/document';
import theme from 'theme/paletteDark';
import brand from 'public/text/brand';

const MetaComponent = () => (
  <Head>
    {/* Use minimum-scale=1 to enable GPU rasterization */}
    <meta
      name="description"
      content={brand.desc}
    />
    {/* Favicon */}
    <link rel="icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-TileImage" content="/favicons/ms-icon-144x144.png" />
    {/* PWA primary color */}
    <meta name="theme-color" content={theme.cyber.palette.primary.main} />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;600;800&display=swap"
    />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css" />
    <link href="https://unpkg.com/ionicons@3.0.0/dist/css/ionicons.min.css" rel="stylesheet" />
    {/*  Facebook */}
    <meta property="author" content="verselion" />
    <meta property="og:site_name" content="verselion.ux-maestro.com" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    {/*  Twitter */}
    <meta property="twitter:site" content="verselion.ux-maestro.com" />
    <meta property="twitter:domain" content="verselion.ux-maestro.com" />
    <meta property="twitter:creator" content="verselion" />
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:image:src" content="/images/logo-verselion.png" />
    <meta property="og:url" content={brand.url} />
    <meta property="og:title" content={brand.name} />
    <meta
      property="og:description"
      content={brand.desc}
    />
    <meta name="twitter:site" content={brand.url} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={brand.img} />
    <meta property="og:image" content={brand.img} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <script src="/scripts/three.r119.min.js" />
  </Head>
);

export default MetaComponent;
