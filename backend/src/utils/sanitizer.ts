import DOMPurify from 'dompurify';

// Configurações de sanitização
const sanitizeConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title', 'target'],
};

// Sanitizar texto para prevenir XSS
export function sanitizeText(text: string): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, sanitizeConfig);
}

// Sanitizar objeto recursivamente
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// Middleware para sanitizar req.body
export function sanitizeBody(req: any, res: any, next: any) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
}
