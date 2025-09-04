import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';
import { getBackArrowIcon } from 'shared/utils/rtlUtils';

import Card from '../components/display/Card';
import Button from '../components/forms/Button';

import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isRetrying: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, isRetrying: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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

    // Add a small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, TIMING_CONSTANTS.ERROR_RECOVERY_DELAY));

    this.setState({ hasError: false, error: null, isRetrying: false });

    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use a functional component wrapper to access hooks
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

// Functional component to use hooks
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
            variant="secondary"
            className={styles.secondaryButton}
            disabled={isRetrying}
          >
            <BackArrowIcon size={16} />
            {t('errorDisplay.goBack')}
          </Button>
          <Button
            onClick={onRetry}
            variant="primary"
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
