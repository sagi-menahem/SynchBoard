import logger from 'shared/utils/logger';

/**
 * Schema definition for validating WebSocket messages and API requests with security constraints.
 * Supports field requirements, type allowlists, and content length limits for comprehensive validation.
 */
export interface MessageValidationSchema {
  requiredFields?: string[];
  allowedTypes?: string[];
  maxLength?: number;
}

// Regular expressions for detecting common XSS attack vectors in user input
const XSS_PATTERNS = {
  SCRIPT_TAG: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  IFRAME_TAG: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  JAVASCRIPT_PROTOCOL: /javascript:/gi,
  EVENT_HANDLERS: /on\w+\s*=/gi,
  DATA_HTML: /data:text\/html[^,]*,/gi,
};

// Protocol patterns that pose security risks for URL validation
const DANGEROUS_PROTOCOLS = {
  JAVASCRIPT: ['java', 'script', ':'].join(''),
  DATA_HTML: 'data:',
} as const;

/**
 * Sanitizes user input by removing potentially dangerous XSS attack vectors.
 * Strips script tags, iframes, javascript protocols, event handlers, and data URLs
 * to prevent code injection attacks while preserving safe content.
 *
 * @param input - User input of any type to be sanitized
 * @returns Sanitized string with dangerous patterns removed, empty string for null/undefined input
 */
export const sanitizeString = (input: unknown): string => {
  if (input === null || input === undefined) {
    return '';
  }

  const stringContent = String(input);

  if (!stringContent || typeof stringContent !== 'string') {
    return '';
  }

  // Apply all XSS pattern filters to remove dangerous content
  let sanitized = stringContent;
  for (const pattern of Object.values(XSS_PATTERNS)) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
};

/**
 * Recursively sanitizes complex objects, arrays, and nested structures for XSS prevention.
 * Applies string sanitization to all string values while preserving object structure,
 * ensuring deep sanitization of nested content and array elements.
 *
 * @param obj - Object, array, or primitive value to sanitize recursively
 * @returns Sanitized version of input with all string content processed for XSS removal
 */
export const sanitizeObject = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const objRecord = obj as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    // Use hasOwnProperty check to prevent prototype pollution while maintaining traversal integrity
    for (const key in objRecord) {
      if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
        // Sanitize both object keys and values to prevent key-based XSS
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(objRecord[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Validates URLs for security threats including protocol-based attacks and dangerous schemes.
 * Ensures URLs use safe protocols (http/https) and prevents javascript:, data: HTML, and other
 * potentially malicious URL schemes that could execute code or bypass security controls.
 *
 * @param url - URL string to validate for security threats
 * @returns True if URL is safe for use in links, redirects, and other contexts
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);

    // Allow only safe HTTP protocols - empty string protocol indicates relative URLs
    if (!['http:', 'https:', ''].includes(parsed.protocol)) {
      return false;
    }

    // Block javascript: protocol attempts
    if (url.toLowerCase().includes(DANGEROUS_PROTOCOLS.JAVASCRIPT)) {
      return false;
    }

    // Block data: URLs that could contain HTML/JavaScript
    if (url.toLowerCase().startsWith(DANGEROUS_PROTOCOLS.DATA_HTML) && url.includes('text/html')) {
      return false;
    }

    return true;
  } catch {
    // For relative URLs, ensure no protocol or scheme indicators
    return !url.includes(':') && !url.includes('//');
  }
};

/**
 * Detects prototype pollution attack attempts in objects by checking for dangerous property names.
 * Scans for __proto__, prototype, and constructor.prototype manipulations that could modify
 * JavaScript object prototypes and lead to security vulnerabilities or application corruption.
 *
 * @param obj - Object to inspect for prototype pollution patterns
 * @returns True if object contains potential prototype pollution attempt indicators
 */
export const isPrototypePollutionAttempt = (obj: Record<string, unknown>): boolean => {
  const dangerousKeys = ['__proto__', 'prototype'];

  // Check for direct prototype pollution keys
  for (const key of dangerousKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return true;
    }
  }

  // Check for constructor.prototype manipulation attempts
  if (Object.prototype.hasOwnProperty.call(obj, 'constructor')) {
    const constructor = obj['constructor'];
    if (
      constructor &&
      typeof constructor === 'object' &&
      typeof constructor !== 'function' &&
      Object.prototype.hasOwnProperty.call(constructor as Record<string, unknown>, 'prototype')
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Validates incoming WebSocket messages and API requests against security and schema constraints.
 * Performs comprehensive validation including prototype pollution detection, required field checking,
 * type allowlisting, and content length limits to ensure message safety and structure compliance.
 *
 * @param data - Message data to validate for security and schema compliance
 * @param schema - Optional validation schema defining field requirements and constraints
 * @returns True if message passes all security and schema validation checks
 */
export const validateMessage = (data: unknown, schema?: MessageValidationSchema): boolean => {
  if (typeof data !== 'object' || data === null) {
    logger.warn('Message validation failed: data is not an object');
    return false;
  }

  const dataObj = data as Record<string, unknown>;

  // First check for prototype pollution attempts
  if (isPrototypePollutionAttempt(dataObj)) {
    logger.warn('Message validation failed: prototype pollution attempt detected', dataObj);
    return false;
  }

  // Apply optional schema validation if provided
  if (schema) {
    if (schema.requiredFields) {
      for (const field of schema.requiredFields) {
        if (!(field in dataObj) || dataObj[field] === undefined || dataObj[field] === null) {
          logger.warn(`Message validation failed: required field '${field}' is missing`);
          return false;
        }
      }
    }

    if (schema.allowedTypes && 'type' in dataObj) {
      if (!schema.allowedTypes.includes(String(dataObj.type))) {
        logger.warn(`Message validation failed: type '${dataObj.type}' is not allowed`);
        return false;
      }
    }

    if (schema.maxLength && 'content' in dataObj) {
      const content = String(dataObj.content);
      if (content.length > schema.maxLength) {
        logger.warn(
          `Message validation failed: content length ${content.length} exceeds max ${schema.maxLength}`,
        );
        return false;
      }
    }
  }

  return true;
};

/**
 * Specialized validation for board-related WebSocket messages with focus on prototype pollution prevention.
 * Simplified validation for real-time board updates, chat messages, and canvas operations
 * where performance is critical but security remains paramount.
 *
 * @param data - Board message object to validate for security threats
 * @returns True if board message is safe for processing by WebSocket handlers
 */
export const validateBoardMessage = (data: Record<string, unknown>): boolean => {
  if (isPrototypePollutionAttempt(data)) {
    logger.warn('Board message validation failed: prototype pollution attempt detected');
    return false;
  }

  return true;
};

/**
 * Alias for sanitizeString providing semantic clarity for user-generated content sanitization.
 * Specifically designed for cleaning user input such as form fields, comments, and text content
 * before display or storage to prevent XSS attacks and maintain application security.
 */
export const sanitizeUserContent = sanitizeString;
