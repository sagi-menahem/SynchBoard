import { useCallback } from 'react';

import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/Logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  defaultMessage?: string;
}

interface ErrorInfo {
  error: unknown;
  context?: string;
  options?: ErrorHandlerOptions;
}

const DEFAULT_OPTIONS: Required<ErrorHandlerOptions> = {
  showToast: true,
  logError: true,
  defaultMessage: 'An unexpected error occurred',
};

export const useUnifiedErrorHandler = () => {
  const { t } = useTranslation();

  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof AxiosError) {
      // Handle HTTP errors
      if (error.response?.status === 401) {
        return t('errors.unauthorized', 'You are not authorized to perform this action');
      }
      if (error.response?.status === 403) {
        return t('errors.forbidden', 'You do not have permission to access this resource');
      }
      if (error.response?.status === 404) {
        return t('errors.notFound', 'The requested resource was not found');
      }
      if (error.response?.status === 409) {
        return t('errors.conflict', 'A conflict occurred while processing your request');
      }
      if (error.response?.status && error.response.status >= 500) {
        return t('errors.serverError', 'A server error occurred. Please try again later');
      }
      
      // Use server-provided error message if available
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred';
  }, [t]);

  const handleError = useCallback(({ error, context, options }: ErrorInfo) => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };
    const message = finalOptions.defaultMessage || getErrorMessage(error);
    
    if (finalOptions.logError) {
      const contextMessage = context ? `[${context}] ` : '';
      logger.error(`${contextMessage}Error occurred:`, error);
    }
    
    if (finalOptions.showToast) {
      toast.error(message, {
        duration: 4000,
        id: `error-${Date.now()}`,
      });
    }
    
    return message;
  }, [getErrorMessage]);

  const handleApiError = useCallback((error: AxiosError, context?: string, options?: ErrorHandlerOptions) => {
    return handleError({ error, context, options });
  }, [handleError]);

  const handleTransactionError = useCallback((error: Error, transactionId: string, actionType: string) => {
    const context = `Transaction ${actionType}:${transactionId}`;
    return handleError({ 
      error, 
      context,
      options: { 
        defaultMessage: `Failed to complete ${actionType}. Please try again.`,
      },
    });
  }, [handleError]);

  const handleNetworkError = useCallback((error: unknown, context?: string) => {
    return handleError({ 
      error, 
      context,
      options: {
        defaultMessage: t('errors.networkError', 'Network error. Please check your connection and try again.'),
      },
    });
  }, [handleError, t]);

  return {
    handleError,
    handleApiError,
    handleTransactionError,
    handleNetworkError,
    getErrorMessage,
  };
};