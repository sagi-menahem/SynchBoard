import React, { Component, type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/Logger';

import styles from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    level?: 'page' | 'section' | 'component';
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
        
    logger.error(`${this.props.level || 'Component'} error boundary caught an error`, error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    logger.warn('Error reported to monitoring service', { error: error.message, errorInfo: errorInfo.componentStack });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          level={this.props.level}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
    error: Error | null;
    onRetry: () => void;
    level?: 'page' | 'section' | 'component';
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  level = 'component', 
}) => {
  const getLevelConfig = () => {
    switch (level) {
      case 'page':
        return {
          title: 'Page Error',
          description: 'This page encountered an error and could not be displayed.',
          showDetails: true,
          actionText: 'Reload Page',
          onAction: () => window.location.reload(),
        };
      case 'section':
        return {
          title: 'Section Error',
          description: 'This section encountered an error.',
          showDetails: false,
          actionText: 'Try Again',
          onAction: onRetry,
        };
      default:
        return {
          title: 'Component Error',
          description: 'A component error occurred.',
          showDetails: false,
          actionText: 'Retry',
          onAction: onRetry,
        };
    }
  };

  const config = getLevelConfig();

  return (
    <div className={`${styles.errorFallback} ${styles[`errorFallback--${level}`]}`}>
      <div className={styles.errorFallbackContent}>
        <h3 className={styles.errorFallbackTitle}>{config.title}</h3>
        <p className={styles.errorFallbackDescription}>{config.description}</p>
                
        {config.showDetails && error && (
          <details className={styles.errorFallbackDetails}>
            <summary>Error Details</summary>
            <div className={styles.errorFallbackErrorInfo}>
              <p><strong>Error:</strong> {error.message}</p>
              {error.stack && (
                <pre className={styles.errorFallbackStack}>
                  <code>{error.stack}</code>
                </pre>
              )}
            </div>
          </details>
        )}

        <div className={styles.errorFallbackActions}>
          <button 
            className={`${styles.errorFallbackButton} ${styles['errorFallbackButton--primary']}`}
            onClick={config.onAction}
          >
            {config.actionText}
          </button>
                    
          {level === 'page' && (
            <button 
              className={`${styles.errorFallbackButton} ${styles['errorFallbackButton--secondary']}`}
              onClick={() => window.history.back()}
            >
                            Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;