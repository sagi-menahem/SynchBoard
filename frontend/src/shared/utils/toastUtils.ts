import { toast } from 'react-hot-toast';

interface FlexibleToastMessages {
  loading: string;
  success: string | ((response?: unknown) => string);
  error: string | ((error?: unknown) => string);
}

/**
 * Generic toast promise utility to standardize toast.promise usage across the app
 */
export const toastPromise = async <T>(
  promise: Promise<T>,
  messages: FlexibleToastMessages,
): Promise<T> => {
  return await toast.promise(promise, messages);
};

