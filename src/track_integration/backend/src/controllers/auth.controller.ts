import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';

// Mock DB handler interface
const mockUsers = [
  {
    id: 'user-001',
    name: 'Elena Petrova',
    email: 'elena.petrova@zafir-academy.com',
    passwordHash: '$2b$12$N9qo8uLOqpY3SgH2rLpUz.VfM3A0l6eIq4TfK5yV6z5o4WcZq321O', // bcrypt hash
    role: 'OPERATOR' as const
  }
];

export class AuthController {
  /**
   * Log in user, returning signed authentication token
   */
  static async login(req: AuthenticatedRequest, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required credentials.' });
    }

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed. Check security signature.' });
    }

    const match = await AuthService.verifyPassword(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Key mismatch. Invalid password.' });
    }

    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.json({
      message: 'Secure biometric/cryptographic credential match.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  /**
   * Retrieve active user profile
   */
  static getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(400).json({ error: 'User payload context absent.' });
    }
    return res.json({ user: req.user });
  }
}
