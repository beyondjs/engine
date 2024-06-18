import * as express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { middleware } from 'express-openapi-validator';
import { Routes } from '@beyond-js/ai-server/http/routes';
import { join } from 'path';

// Initialise express
const app = express();
app.use(express.json());

// Setup middleware for OpenAPI specs validation
const apiSpec = join(process.cwd(), 'openapi/merged.yaml');
app.use(middleware({ apiSpec }));

// Setup custom error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
	if (!error) return next();
	res.status(error.status || 500).json({ message: error.message, errors: error.errors });
});

Routes.setup(app);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log('Local repository port is:', PORT);
	console.log(`http://localhost:${PORT}`);
});
