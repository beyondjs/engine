import type { Application, Request, Response as IResponse } from 'express';
import { validateBearerToken } from '@beyond-js/ai-server/http/middleware';
import * as fs from 'fs';
import { join } from 'path';

export class FilesRoutes {
	static setup(app: Application) {
		app.post('/files/upload', validateBearerToken, this.post);
	}

	static async post(req: Request, res: IResponse) {
		try {
			const { fileName, content } = req.body;
			if (!fileName || !content) {
				return res.status(400).json({ message: 'filename and content are required' });
			}

			const fileDestination = join(process.cwd(), 'uploads', fileName);

			fs.writeFile(fileDestination, content, err => {
				err
					? res.status(500).json({ message: `Failed to write file: ${err.message}` })
					: res.status(200).json({ message: 'File successfully uploaded' });
			});
		} catch (exc) {
			res.status(500).json({ message: 'Internal server error', error: exc.message });
		}
	}
}
