import { injectable, inject } from 'inversify';
import { IGitService } from '../interfaces/git.interface';
import { TYPES } from '../symbols';
import * as GitHubHelpers from './github.service';

@injectable()
export class GitService implements IGitService {
	private readonly git: SimpleGitStatic;

	constructor(@inject(TYPES.SimpleGit) git: SimpleGitStatic) {
		this.git = git;
	}

	public CloneRepo(repoSetting: RepoSetting, destination: string, options?: string[]): Promise<string> {
		return new Promise((resolve, reject) => {
			const git = this.git(destination);
			const repoUrl = GitHubHelpers.GetRepoUrl(repoSetting);
			git.clone(repoUrl, options as string[], (err) => {
				if (err) {
					reject(err);
				}

				resolve(`${destination}/${repoSetting.repo}.git`);
			});
		});
	}

	public GetLatestTag(repoFolderPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const git = this.git(repoFolderPath);
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

	public HasChanges(repoFolderPath: string, repoSetting: RepoSetting): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			const latestTag = await this.GetLatestTag(repoFolderPath);
			if (latestTag.trim().length === 0) {
				resolve(false);
			} else {
				const git = this.git(repoFolderPath);
				git.log(['--merges', `${repoSetting.base}...${latestTag}`], (err, commits) => {
					if (err) {
						reject(err);
					}

					resolve(commits.total > 0);
				});
			}
		});
	}
}
