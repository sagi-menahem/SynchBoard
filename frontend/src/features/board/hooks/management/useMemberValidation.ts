import { useCallback } from 'react';

import { useAuth } from 'features/auth/hooks/useAuth';
import { checkUserExists } from 'features/settings/services/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';
import { validateEmail } from 'shared/utils/validationUtils';

export interface MemberValidationResult {
  isValid: boolean;
  error?: string;
}

export const useMemberValidation = () => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();

  const validateMemberEmail = useCallback(async (
    email: string,
    existingEmails: string[] = [],
  ): Promise<MemberValidationResult> => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if email is empty
    if (!trimmedEmail) {
      return { isValid: false, error: 'Empty email' };
    }
    
    // Check email format
    if (!validateEmail(trimmedEmail)) {
      toast.error(t('board:createForm.invalidEmail'));
      return { isValid: false, error: 'Invalid email format' };
    }

    // Check if user is trying to invite themselves
    if (userEmail && trimmedEmail === userEmail.toLowerCase()) {
      toast.error(t('board:createForm.cannotInviteSelf'));
      return { isValid: false, error: 'Cannot invite self' };
    }
    
    // Check if email is already in the list
    if (existingEmails.includes(trimmedEmail)) {
      toast.error(t('board:createForm.emailAlreadyAdded'));
      return { isValid: false, error: 'Email already added' };
    }

    // Check if user exists in the system
    try {
      const userExists = await checkUserExists(trimmedEmail);
      if (!userExists) {
        toast.error(t('board:createForm.userNotFound', { email: trimmedEmail }));
        return { isValid: false, error: 'User not found' };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('Error checking user existence:', error);
      toast.error(t('board:createForm.errorCheckingUser'));
      return { isValid: false, error: 'API error checking user' };
    }
  }, [t, userEmail]);

  const validateEmailFormat = useCallback((email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {return false;}
    return validateEmail(trimmedEmail);
  }, []);

  const checkIfSelfInvite = useCallback((email: string): boolean => {
    if (!userEmail) {return false;}
    return email.trim().toLowerCase() === userEmail.toLowerCase();
  }, [userEmail]);

  const checkIfEmailExists = useCallback((email: string, existingEmails: string[]): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    return existingEmails.includes(trimmedEmail);
  }, []);

  return {
    validateMemberEmail,
    validateEmailFormat,
    checkIfSelfInvite,
    checkIfEmailExists,
  };
};