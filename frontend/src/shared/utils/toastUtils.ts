import { toast } from 'react-hot-toast';

interface FlexibleToastMessages {
  loading: string;
  success: string | ((response?: unknown) => string);
  error: string | ((error?: unknown) => string);
}

/**
 * Wraps a promise with toast notifications for loading, success, and error states.
 * Provides automatic user feedback during async operations with customizable messages.
 * Supports both static strings and dynamic message functions based on response/error data.
 * 
 * @param {Promise<T>} promise - The promise to wrap with toast notifications
 * @param {FlexibleToastMessages} messages - Toast messages for different states
 * @returns {Promise<T>} The original promise result with toast notifications
 */
export const toastPromise = async <T>(
  promise: Promise<T>,
  messages: FlexibleToastMessages,
): Promise<T> => {
  return await toast.promise(promise, messages);
};
