import { injectable, inject } from 'inversify';
import 'colors';
import { ReadlineModule } from '../../types/readline';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { RimrafModule } from '../../types/rimraf';
import { TYPES } from '../symbols';
import { IProgramProvider } from '../interfaces/program-provider.interface';
import { ISettingsProvider } from '../interfaces/settings-provider.interface';
import { IGitService } from '../interfaces/git-service.interface';

@injectable()
export class ProgramProvider implements IProgramProvider {
	private readonly package: any;
	private readonly console: NodeJS.WriteStream;
	private readonly readline: ReadlineModule;
	private readonly fs: FsModule;
	private readonly path: PathModule;
	private readonly rimraf: RimrafModule;
	private readonly settings: ISettingsProvider;
	private readonly git: IGitService;

	constructor(
		@inject(TYPES.PackageJson) packageJson: any,
		@inject(TYPES.Console) console: NodeJS.WriteStream,
		@inject(TYPES.ReadlineModule) readline: ReadlineModule,
		@inject(TYPES.FsModule) fs: FsModule,
		@inject(TYPES.PathModule) path: PathModule,
		@inject(TYPES.RimrafModule) rimraf: RimrafModule,
		@inject(TYPES.SettingsProvider) settings: ISettingsProvider,
		@inject(TYPES.GitService) git: IGitService
	) {
		this.package = packageJson;
		this.console = console;
		this.readline = readline;
		this.fs = fs;
		this.path = path;
		this.rimraf = rimraf;
		this.settings = settings;
		this.git = git;
	}

	public get Version(): string {
		return this.package.version;
	}

	public async Init(force?: boolean): Promise<void> {
		return await this.Initialize(force);
	}

	public async List(): Promise<void> {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		const repos = this.settings.GetRepos();
		if (repos.length > 0) {
			repos.forEach((repoSetting) => {
				this.console.write(`${this.StringifyRepoSetting(repoSetting, true)}\n`);
			});
		}
	}

	public async Add(repoArg: string, base?: string): Promise<void> {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		const repo = ProgramProvider.ParseRepoArg(repoArg, base);
		if (await this.settings.AddRepo(repo)) {
			this.console.write(`Added repo '${this.StringifyRepoSetting(repo)}'\n`);
		} else {
			this.console.write(`${'Warning'.yellow}: repo '${this.StringifyRepoSetting(repo)}' already exists\n`);
		}
	}

	public async Update(repoArg: string, base: string): Promise<void> {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		const repoSetting = ProgramProvider.ParseRepoArg(repoArg, base);
		if (await this.settings.UpdateRepo(repoSetting)) {
			this.console.write(`Updated repo '${this.StringifyRepoSetting(repoSetting)}' with base branch '${repoSetting.base}'\n`);
		} else {
			this.console.write(`${'Warning'.yellow}: repo '${this.StringifyRepoSetting(repoSetting)}' does not exist\n`);
		}
	}

	public async Remove(repoArg: string): Promise<void> {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		const repoSetting = ProgramProvider.ParseRepoArg(repoArg);
		if (await this.settings.RemoveRepo(repoSetting)) {
			this.console.write(`Removed repo '${this.StringifyRepoSetting(repoSetting)}'\n`);
		} else {
			this.console.write(`${'Warning'.yellow}: repo '${this.StringifyRepoSetting(repoSetting)}' does not exist\n`);
		}
	}

	public async Import(config: string): Promise<void> {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		try {
			await this.settings.Import(config);
			this.console.write('Import successful\n');
		} catch (e) {
			let errorMessage = e.toString();
			if (e instanceof Error) {
				errorMessage = e.message;
			}
			this.console.write(`${'Error'.red}: ${errorMessage}\n`);
		}
	}

	public async Export(prettyPrint: boolean | undefined = false) {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		const config = await this.settings.Export();
		const output = prettyPrint ? JSON.stringify(JSON.parse(config), undefined, 4) : config;
		this.console.write(`${output}\n`);
	}

	public async Execute(): Promise<void> {
		if (this.settings.IsFirstRun()) {
			await this.Initialize();
		}

		const tempFolderPath = this.fs.mkdtempSync(`${this.settings.Directory}/temp`);
		const repos = this.settings.GetRepos();
		const releases: RepoSetting[] = [];

		try {
			for (let i = 0; i < repos.length; i++) {
				const repo = repos[i];
				this.WriteTempMessage(`Cloning repo ${i + 1}/${repos.length}: '${this.StringifyRepoSetting(repo)}'`);

				const repoPath = await this.git.CloneRepo(repo, tempFolderPath, ['--bare']);
				if (await this.git.HasChanges(repoPath, repo)) {
					releases.push(repo);
				}
			}
		} catch (ex) {
			this.WriteTempMessage('');
			this.console.write(ex.toString().red);
			releases.splice(0);
		}

		this.WriteTempMessage('');
		this.CleanUpTempFolders();
		releases.forEach((repoSetting) => this.console.write(`${this.StringifyRepoSetting(repoSetting)}\n`));
	}

	private StringifyRepoSetting(repoSetting: RepoSetting, includeBase: boolean = false): string {
		return `${repoSetting.user}${'/'.gray}${repoSetting.repo}${includeBase ? ` [${repoSetting.base}]`.gray : ''}`;
	}

	private async Initialize(force: boolean = false): Promise<void> {
		if (force || this.settings.IsFirstRun()) {
			if (force) {
				this.console.write('Reinitializing settings...');
			} else {
				this.console.write('First run detected. Initializing settings...');
			}
			await this.settings.Init();
			this.console.write('Done\n');
		} else {
			this.console.write('Settings already initialized\n');
		}
	}

	private static ParseRepoArg(repoArg: string, base: string = 'master'): RepoSetting {
		const [user, ...repoParts] = repoArg.split('/');
		const repo = repoParts.join('/');
		return { user, repo, base };
	}

	private WriteTempMessage(message: string): void {
		this.readline.clearLine(this.console, -1);
		this.readline.cursorTo(this.console, 0);
		this.console.write(message);
	}

	private CleanUpTempFolders(): void {
		const files = this.fs.readdirSync(this.settings.Directory);
		for (const file of files) {
			if (/^temp.+/.test(file)) {
				this.rimraf.sync(this.path.resolve(this.settings.Directory, file));
			}
		}
	}
}
