import { Blob } from './blob';
import { Tree } from './tree';
import { Commit } from './commit';

export /*bundle*/ class Files {
  private api: string;
  private token: string;
  private repo: { owner: string; name: string };
  private branch: string;

  constructor(api: string, token: string, repo: { owner: string; name: string }, branch: string) {
    this.api = api;
    this.token = token;
    this.repo = repo;
    this.branch = branch;
  }

  public async add(message: string, files: { path: string; content: string }[]) {
    const blob = new Blob(this.api, this.token);
    const tree = new Tree(this.api, this.token);
    const commit = new Commit(this.api, this.token);

    // Get the latest commit from the branch
    const branchRes = await fetch(`${this.api}/repos/${this.repo.owner}/${this.repo.name}/git/ref/heads/${this.branch}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    const branch = await branchRes.json();
    const latestSha = branch.object.sha;

    // Get the tree from the latest commit
    const commitRes = await fetch(`${this.api}/repos/${this.repo.owner}/${this.repo.name}/git/commits/${latestSha}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    const commit = await commitRes.json();
    const baseSha = commit.tree.sha;

    // Create the new tree with the files
    const treeSha = await tree.create(baseSha, files, this.repo);

    // Create the new commit
    const commitSha = await commit.create(treeSha, latestSha, message, this.repo);

    // Update the branch to point to the new commit
    await fetch(`${this.api}/repos/${this.repo.owner}/${this.repo.name}/git/refs/heads/${this.branch}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({
        sha: commitSha
      })
    });

    console.log('Files added and commit created successfully.');
  }
}
