import React, { Fragment, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { 
  Container, 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { 
  PersonAdd as RegisterIcon,
  Description as VisaIcon,
  Hotel as HotelIcon,
  DirectionsBus as TransportIcon,
  OpenInNew as OpenIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import { useSpacing } from 'theme/common';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import MediaBanner from 'components/HeroBanner/MediaBanner';
import ParallaxDeco from 'components/Parallax3d/Ufo';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';
import imgAPI from 'public/images/imgAPI';
import { useRouter } from 'next/router';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`guide-tabpanel-${index}`}
      aria-labelledby={`guide-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Guide() {
  const { classes } = useSpacing();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const isRTL = ['ar', 'ur', 'fa'].includes(router.locale);
  
  // Wait for router to be ready with locale
  if (!router.isReady) {
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Fragment>
      <Head>
        <title>
          {brand.name + ' - ' + t('ai-landing.guide_page_title')}
        </title>
        {isRTL && (
          <>
            <link
              href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap"
              rel="stylesheet"
            />
            <style>{`
              * {
                font-family: 'Tajawal', sans-serif !important;
              }
            `}</style>
          </>
        )}
      </Head>
      <CssBaseline />
      <div className={classes.innerPage}>
        <section id="banner">
          <MediaBanner
            title={t('ai-landing.guide_banner_title')}
            cover={imgAPI.inner[19]}
            featured={['/images/A.jpg', '/images/B.jpg', '/images/C.jpg']}
            decoration={() => <ParallaxDeco type="scroll" />}
          />
        </section>
        
        <Container sx={{ mt: 5, mb: 10 }}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body1">
              {t('ai-landing.guide_intro_message')}
            </Typography>
          </Alert>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  textTransform: 'none',
                }
              }}
            >
              <Tab 
                icon={<RegisterIcon />} 
                iconPosition="start" 
                label={t('ai-landing.guide_tab_register')} 
              />
              <Tab 
                icon={<VisaIcon />} 
                iconPosition="start" 
                label={t('ai-landing.guide_tab_visa')} 
              />
              <Tab 
                icon={<HotelIcon />} 
                iconPosition="start" 
                label={t('ai-landing.guide_tab_hotel')} 
              />
              <Tab 
                icon={<TransportIcon />} 
                iconPosition="start" 
                label={t('ai-landing.guide_tab_transportation')} 
              />
            </Tabs>
          </Box>

          {/* REGISTER TAB */}
          <TabPanel value={activeTab} index={0}>
            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
                  {t('ai-landing.guide_register_title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {t('ai-landing.guide_register_intro')}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Stepper orientation="vertical">
                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_register_step1_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_register_step1_desc')}</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_register_step1_point1')} color="success" />
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_register_step1_point2')} color="success" />
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_register_step1_point3')} color="success" />
                        </Stack>
                      </Box>
                      <Button 
                        variant="contained" 
                        endIcon={<OpenIcon />}
                        onClick={() => openInNewTab(`/${router.locale}/register`)}
                        sx={{ mt: 1 }}
                      >
                        {t('ai-landing.guide_go_to_register')}
                      </Button>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_register_step2_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_register_step2_desc')}</Typography>
                      <Alert severity="warning" sx={{ my: 2 }}>
                        <Typography variant="body2">
                          {t('ai-landing.guide_register_step2_note')}
                        </Typography>
                      </Alert>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_register_step3_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_register_step3_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_register_step4_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_register_step4_desc')}</Typography>
                    </StepContent>
                  </Step>
                </Stepper>

                <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'primary.50' }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {t('ai-landing.guide_important_notes')}
                  </Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_register_note1')}</Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_register_note2')}</Typography>
                  <Typography variant="body2">• {t('ai-landing.guide_register_note3')}</Typography>
                </Paper>
              </CardContent>
            </Card>
          </TabPanel>

          {/* VISA TAB */}
          <TabPanel value={activeTab} index={1}>
            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
                  {t('ai-landing.guide_visa_title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {t('ai-landing.guide_visa_intro')}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Stepper orientation="vertical">
                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_visa_step1_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_visa_step1_desc')}</Typography>
                      <Button 
                        variant="contained" 
                        endIcon={<OpenIcon />}
                        onClick={() => openInNewTab(`/${router.locale}/visa`)}
                        sx={{ mt: 1 }}
                      >
                        {t('ai-landing.guide_go_to_visa')}
                      </Button>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_visa_step2_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_visa_step2_desc')}</Typography>
                      <Alert severity="info" sx={{ my: 2 }}>
                        <Typography variant="body2">
                          {t('ai-landing.guide_visa_step2_note')}
                        </Typography>
                      </Alert>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_visa_step3_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_visa_step3_desc')}</Typography>
                      <Box sx={{ my: 2 }}>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          {t('ai-landing.guide_visa_required_docs')}:
                        </Typography>
                        <Stack spacing={1}>
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_visa_doc1')} color="primary" variant="outlined" />
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_visa_doc2')} color="primary" variant="outlined" />
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_visa_doc3')} color="primary" variant="outlined" />
                          <Chip icon={<CheckIcon />} label={t('ai-landing.guide_visa_doc4')} color="primary" variant="outlined" />
                        </Stack>
                      </Box>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_visa_step4_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_visa_step4_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_visa_step5_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_visa_step5_desc')}</Typography>
                      <Alert severity="success" sx={{ my: 2 }}>
                        <Typography variant="body2">
                          {t('ai-landing.guide_visa_step5_note')}
                        </Typography>
                      </Alert>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_visa_step6_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_visa_step6_desc')}</Typography>
                    </StepContent>
                  </Step>
                </Stepper>

                <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'warning.50' }}>
                  <Typography variant="h6" gutterBottom color="warning.dark">
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {t('ai-landing.guide_important_notes')}
                  </Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_visa_note1')}</Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_visa_note2')}</Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_visa_note3')}</Typography>
                  <Typography variant="body2">• {t('ai-landing.guide_visa_note4')}</Typography>
                </Paper>
              </CardContent>
            </Card>
          </TabPanel>

          {/* HOTEL TAB */}
          <TabPanel value={activeTab} index={2}>
            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
                  {t('ai-landing.guide_hotel_title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {t('ai-landing.guide_hotel_intro')}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Stepper orientation="vertical">
                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step1_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step1_desc')}</Typography>
                      <Button 
                        variant="contained" 
                        endIcon={<OpenIcon />}
                        onClick={() => openInNewTab(`/${router.locale}/hotel`)}
                        sx={{ mt: 1 }}
                      >
                        {t('ai-landing.guide_go_to_hotel')}
                      </Button>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step2_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step2_desc')}</Typography>
                      <Alert severity="info" sx={{ my: 2 }}>
                        <Typography variant="body2">
                          {t('ai-landing.guide_hotel_step2_note')}
                        </Typography>
                      </Alert>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step3_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step3_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step4_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step4_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step5_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step5_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step6_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step6_desc')}</Typography>
                      <Alert severity="success" sx={{ my: 2 }}>
                        <Typography variant="body2">
                          {t('ai-landing.guide_hotel_step6_note')}
                        </Typography>
                      </Alert>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_hotel_step7_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_hotel_step7_desc')}</Typography>
                    </StepContent>
                  </Step>
                </Stepper>

                <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'info.50' }}>
                  <Typography variant="h6" gutterBottom color="info.dark">
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {t('ai-landing.guide_important_notes')}
                  </Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_hotel_note1')}</Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_hotel_note2')}</Typography>
                  <Typography variant="body2">• {t('ai-landing.guide_hotel_note3')}</Typography>
                </Paper>
              </CardContent>
            </Card>
          </TabPanel>

          {/* TRANSPORTATION TAB */}
          <TabPanel value={activeTab} index={3}>
            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
                  {t('ai-landing.guide_transport_title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {t('ai-landing.guide_transport_intro')}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Stepper orientation="vertical">
                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_transport_step1_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_transport_step1_desc')}</Typography>
                      <Button 
                        variant="contained" 
                        endIcon={<OpenIcon />}
                        onClick={() => openInNewTab(`/${router.locale}/transportation`)}
                        sx={{ mt: 1 }}
                      >
                        {t('ai-landing.guide_go_to_transport')}
                      </Button>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_transport_step2_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_transport_step2_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_transport_step3_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_transport_step3_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_transport_step4_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_transport_step4_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_transport_step5_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_transport_step5_desc')}</Typography>
                    </StepContent>
                  </Step>

                  <Step active>
                    <StepLabel>
                      <Typography variant="h6" fontWeight="600">
                        {t('ai-landing.guide_transport_step6_title')}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography paragraph>{t('ai-landing.guide_transport_step6_desc')}</Typography>
                    </StepContent>
                  </Step>
                </Stepper>

                <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'success.50' }}>
                  <Typography variant="h6" gutterBottom color="success.dark">
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {t('ai-landing.guide_important_notes')}
                  </Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_transport_note1')}</Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_transport_note2')}</Typography>
                  <Typography variant="body2" paragraph>• {t('ai-landing.guide_transport_note3')}</Typography>
                  <Typography variant="body2">• {t('ai-landing.guide_transport_note4')}</Typography>
                </Paper>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Quick Links Card */}
          <Card elevation={3} sx={{ mt: 5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="white">
                {t('ai-landing.guide_quick_links_title')}
              </Typography>
              <Typography variant="body2" paragraph sx={{ opacity: 0.95, color: 'white' }}>
                {t('ai-landing.guide_quick_links_desc')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => openInNewTab(`/${router.locale}/register`)}
                  sx={{ 
                    bgcolor: '#ffffff', 
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: '#f0f0f0',
                      color: '#5568d3'
                    }
                  }}
                >
                  {t('ai-landing.guide_tab_register')}
                </Button>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => openInNewTab(`/${router.locale}/visa`)}
                  sx={{ 
                    bgcolor: '#ffffff', 
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: '#f0f0f0',
                      color: '#5568d3'
                    }
                  }}
                >
                  {t('ai-landing.guide_tab_visa')}
                </Button>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => openInNewTab(`/${router.locale}/hotel`)}
                  sx={{ 
                    bgcolor: '#ffffff', 
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: '#f0f0f0',
                      color: '#5568d3'
                    }
                  }}
                >
                  {t('ai-landing.guide_tab_hotel')}
                </Button>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => openInNewTab(`/${router.locale}/transportation`)}
                  sx={{ 
                    bgcolor: '#ffffff', 
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': { 
                      bgcolor: '#f0f0f0',
                      color: '#5568d3'
                    }
                  }}
                >
                  {t('ai-landing.guide_tab_transportation')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </div>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

Guide.getLayout = (page, pageProps) => (
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

export default Guide;

