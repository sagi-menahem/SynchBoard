import { useCallback, useRef, useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
 * Maps HTTP status codes to translation keys for consistent error messaging.
 */
const STATUS_CODE_TRANSLATION_MAP: Record<number, string> = {
  401: 'auth:errors.badCredentials',
  404: 'auth:errors.forgotPassword', // "Email not registered in the system"
  409: 'auth:errors.emailAlreadyRegistered',
};

/**
 * Attempts to translate a message if it looks like a translation key.
 * Returns the translated message or null if translation failed.
 */
const tryTranslateKey = (message: string, t: (key: string) => string): string | null => {
  // Check if message looks like a translation key (contains dots or specific patterns)
  if (!message.includes('.') && !message.includes(':')) {
    return null;
  }

  // Normalize the key - handle various formats from backend
  const possibleKeys = [
    message, // Try as-is first
    `auth:errors.${message}`, // Try with auth:errors prefix
    `auth:${message}`, // Try with auth: prefix
    message.replace('auth.', 'auth:'), // Convert dot notation to colon
    `auth:errors.${message.replace('auth.', '')}`, // Strip auth. and add auth:errors
  ];

  for (const key of possibleKeys) {
    const translated = t(key);
    // Check if translation succeeded (result differs from key)
    if (translated && translated !== key && !translated.includes('.')) {
      return translated;
    }
  }

  return null;
};

/**
 * Extracts and translates error message from various error types.
 * Handles HTTP status codes, backend translation keys, and fallback messages.
 */
const extractErrorMessage = (
  err: unknown,
  toastMessages: ToastMessages,
  t: (key: string) => string,
): string => {
  // Check for Axios error with response
  if (err !== null && err !== undefined && typeof err === 'object' && 'response' in err) {
    const axiosError = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };

    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message;

    // First, try to map status code to a known translation key
    if (status && STATUS_CODE_TRANSLATION_MAP[status]) {
      const translatedByStatus = t(STATUS_CODE_TRANSLATION_MAP[status]);
      if (translatedByStatus && !translatedByStatus.includes(':')) {
        return translatedByStatus;
      }
    }

    // Second, try to translate the server message if it looks like a key
    if (serverMessage) {
      const translatedMessage = tryTranslateKey(serverMessage, t);
      if (translatedMessage) {
        return translatedMessage;
      }
    }

    // Third, for specific status codes without translation, use generic fallbacks
    if (status === 401) {
      return t('auth:errors.badCredentials');
    }
    if (status === 404) {
      return t('auth:errors.forgotPassword');
    }
    if (status === 409) {
      return t('auth:errors.emailAlreadyRegistered');
    }
  }

  // Use configured error message handler (which should already be translated)
  if (typeof toastMessages.error === 'function') {
    return toastMessages.error(err);
  }

  return toastMessages.error;
};

/**
 * Custom hook for handling form submissions with integrated toast notifications and error handling.
 * Provides a comprehensive solution for form processing that includes validation, API calls,
 * user feedback through toast messages, and state management. Uses useState and useTransition
 * for proper React 19 compatibility.
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

  // Get translation function for error message internationalization
  const { t } = useTranslation(['auth', 'common']);

  // State management
  const [state, setState] = useState<FormState<TResponse>>({ success: false });
  const [isPending, startTransition] = useTransition();

  // Ref to store form element for preventing default reset on error
  const formRef = useRef<HTMLFormElement>(null);

  const submitAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        // Preserve form values before validation for potential restoration
        const formValues = extractFormValues(formData);
        const validation = validateFormData(formData);

        // Return early if validation fails, preserving form values
        if ('error' in validation) {
          setState({
            success: false,
            error: validation.error,
            formValues,
          });
          return;
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

          // Update state with success
          setState({
            success: true,
            data: response,
          });

          if (onSuccess !== undefined) {
            onSuccess(response, validation);
          }
        } catch (err: unknown) {
          logger.error(`${logContext} failed:`, err, contextInfo);

          // Extract and translate error message
          const errorMessage = extractErrorMessage(err, toastMessages, t);
          toast.error(errorMessage, { id: toastId });

          // Preserve form values on API error
          setState({
            success: false,
            error: errorMessage,
            formValues,
          });
        }
      });
    },
    [validateFormData, serviceCall, toastMessages, onSuccess, logContext, contextInfo, t],
  );

  return {
    state,
    submitAction,
    isPending,
    formRef,
  };
};
