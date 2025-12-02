export interface BackendError {
  message: string;
}

/**
 * Type guard function that determines if unknown data represents a structured backend error.
 * Validates that the data contains a properly formatted error message from the server.
 * Used in API error handling to differentiate structured errors from unexpected failures.
 *
 * @param {unknown} data - Data to check, typically from HTTP response body
 * @returns {data is BackendError} True if data matches BackendError interface structure
 */
export const isBackendError = (data: unknown): data is BackendError => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Validate message field exists, is string, non-empty, and reasonable length
  return (
    'message' in obj &&
    typeof obj.message === 'string' &&
    obj.message.trim().length > 0 &&
    obj.message.length <= 500 // Prevent memory abuse from malicious payloads
  );
};
