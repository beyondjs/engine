# @beyonjs/ai-server - GitHub Commit Module

This module provides functionality to add multiple files to a GitHub repository in a single commit. The files are read
from the disk and uploaded to the repository using the GitHub API. This is particularly useful for automating the
process of committing a large number of files.

## Features

-   List files recursively in a specified folder.
-   Read the content of files from disk.
-   Create blobs for the files.
-   Create a tree in the GitHub repository.
-   Commit the tree to the repository.
-   Update the branch to point to the new commit.

## Usage

### Prerequisites

-   Ensure that the files you want to commit are uploaded to a specific folder.

### Example

The following example demonstrates how to use this module to add multiple files to a GitHub repository.

1. **Import the necessary functions and interfaces:**

```typescript
import { addFiles, AddFilesParams } from '@beyonjs/ai-server/github/commit';
```

2. **Prepare the parameters:**

```typescript
const params: AddFilesParams = {
	api: 'https://api.github.com',
	repo: { owner: 'your-username', name: 'your-repository' },
	branch: 'main',
	message: 'Add multiple files from folder',
	folder: 'your-folder',
};
```

3. **Call the `addFiles` function:**

```typescript
addFiles(params)
	.then(() => console.log('Files added and commit created successfully.'))
	.catch(console.error);
```

### Parameters

-   **api**: The GitHub API base URL (typically `https://api.github.com`).
-   **repo**: An object containing the owner and name of the repository.
    -   `owner`: The username or organization name that owns the repository.
    -   `name`: The name of the repository.
-   **branch**: The branch to which the files will be committed.
-   **message**: The commit message.
-   **folder**: The folder (relative path from `process.cwd()/uploads`) containing the files to be committed.
