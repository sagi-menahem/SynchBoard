import logger from 'utils/logger';

export interface MessageValidationSchema {
    requiredFields?: string[];
    allowedTypes?: string[];
    maxLength?: number;
}

export const sanitizeWebSocketString = (input: unknown): string => {
  if (typeof input !== 'string') {
    return String(input);
  }
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const sanitizeObject = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeWebSocketString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const objRecord = obj as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const key in objRecord) {
      if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
        const sanitizedKey = sanitizeWebSocketString(key);
        sanitized[sanitizedKey] = sanitizeObject(objRecord[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

export const isPrototypePollutionAttempt = (obj: Record<string, unknown>): boolean => {
  if ('__proto__' in obj) {
    const proto = obj['__proto__'];
    if (proto && typeof proto === 'object' && proto !== Object.prototype) {
      const suspiciousProps = ['constructor', 'valueOf', 'toString', 'hasOwnProperty'];
      for (const prop of suspiciousProps) {
        if (proto.hasOwnProperty(prop)) {
          return true;
        }
      }
    }
  }

  if ('constructor' in obj) {
    const constructor = obj['constructor'];
    if (constructor && typeof constructor === 'object') {
      if ('prototype' in constructor) {
        return true;
      }
    }
  }

  if ('prototype' in obj) {
    const prototype = obj['prototype'];
    if (prototype && typeof prototype === 'object') {
      return true;
    }
  }

  return false;
};

export const validateMessage = (data: unknown, schema?: MessageValidationSchema): boolean => {
  if (!data || typeof data !== 'object' || data === null) {
    logger.warn('Invalid message: not an object');
    return false;
  }

  const dataObj = data as Record<string, unknown>;

  if (isPrototypePollutionAttempt(dataObj)) {
    logger.error('Potential prototype pollution attempt detected');
    return false;
  }

  if (schema) {
    if (schema.requiredFields) {
      for (const field of schema.requiredFields) {
        if (!(field in dataObj)) {
          logger.warn(`Missing required field: ${field}`);
          return false;
        }
      }
    }

    if (schema.allowedTypes && 'updateType' in dataObj) {
      const updateType = dataObj['updateType'] as unknown;
      if (typeof updateType === 'string' && !schema.allowedTypes.includes(updateType)) {
        logger.warn(`Invalid updateType: ${updateType}`);
        return false;
      }
    }

    if (schema.maxLength && 'content' in dataObj) {
      const content = dataObj['content'] as unknown;
      if (typeof content === 'string' && content.length > schema.maxLength) {
        logger.warn(`Content exceeds maximum length of ${schema.maxLength}`);
        return false;
      }
    }
  }

  return true;
};

export const validateBoardMessage = (dataObj: Record<string, unknown>): boolean => {
  if ('type' in dataObj && 'instanceId' in dataObj && 'payload' in dataObj) {
    const actionType = dataObj['type'] as unknown;
    if (typeof actionType === 'string') {
      const validActionTypes = ['OBJECT_ADD', 'OBJECT_UPDATE', 'OBJECT_DELETE'];
      if (validActionTypes.includes(actionType)) {
        return true;
      }
    }
  }

  if ('type' in dataObj && 'sender' in dataObj) {
    const requiredFields = ['type', 'sender'];
    for (const field of requiredFields) {
      if (!(field in dataObj)) {
        logger.warn(`BoardActionDTO missing required field: ${field}`);
        return false;
      }
    }
        
    const actionType = dataObj['type'] as unknown;
    if (typeof actionType === 'string') {
      const validActionTypes = ['OBJECT_ADD', 'OBJECT_UPDATE', 'OBJECT_DELETE'];
      if (!validActionTypes.includes(actionType)) {
        logger.warn(`Invalid board action type: ${actionType}`);
        return false;
      }
    }
        
    return true;
  }

  if ('updateType' in dataObj && 'sourceUserEmail' in dataObj) {
    const requiredFields = ['updateType', 'sourceUserEmail'];
    for (const field of requiredFields) {
      if (!(field in dataObj)) {
        logger.warn(`BoardUpdateDTO missing required field: ${field}`);
        return false;
      }
    }
        
    const updateType = dataObj['updateType'] as unknown;
    if (typeof updateType === 'string') {
      const validUpdateTypes = ['DETAILS_UPDATED', 'MEMBERS_UPDATED'];
      if (!validUpdateTypes.includes(updateType)) {
        logger.warn(`Invalid board update type: ${updateType}`);
        return false;
      }
    }
        
    return true;
  }

  if ('type' in dataObj && 'content' in dataObj && 'timestamp' in dataObj && 'senderEmail' in dataObj) {
    const requiredFields = ['type', 'content', 'timestamp', 'senderEmail'];
    for (const field of requiredFields) {
      if (!(field in dataObj)) {
        logger.warn(`ChatMessageDTO missing required field: ${field}`);
        return false;
      }
    }
        
    const messageType = dataObj['type'] as unknown;
    if (typeof messageType === 'string') {
      const validMessageTypes = ['CHAT', 'JOIN', 'LEAVE'];
      if (!validMessageTypes.includes(messageType)) {
        logger.warn(`Invalid chat message type: ${messageType}`);
        return false;
      }
    }
        
    return true;
  }

  if ('instanceId' in dataObj || 'payload' in dataObj) {
    return true;
  }

  logger.warn('Board message does not match any known format');
  return false;
};