import { promises as fs } from 'fs';
import { Tree } from './tree';
import { Commit } from './commit';
import { Branch } from './branch';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const GITHUB_TOKEN = <string>process.env.GITHUB_TOKEN;

/**
 * Files class for adding multiple files in a GitHub repository.
 * This class interacts with Blob, Tree, and Commit classes to perform the actions.
 */
export class Files {
	private api = 'https://api.github.com';
	private token: string;
	private repo: { owner: string; name: string };
	private branch: string;

	constructor(repo: { owner: string; name: string }, branch: string) {
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
		const tree = new Tree(this.api, this.token);
		const commit = new Commit(this.api, this.token);
		const branch = new Branch(this.api, this.token);

		try {
			// Get the latest commit from the branch, or create the branch if it doesn't exist
			let latestSha: string;
			try {
				latestSha = await branch.getLatestCommit(this.repo, this.branch);
			} catch (error) {
				if (error.message === 'Failed to get branch') {
					// Branch does not exist, create it from the default branch
					const repoRes = await fetch(`${this.api}/repos/${this.repo.owner}/${this.repo.name}`, {
						headers: {
							Authorization: `Bearer ${this.token}`,
						},
					});

					if (!repoRes.ok) throw new Error('Failed to get repository info');

					const repoData = await repoRes.json();
					const defaultBranch = repoData.default_branch;

					latestSha = await branch.getLatestCommit(this.repo, defaultBranch);
					await branch.create(this.repo, this.branch, latestSha);
				} else {
					throw error;
				}
			}

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
			await branch.update(this.repo, this.branch, commitSha);

			console.log('Files added and commit created successfully.');
		} catch (error) {
			console.error(error);
		}
	}
}
