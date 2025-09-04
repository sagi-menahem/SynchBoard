import type { RegisterRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';

import * as authService from '../../services/authService';

import { authValidation, extractFormData, useAuthForm } from './useAuthForm';

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
