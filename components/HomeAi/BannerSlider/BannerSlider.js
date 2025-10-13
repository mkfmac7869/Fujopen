import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useSpring, animated } from 'react-spring';
import link from 'public/text/link';
import imgAPI from 'public/images/imgAPI';
import { useText, useTextGradient } from 'theme/common';
import LocaleLink from '../../Link';
import useStyles from './slider-style';

const calc = (x, y) => [x - window.innerWidth / 2, y - window.innerHeight / 2];
const trans1 = (x, y) => `translate3d(${x / 10}px,${y / 10}px,0)`;
const trans2 = (x, y) => `translate3d(${x / 8 + 35}px,${y / 8 - 230}px,0)`;
const trans3 = (x, y) => `translate3d(${x / 6 - 250}px,${y / 6 - 200}px,0)`;
const trans4 = (x, y) => `translate3d(${x / 4 + 35}px,${y / 4 - 230}px,0)`;

function BannerSlider() {
  // Theme breakpoints
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [position, setPosition] = useSpring(() => ({ xy: [0, 0], config: { mass: 300, tension: 200, friction: 240 } }));

  const { classes, cx } = useStyles();
  const { classes: text } = useText();
  const { classes: gradient } = useTextGradient();

  const { t } = useTranslation('common');
  const router = useRouter();
  const isArabic = router.query.locale === 'ar';
  
  // Use RTL image for Arabic, normal image for other languages
  const backgroundImage = isArabic ? '/images/ai/2_rtl.png' : imgAPI.ai[0];

  return (
    <div className={classes.bannerWrap} style={{ margin: 0, padding: 0, top: 0 }}>
      <div className={classes.carousel} onMouseMove={({ clientX: x, clientY: y }) => setPosition.start({ xy: calc(x, y) })} style={{ margin: 0, padding: 0 }}>
        <div className={classes.slide} style={{ margin: 0, paddingTop: 0 }}>
          <div className={classes.inner}>
            <div className={cx(classes.img, classes.backgroundBanner)} style={{ margin: 0, padding: 0, top: 0, overflow: 'hidden' }}>
              <img 
                src={backgroundImage} 
                alt="background" 
                style={{ 
                  margin: 0, 
                  padding: 0, 
                  display: 'block',
                  width: isArabic ? '100%' : '110%',
                  height: isArabic ? '100%' : '110%',
                  objectFit: 'cover',
                  objectPosition: isArabic ? 'center' : 'center',
                  animation: isArabic ? 'none' : 'heroFloat 20s ease-in-out infinite',
                  willChange: 'transform'
                }} 
              />
            </div>
            <Container>
              <Grid spacing={6} container alignItems="center">
                <Grid item md={7} xs={12}>
                  <Box px={{ sm: 3 }}>
                    <div className={classes.text}>
                      <h4 className={text.title}>
                        {t('ai-landing.banner_title')}
                        <span className={cx(theme.palette.mode === 'dark' ? gradient.tripleLight : gradient.tripleMain, text.uppercase)}>
                          &nbsp;
                          {t('ai-landing.banner_highlight')}
                        </span>
                      </h4>
                      <h5 className={text.subtitle}>
                        {t('ai-landing.banner_desc')}
                      </h5>
                      <div className={classes.btnArea}>
                        <Button 
                          component={LocaleLink} 
                          size="large" 
                          variant="contained" 
                          to={link.register} 
                          className={cx(classes.button, classes.glassButton)}
                        >
                          {t('btn_get')}
                        </Button>
                        <Button component={LocaleLink} size="large" color="secondary" variant="outlined" to="/outline" className={classes.button}>
                          OUTLINE
                        </Button>
                      </div>
                    </div>
                  </Box>
                </Grid>
                <Grid item md={5} xs={12}>
                  <div className={classes.decoBanner}>
                    {isDesktop && (
                      <div className={classes.parallaxScene}>
                        <animated.div style={{ transform: position.xy.to(trans1) }}>
                          <span className={classes.hexa}>
                            <img src={imgAPI.ai[1]} alt="parallax" />
                          </span>
                        </animated.div>
                        <animated.div style={{ transform: position.xy.to(trans2) }}>
                          <span className={classes.head}>
                            <img src={imgAPI.ai[2]} alt="parallax" />
                          </span>
                        </animated.div>
                        <animated.div style={{ transform: position.xy.to(trans3) }}>
                          <span className={classes.chest}>
                            <img src={imgAPI.ai[3]} alt="parallax" />
                          </span>
                        </animated.div>
                        <animated.div style={{ transform: position.xy.to(trans4) }}>
                          <span className={classes.belt}>
                            <img src={imgAPI.ai[4]} alt="parallax" />
                          </span>
                        </animated.div>
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BannerSlider;
