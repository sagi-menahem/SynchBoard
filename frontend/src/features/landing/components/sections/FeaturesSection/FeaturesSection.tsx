import React from 'react';
import { useTranslation } from 'react-i18next';

import { Dot } from '../../common';
import { FEATURES } from '../../../constants/landingContent';
import { FadeInView } from '../../animations';
import { Container } from '../../layout';
import FeatureCard from '../../ui/FeatureCard';

import styles from './FeaturesSection.module.scss';

/**
 * Features section showcasing the main capabilities of SynchBoard.
 * Displays feature cards in a responsive grid with scroll animations.
 */
const FeaturesSection: React.FC = () => {
  const { t } = useTranslation(['landing']);

  return (
    <Container withBorders as="section" id="features" className={styles.features}>
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />
      <FadeInView>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('landing:features.sectionTitle')}</h2>
          <p className={styles.sectionSubtitle}>{t('landing:features.sectionSubtitle')}</p>
        </div>
      </FadeInView>

      <div className={styles.featureGrid}>
        {FEATURES.map((feature, index) => (
          <FadeInView key={feature.id} delay={index * 0.1}>
            <FeatureCard
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
            />
          </FadeInView>
        ))}
      </div>
    </Container>
  );
};

export default FeaturesSection;
