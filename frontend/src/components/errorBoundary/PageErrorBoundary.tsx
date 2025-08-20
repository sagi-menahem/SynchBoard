import { Component, type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/logger';

import { ErrorDisplay } from 'components/common';

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Page-level error boundary that catches errors at the route/page level.
 * Uses the new ErrorDisplay component for consistent, professional error presentation.
 */
export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { pageName } = this.props;
    
    // Log detailed error information
    logger.error(`Page Error in ${pageName || 'Unknown Page'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      page: pageName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          errorType="page"
          title={`${this.props.pageName || 'Page'} Error`}
          message="This page encountered an error and cannot be displayed. Please try refreshing the page or navigate back to continue using SynchBoard."
          error={this.state.error}
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
        />
      );
    }

    return this.props.children;
  }
}