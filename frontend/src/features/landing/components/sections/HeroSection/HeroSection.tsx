import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';

import { GITHUB_URL } from '../../../constants/landingContent';
import { Dot } from '../../common';
import { Container } from '../../layout';

import styles from './HeroSection.module.scss';

interface HeroSectionProps {
  onGetStarted: () => void;
}

/**
 * Main hero section with headline, subheadline, and CTAs.
 * Centered layout matching the template design.
 * Uses CSS animations for faster LCP.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation(['landing']);

  return (
    <Container withBorders className={styles.hero}>
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />

      {/* Headline */}
      <h1 className={`${styles.headline} ${styles.animateFadeInUp}`}>
        Collaborate in Real-Time on <br />
        Shared <span className={styles.highlight}>Whiteboards</span>
      </h1>

      {/* Subheadline */}
      <p className={`${styles.subheadline} ${styles.animateFadeInUp} ${styles.animateDelay1}`}>
        {t('landing:hero.subheadline')}
      </p>

      {/* CTAs */}
      <div className={`${styles.ctaGroup} ${styles.animateFadeInUp} ${styles.animateDelay2}`}>
        <Button variant="primary" onClick={onGetStarted}>
          {t('landing:hero.ctaPrimary')}
        </Button>
        <Button variant="secondary-glass" onClick={() => window.open(GITHUB_URL, '_blank')}>
          {t('landing:hero.ctaSecondary')}
        </Button>
      </div>
    </Container>
  );
};

export default HeroSection;
