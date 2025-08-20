import { Component, type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/Logger';

import { ErrorDisplay } from 'components/common';

interface Props {
  children: ReactNode;
  boardId?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BoardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { boardId } = this.props;
    logger.error(`Board Error (Board ID: ${boardId || 'Unknown'}):`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      boardId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context: 'BoardErrorBoundary',
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoBack = () => {
    window.location.href = '/boards';
  };

  render() {
    if (this.state.hasError) {
      const { boardId } = this.props;
      
      return (
        <ErrorDisplay
          errorType="board"
          title="Board Error"
          message={
            boardId
              ? `Unable to load board ${boardId}. The board may be temporarily unavailable, or you may not have access to it.`
              : 'Unable to load this board. This could be due to a connection issue or the board may not exist.'
          }
          error={this.state.error}
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
        />
      );
    }

    return this.props.children;
  }
}