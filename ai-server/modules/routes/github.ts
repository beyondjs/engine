import type { Application, Request, Response as IResponse } from 'express';
import { validateBearerToken } from '@beyond-js/ai-server/http/middleware';
import { concatenateFiles } from '@beyond-js/ai-server/github';

export class GitHubRoutes {
	static setup(app: Application) {
		app.post('/github/tools', validateBearerToken, this.post);
	}

	static async post(req: Request, res: IResponse) {
		try {
			const { baseUrl } = req.body;
			if (!baseUrl) {
				return res.status(400).json({ message: 'Parameter baseUrl is required' });
			}

			const concatenatedContent = await concatenateFiles(baseUrl);
			res.json({ concatenatedContent });
		} catch (exc) {
			res.status(500).json({ message: 'Internal server error', error: exc.message });
		}
	}
}
