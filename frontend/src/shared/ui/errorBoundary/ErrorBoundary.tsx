import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';
import { getBackArrowIcon } from 'shared/utils/rtlUtils';

import Card from '../components/display/Card';
import Button from '../components/forms/Button';

import styles from './ErrorBoundary.module.scss';

interface Props {
  /** Child components to render when no error has occurred */
  children: ReactNode;
  /** Optional callback to execute when user clicks retry */
  onRetry?: () => void;
}

interface State {
  /** Whether an error has been caught by the boundary */
  hasError: boolean;
  /** The caught error object, if any */
  error: Error | null;
  /** Whether a retry operation is currently in progress */
  isRetrying: boolean;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree.
 * Provides a user-friendly error interface with retry functionality and comprehensive error logging.
 * Prevents the entire application from crashing due to unhandled component errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isRetrying: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state to show error UI on next render
    return { hasError: true, error, isRetrying: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log comprehensive error information for debugging
    logger.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true });

    // Brief delay to provide visual feedback before retry
    await new Promise((resolve) => setTimeout(resolve, TIMING_CONSTANTS.ERROR_RECOVERY_DELAY));

    this.setState({ hasError: false, error: null, isRetrying: false });

    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      // Fallback to page reload if no custom retry handler
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryUI
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          isRetrying={this.state.isRetrying}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error boundary user interface component with localized messaging and accessibility features.
 * Displays a user-friendly error message with retry and navigation options.
 *
 * @param onRetry - Callback to attempt error recovery
 * @param onGoHome - Callback to navigate back to home page
 * @param isRetrying - Whether retry operation is in progress
 */
const ErrorBoundaryUI: React.FC<{
  onRetry: () => void;
  onGoHome: () => void;
  isRetrying: boolean;
}> = ({ onRetry, onGoHome, isRetrying }) => {
  const { t } = useTranslation('common');
  const BackArrowIcon = getBackArrowIcon();

  return (
    <div className={styles.errorContainer} role="alert" aria-live="assertive">
      <Card variant="elevated" className={styles.errorCard}>
        <div className={styles.iconContainer}>
          <AlertTriangle className={styles.errorIcon} aria-hidden="true" size={64} />
        </div>

        <h1 className={styles.title}>{t('errorBoundary.title')}</h1>

        <p className={styles.message}>{t('errorBoundary.message')}</p>

        <div className={styles.buttonContainer}>
          <Button
            onClick={onGoHome}
            variant="secondary-glass"
            className={styles.secondaryButton}
            disabled={isRetrying}
          >
            <BackArrowIcon size={16} />
            {t('errorDisplay.goBack')}
          </Button>
          <Button
            onClick={onRetry}
            variant="primary-glass"
            className={styles.retryButton}
            disabled={isRetrying}
            aria-describedby="retry-description"
          >
            <RotateCcw size={18} />
            {t('errorBoundary.tryAgain')}
          </Button>
        </div>

        <div id="retry-description" className="sr-only">
          {t('errorDisplay.helpText')}
        </div>
      </Card>
    </div>
  );
};
