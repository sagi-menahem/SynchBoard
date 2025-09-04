import { useActionState, useCallback } from 'react';

import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

/**
 * State object returned by form operations.
 */
export interface FormState<T = unknown> {
  // Whether the form submission was successful
  success: boolean;
  // Error message if the operation failed
  error?: string;
  // Data returned from successful operation
  data?: T;
}

/**
 * Toast notification messages for different form states.
 */
export interface ToastMessages {
  // Message shown while form is being processed
  loading: string;
  // Message shown on successful completion (static or dynamic)
  success: string | ((response?: unknown) => string);
  // Message shown on error (static or dynamic)
  error: string | ((error?: unknown) => string);
}

/**
 * Configuration options for useFormWithToast hook.
 */
export interface UseFormWithToastOptions<TRequest extends object, TResponse> {
  // Function to validate and parse form data into typed request object
  validateFormData: (formData: FormData) => TRequest | { error: string };
  // Service function to execute with validated data
  serviceCall: (data: TRequest) => Promise<TResponse>;
  // Toast messages for different operation states
  toastMessages: ToastMessages;
  // Optional callback executed on successful completion
  onSuccess?: (response: TResponse, requestData: TRequest) => void;
  // Additional context for logging purposes
  contextInfo?: Record<string, unknown>;
  // Context label for log messages
  logContext?: string;
}

/**
 * Custom hook for handling form submissions with integrated toast notifications and error handling.
 * Provides a comprehensive solution for form processing that includes validation, API calls,
 * user feedback through toast messages, and state management. Leverages React's useActionState
 * for handling form actions with proper loading states.
 * 
 * @param {UseFormWithToastOptions<TRequest, TResponse>} options - Configuration for form handling
 * @returns {Object} Object containing form state, submit action, and pending status
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

  const formAction = useCallback(
    async (
      _previousState: FormState<TResponse>,
      formData: FormData,
    ): Promise<FormState<TResponse>> => {
      const validation = validateFormData(formData);

      // Return early if validation fails
      if ('error' in validation) {
        return {
          success: false,
        };
      }

      try {
        // Execute service call with toast promise wrapper for user feedback
        const response = await toastPromise(serviceCall(validation), toastMessages);

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
    },
    [validateFormData, serviceCall, toastMessages, onSuccess, logContext, contextInfo],
  );

  const [state, submitAction, isPending] = useActionState(formAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};
