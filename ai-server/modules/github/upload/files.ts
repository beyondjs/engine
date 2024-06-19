import { promises as fs } from 'fs';
import { Blob } from './blob';
import { Tree } from './tree';
import { Commit } from './commit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const GITHUB_TOKEN = <string>process.env.GITHUB_TOKEN;

/**
 * Files class for adding multiple files in a GitHub repository.
 * This class interacts with Blob, Tree, and Commit classes to perform the actions.
 */
export /*bundle*/ class Files {
	private api: string;
	private token: string;
	private repo: { owner: string; name: string };
	private branch: string;

	constructor(api: string, repo: { owner: string; name: string }, branch: string) {
		this.api = api;
		this.token = GITHUB_TOKEN;
		this.repo = repo;
		this.branch = branch;
	}

	/**
	 * Adds multiple files to the specified repository.
	 *
	 * @param message - The commit message.
	 * @param files - The files to add with their paths.
	 * @throws Error if any step in the process fails.
	 */
	public async add(message: string, files: { path: string; fullPath: string }[]) {
		const blob = new Blob(this.api, this.token);
		const tree = new Tree(this.api, this.token);
		const commit = new Commit(this.api, this.token);

		try {
			// Get the latest commit from the branch
			const branchRes = await fetch(
				`${this.api}/repos/${this.repo.owner}/${this.repo.name}/git/ref/heads/${this.branch}`,
				{
					headers: {
						Authorization: `Bearer ${this.token}`,
					},
				}
			);
			if (!branchRes.ok) throw new Error('Failed to get branch');
			const branch = await branchRes.json();
			const latestSha = branch.object.sha;

			// Get the tree from the latest commit
			const commitRes = await fetch(
				`${this.api}/repos/${this.repo.owner}/${this.repo.name}/git/commits/${latestSha}`,
				{
					headers: {
						Authorization: `Bearer ${this.token}`,
					},
				}
			);
			if (!commitRes.ok) throw new Error('Failed to get commit');
			const commitData = await commitRes.json();
			const baseSha = commitData.tree.sha;

			// Read files content from disk
			const fileContents = await Promise.all(
				files.map(async file => {
					const content = await fs.readFile(file.fullPath, 'utf8');
					return { path: file.path, content };
				})
			);

			// Create the new tree with the files
			const treeSha = await tree.create(baseSha, fileContents, this.repo);

			// Create the new commit
			const commitSha = await commit.create(treeSha, latestSha, message, this.repo);

			// Update the branch to point to the new commit
			const updateRes = await fetch(
				`${this.api}/repos/${this.repo.owner}/${this.repo.name}/git/refs/heads/${this.branch}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.token}`,
					},
					body: JSON.stringify({
						sha: commitSha,
					}),
				}
			);
			if (!updateRes.ok) throw new Error('Failed to update branch');

			console.log('Files added and commit created successfully.');
		} catch (error) {
			console.error(error);
		}
	}
}
