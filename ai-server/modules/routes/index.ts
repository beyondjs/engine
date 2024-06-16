import type { Application, Request, Response } from 'express';
import { FilesRoutes } from './files';

export /*bundle*/ class Routes {
	static setup(app: Application) {
		app.get('/', (req: Request, res: Response) => res.send('BeyonsJS AI API HTTP Server'));

		FilesRoutes.setup(app);
	}
}
