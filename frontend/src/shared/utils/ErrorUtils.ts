import { toast } from 'react-hot-toast';
import i18n from 'shared/lib/i18n';
import logger from 'shared/utils/logger';

/**
 * Creates a standardized error handler function for React components and application modules.
 * Provides consistent error logging with context information and user notification via toast.
 * Used in error boundaries and async operation error handling.
 *
 * @param {string} context - Descriptive context label for identifying error source
 * @returns {(error: Error) => void} Error handler function that logs and notifies users
 */
export const createErrorHandler = (context: string) => (error: Error) => {
  logger.error(`[${context}] Component Error`, error, {
    timestamp: new Date().toISOString(),
    context,
  });

  toast.error(i18n.t('common:errors.common.componentError', { context }));
};
