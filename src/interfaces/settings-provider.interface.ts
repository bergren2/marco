export interface ISettingsProvider {
	readonly Directory: string;

	IsFirstRun(): boolean;

	Init(): Promise<void>;

	GetRepos(): RepoSetting[];

	AddRepo(repoSetting: RepoSetting): Promise<boolean>;

	UpdateRepo(repoSetting: RepoSetting): Promise<boolean>;

	RemoveRepo(repoSetting: RepoSetting): Promise<boolean>;

	Export(): Promise<string>;
}
