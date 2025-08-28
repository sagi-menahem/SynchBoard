import { toast } from 'react-hot-toast';
import i18n from 'shared/lib/i18n';
import logger from 'shared/utils/logger';

export const createErrorHandler = (context: string) => (error: Error) => {
  logger.error(`[${context}] Component Error`, error, {
    timestamp: new Date().toISOString(),
    context,
  });

  toast.error(i18n.t('errors.common.componentError', { context }));
};