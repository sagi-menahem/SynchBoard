import { motion } from 'framer-motion';
import { ExternalLink, Star } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';

import { GITHUB_URL } from '../../../constants/landingContent';
import { Container } from '../../layout';

import styles from './HeroSection.module.scss';

interface HeroSectionProps {
  onGetStarted: () => void;
}

/**
 * Main hero section with headline, subheadline, CTAs, and star ratings.
 * Centered layout matching the template design.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation(['landing']);

  return (
    <Container withBorders className={styles.hero}>
      {/* Badge */}
      <motion.div
        className={styles.badge}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('landing:hero.badge')}
      </motion.div>

      {/* Headline */}
      <motion.h1
        className={styles.headline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Collaborate in Real-Time on <br />
        Shared <span className={styles.highlight}>Whiteboards</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className={styles.subheadline}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {t('landing:hero.subheadline')}
      </motion.p>

      {/* CTAs */}
      <motion.div
        className={styles.ctaGroup}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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

      {/* Star Rating */}
      <motion.div
        className={styles.rating}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className={styles.stars}>
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: index * 0.05 }}
            >
              <Star size={16} fill="currentColor" className={styles.star} />
            </motion.div>
          ))}
        </div>
        <span className={styles.ratingDivider} />
        <span className={styles.ratingText}>Full-Stack Portfolio Project</span>
        <ExternalLink size={14} className={styles.ratingIcon} />
      </motion.div>
    </Container>
  );
};

export default HeroSection;
