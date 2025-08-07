import React, { type ErrorInfo, type ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';

interface Props {
    children: ReactNode;
    boardId?: string | number;
}

const BoardErrorFallback: React.FC<{ boardId?: string | number; onRetry: () => void }> = ({ 
    boardId, 
    onRetry 
}) => (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '300px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        textAlign: 'center'
    }}>
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
            Board Loading Error
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {boardId 
                ? `Unable to load board ${boardId}. The board may be unavailable or you may not have access.`
                : 'Unable to load the board. Please check your connection and try again.'
            }
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
                onClick={onRetry}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Try Again
            </button>
            <button 
                onClick={() => window.history.back()}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Go Back
            </button>
        </div>
    </div>
);

export const BoardErrorBoundary: React.FC<Props> = ({ children, boardId }) => {
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
        console.error(`Board Error (Board ID: ${boardId}):`, {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            boardId,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

    };

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <ErrorBoundary 
            level="section" 
            onError={handleError}
            fallback={<BoardErrorFallback boardId={boardId} onRetry={handleRetry} />}
        >
            {children}
        </ErrorBoundary>
    );
};