export /*bundle*/ class Commit {
  private api: string;
  private token: string;

  constructor(api: string, token: string) {
    this.api = api;
    this.token = token;
  }

  public async create(treeSha: string, parentSha: string, message: string, repo: { owner: string; name: string }): Promise<string> {
    const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/commits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({
        message: message,
        tree: treeSha,
        parents: [parentSha]
      })
    });

    const data = await response.json();
    return data.sha;
  }
}
