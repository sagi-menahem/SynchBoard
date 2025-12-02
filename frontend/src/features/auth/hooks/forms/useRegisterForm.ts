import type { AuthResponse, RegisterRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';

import * as authService from '../../services/authService';

import { authValidation, extractFormData, useAuthForm } from './useAuthForm';

/**
 * Hook for managing user registration form submission with comprehensive validation.
 * Handles validation of required fields (email, password, firstName, gender) and optional fields,
 * processes registration API call, and triggers either email verification flow or immediate login.
 *
 * @param onRegistrationSuccess - Callback fired when registration is successful, receives either email for verification or auth token for immediate login
 * @returns Form submission handler and loading state for registration functionality
 */
export const useRegisterForm = (
  onRegistrationSuccess: (emailOrToken: string | AuthResponse) => void,
) => {
  const { t } = useTranslation(['auth', 'common']);

  return useAuthForm<RegisterRequest, AuthResponse | string>({
    formType: 'register',
    validateFormData: (formData: FormData) => {
      const email = extractFormData.email(formData);
      const password = extractFormData.password(formData);
      const confirmPassword = extractFormData.confirmPassword(formData);
      const firstName = extractFormData.firstName(formData);
      const lastName = extractFormData.lastName(formData);
      const gender = extractFormData.gender(formData);
      const phoneNumber = extractFormData.phoneNumber(formData);
      const dateOfBirth = extractFormData.dateOfBirth(formData);

      const emailError = authValidation.validateEmail(email, t);
      if (emailError) {
        return emailError;
      }

      const passwordError = authValidation.validatePassword(password, t);
      if (passwordError) {
        return passwordError;
      }

      const confirmPasswordError = authValidation.validateConfirmPassword(
        password,
        confirmPassword,
        t,
      );
      if (confirmPasswordError) {
        return confirmPasswordError;
      }

      const firstNameError = authValidation.validateRequiredField(
        firstName,
        t('auth:registerForm.fields.firstName'),
        t,
      );
      if (firstNameError) {
        return firstNameError;
      }

      // Gender is now optional - include only if provided
      // Include optional fields only if they have values
      return {
        email,
        password,
        firstName,
        ...(gender && { gender }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth }),
      };
    },
    serviceCall: authService.register,
    onSuccess: (response, requestData) => {
      // Check if response is AuthResponse (has token) or string message
      if (typeof response === 'string') {
        // Email verification enabled - pass email for verification modal
        onRegistrationSuccess(requestData.email);
      } else {
        // Email verification disabled - pass auth token for immediate login
        onRegistrationSuccess(response);
      }
    },
    logContext: 'Registration',
  });
};
