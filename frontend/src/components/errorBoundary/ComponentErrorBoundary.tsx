import { Component, type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/Logger';

import { ErrorDisplay } from 'components/common';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallbackMessage?: string;
  minimal?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component-level error boundary for granular error isolation.
 * Catches errors in individual components without affecting the entire page.
 * Supports both full ErrorDisplay and minimal inline error displays.
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName } = this.props;
    
    // Log component-specific error information
    logger.error(`Component Error in ${componentName || 'Unknown Component'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName,
      timestamp: new Date().toISOString(),
      context: 'ComponentErrorBoundary',
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { componentName, fallbackMessage, minimal = false } = this.props;

      // For minimal errors, show a compact inline error
      if (minimal) {
        return (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            textAlign: 'center',
            margin: '0.5rem 0',
          }}>
            <p style={{ 
              color: '#dc2626', 
              fontSize: '0.875rem', 
              margin: '0 0 0.75rem 0',
              fontWeight: 500,
            }}>
              {fallbackMessage || `${componentName || 'Component'} failed to load`}
            </p>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '0.375rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background-color 0.2s ease',
              }}
            >
              Try Again
            </button>
          </div>
        );
      }

      // For full errors, use the ErrorDisplay component
      return (
        <ErrorDisplay
          errorType="component"
          title={`${componentName || 'Component'} Error`}
          message={
            fallbackMessage || 
            `The ${componentName || 'component'} encountered an error and cannot be displayed. This is likely a temporary issue.`
          }
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}