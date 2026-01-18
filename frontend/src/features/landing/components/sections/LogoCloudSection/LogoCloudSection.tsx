import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dot } from '../../common';
import {
  DockerLogo,
  JavaLogo,
  PostgreSQLLogo,
  ReactLogo,
  SpringLogo,
  TypeScriptLogo,
  WebSocketLogo,
  GitHubLogo,
} from '../../icons/TechLogos';
import { Container } from '../../layout';

import styles from './LogoCloudSection.module.scss';

// Tech logos used in SynchBoard
const TECH_LOGOS = [
  { id: 'react', Icon: ReactLogo, name: 'React' },
  { id: 'typescript', Icon: TypeScriptLogo, name: 'TypeScript' },
  { id: 'spring', Icon: SpringLogo, name: 'Spring Boot' },
  { id: 'java', Icon: JavaLogo, name: 'Java' },
  { id: 'postgresql', Icon: PostgreSQLLogo, name: 'PostgreSQL' },
  { id: 'docker', Icon: DockerLogo, name: 'Docker' },
  { id: 'websocket', Icon: WebSocketLogo, name: 'WebSocket' },
  { id: 'github', Icon: GitHubLogo, name: 'GitHub' },
];

/**
 * Logo cloud section showing technology stack used in SynchBoard.
 * Logos animate with a swap effect at random intervals.
 */
const LogoCloudSection: React.FC = () => {
  const { t } = useTranslation(['landing']);

  // Track which logos are displayed (indices)
  const [displayedIndices, setDisplayedIndices] = useState<number[]>(() =>
    Array.from({ length: Math.min(8, TECH_LOGOS.length) }, (_, i) => i)
  );

  useEffect(() => {
    // Only animate if we have more logos than displayed
    if (TECH_LOGOS.length <= displayedIndices.length) return;

    const interval = setInterval(() => {
      const notDisplayedIndices = TECH_LOGOS
        .map((_, index) => index)
        .filter((index) => !displayedIndices.includes(index));

      if (notDisplayedIndices.length > 0) {
        const randomDisplayedIndex = Math.floor(Math.random() * displayedIndices.length);
        const randomNotDisplayedIndex = Math.floor(Math.random() * notDisplayedIndices.length);
        const newLogoIndex = notDisplayedIndices[randomNotDisplayedIndex];

        setDisplayedIndices((prev) => {
          const newIndices = [...prev];
          newIndices[randomDisplayedIndex] = newLogoIndex;
          return newIndices;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [displayedIndices]);

  return (
    <Container withBorders className={styles.section}>
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />
      <h2 className={styles.heading}>{t('landing:logoCloud.heading')}</h2>
      <div className={styles.grid}>
        {displayedIndices.map((logoIndex, position) => {
          const logo = TECH_LOGOS[logoIndex];
          const { Icon } = logo;

          return (
            <div
              key={position}
              className={clsx(
                styles.logoCell,
                position % 2 === 0 && styles.borderRight,
                position < 6 && styles.borderBottomMobile,
                position % 4 !== 3 && styles.borderRightDesktop,
                position < 4 && styles.borderBottomDesktop
              )}
            >
              <div className={styles.hoverBg} />
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={logoIndex}
                  className={styles.logoWrapper}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, y: -100 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  whileHover={{ opacity: 1 }}
                >
                  <Icon className={styles.logo} />
                  <span className={styles.logoName}>{logo.name}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default LogoCloudSection;
