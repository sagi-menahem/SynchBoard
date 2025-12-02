import React from 'react';

import styles from './SectionCardSkeleton.module.scss';
import Skeleton from './Skeleton';

/**
 * Content layout variants for different section types.
 */
type ContentVariant =
  | 'form' // Input fields stacked vertically
  | 'profile' // Avatar with text info
  | 'picture' // Large image with buttons
  | 'swatches' // Color/option swatches row
  | 'members' // List of member items
  | 'description' // Text area placeholder
  | 'settings'; // Form fields with labels

/**
 * Props for SectionCardSkeleton component.
 */
interface SectionCardSkeletonProps {
  /** Whether to show the header section */
  showHeader?: boolean;
  /** Whether to show header action button */
  showHeaderAction?: boolean;
  /** Type of content to display in the skeleton */
  contentVariant?: ContentVariant;
  /** Number of items for list-based variants (members, form fields) */
  itemCount?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Skeleton placeholder for SectionCard component during loading states.
 * Provides multiple content variants to match different section types.
 *
 * @param showHeader - Display header with title skeleton
 * @param showHeaderAction - Display action button in header
 * @param contentVariant - Type of content layout to render
 * @param itemCount - Number of items for list variants
 */
const SectionCardSkeleton: React.FC<SectionCardSkeletonProps> = ({
  showHeader = true,
  showHeaderAction = false,
  contentVariant = 'form',
  itemCount = 3,
  className,
}) => {
  const renderContent = () => {
    switch (contentVariant) {
      case 'form':
        return (
          <div className={styles.contentStack}>
            {Array.from({ length: itemCount }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" className={styles.inputField} />
            ))}
            <div className={styles.contentRow} style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <Skeleton variant="rounded" className={styles.button} />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className={styles.contentRow}>
            <Skeleton variant="circular" className={styles.avatar} />
            <div className={styles.contentStack} style={{ flex: 1 }}>
              <Skeleton variant="text" className={styles.textLineMedium} />
              <Skeleton variant="text" className={styles.textLineShort} />
            </div>
          </div>
        );

      case 'picture':
        return (
          <div className={styles.contentStack} style={{ alignItems: 'center' }}>
            <Skeleton variant="circular" className={styles.avatarLarge} />
            <div className={styles.contentRow} style={{ marginTop: 8 }}>
              <Skeleton variant="rounded" className={styles.button} />
              <Skeleton variant="rounded" className={styles.button} />
            </div>
          </div>
        );

      case 'swatches':
        return (
          <div className={styles.swatchesRow}>
            {Array.from({ length: itemCount }).map((_, i) => (
              <Skeleton key={i} variant="circular" className={styles.colorSwatch} />
            ))}
          </div>
        );

      case 'members':
        return (
          <div className={styles.contentStack}>
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i} className={styles.memberItem}>
                <Skeleton variant="circular" className={styles.memberAvatar} />
                <div className={styles.memberInfo}>
                  <Skeleton variant="text" className={styles.memberName} />
                  <Skeleton variant="text" className={styles.memberEmail} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'description':
        return (
          <div className={styles.contentStack}>
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="95%" height={14} />
            <Skeleton variant="text" width="70%" height={14} />
          </div>
        );

      case 'settings':
        return (
          <div className={styles.contentStack}>
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i} className={styles.contentStack} style={{ gap: 8 }}>
                <Skeleton variant="text" width={80} height={12} />
                <Skeleton variant="rectangular" className={styles.inputField} />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.sectionCardSkeleton} ${className ?? ''}`}>
      {showHeader && (
        <div className={styles.header}>
          <Skeleton variant="text" className={styles.title} />
          {showHeaderAction && <Skeleton variant="rounded" className={styles.headerAction} />}
        </div>
      )}
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
};

export default SectionCardSkeleton;
