import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import i18n from 'shared/lib/i18n';
import logger from 'shared/utils/logger';

/**
 * Configuration options for API call hooks.
 */
interface ApiCallOptions<T> {
  // Callback executed when the API call succeeds
  onSuccess?: (data: T) => void;
  // Callback executed when the API call fails
  onError?: (error: AxiosError) => void;
  // Toast message to display on successful API call
  successMessage?: string;
  // Toast message to display on failed API call (overrides server message)
  errorMessage?: string;
  // Whether to show success toast notification
  showSuccessToast?: boolean;
  // Whether to show error toast notification
  showErrorToast?: boolean;
}

/**
 * Return value from the useApiCall hook.
 */
interface UseApiCallReturn<T, P extends unknown[]> {
  // The data returned from the successful API call
  data: T | null;
  // Whether the API call is currently in progress
  loading: boolean;
  // The error returned from a failed API call
  error: AxiosError | null;
  // Function to execute the API call with parameters
  execute: (...args: P) => Promise<T | null>;
  // Function to reset the hook state
  reset: () => void;
}

/**
 * Custom hook for managing API calls with loading states, error handling, and toast notifications.
 * Provides a standardized way to handle asynchronous API operations with automatic state management
 * and user feedback through toast messages.
 * 
 * @param {Function} apiFunction - The API function to execute, should return a Promise<T>
 * @param {ApiCallOptions<T>} options - Configuration options for success/error handling and notifications
 * @returns {UseApiCallReturn<T, P>} Object containing data, loading state, error, execute function, and reset function
 */
export function useApiCall<T = unknown, P extends unknown[] = unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: ApiCallOptions<T> = {},
): UseApiCallReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  // Memoized to prevent re-creating API executor function when dependencies haven't changed
  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError);

        logger.error('API call failed:', axiosError);

        if (showErrorToast) {
          // Use custom error message or extract from server response, with fallback
          const message =
            errorMessage ||
            (axiosError.response?.data as { message?: string })?.message ||
            i18n.t('common:errors.common.unexpected');
          toast.error(message);
        }

        onError?.(axiosError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunction,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccessToast,
      showErrorToast,
    ],
  );

  // Memoized to provide stable function reference for resetting hook state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Custom hook for managing API mutations (create, update, delete operations) without return data.
 * Similar to useApiCall but optimized for operations that don't return meaningful data,
 * focusing on success/failure status and user feedback through toast notifications.
 * 
 * @param {Function} apiFunction - The API mutation function to execute, should return a Promise
 * @param {Object} options - Configuration options for success/error handling and notifications
 * @returns {Object} Object containing loading state, error, and execute function that returns boolean success status
 */
export function useApiMutation<P extends unknown[] = unknown[]>(
  apiFunction: (...args: P) => Promise<unknown>,
  options: Omit<ApiCallOptions<unknown>, 'onSuccess'> & {
    onSuccess?: () => void;
  } = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  // Memoized to prevent re-creating mutation executor function when dependencies haven't changed
  const execute = useCallback(
    async (...args: P): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiFunction(...args);

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.();
        return true;
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError);

        logger.error('API mutation failed:', axiosError);

        if (showErrorToast) {
          // Use custom error message or extract from server response, with fallback
          const message =
            errorMessage ||
            (axiosError.response?.data as { message?: string })?.message ||
            i18n.t('common:errors.common.unexpected');
          toast.error(message);
        }

        onError?.(axiosError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunction,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccessToast,
      showErrorToast,
    ],
  );

  return { loading, error, execute };
}
