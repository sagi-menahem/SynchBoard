import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
  errorType: 'page' | 'board' | 'component';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  error?: Error | null;
  showTechnicalDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorType,
  title,
  message,
  onRetry,
  onGoBack,
  error,
  showTechnicalDetails = false,
}) => {
  const { t } = useTranslation(['common']);
  const [showDetails, setShowDetails] = useState(showTechnicalDetails);

  const getErrorConfig = () => {
    switch (errorType) {
      case 'page':
        return {
          title: title || t('common:errorDisplay.pageUnavailable'),
          message: message || t('common:errorDisplay.pageUnavailableMessage'),
          icon: '🚫',
          showRetry: true,
          showGoBack: true,
        };
      case 'board':
        return {
          title: title || t('common:errorDisplay.boardLoadingError'),
          message: message || t('common:errorDisplay.boardLoadingErrorMessage'),
          icon: '📋',
          showRetry: true,
          showGoBack: true,
        };
      case 'component':
        return {
          title: title || t('common:errorDisplay.featureUnavailable'),
          message: message || t('common:errorDisplay.featureUnavailableMessage'),
          icon: '⚠️',
          showRetry: true,
          showGoBack: false,
        };
      default:
        return {
          title: title || t('common:errorDisplay.somethingWentWrong'),
          message: message || t('common:errorDisplay.unexpectedError'),
          icon: '❌',
          showRetry: true,
          showGoBack: false,
        };
    }
  };

  const config = getErrorConfig();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (errorType === 'page') {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const containerClass = `${styles.container} ${styles[`container--${errorType}`]}`;

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <span className={styles.icon} role="img" aria-label={t('common:errorDisplay.errorAriaLabel')}>
            {config.icon}
          </span>
        </div>

        <h2 className={styles.title}>
          {config.title}
        </h2>

        <p className={styles.message}>
          {config.message}
        </p>

        <div className={styles.actions}>
          {config.showRetry && (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleRetry}
            >
              {t('common:errorDisplay.tryAgain')}
            </button>
          )}
          
          {config.showGoBack && (
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleGoBack}
            >
              {t('common:errorDisplay.goBack')}
            </button>
          )}
        </div>

        {error && (
          <div className={styles.technicalDetails}>
            <button
              className={styles.detailsToggle}
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
            >
              {showDetails ? '▼' : '▶'} {t('common:errorDisplay.technicalDetails')}
            </button>
            
            {showDetails && (
              <div className={styles.detailsContent}>
                <div className={styles.errorInfo}>
                  <p><strong>{t('common:errorDisplay.error')}</strong> {error.message}</p>
                  <p><strong>{t('common:errorDisplay.time')}</strong> {new Date().toLocaleString()}</p>
                  <p><strong>{t('common:errorDisplay.location')}</strong> {window.location.href}</p>
                </div>
                
                {error.stack && (
                  <details className={styles.stackTrace}>
                    <summary>{t('common:errorDisplay.stackTrace')}</summary>
                    <pre className={styles.stackContent}>
                      <code>{error.stack}</code>
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.helpText}>
          {t('common:errorDisplay.helpText')}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;