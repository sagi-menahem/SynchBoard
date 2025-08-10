import { useCallback } from 'react';

import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

interface ErrorHandlerOptions {
    showToast?: boolean;
    redirectOnError?: string;
    logLevel?: 'error' | 'warn' | 'info';
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
    const navigate = useNavigate();
    const { showToast = true, redirectOnError, logLevel = 'error' } = options;

    const handleError = useCallback((error: Error, context?: string) => {
        const logMessage = `${context ? `[${context}] ` : ''}${error.message}`;
        logger[logLevel](logMessage, error);

        if (showToast) {
            toast.error(
                context 
                    ? `${context}: ${error.message}`
                    : error.message || 'An unexpected error occurred'
            );
        }

        if (redirectOnError) {
            navigate(redirectOnError);
        }
    }, [navigate, showToast, redirectOnError, logLevel]);

    const handleAsyncError = useCallback(async <T>(
        asyncFn: () => Promise<T>,
        context?: string,
        fallbackValue?: T
    ): Promise<T | undefined> => {
        try {
            return await asyncFn();
        } catch (error) {
            handleError(error as Error, context);
            return fallbackValue;
        }
    }, [handleError]);

    return {
        handleError,
        handleAsyncError
    };
};

export const createErrorHandler = (context: string) => (error: Error) => {
    logger.error(`[${context}] Component Error`, error, {
        timestamp: new Date().toISOString(),
        context
    });
    
    toast.error(`${context} encountered an error`);
};