import { useActionState } from 'react';

import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

export interface FormState<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ToastMessages {
  loading: string;
  success: string | ((response?: unknown) => string);
  error: string | ((error?: unknown) => string);
}

export interface UseFormWithToastOptions<TRequest extends object, TResponse> {
  validateFormData: (formData: FormData) => TRequest | { error: string };
  serviceCall: (data: TRequest) => Promise<TResponse>;
  toastMessages: ToastMessages;
  onSuccess?: (response: TResponse, requestData: TRequest) => void;
  contextInfo?: Record<string, unknown>;
  logContext?: string;
}

/**
 * Generic form hook that standardizes form handling with toast notifications
 */
export const useFormWithToast = <TRequest extends object, TResponse = unknown>(
  options: UseFormWithToastOptions<TRequest, TResponse>,
) => {
  const {
    validateFormData,
    serviceCall,
    toastMessages,
    onSuccess,
    contextInfo = {},
    logContext = 'Form operation',
  } = options;

  const formAction = async (
    _previousState: FormState<TResponse>,
    formData: FormData,
  ): Promise<FormState<TResponse>> => {
    const validation = validateFormData(formData);
    
    if ('error' in validation) {
      return {
        success: false,
        error: validation.error,
      };
    }

    try {
      const response = await toastPromise(
        serviceCall(validation),
        toastMessages,
      );

      if (onSuccess !== undefined) {
        onSuccess(response, validation);
      }

      return {
        success: true,
        data: response,
      };
    } catch (err: unknown) {
      logger.error(`${logContext} failed:`, err, contextInfo);
      
      return {
        success: false,
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(formAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};