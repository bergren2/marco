import { injectable, inject } from '../../node_modules/inversify';
import { IConfigDirectoryProvider } from '../interfaces/config-directory-provider.interface';
import { SYMBOLS } from '../symbols';
import { PathModule } from '../../types/path';

@injectable()
export class ConfigDirectoryProvider implements IConfigDirectoryProvider {
	private readonly path: string;
	public get Path(): string {
		return this.path;
	}

	constructor(@inject(SYMBOLS.PathModule) pathModule: PathModule) {
		const userHomeDirectory = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || '.';
		this.path = pathModule.resolve(userHomeDirectory, '.marco');
	}
}
