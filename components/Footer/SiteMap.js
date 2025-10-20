import React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import brand from 'public/text/brand';
import { useTextAlign } from 'theme/common';
import Logo from '../Branding/Logo';
import SelectLang from '../Utils/LangSwitch/Select';
import LocaleLink from '../Link';
import useStyles from './sitemap-style';

function Copyright() {
  return (
    <Typography variant="body2" display="block">
      &copy;&nbsp;
      {brand.footerText}
    </Typography>
  );
}

function Footer(props) {
  // Theme breakpoints
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Translation Function
  const { toggleDir } = props;
  const { t } = useTranslation('common');
  const router = useRouter();
  const locale = router.query.locale || 'en';

  const { classes } = useStyles();
  const { classes: align } = useTextAlign();

  // Main menu items that match the header
  const mainMenuItems = [
    { name: t('ai-landing.header_home'), link: `/${locale}` },
    { name: t('ai-landing.header_visa'), link: `/${locale}/visa` },
    { name: t('ai-landing.header_hotel'), link: `/${locale}/hotel` },
    { name: t('ai-landing.header_transportation'), link: `/${locale}/transportation` },
    { name: t('ai-landing.header_certificates'), link: `/${locale}/certificates` },
    { name: t('ai-landing.header_profile'), link: `/${locale}/profile` },
  ];

  // Footer sections
  const footers = [
    {
      title: 'Quick Links',
      items: mainMenuItems
    },
  ];

  return (
    <footer className={classes.footer}>
      <Container className={classes.root} fixed={isMobile}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <div className={classes.logo}>
              <Logo type="landscape" size="small" />
            </div>
            <Typography color="textPrimary" className={classes.footerDesc} gutterBottom>
              {t('ai-landing.banner_desc')}
            </Typography>
            {isDesktop && <Copyright />}
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container justifyContent="space-evenly">
              {footers.map(footer => (
                <Grid item xs={12} md={12} key={footer.title} className={classes.siteMapItem}>
                  {isDesktop && (
                    <div>
                      <Typography variant="h6" className={classes.title} color="textPrimary" gutterBottom>
                        {footer.title}
                      </Typography>
                      <Grid container spacing={2}>
                        {footer.items.map((item, index) => (
                          <Grid item xs={6} md={4} key={index}>
                            <Link
                              component={LocaleLink}
                              to={item.link}
                              variant="subtitle1"
                              color="textSecondary"
                              underline="hover"
                              sx={{ display: 'block', mb: 1 }}
                            >
                              {item.name}
                            </Link>
                          </Grid>
                        ))}
                      </Grid>
                    </div>
                  )}
                  {isMobile && (
                    <Accordion
                      square
                      classes={{
                        root: classes.accordionRoot,
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon className={classes.accordionIcon} />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        classes={{
                          content: classes.accordionContent,
                        }}
                      >
                        <strong>
                          {footer.title}
                        </strong>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={1}>
                          {footer.items.map((item, index) => (
                            <Grid item xs={6} key={index}>
                              <Link
                                component={LocaleLink}
                                to={item.link}
                                variant="subtitle1"
                                color="textSecondary"
                                underline="hover"
                                sx={{ display: 'block', mb: 1 }}
                              >
                                {item.name}
                              </Link>
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} md={3}>
            <div className={classes.socmed}>
              <IconButton aria-label="FB" className={classes.margin} size="small">
                <i className="ion-logo-twitter" />
              </IconButton>
              <IconButton aria-label="TW" className={classes.margin} size="small">
                <i className="ion-logo-facebook" />
              </IconButton>
              <IconButton aria-label="IG" className={classes.margin} size="small">
                <i className="ion-logo-instagram" />
              </IconButton>
              <IconButton aria-label="LI" className={classes.margin} size="small">
                <i className="ion-logo-linkedin" />
              </IconButton>
            </div>
            <SelectLang toggleDir={toggleDir} />
          </Grid>
        </Grid>
        {isMobile && (
          <div className={align.textCenter}>
            <Box p={{ md: 4 }}>
              <Copyright />
            </Box>
          </div>
        )}
      </Container>
    </footer>
  );
}

Footer.propTypes = {
  toggleDir: PropTypes.func,
};

Footer.defaultProps = {
  toggleDir: () => {},
};

export default Footer;
