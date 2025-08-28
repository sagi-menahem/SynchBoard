import { useCallback } from 'react';

import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createErrorHandler } from 'shared/utils';
import logger from 'shared/utils/logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnError?: string;
  logLevel?: 'error' | 'warn' | 'info';
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast = true, redirectOnError, logLevel = 'error' } = options;

  const handleError = useCallback((error: Error, context?: string) => {
    const logMessage = `${context ? `[${context}] ` : ''}${error.message}`;
    logger[logLevel](logMessage, error);

    if (showToast) {
      toast.error(
        context
          ? `${context}: ${error.message}`
          : error.message || t('errorHandler.unexpectedError'),
      );
    }

    if (redirectOnError) {
      navigate(redirectOnError);
    }
  }, [navigate, showToast, redirectOnError, logLevel, t]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallbackValue?: T,
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
    handleAsyncError,
  };
};

export { createErrorHandler };
