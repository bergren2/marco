import { expect } from 'chai';
import { Mock, It, Times } from 'typemoq';
import { WriteStream } from 'fs';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { SettingsProvider } from '../../src/implementations/settings-provider';

describe('SettingsProvider', () => {
	describe('Directory', () => {
		let userprofileBackup: string | undefined;
		let homeBackup: string | undefined;

		before(() => {
			userprofileBackup = process.env['USERPROFILE'];
			homeBackup = process.env['HOME'];
		});

		after(() => {
			process.env['USERPROFILE'] = userprofileBackup;
			process.env['HOME'] = homeBackup;
		});

		it('should be initialized based on environment', () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();

			const homeFolder = '/some/folder';

			process.env['USERPROFILE'] = homeFolder;
			process.env['HOME'] = homeFolder;

			pathMock
				.setup((x) => x.resolve(It.isAnyString(), It.isAnyString()))
				.returns((str1, str2) => `${str1}/${str2}`);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const directory = settingsProvider.Directory;

			// Assert
			expect(directory).to.equal(`${homeFolder}/.marco`);
		});
	});

	describe('IsFirstRun', () => {
		it('should return a boolean', () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();

			pathMock.setup((x) => x.resolve(It.isAny())).returns(() => '');
			fsMock.setup((x) => x.existsSync(It.isAny())).returns(() => false);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const isFirstRun = settingsProvider.IsFirstRun();

			// Assert
			expect(isFirstRun).to.be.a('boolean');
		});

		it('should return true if repo config does not exist', () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();

			pathMock.setup((x) => x.resolve(It.isAny())).returns(() => '');
			fsMock.setup((x) => x.existsSync(It.isAny())).returns(() => false);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const isFirstRun = settingsProvider.IsFirstRun();

			// Assert
			expect(isFirstRun).to.be.a('boolean').that.is.true;
		});

		it('should return false if repo config does exist', () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();

			pathMock.setup((x) => x.resolve(It.isAny())).returns(() => '');
			fsMock.setup((x) => x.existsSync(It.isAny())).returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const isFirstRun = settingsProvider.IsFirstRun();

			// Assert
			expect(isFirstRun).to.be.a('boolean').that.is.false;
		});
	});

	describe('Init', () => {
		it('should create directory if it does not exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			fsMock.setup((x) => x.existsSync(It.isAnyString())).returns(() => false);
			fsMock.setup((x) => x.mkdirSync(It.isAnyString()));
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			await settingsProvider.Init();

			// Assert
			fsMock.verify((x) => x.mkdirSync(It.isAnyString()), Times.once());
		});

		it('should not create directory if it does exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			fsMock.setup((x) => x.existsSync(It.isAnyString())).returns(() => true);
			fsMock.setup((x) => x.mkdirSync(It.isAnyString()));
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null));

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			await settingsProvider.Init();

			// Assert
			fsMock.verify((x) => x.mkdirSync(It.isAnyString()), Times.never());
		});

		it('should create repo config file', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			fsMock.setup((x) => x.existsSync(It.isAnyString())).returns(() => true);
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null));

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			await settingsProvider.Init();

			// Assert
			fsMock.verify((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()), Times.once());
			fileMock.verify((x) => x.write(It.isAnyString(), It.isAny()), Times.once());
		});

		it('should reject if there was an error writing the repo config file', (done) => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			fsMock.setup((x) => x.existsSync(It.isAnyString())).returns(() => true);
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb('Error'));

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const initPromise = settingsProvider.Init();

			// Assert
			expect(initPromise).to.be.rejected.and.notify(done);
		});
	});

	describe('GetRepos', () => {
		it('should return the repo config as an object', () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();

			const repos = [{ user: 'user', repo: 'repo', base: 'base' }];

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock.setup((x) => x.readFileSync(It.isAny(), It.isAnyString())).returns(() => JSON.stringify(repos));

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const loadedRepos = settingsProvider.GetRepos();

			// Assert
			expect(loadedRepos).to.deep.equal(repos);
		});
	});

	describe('AddRepo', () => {
		it('should write repo to the repo config file if the repo did not already exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const repos: RepoSetting[] = [];
			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.AddRepo(repo);

			// Assert
			fileMock.verify((x) => x.write(
				It.is((content) => content === JSON.stringify([repo])),
				It.isAny()
			), Times.once());
			expect(result).to.be.true;
		});

		it('should not write repo to the repo config file if the repo already exists', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const repos: RepoSetting[] = [repo];

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.AddRepo(repo);

			// Assert
			fileMock.verify((x) => x.write(It.isAnyString(), It.isAny()), Times.never());
			expect(result).to.be.false;
		});

		it('should sort the repos by user and repo name', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const repos: RepoSetting[] = [
				{
					user: 'user2',
					repo: 'repo2',
					base: 'base'
				}
			];
			const repo: RepoSetting = { user: 'user1', repo: 'repo1', base: 'base' };

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			await settingsProvider.AddRepo(repo);

			// Assert
			fileMock.verify((x) => x.write(
				It.is((content) => content === JSON.stringify([repo, repos[0]])),
				It.isAny()
			), Times.once());
		});
	});

	describe('UpdateRepo', () => {
		it('should update the repo if the repo already exists', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const updatedRepo: RepoSetting = { user: 'user', repo: 'repo', base: 'new-base' };
			const repos: RepoSetting[] = [repo, extraRepo];

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.UpdateRepo(updatedRepo);

			// Assert
			fileMock.verify((x) => x.write(
				It.is((content) => content === JSON.stringify([updatedRepo, extraRepo])),
				It.isAny()
			), Times.once());
			expect(result).to.be.true;
		});

		it('should not update the repo if the repo does not exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const updatedRepo: RepoSetting = { user: 'user', repo: 'repo', base: 'new-base' };
			const repos: RepoSetting[] = [extraRepo];

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.UpdateRepo(updatedRepo);

			// Assert
			fileMock.verify((x) => x.write(It.isAnyString(), It.isAny()), Times.never());
			expect(result).to.be.false;
		});
	});

	describe('RemoveRepo', () => {
		it('should remove the repo if the repo already exists', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const repos: RepoSetting[] = [repo, extraRepo];

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.RemoveRepo(repo);

			// Assert
			fileMock.verify((x) => x.write(
				It.is((content) => content === JSON.stringify([extraRepo])),
				It.isAny()
			), Times.once());
			expect(result).to.be.true;
		});

		it('should not remove the repo if the repo does not exist', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const repos: RepoSetting[] = [extraRepo];

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => JSON.stringify(repos));

			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);

			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.RemoveRepo(repo);

			// Assert
			fileMock.verify((x) => x.write(It.isAnyString(), It.isAny()), Times.never());
			expect(result).to.be.false;
		});
	});

	describe('Import', () => {
		it('should write given config to config file', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();
			const config = '[{"user": "user", "repo": "repo", "base": "base"}]';

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);
			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			await settingsProvider.Import(config);

			// Assert
			fileMock.verify((x) => x.write(It.is((str) => str === config), It.isAny()), Times.once());
		});

		it('should call .close() on the file handler', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();
			const config = '[{"user": "user", "repo": "repo", "base": "base"}]';

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);
			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb(null))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			await settingsProvider.Import(config);

			// Assert
			fileMock.verify((x) => x.close(), Times.once());
		});

		it('should reject if there was an error writing to the file', (done) => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const fileMock = Mock.ofType<WriteStream>();
			const config = '[{"user": "user", "repo": "repo", "base": "base"}]';

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.createWriteStream(It.isAnyString(), It.isAnyString()))
				.returns(() => fileMock.object);
			fileMock
				.setup((x) => x.write(It.isAnyString(), It.isAny()))
				.callback((_content, cb) => cb('Error'))
				.returns(() => true);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const importPromise = settingsProvider.Import(config);

			// Assert
			expect(importPromise).to.eventually.be.rejected.and.notify(done);
		});
	});

	describe('Export', () => {
		it('should return the exact contents of config file', async () => {
			// Arrange
			const fsMock = Mock.ofType<FsModule>();
			const pathMock = Mock.ofType<PathModule>();
			const config = '[{"user": "user", "repo": "repo", "base": "base"}]';

			pathMock.setup((x) => x.resolve(It.isAnyString(), It.isAnyString())).returns(() => '');
			fsMock
				.setup((x) => x.readFileSync(It.isAnyString(), It.isAnyString()))
				.returns(() => config);

			const settingsProvider = new SettingsProvider(fsMock.object, pathMock.object);

			// Act
			const result = await settingsProvider.Export();

			// Assert
			expect(result).to.equal(config);
		});
	});
});
