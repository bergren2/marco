import * as fs from 'fs';
import * as path from 'path';

export const Directory = path.resolve(getUserHomeDirectory(), '.marco');
const repoConfigFilename = 'repos.json';

export function IsFirstRun(): boolean {
	return !fs.existsSync(path.resolve(Directory, repoConfigFilename));
}

export async function Init(): Promise<void> {
	createDirectory();
	await createRepoConfigFile();
}

function createDirectory(): void {
	if (!fs.existsSync(Directory)) {
		fs.mkdirSync(Directory);
	}
}

async function createRepoConfigFile(): Promise<void> {
	await setRepos([]);
}

function getUserHomeDirectory(): string {
	return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] || '.';
}

export function GetRepos(): RepoSetting[] {
	const repoJson = fs.readFileSync(path.resolve(Directory, repoConfigFilename), 'utf-8');
	return JSON.parse(repoJson);
}

function setRepos(repos: RepoSetting[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(path.resolve(Directory, repoConfigFilename), 'utf-8');
		file.write(JSON.stringify(repos), (err: any) => {
			file.close();
			if (err) {
				reject(err);
			}
			resolve();
		});
	});
}

export async function AddRepo(repo: RepoSetting): Promise<boolean> {
	const repos = GetRepos();
	if (repos.filter((r) => r.user === repo.user && r.repo === repo.repo).length === 0) {
		repos.push(repo);
		repos.sort((a, b) => `${a.user}/${a.repo}`.localeCompare(`${b.user}/${b.repo}`));
		await setRepos(repos);
		return true;
	}
	return false;
}

export async function UpdateRepo(repo: RepoSetting): Promise<boolean> {
	const repos = GetRepos();
	const target = repos.find((r) => r.user === repo.user && r.repo === repo.repo);
	if (target) {
		target.base = repo.base;
		await setRepos(repos);
		return true;
	}
	return false;
}

export async function RemoveRepo(repo: RepoSetting): Promise<boolean> {
	const repos = GetRepos();
	const target = repos.find((r) => r.user === repo.user && r.repo === repo.repo);
	if (target) {
		repos.splice(repos.indexOf(target), 1);
		await setRepos(repos);
		return true;
	}
	return false;
}
