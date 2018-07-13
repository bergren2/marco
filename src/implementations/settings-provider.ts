import { injectable, inject } from 'inversify';
import { ISettingsProvider } from '../interfaces/settings-provider.interface';
import { TYPES } from '../symbols';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';

@injectable()
export class SettingsProvider implements ISettingsProvider {
	private readonly directory: string;
	public get Directory(): string {
		return this.directory;
	}

	private static readonly repoConfigFilename: string = 'repos.json';

	private readonly fs: FsModule;
	private readonly path: PathModule;

	constructor(@inject(TYPES.FsModule) fs: FsModule, @inject(TYPES.PathModule) path: PathModule) {
		this.fs = fs;
		this.path = path;

		this.directory = this.path.resolve(SettingsProvider.GetUserHomeDirectory(), '.marco');
	}

	public IsFirstRun(): boolean {
		return !this.fs.existsSync(this.path.resolve(this.Directory, SettingsProvider.repoConfigFilename));
	}

	public async Init(): Promise<void> {
		this.CreateDirectory();
		await this.CreateRepoConfigFile();
	}

	public GetRepos(): RepoSetting[] {
		const repoJson = this.fs.readFileSync(
			this.path.resolve(this.Directory, SettingsProvider.repoConfigFilename),
			'utf-8'
		);
		return JSON.parse(repoJson);
	}

	public async AddRepo(repo: RepoSetting): Promise<boolean> {
		const repos = this.GetRepos();
		if (repos.filter((r) => r.user === repo.user && r.repo === repo.repo).length === 0) {
			repos.push(repo);
			repos.sort((a, b) => `${a.user}/${a.repo}`.localeCompare(`${b.user}/${b.repo}`));
			await this.SetRepos(repos);
			return true;
		}
		return false;
	}

	public async UpdateRepo(repo: RepoSetting): Promise<boolean> {
		const repos = this.GetRepos();
		const target = repos.find((r) => r.user === repo.user && r.repo === repo.repo);
		if (target) {
			target.base = repo.base;
			await this.SetRepos(repos);
			return true;
		}
		return false;
	}

	public async RemoveRepo(repo: RepoSetting): Promise<boolean> {
		const repos = this.GetRepos();
		const target = repos.find((r) => r.user === repo.user && r.repo === repo.repo);
		if (target) {
			repos.splice(repos.indexOf(target), 1);
			await this.SetRepos(repos);
			return true;
		}
		return false;
	}

	public async Import(config: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const file = this.fs.createWriteStream(
				this.path.resolve(this.Directory, SettingsProvider.repoConfigFilename),
				'utf-8'
			);

			file.write(config, (err: any) => {
				file.close();
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public async Export(): Promise<string> {
		const repoJson = this.fs.readFileSync(
			this.path.resolve(this.Directory, SettingsProvider.repoConfigFilename),
			'utf-8'
		);

		return repoJson;
	}

	private CreateDirectory(): void {
		if (!this.fs.existsSync(this.Directory)) {
			this.fs.mkdirSync(this.Directory);
		}
	}

	private async CreateRepoConfigFile(): Promise<void> {
		await this.SetRepos([]);
	}

	private static GetUserHomeDirectory(): string {
		return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] || '.';
	}

	private SetRepos(repos: RepoSetting[]): Promise<void> {
		return new Promise((resolve, reject) => {
			const file = this.fs.createWriteStream(
				this.path.resolve(this.Directory, SettingsProvider.repoConfigFilename),
				'utf-8'
			);
			file.write(JSON.stringify(repos), (err: any) => {
				file.close();
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
