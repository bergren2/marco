export interface ISettingsProvider {
	IsFirstRun(): boolean;

	Init(): Promise<void>;

	GetRepos(): RepoSetting[];

	AddRepo(repoSetting: RepoSetting): Promise<boolean>;

	UpdateRepo(repoSetting: RepoSetting): Promise<boolean>;

	RemoveRepo(repoSetting: RepoSetting): Promise<boolean>;

	Import(config: string): Promise<void>;

	Export(): Promise<string>;
}
