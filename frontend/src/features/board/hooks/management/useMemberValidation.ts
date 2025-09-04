import { useAuth } from 'features/auth/hooks/useAuth';
import { checkUserExists } from 'features/settings/services/userService';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';
import { validateEmail } from 'shared/utils/validationUtils';

export interface MemberValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Custom hook that provides comprehensive email validation for board member operations.
 * This hook handles the complex validation logic required for member invitations including
 * email format validation, duplicate checking, self-invitation prevention, and user existence
 * verification. It integrates with the user service to check if invited users exist in the system
 * and provides detailed error feedback through toast notifications. The hook separates validation
 * concerns into discrete functions for flexibility and reusability across different member
 * management scenarios, ensuring data integrity and user experience quality.
 * 
 * @returns Object containing validation functions for email format, self-invite checking,
 *   duplicate detection, and comprehensive member email validation with API verification
 */
export const useMemberValidation = () => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();

  const validateMemberEmail = useCallback(
    async (email: string, existingEmails: string[] = []): Promise<MemberValidationResult> => {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        return { isValid: false, error: 'Empty email' };
      }

      if (!validateEmail(trimmedEmail)) {
        toast.error(t('board:createForm.invalidEmail'));
        return { isValid: false, error: 'Invalid email format' };
      }

      if (userEmail && trimmedEmail === userEmail.toLowerCase()) {
        toast.error(t('board:createForm.cannotInviteSelf'));
        return { isValid: false, error: 'Cannot invite self' };
      }

      if (existingEmails.includes(trimmedEmail)) {
        toast.error(t('board:createForm.emailAlreadyAdded'));
        return { isValid: false, error: 'Email already added' };
      }

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
    },
    [t, userEmail],
  );

  const validateEmailFormat = useCallback((email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return false;
    }
    return validateEmail(trimmedEmail);
  }, []);

  const checkIfSelfInvite = useCallback(
    (email: string): boolean => {
      if (!userEmail) {
        return false;
      }
      return email.trim().toLowerCase() === userEmail.toLowerCase();
    },
    [userEmail],
  );

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
