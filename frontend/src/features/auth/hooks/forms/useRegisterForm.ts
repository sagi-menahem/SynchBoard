import type { RegisterRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';

import * as authService from '../../services/authService';

import { authValidation, extractFormData, useAuthForm } from './useAuthForm';

/**
 * Hook for managing user registration form submission with comprehensive validation.
 * Handles validation of required fields (email, password, firstName, gender) and optional fields,
 * processes registration API call, and triggers email verification flow upon success.
 *
 * @param onRegistrationSuccess - Callback fired when registration is successful, receives the registered email
 * @returns Form submission handler and loading state for registration functionality
 */
export const useRegisterForm = (onRegistrationSuccess: (email: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  return useAuthForm<RegisterRequest, string>({
    formType: 'register',
    validateFormData: (formData: FormData) => {
      const email = extractFormData.email(formData);
      const password = extractFormData.password(formData);
      const firstName = extractFormData.firstName(formData);
      const lastName = extractFormData.lastName(formData);
      const genderValue = formData.get('gender');
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

      const firstNameError = authValidation.validateRequiredField(
        firstName,
        t('auth:registerForm.fields.firstName'),
        t,
      );
      if (firstNameError) {
        return firstNameError;
      }

      const genderError = authValidation.validateRequiredField(
        genderValue as string,
        t('auth:registerForm.fields.gender'),
        t,
      );
      if (genderError) {
        return genderError;
      }

      // Include optional fields only if they have values
      return {
        email,
        password,
        firstName,
        gender,
        ...(lastName !== null && lastName !== '' && { lastName }),
        ...(phoneNumber !== null && phoneNumber !== '' && { phoneNumber }),
        ...(dateOfBirth !== null && dateOfBirth !== '' && { dateOfBirth }),
      };
    },
    serviceCall: authService.register,
    onSuccess: (_, requestData) => {
      onRegistrationSuccess(requestData.email);
    },
    logContext: 'Registration',
  });
};
