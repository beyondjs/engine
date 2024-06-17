import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_FILE = path.join(process.cwd(), 'concatenated_code.ts');

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

	const data = await response.json();
	return data;
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

	const fileList = await fetchFileList(url);
	let concatenatedContent = '';

	for (const file of fileList) {
		concatenatedContent = await processFile(file, concatenatedContent);
	}

	writeFileSync(OUTPUT_FILE, concatenatedContent);
	console.log(`Files concatenated into ${OUTPUT_FILE}`);

	return url;
}
