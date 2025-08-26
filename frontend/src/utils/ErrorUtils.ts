import i18n from 'i18n';
import { toast } from 'react-hot-toast';
import logger from 'utils/logger';

export const createErrorHandler = (context: string) => (error: Error) => {
  logger.error(`[${context}] Component Error`, error, {
    timestamp: new Date().toISOString(),
    context,
  });
    
  toast.error(i18n.t('errors.componentError', { context }));
};