import { Component, type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/logger';

import { ErrorDisplay } from 'components/common';

type ErrorType = 'page' | 'board' | 'component';

interface Props {
  children: ReactNode;
  type: ErrorType;
  context?: string | number;
  fallbackMessage?: string;
  minimal?: boolean;
  onRetry?: () => void;
  onGoBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class UnifiedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { type, context } = this.props;
    
    const logContext = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      errorBoundaryType: type,
    };

    switch (type) {
      case 'page':
        logger.error(`Page Error in ${context || 'Unknown Page'}:`, {
          ...logContext,
          userAgent: navigator.userAgent,
        });
        break;
      case 'board':
        logger.error(`Board Error (Board ID: ${context || 'Unknown'}):`, logContext);
        break;
      case 'component':
        logger.error(`Component Error in ${context || 'Unknown Component'}:`, logContext);
        break;
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  private handleGoBack = () => {
    if (this.props.onGoBack) {
      this.props.onGoBack();
    } else if (this.props.type === 'board') {
      window.location.href = '/boards';
    } else {
      window.history.back();
    }
  };

  private getErrorTypeConfig() {
    const { type, context, fallbackMessage } = this.props;

    switch (type) {
      case 'page':
        return {
          title: `${context || 'Page'} Error`,
          message: fallbackMessage || 'This page encountered an error and cannot be displayed. Please try refreshing the page or navigate back to continue using SynchBoard.',
        };
      case 'board':
        return {
          title: 'Board Error',
          message: fallbackMessage || (
            context
              ? `Unable to load board ${context}. The board may be temporarily unavailable, or you may not have access to it.`
              : 'Unable to load this board. This could be due to a connection issue or the board may not exist.'
          ),
        };
      case 'component':
        return {
          title: `${context || 'Component'} Error`,
          message: fallbackMessage || `The ${context || 'component'} encountered an error and cannot be displayed. This is likely a temporary issue.`,
        };
      default:
        return {
          title: 'Unexpected Error',
          message: 'An unexpected error occurred.',
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const { type, context, fallbackMessage, minimal = false } = this.props;
      const { title, message } = this.getErrorTypeConfig();

      // Minimal error display for components
      if (minimal && type === 'component') {
        return (
          <div style={{
            padding: '1rem',
            backgroundColor: '#2f2f2f',
            border: '1px solid #444',
            borderRadius: '6px',
            textAlign: 'center',
            margin: '0.5rem 0',
          }}>
            <p style={{ 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              margin: '0 0 0.75rem 0',
              fontWeight: 500,
            }}>
              {fallbackMessage || `${context || 'Component'} failed to load`}
            </p>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '0.375rem 1rem',
                fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              Try Again
            </button>
          </div>
        );
      }

      // Full error display
      return (
        <ErrorDisplay
          errorType={type}
          title={title}
          message={message}
          error={this.state.error}
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
        />
      );
    }

    return this.props.children;
  }
}