import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';

import { OrbitingLogos } from '../../animations';
import { Dot } from '../../common';
import { Container } from '../../layout';

import styles from './CTASection.module.scss';

interface CTASectionProps {
  onGetStarted: () => void;
}

/**
 * Call-to-action section with orbiting tech logos animation.
 * Layout matches the Nodus template CTA component.
 */
const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation(['landing']);

  return (
    <Container withBorders className={styles.cta}>
      <Dot top left />
      <Dot top right />

      {/* Orbiting logos centered behind content */}
      <OrbitingLogos className={styles.orbit} size={600} />

      {/* Content - centered and positioned above orbit */}
      <h2 className={styles.headline}>{t('landing:cta.headline')}</h2>

      <Button variant="primary" onClick={onGetStarted} className={styles.ctaButton}>
        {t('landing:cta.ctaPrimary')}
      </Button>
    </Container>
  );
};

export default CTASection;
