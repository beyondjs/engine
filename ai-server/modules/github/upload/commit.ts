/**
 * Commit class for creating commits in a GitHub repository.
 * This class interacts with the GitHub API to create commits.
 */
export class Commit {
	private api: string;
	private token: string;

	constructor(api: string, token: string) {
		this.api = api;
		this.token = token;
	}

	/**
	 * Creates a commit in the specified repository.
	 *
	 * @param treeSha - The tree SHA to associate with the commit.
	 * @param parentSha - The parent commit SHA.
	 * @param message - The commit message.
	 * @param repo - The repository information.
	 * @returns The SHA of the created commit.
	 * @throws Error if the commit creation fails.
	 */
	public async create(
		treeSha: string,
		parentSha: string,
		message: string,
		repo: { owner: string; name: string }
	): Promise<string> {
		const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/commits`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`,
			},
			body: JSON.stringify({
				message,
				tree: treeSha,
				parents: [parentSha],
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to create commit');
		}

		const data = await response.json();
		return data.sha;
	}
}
