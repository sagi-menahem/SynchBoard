
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

export const sanitizeUserContent = (content: unknown): string => {
    if (content === null || content === undefined) {
        return '';
    }

    const stringContent = String(content);
    
    // Basic sanitization - remove script tags and potentially dangerous content
    if (!stringContent || typeof stringContent !== 'string') {
        return '';
    }

    let sanitized = stringContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    sanitized = sanitized.replace(/data:text\/html[^,]*,/gi, '');

    return sanitized;
};
