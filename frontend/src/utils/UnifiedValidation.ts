import logger from 'utils/Logger';

export interface MessageValidationSchema {
  requiredFields?: string[];
  allowedTypes?: string[];
  maxLength?: number;
}

// Centralized XSS sanitization function
const XSS_PATTERNS = {
  SCRIPT_TAG: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  IFRAME_TAG: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  JAVASCRIPT_PROTOCOL: /javascript:/gi,
  EVENT_HANDLERS: /on\w+\s*=/gi,
  DATA_HTML: /data:text\/html[^,]*,/gi,
};

export const sanitizeString = (input: unknown): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  const stringContent = String(input);
  
  if (!stringContent || typeof stringContent !== 'string') {
    return '';
  }

  // Apply all XSS sanitization patterns
  let sanitized = stringContent;
  for (const pattern of Object.values(XSS_PATTERNS)) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
};

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
    for (const key in objRecord) {
      if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(objRecord[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

export const isSafeUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);

    if (!['http:', 'https:', ''].includes(parsed.protocol)) {
      return false;
    }

    if (url.toLowerCase().includes('javascript:')) {
      return false;
    }

    if (url.toLowerCase().startsWith('data:') && url.includes('text/html')) {
      return false;
    }

    return true;
  } catch {
    return !url.includes(':') && !url.includes('//');
  }
};

export const isPrototypePollutionAttempt = (obj: Record<string, unknown>): boolean => {
  // Only check for dangerous keys that are explicitly set as own properties
  const dangerousKeys = ['__proto__', 'prototype'];
  
  for (const key of dangerousKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return true;
    }
  }
  
  // Check for constructor.prototype pollution only if constructor is set to a malicious value
  // Only flag if constructor is explicitly set to a non-function object with prototype
  // Normal objects should have constructor as a function reference, not an object
  if (Object.prototype.hasOwnProperty.call(obj, 'constructor')) {
    const constructor = obj['constructor'];
    if (constructor && 
        typeof constructor === 'object' && 
        typeof constructor !== 'function' && 
        Object.prototype.hasOwnProperty.call(constructor as Record<string, unknown>, 'prototype')) {
      return true;
    }
  }

  return false;
};

export const validateMessage = (data: unknown, schema?: MessageValidationSchema): boolean => {
  if (typeof data !== 'object' || data === null) {
    logger.warn('Message validation failed: data is not an object');
    return false;
  }

  const dataObj = data as Record<string, unknown>;

  // Check for prototype pollution attempts
  if (isPrototypePollutionAttempt(dataObj)) {
    logger.warn('Message validation failed: prototype pollution attempt detected', dataObj);
    return false;
  }

  if (schema) {
    // Validate required fields
    if (schema.requiredFields) {
      for (const field of schema.requiredFields) {
        if (!(field in dataObj) || dataObj[field] === undefined || dataObj[field] === null) {
          logger.warn(`Message validation failed: required field '${field}' is missing`);
          return false;
        }
      }
    }

    // Validate allowed types
    if (schema.allowedTypes && 'type' in dataObj) {
      if (!schema.allowedTypes.includes(String(dataObj.type))) {
        logger.warn(`Message validation failed: type '${dataObj.type}' is not allowed`);
        return false;
      }
    }

    // Validate content length
    if (schema.maxLength && 'content' in dataObj) {
      const content = String(dataObj.content);
      if (content.length > schema.maxLength) {
        logger.warn(`Message validation failed: content length ${content.length} exceeds max ${schema.maxLength}`);
        return false;
      }
    }
  }

  return true;
};

export const validateBoardMessage = (data: Record<string, unknown>): boolean => {
  if (isPrototypePollutionAttempt(data)) {
    logger.warn('Board message validation failed: prototype pollution attempt detected');
    return false;
  }

  return true;
};

// Alias for backward compatibility
export const sanitizeUserContent = sanitizeString;
export const sanitizeWebSocketString = sanitizeString;