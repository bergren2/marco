import { injectable, inject } from '../../node_modules/inversify';
import { IConfigProvider } from '../interfaces/config-provider.interface';
import { Config } from '../models/config';
import { ConfigLike } from '../../types/config-like';
import { SYMBOLS } from '../symbols';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { IConfigDirectoryProvider } from '../interfaces/config-directory-provider.interface';

@injectable()
export class ConfigProvider implements IConfigProvider {
	private static readonly configFilename = 'config.json';

	private config!: Config;

	private readonly fs: FsModule;
	private readonly path: PathModule;
	private readonly configDirectoryProvider: IConfigDirectoryProvider;

	constructor(
		@inject(SYMBOLS.FsModule) fs: FsModule,
		@inject(SYMBOLS.PathModule) path: PathModule,
		@inject(SYMBOLS.ConfigDirectoryProvider) configDirectoryProvider: IConfigDirectoryProvider
	) {
		this.fs = fs;
		this.path = path;
		this.configDirectoryProvider = configDirectoryProvider;
	}

	public async Get(): Promise<Config> {
		if (this.config) {
			return this.config;
		} else {
			await this.initDirectory();
			return new Promise<Config>((resolve) => {
				this.fs.readFile(this.path.resolve(this.configDirectoryProvider.Path, ConfigProvider.configFilename), 'utf-8', (err, data) => {
					if (err) {
						throw err;
					}

					this.config = JSON.parse(data);
					resolve(this.config);
				});
			});
		}
	}

	public async Set(config: ConfigLike): Promise<void> {
		const currentConfig = this.config || new Config();
		this.config = { ...currentConfig, ...config };
		await this.initDirectory();
		return new Promise<void>((resolve) => {
			const file = this.fs.createWriteStream(
				this.path.resolve(this.configDirectoryProvider.Path, ConfigProvider.configFilename),
				'utf-8'
			);

			file.write(JSON.stringify(this.config), () => {
				file.close();
				resolve();
			});
		});
	}

	private async initDirectory(): Promise<void> {
		return new Promise<boolean>((resolve) => {
			this.fs.exists(this.configDirectoryProvider.Path, resolve);
		})
		.then((directoryExists) => {
			if (directoryExists) {
				return Promise.resolve();
			} else {
				return new Promise<void>((resolve) => {
					this.fs.mkdir(this.configDirectoryProvider.Path, (err) => {
						if (err) {
							throw err;
						}
						resolve();
					});
				});
			}
		})
		.then(() => {
			return new Promise<boolean>((resolve) => {
				this.fs.exists(this.path.resolve(this.configDirectoryProvider.Path, ConfigProvider.configFilename), resolve);
			});
		})
		.then((fileExists) => {
			if (!fileExists) {
				const file = this.fs.createWriteStream(
					this.path.resolve(this.configDirectoryProvider.Path, ConfigProvider.configFilename),
					'utf-8'
				);

				file.write(JSON.stringify(new Config()), () => {
					file.close();
				});
			}
		});
	}
}
