import { Component, type ErrorInfo, type ReactNode } from 'react';

import i18n from 'i18next';
import logger from 'shared/utils/logger';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #2f2f2f 0%, #1f1f1f 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '20vh',
          color: '#fff',
          zIndex: 9999,
          padding: '2rem',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '4rem',
                display: 'inline-block',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
              }}>
                ⚠️
              </div>
            </div>
            
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 1rem 0',
              lineHeight: '1.2',
            }}>
              {i18n.t('errorBoundary.title')}
            </h1>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#ccc',
              lineHeight: '1.6',
              margin: '0 0 2rem 0',
            }}>
              {i18n.t('errorBoundary.message')}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: '2px solid #3b82f6',
                  minWidth: '120px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {i18n.t('errorBoundary.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}