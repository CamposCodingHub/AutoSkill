import rateLimit from 'express-rate-limit';

// Rate limiting específico para login (5 tentativas em 15 minutos)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar tentativas bem-sucedidas
});

// Rate limiting geral para API (100 requisições por minuto)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requisições
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para registro (3 tentativas por hora)
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 tentativas
  message: {
    error: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
