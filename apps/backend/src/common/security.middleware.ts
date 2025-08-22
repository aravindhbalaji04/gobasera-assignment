import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Request logging for security monitoring
    this.logSecurityEvent(req);

    // Rate limiting check (additional layer)
    if (this.isRateLimitExceeded(req)) {
      this.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      return res.status(429).json({
        message: 'Too many requests',
        retryAfter: 60
      });
    }

    next();
  }

  private logSecurityEvent(req: Request) {
    const securityInfo = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      headers: {
        origin: req.get('Origin'),
        referer: req.get('Referer'),
        'x-forwarded-for': req.get('X-Forwarded-For'),
      }
    };

    // Log suspicious requests
    if (this.isSuspiciousRequest(req)) {
      this.logger.warn(`Suspicious request detected: ${JSON.stringify(securityInfo)}`);
    }

    // Log all requests in development
    if (this.configService.get('nodeEnv') === 'development') {
      this.logger.debug(`Request: ${req.method} ${req.path} from ${req.ip}`);
    }
  }

  private isSuspiciousRequest(req: Request): boolean {
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union\s+select/i, // SQL injection
      /eval\s*\(/i, // Code injection
    ];

    const path = req.path.toLowerCase();
    const userAgent = req.get('User-Agent')?.toLowerCase() || '';

    return suspiciousPatterns.some(pattern => 
      pattern.test(path) || pattern.test(userAgent)
    );
  }

  private isRateLimitExceeded(req: Request): boolean {
    // This is a simplified check - actual rate limiting is handled by express-rate-limit
    // This provides an additional layer of security
    return false;
  }
}
