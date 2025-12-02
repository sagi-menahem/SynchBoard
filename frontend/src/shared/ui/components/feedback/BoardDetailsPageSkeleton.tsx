import React from 'react';

import styles from './BoardDetailsPageSkeleton.module.scss';
import SectionCardSkeleton from './SectionCardSkeleton';

/**
 * Skeleton placeholder for the Board Details page during loading states.
 * Renders the two-column layout with appropriate skeleton sections.
 */
const BoardDetailsPageSkeleton: React.FC = () => {
  return (
    <main className={styles.pageContent}>
      {/* Left Column - Board Visual & Description */}
      <div className={styles.leftColumn}>
        {/* Board Picture Section */}
        <SectionCardSkeleton showHeaderAction contentVariant="picture" />
        {/* Description Section */}
        <SectionCardSkeleton showHeaderAction contentVariant="description" />
      </div>

      {/* Right Column - Settings & Members */}
      <div className={styles.rightColumn}>
        {/* Canvas Settings Section */}
        <SectionCardSkeleton contentVariant="settings" itemCount={3} />
        {/* Members Section */}
        <SectionCardSkeleton contentVariant="members" itemCount={4} />
      </div>
    </main>
  );
};

export default BoardDetailsPageSkeleton;
