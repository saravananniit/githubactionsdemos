const bcrypt = require('bcryptjs');
const dbService = require('./db.service');
const { generateToken } = require('../utils/jwt.utils');

/**
 * Authentication service
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user (without password) and token
   */
  async register(userData) {
    const { email, password, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await dbService.findByField('users', 'email', email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await dbService.create('users', {
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User (without password) and token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await dbService.findByField('users', 'email', email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get current user profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object (without password)
   */
  async getProfile(userId) {
    const user = await dbService.findById('users', userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
