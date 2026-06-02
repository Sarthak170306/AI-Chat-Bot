const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

/**
 * Example protected endpoint: sync Clerk user into our MongoDB users collection.
 * Frontend should call this after Clerk authentication to ensure we have a user record.
 * POST /api/auth/sync
 * Body: (optional) additional profile info
 */
router.post('/sync', authMiddleware, async (req, res) => {
	try {
		// `authMiddleware` should attach `req.clerkUserId` and `req.clerkUser` when verification succeeds
		const clerkUserId = req.clerkUserId;
		const profile = req.body || {};

		if (!clerkUserId) return res.status(400).json({ message: 'Missing Clerk user id' });

		// Upsert user record by clerkUserId (stored in the email field for example purposes)
		// Adjust schema/storage as needed — here we map clerkUserId -> email field `clerkId` if desired.
		let user = await User.findOne({ email: profile.email });
		if (!user) {
			user = new User({
				username: profile.username || profile.name || `user_${clerkUserId.slice(-6)}`,
				email: profile.email || `${clerkUserId}@clerk.local`,
				password: 'CLERK_MANAGED',
			});
			// Save clerk id in a separate field if your schema supports it. For now we save email mapping only.
			await user.save();
		}

		return res.json({ user, synced: true });
	} catch (err) {
		console.error('Sync error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
