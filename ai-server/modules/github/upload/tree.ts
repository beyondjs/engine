import { Blob } from './blob';

/**
 * Tree class for creating trees in a GitHub repository.
 * This class interacts with the GitHub API to create trees.
 */
export class Tree {
	private api: string;
	private token: string;
	private blob: Blob;

	constructor(api: string, token: string) {
		this.api = api;
		this.token = token;
		this.blob = new Blob(api, token);
	}

	/**
	 * Creates a tree in the specified repository.
	 *
	 * @param base - The base tree SHA.
	 * @param files - The files to include in the tree.
	 * @param repo - The repository information.
	 * @returns The SHA of the created tree.
	 * @throws Error if the tree creation fails.
	 */
	public async create(
		base: string,
		files: { path: string; content: string }[],
		repo: { owner: string; name: string }
	): Promise<string> {
		const treeItems = await Promise.all(
			files.map(async file => {
				const sha = await this.blob.create(file.content, repo);
				return {
					path: file.path,
					mode: '100644',
					type: 'blob',
					sha,
				};
			})
		);

		const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/trees`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`,
			},
			body: JSON.stringify({
				base_tree: base,
				tree: treeItems,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to create tree');
		}

		const data = await response.json();
		return data.sha;
	}
}
