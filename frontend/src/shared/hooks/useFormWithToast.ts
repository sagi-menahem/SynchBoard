import { useActionState } from 'react';

import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

export interface FormState<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ToastMessages {
  loading: string;
  success: string | ((response?: any) => string);
  error: string | ((error?: any) => string);
}

export interface UseFormWithToastOptions<TRequest extends object, TResponse> {
  validateFormData: (formData: FormData) => TRequest | { error: string };
  serviceCall: (data: TRequest) => Promise<TResponse>;
  toastMessages: ToastMessages;
  onSuccess?: (response: TResponse, requestData: TRequest) => void;
  contextInfo?: Record<string, any>;
  logContext?: string;
}

/**
 * Generic form hook that standardizes form handling with toast notifications
 */
export const useFormWithToast = <TRequest extends object, TResponse = any>(
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
        serviceCall(validation as TRequest),
        toastMessages,
      );

      onSuccess?.(response, validation);

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