import { Mock, It, Times } from 'typemoq';
import { expect } from 'chai';
import * as fs from 'fs';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { IConfigDirectoryProvider } from '../../src/interfaces/config-directory-provider.interface';
import { ConfigProvider } from '../../src/providers/config-provider';
import { Config } from '../../src/models/config';

describe('ConfigProvider', () => {
	describe('Get', () => {
		it('should get config from file if in-memory config object does not exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()))
				.callback((_path, _config, cb) => cb(undefined, JSON.stringify(new Config())));

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			// Act
			await configProvider.Get();

			// Assert
			fsMock.verify((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()), Times.once());
		});

		it('should get config from in-memory object if it exists', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()))
				.callback((_path, _config, cb) => cb(undefined, JSON.stringify(new Config())));

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			// Act
			const result1 = await configProvider.Get();
			const result2 = await configProvider.Get();

			// Assert
			fsMock.verify((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()), Times.once());
			expect(result1).to.equal(result2);
		});

		it('should throw an error if config file cannot be read', (done) => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()))
				.callback((_path, _config, cb) => cb('Example Error'));

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			// Act
			const promise = configProvider.Get();

			// Assert
			expect(promise).to.eventually.be.rejected.and.notify(done);
		});
	});

	describe('Set', () => {
		it('should apply properties from passed ConfigLike to config', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();
			const fileMock = Mock.ofType<fs.WriteStream>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.createWriteStream(It.isAny(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb());

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			const repos: RepoSetting[] = [
				{
					user: 'user',
					repo: 'repo',
					base: 'base'
				}
			];

			// Act
			await configProvider.Set({ repos });

			// Assert
			fileMock.verify((x) => x.write(
				It.is((content) => content === JSON.stringify({ repos })),
				It.isAny()
			), Times.once());
		});
	});

	describe('initDirectory', () => {
		it('should create directory if it doesn\'t exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(false));

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()))
				.callback((_path, _config, cb) => cb(undefined, JSON.stringify(new Config())));

			fsMock
				.setup((x) => x.mkdir(It.isAny(), It.isAny()))
				.callback((_path, cb) => cb(undefined));

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			// Act
			await configProvider.Get();

			// Assert
			fsMock.verify((x) => x.mkdir(It.isAny(), It.isAny()), Times.once());
		});

		it('should throw an error if unable to create directory', (done) => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(false));

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()))
				.callback((_path, _config, cb) => cb(undefined, JSON.stringify(new Config())));

			fsMock
				.setup((x) => x.mkdir(It.isAny(), It.isAny()))
				.callback((_path, cb) => cb('Example error'));

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			// Act
			const promise = configProvider.Get();

			// Assert
			expect(promise).to.eventually.be.rejected.and.notify(done);
		});

		it('should create config file if it doesn\'t exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();
			const fileMock = Mock.ofType<fs.WriteStream>();

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(true));

			fsMock
				.setup((x) => x.exists(It.isAny(), It.isAny()))
				.callback((_pathMock, cb) => cb(false));

			fsMock
				.setup((x) => x.readFile(It.isAny(), It.isAnyString(), It.isAny()))
				.callback((_path, _config, cb) => cb(undefined, JSON.stringify(new Config())));

			fsMock
				.setup((x) => x.createWriteStream(It.isAny(), It.isAny()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAny(), It.isAny()))
				.callback((_content, cb) => cb());

			const configProvider = new ConfigProvider(
				fsMock.object,
				pathMock.object,
				configDirectoryProviderMock.object
			);

			// Act
			await configProvider.Get();

			// Assert
			fileMock.verify((x) => x.write(
				It.is((content) => content === JSON.stringify(new Config())),
				It.isAny()
			), Times.once());
			fileMock.verify((x) => x.close(), Times.once());
		});
	});
});
