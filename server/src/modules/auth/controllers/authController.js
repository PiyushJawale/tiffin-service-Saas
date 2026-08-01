const authService = require('../services/authService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    return sendSuccess(res, 201, 'User registered successfully', {
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  });

  /**
   * POST /auth/login
   * Login user
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    return sendSuccess(res, 200, 'Login successful', {
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  });

  /**
   * GET /auth/me
   * Get current logged in user
   */
  getMe = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user._id);
    return sendSuccess(res, 200, 'User retrieved successfully', user);
  });

  /**
   * PUT /auth/profile
   * Update user profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully', user);
  });

  /**
   * POST /auth/refresh-token
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    const tokens = await authService.refreshToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 200, 'Token refreshed successfully', {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  });

  /**
   * POST /auth/logout
   * Logout user
   */
  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user._id);

    res.clearCookie('refreshToken');

    return sendSuccess(res, 200, 'Logged out successfully');
  });
}

module.exports = new AuthController();