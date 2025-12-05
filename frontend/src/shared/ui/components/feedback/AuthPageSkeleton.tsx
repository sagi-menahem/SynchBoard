import React from 'react';

import styles from './AuthPageSkeleton.module.scss';
import Skeleton from './Skeleton';


/**
 * Skeleton placeholder for the Auth page during loading states.
 * Mimics the split-screen layout with hero section and form section.
 */
const AuthPageSkeleton: React.FC = () => {
  return (
    <div className={styles.pageContent}>
      <div className={styles.splitContainer}>
        {/* Hero Section Skeleton */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            {/* Title skeleton */}
            <div className={styles.titleRow}>
              <Skeleton variant="circular" width={32} height={32} className={styles.iconSkeleton} />
              <Skeleton variant="text" width="60%" height={40} className={styles.titleSkeleton} />
            </div>

            {/* Subtitle skeleton */}
            <Skeleton variant="text" width="90%" height={20} className={styles.subtitleSkeleton} />
            <Skeleton variant="text" width="75%" height={20} className={styles.subtitleSkeleton} />

            {/* Features skeleton */}
            <div className={styles.featuresContainer}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.featureRow}>
                  <Skeleton
                    variant="rounded"
                    width={40}
                    height={40}
                    className={styles.featureIcon}
                  />
                  <Skeleton variant="text" width="70%" height={18} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Section Skeleton */}
        <div className={styles.formSection}>
          <div className={styles.authCard}>
            <div className={styles.authContainer}>
              {/* Form header skeleton */}
              <div className={styles.formHeader}>
                <div className={styles.formTitleRow}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width={120} height={24} />
                </div>
              </div>

              {/* Form fields skeleton */}
              <div className={styles.formFields}>
                {/* Email field */}
                <div className={styles.field}>
                  <Skeleton
                    variant="text"
                    width={80}
                    height={14}
                    className={styles.labelSkeleton}
                  />
                  <Skeleton variant="rounded" width="100%" height={40} />
                </div>

                {/* Password field */}
                <div className={styles.field}>
                  <Skeleton
                    variant="text"
                    width={80}
                    height={14}
                    className={styles.labelSkeleton}
                  />
                  <Skeleton variant="rounded" width="100%" height={40} />
                </div>

                {/* Submit button skeleton */}
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={44}
                  className={styles.buttonSkeleton}
                />

                {/* Divider */}
                <div className={styles.dividerRow}>
                  <div className={styles.dividerLine} />
                  <Skeleton variant="text" width={30} height={14} />
                  <div className={styles.dividerLine} />
                </div>

                {/* Google button skeleton */}
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={44}
                  className={styles.googleButtonSkeleton}
                />
              </div>

              {/* Auth actions skeleton */}
              <div className={styles.authActions}>
                <Skeleton variant="text" width={180} height={14} />
                <Skeleton variant="rounded" width={140} height={36} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageSkeleton;
