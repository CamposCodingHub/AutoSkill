import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} from '../utils/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct register data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Test1234',
        name: 'John Doe'
      };
      const result = registerSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Test1234',
        name: 'John Doe'
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'John Doe'
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject name that is too short', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Jo'
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Test1234'
      };
      const result = loginSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Test1234'
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct password change', () => {
      const validData = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123'
      };
      const result = changePasswordSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject weak new password', () => {
      const invalidData = {
        currentPassword: 'OldPass123',
        newPassword: 'weak'
      };
      expect(() => changePasswordSchema.parse(invalidData)).toThrow();
    });
  });
});
