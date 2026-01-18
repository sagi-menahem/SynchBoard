import React from 'react';
import { useTranslation } from 'react-i18next';

import { Dot } from '../../common';
import { SCREENSHOTS } from '../../../constants/landingContent';
import { FadeInView } from '../../animations';
import { Container } from '../../layout';
import ScreenshotCard from '../../ui/ScreenshotCard';

import styles from './ScreenshotsSection.module.scss';

/**
 * Screenshots section displaying app interface examples.
 * Shows workspace screenshots in a responsive grid layout.
 */
const ScreenshotsSection: React.FC = () => {
  const { t } = useTranslation(['landing']);

  return (
    <Container withBorders as="section" id="screenshots" className={styles.screenshots}>
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />
      <FadeInView>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('landing:screenshots.sectionTitle')}</h2>
          <p className={styles.sectionSubtitle}>{t('landing:screenshots.sectionSubtitle')}</p>
        </div>
      </FadeInView>

      <div className={styles.screenshotGrid}>
        {SCREENSHOTS.map((screenshot, index) => (
          <FadeInView
            key={screenshot.id}
            delay={index * 0.15}
            direction={index % 2 === 0 ? 'left' : 'right'}
          >
            <ScreenshotCard
              src={screenshot.src}
              alt={screenshot.alt}
              caption={t(screenshot.captionKey)}
            />
          </FadeInView>
        ))}
      </div>
    </Container>
  );
};

export default ScreenshotsSection;
