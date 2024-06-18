export /*bundle*/ class Blob {
  private api: string;
  private token: string;

  constructor(api: string, token: string) {
    this.api = api;
    this.token = token;
  }

  public async create(content: string, repo: { owner: string; name: string }): Promise<string> {
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
