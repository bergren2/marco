import { expect } from 'chai';
import { IMock, Mock, Times, It } from 'typemoq';
import commander from 'commander';
import { ProgramProvider } from '../../src/implementations/program-provider';
import { ReadlineModule } from '../../types/readline';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { RimrafModule } from '../../types/rimraf';
import { ISettingsProvider } from '../../src/interfaces/settings-provider.interface';
import { IGitService } from '../../src/interfaces/git-service.interface';

describe('ProgramProvider', () => {
	describe('Init', () => {
		let packageMock: IMock<any>;
		let consoleMock: IMock<NodeJS.WriteStream>;
		let readlineMock: IMock<ReadlineModule>;
		let fsMock: IMock<FsModule>;
		let pathMock: IMock<PathModule>;
		let rimrafMock: IMock<RimrafModule>;
		let settingsMock: IMock<ISettingsProvider>;
		let gitMock: IMock<IGitService>;
		let program: ProgramProvider;

		beforeEach(() => {
			packageMock = Mock.ofType<any>();
			consoleMock = Mock.ofType<NodeJS.WriteStream>();
			readlineMock = Mock.ofType<ReadlineModule>();
			fsMock = Mock.ofType<FsModule>();
			pathMock = Mock.ofType<PathModule>();
			rimrafMock = Mock.ofType<RimrafModule>();
			settingsMock = Mock.ofType<ISettingsProvider>();
			gitMock = Mock.ofType<IGitService>();

			program = new ProgramProvider(
				packageMock.object,
				consoleMock.object,
				readlineMock.object,
				fsMock.object,
				pathMock.object,
				rimrafMock.object,
				settingsMock.object,
				gitMock.object
			);
		});

		it('should return an instance of Command', () => {
			// Act
			const result = program.Init();

			// Assert
			expect(result).to.be.an.instanceOf(commander.Command);
		});

		describe('"init" command', () => {
			it('should perform initial setup on first run', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);
				const command = program.Init();

				// Act
				command.parse(['', '', 'init']);

				// Assert
				settingsMock.verify((x) => x.Init(), Times.once());
			});

			it('should not perform initial setup on subsequent runs', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
				const command = program.Init();

				// Act
				command.parse(['', '', 'init']);

				// Assert
				settingsMock.verify((x) => x.Init(), Times.never());
			});

			it('should perform initial setup if "--force" flag is supplied', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
				const command = program.Init();

				// Act
				command.parse(['', '', 'init', '--force']);

				// Assert
				settingsMock.verify((x) => x.Init(), Times.once());
			});
		});

		describe('"list" command', () => {
			const repos: RepoSetting[] = [
				{
					user: 'user1',
					repo: 'repo1',
					base: 'base1'
				},
				{
					user: 'user1',
					repo: 'repo2',
					base: 'base2'
				},
				{
					user: 'user2',
					repo: 'repo3',
					base: 'base3'
				}
			];

			it('should list all repositories', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
				settingsMock.setup((x) => x.GetRepos()).returns(() => repos);
				const command = program.Init();

				// Act
				command.parse(['', '', 'list']);

				// Assert
				consoleMock.verify((x) => x.write(It.isAnyString()), Times.exactly(repos.length));
			});

			it('should not write to console if there are no repositories', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
				settingsMock.setup((x) => x.GetRepos()).returns(() => []);
				const command = program.Init();

				// Act
				command.parse(['', '', 'list']);

				// Assert
				consoleMock.verify((x) => x.write(It.isAnyString()), Times.never());
			});

			it('should initialize settings if not previously initialized', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);
				settingsMock.setup((x) => x.GetRepos()).returns(() => repos);
				const command = program.Init();

				// Act
				command.parse(['', '', 'list']);

				// Assert
				settingsMock.verify((x) => x.Init(), Times.once());
			});

			it('should not initialize settings if previously initialized', () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
				settingsMock.setup((x) => x.GetRepos()).returns(() => repos);
				const command = program.Init();

				// Act
				command.parse(['', '', 'list']);

				// Assert
				settingsMock.verify((x) => x.Init(), Times.never());
			});
		});
	});
});
