import React from 'react';
import PropTypes from 'prop-types';
import { useSpacing } from 'theme/common';
import Header from 'components/Header';
import Subscribe from 'components/SubscribeForm';
import singleMenu from 'components/Header/data/single';
import Footer from 'components/Footer';

function HomeLayout(props) {
  const { classes, cx } = useSpacing();
  const {
    onToggleDark,
    onToggleDir,
    children,
    home,
    menu,
    footerDeco,
    prefix,
    subscribe
  } = props;

  const FooterDeco = footerDeco;

  return (
    <div className={classes.mainWrap} style={{ margin: 0, padding: 0 }}>
      <Header
        onToggleDark={onToggleDark}
        onToggleDir={onToggleDir}
        menu={menu}
        home={home}
        prefix={prefix}
      />
      <main className={cx(classes.containerFront, classes.containerWrap)} style={{ paddingTop: 0, marginTop: 0 }}>
        {children}
      </main>
      <FooterDeco>
        {subscribe && (
          <div className={classes.spaceBottomShort}>
            <Subscribe />
          </div>
        )}
        <Footer toggleDir={onToggleDir} />
      </FooterDeco>
    </div>
  );
}

HomeLayout.propTypes = {
  onToggleDark: PropTypes.func.isRequired,
  onToggleDir: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  menu: PropTypes.array,
  home: PropTypes.bool,
  prefix: PropTypes.string,
  footerDeco: PropTypes.elementType,
  subscribe: PropTypes.bool,
};

HomeLayout.defaultProps = {
  menu: singleMenu.inner,
  home: false,
  prefix: 'ai-landing',
  footerDeco: 'div',
  subscribe: false,
};

export default HomeLayout;
