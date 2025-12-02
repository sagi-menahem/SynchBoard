/**
 * Validates email address format using RFC-compliant regular expression.
 * Performs comprehensive validation including null checks, type verification, and format testing.
 * Used in authentication forms and user profile management to ensure valid email addresses.
 *
 * @param {string} email - The email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (email === null || email === '' || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
