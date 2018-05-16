import { injectable, inject } from 'inversify';
import { IGitService } from '../interfaces/git-service.interface';
import { TYPES } from '../symbols';
import { IGithubService } from '../interfaces/github-service.interface';

@injectable()
export class GitService implements IGitService {
	private readonly git: SimpleGitStatic;
	private readonly githubService: IGithubService;

	constructor(
		@inject(TYPES.SimpleGit) git: SimpleGitStatic,
		@inject(TYPES.GithubService) githubService: IGithubService
	) {
		this.git = git;
		this.githubService = githubService;
	}

	public CloneRepo(repoSetting: RepoSetting, destination: string, options?: string[]): Promise<string> {
		return new Promise((resolve, reject) => {
			const git = this.git(destination);
			const repoUrl = this.githubService.GetRepoUrl(repoSetting);
			git.clone(repoUrl, options as string[], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(`${destination}/${repoSetting.repo}.git`);
				}
			});
		});
	}

	public GetLatestTag(repoFolderPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const git = this.git(repoFolderPath);
			git.tags((err, tags) => {
				if (err) {
					reject(err);
				} else {
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
				}
			});
		});
	}

	public HasChanges(repoFolderPath: string, repoSetting: RepoSetting): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			try {
				const latestTag = await this.GetLatestTag(repoFolderPath);
				if (latestTag.trim().length === 0) {
					resolve(false);
				} else {
					const git = this.git(repoFolderPath);
					git.log(['--merges', `${repoSetting.base}...${latestTag}`], (err, commits) => {
						if (err) {
							reject(err);
						} else {
							resolve(commits.total > 0);
						}
					});
				}
			} catch (ex) {
				reject(ex);
			}
		});
	}
}
