import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { useTranslation } from 'next-i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useStyles from '../header-style';

function PageNav(props) {
  const { classes, cx } = useStyles();
  const { t } = useTranslation('common');
  const pathname = usePathname();
  const router = useRouter();

  const { menu, prefix } = props;
  const locale = router.query.locale || 'en';

  return (
    <ul className={classes.scrollactiveNav}>
      {menu.map(item => {
        const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link));
        const fullPath = item.link;
        
        return (
          <li key={item.id} className={isActive ? 'active' : ''}>
            <Link href={fullPath} passHref legacyBehavior>
              <a className={isActive ? classes.activeLink : ''} style={{ textDecoration: 'none', color: 'inherit', padding: '8px 16px', display: 'inline-block' }}>
                {t(`ai-landing.${item.name}`)}
              </a>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

PageNav.propTypes = {
  menu: PropTypes.array.isRequired,
  prefix: PropTypes.string.isRequired,
};

export default PageNav;

