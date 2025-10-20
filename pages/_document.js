import React from 'react';
import Document, { Html, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { getInitColorSchemeScript } from '@mui/material/styles';
import MetaHead from 'components/Branding/MetaHead';
import createEmotionCache from '../theme/createEmotionCache';
import i18nextConfig from '../next-i18next.config';

class MyDocument extends Document {
  render() {
    const currentLocale = this.props.__NEXT_DATA__.query.locale || i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
        <head>
          <meta name="emotion-insertion-point" content="" />
          {this.props.emotionStyleTags}
          {/* Tajawal Font for Arabic - ALWAYS LOAD */}
          <link
            href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
            rel="stylesheet"
          />
          {currentLocale === 'ar' && (
            <style dangerouslySetInnerHTML={{__html: `
              html[lang="ar"] * {
                font-family: 'Tajawal', sans-serif !important;
              }
              html[lang="ar"] body,
              html[lang="ar"] #__next,
              html[lang="ar"] #__next > div {
                font-family: 'Tajawal', sans-serif !important;
              }
              html[lang="ar"] h1,
              html[lang="ar"] h2,
              html[lang="ar"] h3,
              html[lang="ar"] h4,
              html[lang="ar"] h5,
              html[lang="ar"] h6,
              html[lang="ar"] p,
              html[lang="ar"] span,
              html[lang="ar"] div,
              html[lang="ar"] a,
              html[lang="ar"] button,
              html[lang="ar"] input,
              html[lang="ar"] textarea,
              html[lang="ar"] label,
              html[lang="ar"] li,
              html[lang="ar"] td,
              html[lang="ar"] th {
                font-family: 'Tajawal', sans-serif !important;
              }
              html[lang="ar"] .MuiTypography-root,
              html[lang="ar"] .MuiButton-root,
              html[lang="ar"] .MuiInputBase-root,
              html[lang="ar"] .MuiTab-root,
              html[lang="ar"] .MuiChip-label,
              html[lang="ar"] .MuiListItemText-primary,
              html[lang="ar"] .MuiMenuItem-root,
              html[lang="ar"] .MuiAccordion-root,
              html[lang="ar"] .MuiDialogTitle-root,
              html[lang="ar"] .MuiDialogContent-root,
              html[lang="ar"] [class*="makeStyles"],
              html[lang="ar"] [class*="MuiTypography"],
              html[lang="ar"] [class*="title"],
              html[lang="ar"] [class*="text"] {
                font-family: 'Tajawal', sans-serif !important;
              }
            `}} />
          )}
        </head>
        <MetaHead />
        <body style={{ fontFamily: currentLocale === 'ar' ? 'Tajawal, sans-serif' : 'Montserrat, sans-serif' }}>
          <div
            id="preloader"
            style={{
              position: 'fixed',
              zIndex: 10000,
              background: '#fafafa',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              style={{
                position: 'fixed',
                top: 'calc(50% - 50px)',
                left: 'calc(50% - 50px)'
              }}
              src="/images/preloader.gif"
              alt="loading"
            />
          </div>
          {getInitColorSchemeScript()}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async ctx => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const originalRenderPage = ctx.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({ enhanceApp: (App) => (function EnhanceApp(props) { // eslint-disable-line
      return <App emotionCache={cache} {...props} />;
    }),
  });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
    namespacesRequired: ['common', 'ai-landing'],
  };
};

export default MyDocument;
