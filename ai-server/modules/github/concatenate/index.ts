import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_FILE = path.join(process.cwd(), 'concatenated_code.ts');

// Parse GitHub URL to get API endpoint
function getGitHubApiUrl(githubUrl: string): string {
	const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)/;
	const match = githubUrl.match(regex);

	if (!match) {
		throw new Error('Invalid GitHub URL format. It should be like: https://github.com/owner/repo/tree/branch/path');
	}

	const owner = match[1];
	const repo = match[2];
	const branch = match[3];
	const path = match[4];

	return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
}

async function fetchFileList(url: string): Promise<any[]> {
	console.log(`Fetching file list from: "${url}"`);

	const response = await fetch(url, {
		headers: {
			Authorization: `token ${GITHUB_TOKEN}`,
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch file list: ${response.statusText}`);
	}

	try {
		const data = await response.json();
		return data;
	} catch (err) {
		throw new Error(`Failed to parse file list: ${err.message}`);
	}
}

async function fetchFileContent(url: string): Promise<string> {
	console.log(`Fetching content of the file: "${url}"`);

	const response = await fetch(url, {
		headers: {
			Authorization: `token ${GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3.raw',
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch file content: ${response.statusText}`);
	}
	const content = await response.text();
	return content;
}

async function processFile(file: any, concatenatedContent: string): Promise<string> {
	if (file.type === 'file') {
		const fileContent = await fetchFileContent(file.url);
		concatenatedContent += `\n// File: ${file.path}\n\n${fileContent}\n`;
	} else if (file.type === 'dir') {
		const dirFiles = await fetchFileList(file.url);
		for (const dirFile of dirFiles) {
			concatenatedContent = await processFile(dirFile, concatenatedContent);
		}
	}
	return concatenatedContent;
}

export /*bundle*/ async function concatenateFiles(url: string) {
	if (!GITHUB_TOKEN) {
		throw new Error('GitHub token not found in environment variables');
	}

	const apiUrl = getGitHubApiUrl(url);
	const fileList = await fetchFileList(apiUrl);
	let concatenatedContent = '';

	for (const file of fileList) {
		concatenatedContent = await processFile(file, concatenatedContent);
	}

	writeFileSync(OUTPUT_FILE, concatenatedContent);
	console.log(`Files concatenated into ${OUTPUT_FILE}`);

	return concatenatedContent;
}
