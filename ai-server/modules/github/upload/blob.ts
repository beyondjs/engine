/**
 * Blob class for creating blobs in a GitHub repository.
 * This class interacts with the GitHub API to create blobs.
 */
export class Blob {
	private api: string;
	private token: string;

	constructor(api: string, token: string) {
		this.api = api;
		this.token = token;
	}

	/**
	 * Creates a blob in the specified repository.
	 * @param content - The content of the blob.
	 * @param repo - The repository information.
	 * @returns The SHA of the created blob.
	 * @throws Error if the blob creation fails.
	 */
	public async create(content: string, repo: { owner: string; name: string }): Promise<string> {
		const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/blobs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`,
			},
			body: JSON.stringify({
				content: btoa(content),
				encoding: 'base64',
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to create blob');
		}

		const data = await response.json();
		return data.sha;
	}
}
