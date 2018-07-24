export interface IRepoService {
	GetRepos(): Promise<RepoSetting[]>;

	AddRepo(repoSetting: RepoSetting): Promise<boolean>;

	UpdateRepo(repoSetting: RepoSetting): Promise<boolean>;

	RemoveRepo(repoSetting: RepoSetting): Promise<boolean>;

	SetRepos(repos: RepoSetting[]): Promise<void>;
}
