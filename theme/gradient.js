const gradient = (theme) => {
  // Defensive checks for SSR safety
  if (!theme || !theme.palette || !theme.palette.primary || !theme.palette.secondary) {
    return {
      primary: { dark: '', light: '' },
      secondary: { dark: '', light: '' },
      accent: '',
      double: { light: '', main: '', dark: '', primary: '', secondary: '', accent: '' },
      triple: { light: '', main: '', dark: '' }
    };
  }

  // Ensure accent palette exists (SSR safety)
  const accent = theme.palette.accent || theme.palette.secondary;
  const direction = theme.direction || 'ltr';
  const white = theme.palette.common?.white || '#FFFFFF';
  
  return {
    primary: {
      dark: `linear-gradient(148deg, ${theme.palette.primary.dark} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.primary.main} 100%)`,
      light: `linear-gradient(148deg, ${theme.palette.primary.light} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.primary.main} 100%)`,
    },
    secondary: {
      dark: `linear-gradient(148deg, ${theme.palette.secondary.main} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.secondary.dark} 100%)`,
      light: `linear-gradient(148deg, ${theme.palette.secondary.main} ${direction === 'rtl' ? '100%' : '0%'}, ${white} 100%)`,
    },
    accent: `linear-gradient(148deg, ${accent.main} ${direction === 'rtl' ? '100%' : '0%'}, ${accent.light} 100%)`,
    double: {
      light: `linear-gradient(148deg, ${theme.palette.secondary.light} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.primary.light} 100%)`,
      main: `linear-gradient(148deg, ${theme.palette.primary.main} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.secondary.main} 100%)`,
      dark: `linear-gradient(148deg, ${theme.palette.secondary.dark} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.primary.dark} 100%)`,
      primary: `linear-gradient(148deg, ${accent.main} -20%, ${theme.palette.primary.main} 80%)`,
      secondary: `linear-gradient(148deg, ${theme.palette.secondary.main} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.primary.main} 100%)`,
      accent: `linear-gradient(148deg, ${accent.main} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.secondary.main} 100%)`,
    },
    triple: {
      light: `linear-gradient(148deg, ${theme.palette.secondary.light} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.primary.light} 46%, ${accent.light} 100%)`,
      main: `linear-gradient(148deg, ${theme.palette.primary.main} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.secondary.main} 50%, ${accent.main} 100%)`,
      dark: `linear-gradient(148deg, ${theme.palette.primary.dark} ${direction === 'rtl' ? '100%' : '0%'}, ${theme.palette.secondary.dark} 46%, ${accent.dark} 100%)`
    }
  };
};

export default gradient;
