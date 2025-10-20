import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';
import CheckIcon from '@mui/icons-material/Check';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { useRouter } from 'next/router';
import Image from 'next/image';
import languageDetector from 'lib/languageDetector';
import i18nextConfig from '../../../next-i18next.config';

const LanguageSwitch = ({
  locale,
  checked,
  toggleDir,
  ssg,
  closePopup,
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  // Map language codes to flag image paths
  const flagMap = {
    en: '/images/FLAGS/GB.png',
    de: '/images/FLAGS/DE.png', // Will need to add this file
    id: '/images/FLAGS/ID.png',
    ar: '/images/FLAGS/SA.png',
    pt: '/images/FLAGS/PT.png',
    zh: '/images/FLAGS/CN.png',
    ru: '/images/FLAGS/RU.png',
    ur: '/images/FLAGS/PK.png',
    ko: '/images/FLAGS/KR.png',
    fa: '/images/FLAGS/IR.png',
  };

  const changeLang = lang => {
    languageDetector.cache(lang);
    closePopup();

    if (i18nextConfig.ssg) {
      let href = router.asPath;
      let pName = router.pathname;
      Object.keys(router.query).forEach((k) => {
        if (k === 'locale') {
          pName = pName.replace(`[${k}]`, lang);
          return;
        }
        pName = pName.replace(`[${k}]`, router.query[k]);
      });
      if (lang) {
        href = pName;
      }
      router.push(href);
    } else {
      const { pathname, asPath, query } = router;
      router.push({ pathname, query }, asPath, { locale: lang });
    }

    if (lang === 'ar' || lang === 'ur' || lang === 'fa') {
      toggleDir('rtl');
    } else {
      toggleDir('ltr');
    }
  };

  return ssg ? (
    <ListItem
      role={undefined}
      dense
      button
      onClick={() => changeLang(locale)}
    >
      <ListItemIcon style={{ minWidth: '40px' }}>
        <img 
          src={flagMap[locale]} 
          alt={`${locale} flag`}
          style={{ 
            width: '28px',
            height: '20px',
            objectFit: 'cover',
            borderRadius: '3px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />
      </ListItemIcon>
      <ListItemText primary={t(locale)} />
      {checked && (
        <ListItemSecondaryAction>
          <CheckIcon color="primary" />
        </ListItemSecondaryAction>
      )}
    </ListItem>
  ) : (
    <ListItem
      role={undefined}
      dense
      button
      onClick={() => changeLang(locale)}
    >
      <ListItemIcon style={{ minWidth: '40px' }}>
        <img 
          src={flagMap[locale]} 
          alt={`${locale} flag`}
          style={{ 
            width: '28px',
            height: '20px',
            objectFit: 'cover',
            borderRadius: '3px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />
      </ListItemIcon>
      <ListItemText primary={t(locale)} />
      {checked && (
        <ListItemSecondaryAction>
          <CheckIcon color="primary" />
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

LanguageSwitch.propTypes = {
  locale: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  toggleDir: PropTypes.func.isRequired,
  closePopup: PropTypes.func.isRequired,
  ssg: PropTypes.bool,
};

LanguageSwitch.defaultProps = {
  ssg: false,
};

export default LanguageSwitch;
