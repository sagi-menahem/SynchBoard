/**
 * Email validation using regex pattern
 */
export const validateEmail = (email: string): boolean => {
  if (email === null || email === '' || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Check if a string is empty or only whitespace
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim().length === 0;
};

/**
 * Validate required fields
 */
export const validateRequired = (fields: Record<string, unknown>): string[] => {
  const errors: string[] = [];
  
  Object.entries(fields).forEach(([fieldName, value]) => {
    if (isEmpty(value as string | null | undefined)) {
      errors.push(fieldName);
    }
  });
  
  return errors;
};