import React, { type ErrorInfo, type ReactNode } from 'react';

import logger from 'utils/logger';

import { ErrorBoundary } from './ErrorBoundary';


interface Props {
    children: ReactNode;
    pageName?: string;
}

export const PageErrorBoundary: React.FC<Props> = ({ children, pageName }) => {
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
        logger.error(`Page Error in ${pageName || 'Unknown Page'}:`, {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            page: pageName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

    };

    return (
        <ErrorBoundary 
            level="page" 
            onError={handleError}
        >
            {children}
        </ErrorBoundary>
    );
};