import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validatePassword,
  generateSecurePassword,
  validateCredentials,
  generateSessionToken,
  secureCompare,
  hashPassword,
  validateSessionToken,
  passwordNeedsChange,
  generateCSRFToken,
  validateCSRFToken,
  authRateLimiter,
  authSecurityConfig,
} from '../authSecurity';

describe('Authentication Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'StrongPass123!';
      const result = validatePassword(strongPassword);
      
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPassword = 'weak';
      const result = validatePassword(weakPassword);
      
      expect(result.valid).toBe(false);
      expect(result.score).toBeLessThan(50);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should enforce minimum length', () => {
      const shortPassword = 'Short1!';
      const result = validatePassword(shortPassword);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must be at least 8 characters long');
    });

    it('should enforce uppercase requirement', () => {
      const noUpperPassword = 'password123!';
      const result = validatePassword(noUpperPassword);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one uppercase letter');
    });

    it('should enforce lowercase requirement', () => {
      const noLowerPassword = 'PASSWORD123!';
      const result = validatePassword(noLowerPassword);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one lowercase letter');
    });

    it('should enforce number requirement', () => {
      const noNumberPassword = 'Password!';
      const result = validatePassword(noNumberPassword);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one number');
    });

    it('should enforce special character requirement', () => {
      const noSpecialPassword = 'Password123';
      const result = validatePassword(noSpecialPassword);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password must contain at least one special character');
    });

    it('should reject common passwords', () => {
      const commonPassword = 'password';
      const result = validatePassword(commonPassword);
      
      expect(result.valid).toBe(false);
      expect(result.feedback).toContain('Password is too common, please choose a different one');
    });

    it('should detect repeated characters', () => {
      const repeatedPassword = 'Password111!';
      const result = validatePassword(repeatedPassword);
      
      expect(result.feedback).toContain('Password contains repeated characters');
    });

    it('should detect sequential characters', () => {
      const sequentialPassword = 'Password123!';
      const result = validatePassword(sequentialPassword);
      
      expect(result.feedback).toContain('Password contains sequential characters');
    });

    it('should give bonus for longer passwords', () => {
      const longPassword = 'VeryLongPassword123!';
      const shortPassword = 'Short123!';
      
      const longResult = validatePassword(longPassword);
      const shortResult = validatePassword(shortPassword);
      
      expect(longResult.score).toBeGreaterThan(shortResult.score);
    });

    it('should respect custom configuration', () => {
      const customConfig = {
        minLength: 12,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommonPasswords: true,
        maxAge: 30,
      };

      const password = 'longpassword123!';
      const result = validatePassword(password, customConfig);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password with default length', () => {
      const password = generateSecurePassword();
      expect(password).toHaveLength(12);
    });

    it('should generate password with custom length', () => {
      const password = generateSecurePassword(16);
      expect(password).toHaveLength(16);
    });

    it('should generate password with required character types', () => {
      const password = generateSecurePassword(20);
      
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[0-9]/); // number
      expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>]/); // special
    });

    it('should generate different passwords each time', () => {
      const password1 = generateSecurePassword();
      const password2 = generateSecurePassword();
      
      expect(password1).not.toBe(password2);
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', () => {
      const result = validateCredentials('test@example.com', 'StrongPass123!');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const result = validateCredentials('invalid-email', 'StrongPass123!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject missing email', () => {
      const result = validateCredentials('', 'StrongPass123!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should reject weak password', () => {
      const result = validateCredentials('test@example.com', 'weak');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should sanitize inputs', () => {
      const result = validateCredentials('<script>alert("xss")</script>', 'password');
      
      expect(result.valid).toBe(false);
      // Should not contain script tags after sanitization
      expect(result.errors.join(' ')).not.toContain('<script>');
    });
  });

  describe('generateSessionToken', () => {
    it('should generate 64-character hex token', () => {
      const token = generateSessionToken();
      
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate different tokens each time', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const result = secureCompare('password123', 'password123');
      expect(result).toBe(true);
    });

    it('should return false for different strings', () => {
      const result = secureCompare('password123', 'password456');
      expect(result).toBe(false);
    });

    it('should return false for different length strings', () => {
      const result = secureCompare('password', 'password123');
      expect(result).toBe(false);
    });

    it('should be timing-safe', () => {
      // This is a basic check - in reality timing attacks are hard to test
      const short = 'a';
      const long = 'a'.repeat(1000);
      
      expect(secureCompare(short, long)).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash password consistently', async () => {
      const password = 'testpassword';
      const salt = 'testsalt';
      
      const hash1 = await hashPassword(password, salt);
      const hash2 = await hashPassword(password, salt);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1', 'salt');
      const hash2 = await hashPassword('password2', 'salt');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different salts', async () => {
      const hash1 = await hashPassword('password', 'salt1');
      const hash2 = await hashPassword('password', 'salt2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should work without salt', async () => {
      const hash = await hashPassword('password');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('validateSessionToken', () => {
    it('should validate correct token format', () => {
      const validToken = 'a'.repeat(64);
      expect(validateSessionToken(validToken)).toBe(true);
    });

    it('should reject invalid token format', () => {
      expect(validateSessionToken('invalid')).toBe(false);
      expect(validateSessionToken('a'.repeat(63))).toBe(false);
      expect(validateSessionToken('a'.repeat(65))).toBe(false);
      expect(validateSessionToken('G'.repeat(64))).toBe(false);
    });
  });

  describe('passwordNeedsChange', () => {
    it('should return false for recent password', () => {
      const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const result = passwordNeedsChange(recentDate);
      
      expect(result).toBe(false);
    });

    it('should return true for old password', () => {
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days ago
      const result = passwordNeedsChange(oldDate);
      
      expect(result).toBe(true);
    });

    it('should respect custom max age', () => {
      const customConfig = { 
        maxAge: 30,
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommonPasswords: true
      };
      const oldDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
      const result = passwordNeedsChange(oldDate, customConfig);
      
      expect(result).toBe(true);
    });
  });

  describe('CSRF tokens', () => {
    it('should generate CSRF token', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should validate CSRF token correctly', () => {
      const token = 'a'.repeat(64);
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'b'.repeat(64))).toBe(false);
    });
  });

  describe('AuthRateLimiter', () => {
    it('should allow initial attempts', () => {
      expect(authRateLimiter.canAttempt('test-user')).toBe(true);
    });

    it('should track failed attempts', () => {
      const user = 'test-user-2';
      
      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        authRateLimiter.recordAttempt(user, false);
      }
      
      expect(authRateLimiter.canAttempt(user)).toBe(false);
      expect(authRateLimiter.isLocked(user)).toBe(true);
    });

    it('should reset on successful attempt', () => {
      const user = 'test-user-3';
      
      // Make failed attempts
      for (let i = 0; i < 3; i++) {
        authRateLimiter.recordAttempt(user, false);
      }
      
      // Successful attempt should reset
      authRateLimiter.recordAttempt(user, true);
      expect(authRateLimiter.getRemainingAttempts(user)).toBe(5);
    });

    it('should return remaining attempts', () => {
      const user = 'test-user-4';
      
      authRateLimiter.recordAttempt(user, false);
      expect(authRateLimiter.getRemainingAttempts(user)).toBe(4);
      
      authRateLimiter.recordAttempt(user, false);
      expect(authRateLimiter.getRemainingAttempts(user)).toBe(3);
    });

    it('should provide lockout time', () => {
      const user = 'test-user-5';
      
      // Fill up attempts to trigger lockout
      for (let i = 0; i < 5; i++) {
        authRateLimiter.recordAttempt(user, false);
      }
      
      expect(authRateLimiter.getLockoutTime(user)).toBeGreaterThan(0);
    });

    it('should expire lockout after time', () => {
      const user = 'test-user-6';
      
      // Fill up attempts to trigger lockout
      for (let i = 0; i < 5; i++) {
        authRateLimiter.recordAttempt(user, false);
      }
      
      expect(authRateLimiter.canAttempt(user)).toBe(false);
      
      // Advance time past lockout period
      vi.advanceTimersByTime(31 * 60 * 1000); // 31 minutes
      
      expect(authRateLimiter.canAttempt(user)).toBe(true);
    });
  });

  describe('authSecurityConfig', () => {
    it('should provide password configuration', () => {
      const config = authSecurityConfig.getPasswordConfig();
      expect(config).toHaveProperty('minLength');
      expect(config).toHaveProperty('requireUppercase');
      expect(config).toHaveProperty('requireLowercase');
      expect(config).toHaveProperty('requireNumbers');
      expect(config).toHaveProperty('requireSpecialChars');
    });

    it('should allow password configuration updates', () => {
      const updates = { minLength: 10, maxAge: 60 };
      authSecurityConfig.updatePasswordConfig(updates);
      
      const config = authSecurityConfig.getPasswordConfig();
      expect(config.minLength).toBe(10);
      expect(config.maxAge).toBe(60);
    });

    it('should provide rate limiter instance', () => {
      expect(authSecurityConfig.rateLimiter).toBe(authRateLimiter);
    });
  });
});