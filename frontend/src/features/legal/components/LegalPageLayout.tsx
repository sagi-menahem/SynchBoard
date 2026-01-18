import { ArrowLeft } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import { useIsMobile } from 'shared/hooks';
import { AppHeader, Button, PageTransition } from 'shared/ui';
import utilStyles from 'shared/ui/styles/utils.module.scss';

import styles from './LegalPageLayout.module.scss';

interface LegalPageLayoutProps {
  title: string;
  pageTitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Shared layout component for legal pages (Privacy Policy, Terms of Service).
 * Provides consistent header, styling, and responsive design for legal content.
 */
const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  pageTitle,
  lastUpdated,
  children,
}) => {
  const { t } = useTranslation(['legal']);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const containerStyle = useMemo(
    () =>
      ({
        '--background-blur': '0px',
        '--background-size': isMobile ? '280px 280px' : '400px 400px',
      }) as React.CSSProperties,
    [isMobile],
  );

  const handleGoBack = () => {
    navigate(APP_ROUTES.LANDING);
  };

  return (
    <PageTransition
      className={`${utilStyles.unifiedDotBackground} ${styles.pageContainer}`}
      style={containerStyle}
    >
      <AppHeader
        leading={
          <Button
            variant="icon"
            onClick={handleGoBack}
            title={t('legal:common.backToHome')}
            aria-label={t('legal:common.backToHome')}
          >
            <ArrowLeft size={20} />
          </Button>
        }
        title={<span className={styles.pageTitle}>{pageTitle}</span>}
      />
      <main className={styles.pageContent}>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lastUpdated}>
              {t('legal:common.lastUpdated')}: {lastUpdated}
            </p>
          </header>
          <div className={styles.content}>{children}</div>
        </article>
      </main>
    </PageTransition>
  );
};

export default LegalPageLayout;
