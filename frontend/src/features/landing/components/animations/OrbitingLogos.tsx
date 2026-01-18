import clsx from 'clsx';
import React from 'react';

import {
  DockerLogo,
  GitHubLogo,
  JavaLogo,
  PostgreSQLLogo,
  ReactLogo,
  SpringLogo,
  TypeScriptLogo,
  WebSocketLogo,
} from '../icons/TechLogos';

import styles from './OrbitingLogos.module.scss';

type SvgComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface OrbitingLogosProps {
  size?: number;
  className?: string;
  showRings?: boolean;
  numRings?: number;
}

/**
 * CTAOrbit-style component with multiple rings of orbiting tech logos.
 * Matches the Nodus template animation.
 */
const OrbitingLogos: React.FC<OrbitingLogosProps> = ({
  size = 800,
  className,
  showRings = true,
  numRings = 3,
}) => {
  const logos: SvgComponent[] = [
    ReactLogo,
    TypeScriptLogo,
    SpringLogo,
    JavaLogo,
    PostgreSQLLogo,
    DockerLogo,
    WebSocketLogo,
    GitHubLogo,
    ReactLogo,
    TypeScriptLogo,
    SpringLogo,
    JavaLogo,
    PostgreSQLLogo,
  ];

  const total = logos.length;

  // Compute ring weights (fewer inner, more outer)
  const weights = Array.from({ length: numRings }, (_, i) => i + 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const countsBase = weights.map((w) => Math.floor((total * w) / weightSum));
  let remainder = total - countsBase.reduce((a, b) => a + b, 0);

  // Distribute remainder from outermost inward
  for (let i = numRings - 1; i >= 0 && remainder > 0; i--) {
    countsBase[i] += 1;
    remainder--;
  }

  let cursor = 0;
  const rings: SvgComponent[][] = countsBase.map((count) => {
    const slice = logos.slice(cursor, cursor + count);
    cursor += count;
    return slice;
  });

  // Dynamic ring scales (inner→outer)
  const innerScale = 0.42;
  const outerScale = 0.94;
  const ringScaleFactors: number[] =
    numRings <= 1
      ? [(innerScale + outerScale) / 2]
      : Array.from(
          { length: numRings },
          (_, i) => innerScale + ((outerScale - innerScale) * i) / (numRings - 1)
        );

  const renderRing = (ringIndex: number) => {
    const ringLogos = rings[ringIndex];
    const count = ringLogos.length;
    if (count === 0) return null;

    const diameter = Math.round(size * ringScaleFactors[ringIndex]);
    const radius = diameter / 2;
    const baseDuration = 18;
    const stepDuration = 8;
    const duration = baseDuration + stepDuration * ringIndex;
    const reverse = ringIndex % 2 === 1;

    return (
      <div
        key={`ring-${ringIndex}`}
        className={clsx(styles.ring, reverse ? styles.counterOrbit : styles.orbit)}
        style={
          {
            width: diameter,
            height: diameter,
            '--duration': `${duration}s`,
          } as React.CSSProperties
        }
      >
        <div className={styles.ringInner}>
          {ringLogos.map((Logo, idx) => {
            const angleDeg = (360 / count) * idx;
            return (
              <div
                key={`ring-${ringIndex}-logo-${idx}`}
                className={styles.logoPosition}
                style={{
                  transform: `rotate(${angleDeg}deg) translateX(${radius}px)`,
                }}
              >
                <div style={{ transform: `rotate(${-angleDeg}deg)` }}>
                  <div
                    className={clsx(
                      styles.logoBox,
                      reverse ? styles.orbit : styles.counterOrbit
                    )}
                    style={{ '--duration': `${duration}s` } as React.CSSProperties}
                  >
                    <Logo className={styles.logo} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx(styles.container, className)}
      style={{ width: size, height: size }}
    >
      {/* Background rings */}
      {showRings && (
        <div className={styles.bgRings}>
          {Array.from({ length: numRings }, (_, idx) => numRings - 1 - idx).map((i) => {
            const diameter = Math.round(size * ringScaleFactors[i]);
            return (
              <div
                key={`bg-ring-${i}`}
                className={clsx(
                  styles.bgRing,
                  i === 0 && styles.bgRingInner,
                  i === 1 && styles.bgRingMiddle,
                  i === 2 && styles.bgRingOuter
                )}
                style={{ width: diameter, height: diameter }}
              />
            );
          })}
        </div>
      )}

      {/* Animated rings */}
      {Array.from({ length: numRings }, (_, idx) => numRings - 1 - idx).map((ringIndex) =>
        renderRing(ringIndex)
      )}
    </div>
  );
};

export default OrbitingLogos;
