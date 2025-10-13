import React, { Fragment, useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { getStaticPaths, makeStaticProps } from 'lib/getStatic';
import singleMenu from 'components/Header/data/single';
import HomeLayout from 'components/Layouts/Home';
import FooterDeco from 'components/Footer/Decoration/General';
import brand from 'public/text/brand';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

function ChampionshipOutline() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [eventData, setEventData] = useState(null);
  
  // Glassmorphic card style
  const glassCard = {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 4,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)'}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  };

  useEffect(() => {
    fetch('/details.json')
      .then(res => res.json())
      .then(data => setEventData(data))
      .catch(err => console.error('Error loading event data:', err));
  }, []);

  if (!eventData) {
    return <Container sx={{ py: 10, textAlign: 'center' }}><Typography>Loading...</Typography></Container>;
  }

  return (
    <Fragment>
      <Head>
        <title>{brand.name} - Championship Information</title>
      </Head>
      <CssBaseline />
      
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
        color: 'white',
        pt: 12,
        pb: 8,
        mb: 6
      }}>
        <Container>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, textAlign: 'center' }}>
            {eventData.event_name}
          </Typography>
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, opacity: 0.9 }}>
            {eventData.event_type}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Chip icon={<EventIcon />} label={eventData.dates} sx={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              fontSize: '1.1rem',
              py: 3
            }} />
            <Chip icon={<LocationOnIcon />} label={`${eventData.location.city}, ${eventData.location.country}`} sx={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontSize: '1.1rem',
              py: 3
            }} />
          </Box>
        </Container>
      </Box>

      <Container sx={{ pb: 10 }}>
        
        {/* Event Overview */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', ...glassCard }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon />
                  Organizer
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{eventData.organizer.name}</Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>{eventData.organizer.address}</Typography>
                <Divider sx={{ my: 2 }} />
                {eventData.organizer.contacts.map((contact, idx) => (
                  <Box key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {contact.type === 'email' ? <EmailIcon fontSize="small" /> : <PhoneIcon fontSize="small" />}
                    <Typography variant="body2">{contact.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', ...glassCard }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon />
                  Competition Venue
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{eventData.venue.name}</Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>{eventData.venue.address}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', ...glassCard }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  Event Director
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{eventData.event_director.name}</Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{eventData.event_director.phone}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Competition Details */}
        <Card elevation={0} sx={{ mb: 6, ...glassCard }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Competition Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Ranking</Typography>
                <Typography variant="body2">Seniors: {eventData.competition.ranking.seniors}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Rules</Typography>
                <Typography variant="body2">{eventData.competition.rules}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Competition System</Typography>
                <Typography variant="body2">{eventData.competition.system}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Seeding</Typography>
                <Typography variant="body2">{eventData.competition.seeding.seniors}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Contest Time Table */}
        <Card elevation={0} sx={{ ...glassCard, mb: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon />
              Contest Duration
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Division</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Rounds</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Time per Round</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Break</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventData.competition.contest_time.map((contest, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { background: 'rgba(99, 102, 241, 0.05)' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{contest.division}</TableCell>
                      <TableCell>{contest.rounds}</TableCell>
                      <TableCell>{contest.time_per_round}</TableCell>
                      <TableCell>{contest.break}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Medal Events */}
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, textAlign: 'center', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 40 }} />
          Medal Events
        </Typography>
        
        {Object.entries(eventData.medal_events).map(([division, genders]) => (
          <Accordion key={division} defaultExpanded elevation={0} sx={{ mb: 2, ...glassCard }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: 'rgba(99, 102, 241, 0.08)', borderRadius: '16px 16px 0 0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{division}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {Object.entries(genders).map(([gender, categories]) => (
                  <Grid item xs={12} md={6} key={gender}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: gender === 'Male' ? 'primary.main' : 'secondary.main' }}>
                      {gender}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {categories.map((category, idx) => (
                        <Chip key={idx} label={category} color={gender === 'Male' ? 'primary' : 'secondary'} variant="outlined" sx={{ fontWeight: 600 }} />
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Eligibility */}
        <Card elevation={0} sx={{ ...glassCard, mb: 6, mt: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Eligibility Requirements
            </Typography>
            
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Athletes</Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="License" secondary={eventData.eligibility.athletes.license} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Union Membership" secondary={eventData.eligibility.athletes.union} />
              </ListItem>
            </List>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>Certificate Requirements:</Typography>
            {Object.entries(eventData.eligibility.athletes.certificate_requirements).map(([div, req]) => (
              <Typography key={div} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                <strong>{div}:</strong> {req}
              </Typography>
            ))}

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>Birth Years:</Typography>
            {Object.entries(eventData.eligibility.athletes.birth_years).map(([div, year]) => (
              <Typography key={div} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                <strong>{div}:</strong> {year}
              </Typography>
            ))}

            <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, border: '2px solid', borderColor: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {eventData.eligibility.athletes.note}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Coaches</Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Minimum Age" secondary={`${eventData.eligibility.coaches.minimum_age} years old`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Certificate" secondary={eventData.eligibility.coaches.certificate} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="License" secondary={eventData.eligibility.coaches.license} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Finals Attire" secondary={eventData.eligibility.coaches.attire_finals} />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Registration & Fees */}
        <Card elevation={0} sx={{ ...glassCard, mb: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Registration & Fees
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Registration Method:</strong> {eventData.sport_entries_and_fees.entry_method}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>Deadline:</strong> <Chip label={eventData.sport_entries_and_fees.registration_deadline} color="error" size="small" />
            </Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventData.sport_entries_and_fees.fees.map((fee, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { background: 'rgba(99, 102, 241, 0.05)' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{fee.description}</TableCell>
                      <TableCell><Chip label={fee.amount} color="success" size="small" /></TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{fee.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card elevation={0} sx={{ ...glassCard, mb: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Sport Equipment
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>PSS System:</strong> {eventData.sport_equipment.pss_system}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Compulsory Equipment (by contestant):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {eventData.sport_equipment.compulsory_equipment_by_contestant.map((item, idx) => (
                <Chip key={idx} label={item} color="primary" variant="outlined" />
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <WarningIcon color="warning" fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {eventData.sport_equipment.compliance}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <LocationOnIcon color="info" fontSize="small" />
              <Typography variant="body2">{eventData.sport_equipment.sensor_socks_sales}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Schedule */}
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, textAlign: 'center', color: 'primary.main' }}>
          Event Schedule
        </Typography>
        <TableContainer component={Paper} elevation={0} sx={{ ...glassCard, mb: 6 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Activity</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Division</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventData.detailed_schedule.map((schedule, idx) => (
                <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { background: 'rgba(99, 102, 241, 0.05)' }, '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{schedule.date}</TableCell>
                  <TableCell>{schedule.time || '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{schedule.activity}</TableCell>
                  <TableCell>{schedule.location || '-'}</TableCell>
                  <TableCell>{schedule.division || 'All'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Logistics */}
        <Card elevation={0} sx={{ ...glassCard, mb: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Logistics & Services
            </Typography>
            
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Random Weigh-in</Typography>
            <Typography variant="body2" sx={{ ml: 2 }}>
              <strong>Time:</strong> {eventData.logistics.random_weigh_in.time}
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, mb: 2 }}>
              <strong>Publication:</strong> {eventData.logistics.random_weigh_in.publication_time} on {eventData.logistics.random_weigh_in.publication_platforms.join(', ')}
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 3 }}>Accommodation & Visa</Typography>
            <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
              <strong>Transportation:</strong> {eventData.logistics.accommodation_and_visa.transportation_provided}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>Free Visa Criteria:</Typography>
            <Box sx={{ ml: 2 }}>
              {eventData.logistics.accommodation_and_visa.free_visa_criteria.map((criteria, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2">{criteria}</Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 2, p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2">
                <EmailIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Visa Submission: <strong>{eventData.logistics.accommodation_and_visa.visa_submission_email}</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Awards */}
        <Card elevation={0} sx={{ ...glassCard, mb: 6 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon />
              Awards
            </Typography>
            <Grid container spacing={2}>
              {eventData.awards.map((award, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: award.place === '1st' 
                      ? 'linear-gradient(135deg, #ffd700, #ffed4e)' 
                      : award.place === '2nd' 
                      ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)'
                      : 'linear-gradient(135deg, #cd7f32, #e59866)',
                    borderRadius: 2,
                    boxShadow: 3
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#000' }}>{award.place}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#000', textTransform: 'uppercase' }}>
                      {award.medal}
                    </Typography>
                    {award.note && (
                      <Typography variant="caption" sx={{ color: '#000', display: 'block', mt: 1 }}>
                        {award.note}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Sanctioned By */}
        <Card elevation={0} sx={{ ...glassCard }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
              Sanctioned By
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center', color: 'primary.main' }}>
              {eventData.sanctioned_by.name}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, opacity: 0.8 }}>
              {eventData.sanctioned_by.address}
            </Typography>
          </CardContent>
        </Card>

      </Container>
    </Fragment>
  );
}

const getStaticProps = makeStaticProps(['common']);
export { getStaticPaths, getStaticProps };

ChampionshipOutline.getLayout = (page, pageProps) => (
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

export default ChampionshipOutline;

