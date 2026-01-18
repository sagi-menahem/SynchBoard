import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
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

const ANIMATION_DURATION = 200; // ms - matches CSS animation duration

/**
 * Logo cloud section showing technology stack used in SynchBoard.
 * Logos animate with a swap effect at random intervals.
 * Uses pure CSS animations for performance (no Framer Motion).
 */
const LogoCloudSection: React.FC = () => {
  const { t } = useTranslation(['landing']);

  // Track which logos are displayed (indices)
  const [displayedIndices, setDisplayedIndices] = useState<number[]>(() =>
    Array.from({ length: Math.min(8, TECH_LOGOS.length) }, (_, i) => i)
  );

  // Track which position is currently animating (exiting)
  const [exitingPosition, setExitingPosition] = useState<number | null>(null);

  // Use ref to track animation keys for each position
  const animationKeysRef = useRef<number[]>(Array(8).fill(0));

  useEffect(() => {
    // Only animate if we have more logos than displayed
    if (TECH_LOGOS.length <= displayedIndices.length) return;

    const interval = setInterval(() => {
      const notDisplayedIndices = TECH_LOGOS
        .map((_, index) => index)
        .filter((index) => !displayedIndices.includes(index));

      if (notDisplayedIndices.length > 0) {
        const randomDisplayedPosition = Math.floor(Math.random() * displayedIndices.length);
        const randomNotDisplayedIndex = Math.floor(Math.random() * notDisplayedIndices.length);
        const newLogoIndex = notDisplayedIndices[randomNotDisplayedIndex];

        // Start exit animation
        setExitingPosition(randomDisplayedPosition);

        // After exit animation completes, swap the logo and trigger enter animation
        setTimeout(() => {
          setDisplayedIndices((prev) => {
            const newIndices = [...prev];
            newIndices[randomDisplayedPosition] = newLogoIndex;
            return newIndices;
          });
          // Increment animation key to force re-render and trigger enter animation
          animationKeysRef.current[randomDisplayedPosition]++;
          setExitingPosition(null);
        }, ANIMATION_DURATION);
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
          const isExiting = exitingPosition === position;

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
              <div
                key={`${logoIndex}-${animationKeysRef.current[position]}`}
                className={clsx(styles.logoWrapper, isExiting && styles.logoExiting)}
              >
                <Icon className={styles.logo} />
                <span className={styles.logoName}>{logo.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default LogoCloudSection;
