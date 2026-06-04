/**
 * Clerk auth middleware
 * Verifies the Clerk JWT/session token passed in the `Authorization: Bearer <token>` header
 * and attaches `req.clerkUserId` and `req.clerkUser` (if available).
 *
 * NOTE: This example uses `@clerk/clerk-sdk-node`. Ensure the package is installed
 * and `CLERK_SECRET_KEY` is available in the environment.
 */

const { Clerk } = require('@clerk/clerk-sdk-node');

/**
 * Protect backend routes by verifying Clerk bearer tokens.
 * The frontend should send `Authorization: Bearer <token>`.
 */
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const verified = await clerk.verifyToken(token);
    const clerkUserId = verified?.sub || verified?.userId || null;

    if (!clerkUserId) {
      return res.status(401).json({ message: 'Invalid Clerk token' });
    }

    req.clerkUserId = clerkUserId;
    req.clerkUser = verified;
    req.auth = { userId: clerkUserId };
    return next();
  } catch (err) {
    console.error('Clerk auth error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
