import React from 'react';

import SectionCardSkeleton from './SectionCardSkeleton';

import styles from './SettingsPageSkeleton.module.scss';

/**
 * Skeleton placeholder for the Settings page during loading states.
 * Renders the two-column layout with appropriate skeleton sections.
 */
const SettingsPageSkeleton: React.FC = () => {
  return (
    <main className={styles.pageContent}>
      {/* Left Column - Appearance & Preferences */}
      <div className={styles.leftColumn}>
        {/* Theme Section */}
        <SectionCardSkeleton contentVariant="swatches" itemCount={2} />
        {/* Language Section */}
        <SectionCardSkeleton contentVariant="swatches" itemCount={2} />
        {/* Board Appearance Section */}
        <SectionCardSkeleton contentVariant="swatches" itemCount={6} />
        {/* Profile Details Section */}
        <SectionCardSkeleton contentVariant="settings" itemCount={3} />
      </div>

      {/* Right Column - Security & Account Management */}
      <div className={styles.rightColumn}>
        {/* Password Section */}
        <SectionCardSkeleton contentVariant="form" itemCount={3} />
        {/* Picture Section */}
        <SectionCardSkeleton contentVariant="picture" />
        {/* Danger Zone */}
        <SectionCardSkeleton contentVariant="form" itemCount={1} />
      </div>
    </main>
  );
};

export default SettingsPageSkeleton;
