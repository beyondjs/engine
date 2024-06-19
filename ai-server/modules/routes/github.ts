import type { Application, Request, Response as IResponse } from 'express';
import { validateBearerToken } from '@beyond-js/ai-server/http/middleware';
import { concatenateFiles } from '@beyond-js/ai-server/github/concatenate';

export class GitHubRoutes {
	static setup(app: Application) {
		app.get('/github/tools', /* validateBearerToken, */ this.get);
	}

	static async get(req: Request, res: IResponse) {
		try {
			const baseUrl: string = <string>req.query.baseUrl;
			if (!baseUrl) {
				return res.status(400).json({ message: 'Parameter baseUrl is required' });
			}

			const concatenatedContent = await concatenateFiles(baseUrl);
			res.status(200).send(concatenatedContent);
		} catch (exc) {
			res.status(500).json({ message: 'Internal server error', error: exc.message });
		}
	}
}
