export interface IGitService {
	CloneRepo(repoSetting: RepoSetting, destination: string, options?: string[]): Promise<string>;
	GetLatestTag(repoFolderPath: string): Promise<string>;
	HasChanges(repoFolderPath: string, repoSetting: RepoSetting): Promise<boolean>;
}
