import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import logger from 'shared/utils/logger';

interface ApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface UseApiCallReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T = any, P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: ApiCallOptions<T> = {}
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
          const message = errorMessage || 
            (axiosError.response?.data as any)?.message || 
            'An error occurred';
          toast.error(message);
        }

        onError?.(axiosError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Variant for mutations that don't need to store data
export function useApiMutation<P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<any>,
  options: Omit<ApiCallOptions<any>, 'onSuccess'> & { 
    onSuccess?: () => void 
  } = {}
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
          const message = errorMessage || 
            (axiosError.response?.data as any)?.message || 
            'An error occurred';
          toast.error(message);
        }

        onError?.(axiosError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast]
  );

  return { loading, error, execute };
}