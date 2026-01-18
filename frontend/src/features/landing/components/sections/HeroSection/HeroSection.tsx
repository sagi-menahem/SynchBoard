import { motion } from 'framer-motion';
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
      <motion.h1
        className={styles.headline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Collaborate in Real-Time on <br />
        Shared <span className={styles.highlight}>Whiteboards</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className={styles.subheadline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {t('landing:hero.subheadline')}
      </motion.p>

      {/* CTAs */}
      <motion.div
        className={styles.ctaGroup}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button variant="primary" onClick={onGetStarted}>
          {t('landing:hero.ctaPrimary')}
        </Button>
        <Button
          variant="secondary-glass"
          onClick={() => window.open(GITHUB_URL, '_blank')}
        >
          {t('landing:hero.ctaSecondary')}
        </Button>
      </motion.div>
    </Container>
  );
};

export default HeroSection;
