import { toast } from 'react-hot-toast';
import logger from 'utils/logger';

export const createErrorHandler = (context: string) => (error: Error) => {
    logger.error(`[${context}] Component Error`, error, {
        timestamp: new Date().toISOString(),
        context
    });
    
    toast.error(`${context} encountered an error`);
};