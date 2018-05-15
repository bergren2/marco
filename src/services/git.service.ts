import SimpleGit from 'simple-git';
import * as GitHubHelpers from './github.service';

export function CloneRepo(repoSetting: RepoSetting, destination: string, options?: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const git = SimpleGit(destination);
		const repoUrl = GitHubHelpers.GetRepoUrl(repoSetting);
		git.clone(repoUrl, options as string[], (err) => {
			if (err) {
				console.error(err);
				reject(err);
			}

			resolve(`${destination}/${repoSetting.repo}.git`);
		});
	});
}

export function GetLatestTag(repoFolderPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const git = SimpleGit(repoFolderPath);
		git.tags((err, tags) => {
			if (err) {
				reject(err);
			}

			const semverRegex = /^\d+\.\d+\.\d+$/;
			if (semverRegex.test(tags.latest)) {
				resolve(tags.latest);
			} else {
				let semverTagFound = false;
				for (let i = tags.all.length - 1; i >= 0 && !semverTagFound; i--) {
					if (semverRegex.test(tags.all[i])) {
						semverTagFound = true;
						resolve(tags.all[i]);
					}
				}

				if (!semverTagFound) {
					resolve('');
				}
			}
		});
	});
}

export function HasChanges(repoFolderPath: string, repoSetting: RepoSetting): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		const latestTag = await GetLatestTag(repoFolderPath);
		if (latestTag.trim().length === 0) {
			resolve(false);
		} else {
			const git = SimpleGit(repoFolderPath);
			git.log(['--merges', `${repoSetting.base}...${latestTag}`], (err, commits) => {
				if (err) {
					reject(err);
				}

				resolve(commits.total > 0);
			});
		}
	});
}
