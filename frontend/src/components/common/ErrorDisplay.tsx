import React, { useState } from 'react';

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
  const [showDetails, setShowDetails] = useState(showTechnicalDetails);

  const getErrorConfig = () => {
    switch (errorType) {
      case 'page':
        return {
          title: title || 'Oops! Page Not Available',
          message: message || 'This page encountered an error and cannot be displayed right now. Please try refreshing the page or go back to the previous screen.',
          icon: '🚫',
          showRetry: true,
          showGoBack: true,
        };
      case 'board':
        return {
          title: title || 'Board Loading Error',
          message: message || 'Unable to load this board. This might be a temporary issue with the board data or your connection.',
          icon: '📋',
          showRetry: true,
          showGoBack: true,
        };
      case 'component':
        return {
          title: title || 'Feature Temporarily Unavailable',
          message: message || 'A component on this page encountered an error. You can try refreshing to restore functionality.',
          icon: '⚠️',
          showRetry: true,
          showGoBack: false,
        };
      default:
        return {
          title: title || 'Something Went Wrong',
          message: message || 'An unexpected error occurred.',
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
          <span className={styles.icon} role="img" aria-label="Error">
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
              Try Again
            </button>
          )}
          
          {config.showGoBack && (
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleGoBack}
            >
              Go Back
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
              {showDetails ? '▼' : '▶'} Technical Details
            </button>
            
            {showDetails && (
              <div className={styles.detailsContent}>
                <div className={styles.errorInfo}>
                  <p><strong>Error:</strong> {error.message}</p>
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  <p><strong>Location:</strong> {window.location.href}</p>
                </div>
                
                {error.stack && (
                  <details className={styles.stackTrace}>
                    <summary>Stack Trace</summary>
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
          If this problem persists, please try refreshing the page or contact support.
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;