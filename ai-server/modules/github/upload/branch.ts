/**
 * Branch class for managing branches in a GitHub repository.
 * This class interacts with the GitHub API to get the latest commit and update the branch.
 */
export class Branch {
	private api: string;
	private token: string;

	constructor(api: string, token: string) {
		this.api = api;
		this.token = token;
	}

	/**
	 * Gets the latest commit SHA of the specified branch.
	 *
	 * @param repo - The repository information.
	 * @param branch - The branch name.
	 * @returns The SHA of the latest commit.
	 * @throws Error if the request fails.
	 */
	public async getLatestCommit(repo: { owner: string; name: string }, branch: string): Promise<string> {
		const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/ref/heads/${branch}`, {
			headers: {
				Authorization: `Bearer ${this.token}`,
			},
		});

		if (!response.ok) {
			throw new Error('Failed to get branch');
		}

		const data = await response.json();
		return data.object.sha;
	}

	/**
	 * Updates the branch to point to the specified commit SHA.
	 *
	 * @param repo - The repository information.
	 * @param branch - The branch name.
	 * @param commitSha - The commit SHA to point to.
	 * @throws Error if the request fails.
	 */
	public async update(repo: { owner: string; name: string }, branch: string, commitSha: string): Promise<void> {
		const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/refs/heads/${branch}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`,
			},
			body: JSON.stringify({
				sha: commitSha,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to update branch');
		}
	}

	/**
	 * Creates a new branch from the specified base SHA.
	 *
	 * @param repo - The repository information.
	 * @param branch - The branch name.
	 * @param baseSha - The base commit SHA.
	 * @throws Error if the request fails.
	 */
	public async create(repo: { owner: string; name: string }, branch: string, baseSha: string): Promise<void> {
		const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/refs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`,
			},
			body: JSON.stringify({
				ref: `refs/heads/${branch}`,
				sha: baseSha,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to create branch');
		}
	}
}
