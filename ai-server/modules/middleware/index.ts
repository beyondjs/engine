import type { Request, Response, NextFunction } from 'express';

// Middleware function for validating bearer authentication token
export /*bundle*/ const validateBearerToken = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const accessToken = authHeader && authHeader.split(' ')[1];

	if (!accessToken) {
		console.log(accessToken);
		return res.status(401).json({ error: 'Access token not provided' });
	}

	try {
		// Simulate token validation
		// Replace this with your actual token validation logic
		const isValidToken = await validateToken(accessToken);

		if (!isValidToken) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		next();
	} catch (error) {
		res.status(500).json({ error: 'Failed to authenticate token' });
	}
};

// Dummy function to simulate token validation
// Replace this with your actual token validation logic
async function validateToken(token: string) {
	// Simulate token validation
	return token === 'valid-token';
}
