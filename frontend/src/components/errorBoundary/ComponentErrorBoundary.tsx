import React, { type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/logger';

import { ErrorBoundary } from './ErrorBoundary';


interface Props {
    children: ReactNode;
    componentName?: string;
    fallbackMessage?: string;
    minimal?: boolean;
}

const MinimalErrorFallback: React.FC<{ message?: string; onRetry: () => void }> = ({ 
    message, 
    onRetry 
}) => (
    <div style={{
        padding: '1rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '4px',
        textAlign: 'center'
    }}>
        <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
            {message || 'Component failed to load'}
        </p>
        <button 
            onClick={onRetry}
            style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Retry
        </button>
    </div>
);

export const ComponentErrorBoundary: React.FC<Props> = ({ 
    children, 
    componentName, 
    fallbackMessage,
    minimal = false 
}) => {
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
        logger.error(`Component Error in ${componentName || 'Unknown Component'}:`, {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            componentName,
            timestamp: new Date().toISOString()
        });
    };

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <ErrorBoundary 
            level="component" 
            onError={handleError}
            fallback={minimal ? 
                <MinimalErrorFallback message={fallbackMessage} onRetry={handleRetry} /> : 
                undefined
            }
        >
            {children}
        </ErrorBoundary>
    );
};