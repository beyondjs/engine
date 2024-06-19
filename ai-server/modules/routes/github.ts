import type { Application, Request, Response as IResponse } from 'express';
import { validateBearerToken } from '@beyond-js/ai-server/http/middleware';
import { concatenateFiles } from '@beyond-js/ai-server/github/concatenate';
import { addFiles, IAddFilesParams } from '@beyond-js/ai-server/github/add-files';

export class GitHubRoutes {
	static setup(app: Application) {
		app.get('/github/concatenate', validateBearerToken, this.concatenate);
		app.post('/github/add-files', validateBearerToken, this.addFiles);
	}

	static async concatenate(req: Request, res: IResponse) {
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

	static async addFiles(req: Request, res: IResponse) {
		try {
			const { repo, branch, message, folder } = req.body;

			// Validate required parameters
			if (!repo || !repo.owner || !repo.name || !branch || !message || !folder) {
				return res
					.status(400)
					.json({ message: 'Required fields: repo (owner and name), branch, message, folder' });
			}

			const params: IAddFilesParams = { repo, branch, message, folder };
			await addFiles({ ...params });

			res.status(200).json({ message: 'Files added and commit created successfully.' });
		} catch (exc) {
			res.status(500).json({ message: 'Internal server error', error: exc.message });
		}
	}
}
