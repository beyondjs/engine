import { Files } from './files';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = 'your-personal-access-token';
const REPO = { owner: 'your-username', name: 'repository-name' };
const BRANCH = 'branch-name';
const MESSAGE = 'Add multiple files programmatically';
const FILES = [
  { path: 'path/to/first_file.txt', content: 'Content of the first file' },
  { path: 'path/to/second_file.txt', content: 'Content of the second file' }
];

const files = new Files(GITHUB_API, GITHUB_TOKEN, REPO, BRANCH);
files.add(MESSAGE, FILES).catch(console.error);
