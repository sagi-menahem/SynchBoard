import { useActionState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

import logger from 'shared/utils/logger';

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
  // FormData preserved for re-populating form on error
  formValues?: Record<string, string>;
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
 * Extracts form values from FormData as a plain object for state preservation.
 */
const extractFormValues = (formData: FormData): Record<string, string> => {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      values[key] = value;
    }
  });
  return values;
};

/**
 * Custom hook for handling form submissions with integrated toast notifications and error handling.
 * Provides a comprehensive solution for form processing that includes validation, API calls,
 * user feedback through toast messages, and state management. Leverages React's useActionState
 * for handling form actions with proper loading states.
 *
 * @param {UseFormWithToastOptions<TRequest, TResponse>} options - Configuration for form handling
 * @returns {Object} Object containing form state, submit action, pending status, and form ref
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

  // Ref to store form element for preventing default reset on error
  const formRef = useRef<HTMLFormElement>(null);

  const formAction = useCallback(
    async (
      _previousState: FormState<TResponse>,
      formData: FormData,
    ): Promise<FormState<TResponse>> => {
      // Preserve form values before validation for potential restoration
      const formValues = extractFormValues(formData);
      const validation = validateFormData(formData);

      // Return early if validation fails, preserving form values
      if ('error' in validation) {
        return {
          success: false,
          error: validation.error,
          formValues,
        };
      }

      // Show loading toast
      const toastId = toast.loading(toastMessages.loading);

      try {
        // Execute service call
        const response = await serviceCall(validation);

        // Show success toast
        const successMessage =
          typeof toastMessages.success === 'function'
            ? toastMessages.success(response)
            : toastMessages.success;
        toast.success(successMessage, { id: toastId });

        if (onSuccess !== undefined) {
          onSuccess(response, validation);
        }

        return {
          success: true,
          data: response,
        };
      } catch (err: unknown) {
        logger.error(`${logContext} failed:`, err, contextInfo);

        // Show error toast
        const errorMessage =
          typeof toastMessages.error === 'function' ? toastMessages.error(err) : toastMessages.error;
        toast.error(errorMessage, { id: toastId });

        // Preserve form values on API error
        return {
          success: false,
          formValues,
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
    formRef,
  };
};
