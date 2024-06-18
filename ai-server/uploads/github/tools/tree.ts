export /*bundle*/ class Tree {
  private api: string;
  private token: string;

  constructor(api: string, token: string) {
    this.api = api;
    this.token = token;
  }

  public async create(baseSha: string, files: { path: string; content: string }[], repo: { owner: string; name: string }): Promise<string> {
    const tree = await Promise.all(files.map(async (file) => {
      const blobSha = await this.blob(file.content, repo);
      return {
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobSha
      };
    }));

    const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({
        base_tree: baseSha,
        tree
      })
    });

    const data = await response.json();
    return data.sha;
  }

  private async blob(content: string, repo: { owner: string; name: string }): Promise<string> {
    const response = await fetch(`${this.api}/repos/${repo.owner}/${repo.name}/git/blobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({
        content: btoa(content),
        encoding: 'base64'
      })
    });

    const data = await response.json();
    return data.sha;
  }
}
