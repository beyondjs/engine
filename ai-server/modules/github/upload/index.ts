import { Files } from './files';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Interface for the parameters required to add multiple files.
 */
export interface AddFilesParams {
	api: string;
	repo: { owner: string; name: string };
	branch: string;
	message: string;
	folder: string;
}

/**
 * Adds multiple files to a GitHub repository.
 *
 * @param params - The parameters required to add files.
 */
export async function addFiles(params: AddFilesParams) {
	const { api, repo, branch, message, folder } = params;
	const filesInstance = new Files(api, repo, branch);

	const directoryPath = join(process.cwd(), 'uploads', folder);

	async function getFiles(dir: string): Promise<{ path: string; fullPath: string }[]> {
		const dirents = await fs.readdir(dir, { withFileTypes: true });
		const files = await Promise.all(
			dirents.map(async dirent => {
				const res = join(dir, dirent.name);
				if (dirent.isDirectory()) {
					return getFiles(res);
				} else {
					return { path: res.replace(directoryPath + '/', ''), fullPath: res };
				}
			})
		);
		return Array.prototype.concat(...files);
	}

	try {
		const files = await getFiles(directoryPath);
		await filesInstance.add(message, files);
	} catch (error) {
		console.error(error);
	}
}
