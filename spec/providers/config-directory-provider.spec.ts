import { Mock, It } from 'typemoq';
import { expect } from 'chai';
import { PathModule } from '../../types/path';
import { ConfigDirectoryProvider } from '../../src/providers/config-directory-provider';

describe('ConfigDirectoryProvider', () => {
	describe('Path', () => {
		let userprofileBackup: string | undefined;
		let homeBackup: string | undefined;
		let platformBackup: NodeJS.Platform;

		beforeEach(() => {
			userprofileBackup = process.env['USERPROFILE'];
			homeBackup = process.env['HOME'];
			platformBackup = process.platform;
		});

		afterEach(() => {
			process.env['USERPROFILE'] = userprofileBackup;
			process.env['HOME'] = homeBackup;
			Object.defineProperty(process, 'platform', { value: platformBackup });
		});

		[
			{
				platform: 'win32',
				homeEnvVar: 'USERPROFILE'
			},
			{
				platform: 'linux',
				homeEnvVar: 'HOME'
			}
		].forEach((config) => {
			it(`should initialize Path based on '${config.homeEnvVar}' environment variable when platform is '${config.platform}'`, () => {
				// Arrange
				const homeFolder = '/some/folder';
				Object.defineProperty(process, 'platform', { value: config.platform });
				process.env[config.homeEnvVar] = homeFolder;

				const pathMock = Mock.ofType<PathModule>();
				pathMock
					.setup((x) => x.resolve(It.isAnyString(), It.isAnyString()))
					.returns((str1, str2) => `${str1}/${str2}`);

				const configDirectoryProvider = new ConfigDirectoryProvider(pathMock.object);

				// Act
				const path = configDirectoryProvider.Path;

				// Assert
				expect(path).to.be.a('string').that.equals(`${homeFolder}/.marco`);
			});

			it(`should default to current directory if '${config.homeEnvVar}' environment variable is unavailable when platform is '${config.platform}'`, () => {
				// Arrange
				Object.defineProperty(process, 'platform', { value: config.platform });
				delete process.env[config.homeEnvVar];

				const pathMock = Mock.ofType<PathModule>();
				pathMock
					.setup((x) => x.resolve(It.isAnyString(), It.isAnyString()))
					.returns((str1, str2) => `${str1}/${str2}`);

				const configDirectoryProvider = new ConfigDirectoryProvider(pathMock.object);

				// Act
				const path = configDirectoryProvider.Path;

				// Assert
				expect(path).to.be.a('string').that.equals('./.marco');
			});
		});
	});
});
