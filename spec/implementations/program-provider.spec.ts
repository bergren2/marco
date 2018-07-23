import { expect } from 'chai';
import { IMock, Mock, Times, It } from 'typemoq';
import colors from 'colors';
import { ProgramProvider } from '../../src/implementations/program-provider';
import { ReadlineModule } from '../../types/readline';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { RimrafModule } from '../../types/rimraf';
import { ISettingsProvider } from '../../src/interfaces/settings-provider.interface';
import { IGitService } from '../../src/interfaces/git-service.interface';

describe('ProgramProvider', () => {
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

	describe('Version', () => {
		it('should provide number from package.json', () => {
			// Arrange
			packageMock.setup((x) => x.version).returns(() => '1.2.3');

			// Act
			const version = program.Version;

			// Assert
			expect(version).to.be.a('string').that.equals('1.2.3');
		});
	});

	describe('Init', () => {
		it('should perform initial setup on first run', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);

			// Act
			await program.Init();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not perform initial setup on subsequent runs', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Init();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});

		it('should perform initial setup if "force" parameter is truthy', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Init(true);

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});
	});

	describe('List', () => {
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

		it('should list all repositories', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.GetRepos()).returns(() => repos);

			// Act
			await program.List();

			// Assert
			consoleMock.verify((x) => x.write(It.isAnyString()), Times.exactly(repos.length));
		});

		it('should not write to console if there are no repositories', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.GetRepos()).returns(() => []);

			// Act
			await program.List();

			// Assert
			consoleMock.verify((x) => x.write(It.isAnyString()), Times.never());
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);
			settingsMock.setup((x) => x.GetRepos()).returns(() => repos);

			// Act
			await program.List();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.GetRepos()).returns(() => repos);

			// Act
			await program.List();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});
	});

	describe('Add', () => {
		it('should add the repo to the configuration file', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.AddRepo(It.isAny())).returns(async () => true);
			const newRepo: RepoSetting = {
				user: 'newUser',
				repo: 'newRepo',
				base: 'newBase'
			};

			// Act
			await program.Add(`${newRepo.user}/${newRepo.repo}`, newRepo.base);

			// Assert
			settingsMock.verify((x) => {
				return x.AddRepo(It.is((repo: RepoSetting) => {
					return repo.user === newRepo.user &&
						repo.repo === newRepo.repo &&
						repo.base === newRepo.base;
				}));
			}, Times.once());
		});

		it('should write success message if repo was successfully added', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.AddRepo(It.isAny())).returns(async () => true);

			// Act
			await program.Add('user/repo', 'base');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Added repo'))
			), Times.once());
		});

		it('should write failure message if repo was not successfully added', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.AddRepo(It.isAny())).returns(async () => false);

			// Act
			await program.Add('user/repo', 'base');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Added repo'))
			), Times.never());
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Warning'))
			), Times.once());
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);

			// Act
			await program.Add('user/repo', 'base');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Add('user/repo', 'base');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});
	});

	describe('Update', () => {
		it('should update the repo in the configuration file', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.UpdateRepo(It.isAny())).returns(async () => true);
			const newRepo: RepoSetting = {
				user: 'newUser',
				repo: 'newRepo',
				base: 'newBase'
			};

			// Act
			await program.Update(`${newRepo.user}/${newRepo.repo}`, newRepo.base);

			// Assert
			settingsMock.verify((x) => {
				return x.UpdateRepo(It.is((repo: RepoSetting) => {
					return repo.user === newRepo.user &&
						repo.repo === newRepo.repo &&
						repo.base === newRepo.base;
				}));
			}, Times.once());
		});

		it('should write success message if repo was successfully updated', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.UpdateRepo(It.isAny())).returns(async () => true);

			// Act
			await program.Update('user/repo', 'base');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Updated repo'))
			), Times.once());
		});

		it('should write failure message if repo was not successfully updated', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.UpdateRepo(It.isAny())).returns(async () => false);

			// Act
			await program.Update('user/repo', 'base');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Updated repo'))
			), Times.never());
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Warning'))
			), Times.once());
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);

			// Act
			await program.Update('user/repo', 'base');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Update('user/repo', 'base');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});
	});

	describe('Remove', () => {
		it('should remove the repo from the configuration file', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.RemoveRepo(It.isAny())).returns(async () => true);
			const newRepo: RepoSetting = {
				user: 'newUser',
				repo: 'newRepo',
				base: 'newBase'
			};

			// Act
			await program.Remove(`${newRepo.user}/${newRepo.repo}`);

			// Assert
			settingsMock.verify((x) => {
				return x.RemoveRepo(It.is((repo: RepoSetting) => {
					return repo.user === newRepo.user &&
						repo.repo === newRepo.repo;
				}));
			}, Times.once());
		});

		it('should write success message if repo was successfully removed', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.RemoveRepo(It.isAny())).returns(async () => true);

			// Act
			await program.Remove('user/repo');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Removed repo'))
			), Times.once());
		});

		it('should write failure message if repo was not successfully removed', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.RemoveRepo(It.isAny())).returns(async () => false);

			// Act
			await program.Remove('user/repo');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Removed repo'))
			), Times.never());
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Warning'))
			), Times.once());
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);

			// Act
			await program.Remove('user/repo');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Remove('user/repo');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});
	});

	describe('Import', () => {
		it('should import using the passed config string', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Import('test string');

			// Assert
			settingsMock.verify((x) => x.Import(It.is((config: string) => config === 'test string')), Times.once());
		});

		[new Error('invalid json'), 'invalid json'].forEach((error: any) => {
			it(`should write any errors that occur to the console (${error})`, async () => {
				// Arrange
				settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
				settingsMock.setup((x) => x.Import(It.isAnyString()))
					.returns(async () => {
						throw error;
					});
				colors.disable();

				// Act
				await program.Import('');

				// Assert
				consoleMock.verify((x) => x.write(
					It.is((message: string) => message === 'Error: invalid json\n')
				), Times.once());
			});
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);

			// Act
			await program.Import('');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Import('');

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});
	});

	describe('Export', () => {
		it('should get config from SettingsProvider', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.Export()).returns(async () => 'test string');

			// Act
			await program.Export();

			// Assert
			settingsMock.verify((x) => x.Export(), Times.once());
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === 'test string\n')
			), Times.once());
		});

		it('should format the output if the "--pretty" flag is passed in', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			const obj = { name: 'test object' };
			settingsMock.setup((x) => x.Export()).returns(async () => JSON.stringify(obj));

			// Act
			await program.Export(true);

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === `${JSON.stringify(obj, undefined, 4)}\n`)
			), Times.once());
		});

		it('should not format the output if the "--pretty" flag is not passed in', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			const obj = { name: 'test object' };
			settingsMock.setup((x) => x.Export()).returns(async () => JSON.stringify(obj));

			// Act
			await program.Export(false);

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === `${JSON.stringify(obj)}\n`)
			), Times.once());
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);

			// Act
			await program.Export();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);

			// Act
			await program.Export();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});
	});

	describe('Execute', () => {
		it('should list repos with changes', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			fsMock.setup((x) => x.mkdtempSync(It.isAnyString())).returns(() => '/temp');
			settingsMock.setup((x) => x.GetRepos()).returns(() => [
				{
					user: 'user1',
					repo: 'repo1',
					base: 'base1'
				},
				{
					user: 'user2',
					repo: 'repo2',
					base: 'base2'
				},
				{
					user: 'user3',
					repo: 'repo3',
					base: 'base3'
				}
			]);
			gitMock.setup((x) => x.CloneRepo(It.isAny(), It.isAnyString(), It.isAny()))
				.returns(async () => '/temp');
			gitMock.setup((x) => x.HasChanges(It.isAnyString(), It.isAny()))
				.returns(async (_path, repo) => repo.repo === 'repo1' || repo.repo === 'repo2');
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => []);
			colors.disable();

			// Act
			await program.Execute();

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === 'user1/repo1\n' || message === 'user2/repo2\n')
			), Times.exactly(2));
		});

		it('should initialize settings if not previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => true);
			settingsMock.setup((x) => x.GetRepos()).returns(() => []);
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => []);

			// Act
			await program.Execute();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.once());
		});

		it('should not initialize settings if previously initialized', async () => {
			// Arrange
			settingsMock.setup((x) => x.IsFirstRun()).returns(() => false);
			settingsMock.setup((x) => x.GetRepos()).returns(() => []);
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => []);

			// Act
			await program.Execute();

			// Assert
			settingsMock.verify((x) => x.Init(), Times.never());
		});

		it('should clean up temp folder when complete', async () => {
			// Arrange
			settingsMock.setup((x) => x.GetRepos()).returns(() => []);
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => [
				'temp1',
				'temp2'
			]);
			pathMock.setup((x) => x.resolve(It.isAny(), It.isAnyString()))
				.returns((_directory, file) => file);

			// Act
			await program.Execute();

			// Assert
			rimrafMock.verify((x) => x.sync(
				It.is((path: string) => path === 'temp1' || path === 'temp2')
			), Times.exactly(2));
		});

		it('should not clean up non-temp folders when complete', async () => {
			// Arrange
			settingsMock.setup((x) => x.GetRepos()).returns(() => []);
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => [
				'temp1',
				'temp2',
				'config'
			]);
			pathMock.setup((x) => x.resolve(It.isAny(), It.isAnyString()))
				.returns((_directory, file) => file);

			// Act
			await program.Execute();

			// Assert
			rimrafMock.verify((x) => x.sync(
				It.is((path: string) => path === 'temp1' || path === 'temp2')
			), Times.exactly(2));
			rimrafMock.verify((x) => x.sync(
				It.is((path: string) => path === 'config')
			), Times.never());
		});

		it('should write error message when there was a problem checking a repo', async () => {
			// Arrange
			settingsMock.setup((x) => x.GetRepos()).returns(() => [
				{
					user: 'user',
					repo: 'repo',
					base: 'base'
				}
			]);
			gitMock.setup((x) => x.CloneRepo(It.isAny(), It.isAny(), It.isAny()))
				.returns(async () => {
					throw new Error('The error message');
				});
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => []);

			// Act
			await program.Execute();

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === 'Error: The error message')
			), Times.once());
		});

		it('should clear matched repos if an error is encountered', async () => {
			// Arrange
			settingsMock.setup((x) => x.GetRepos()).returns(() => [
				{
					user: 'user1',
					repo: 'repo1',
					base: 'base1'
				},
				{
					user: 'user2',
					repo: 'repo2',
					base: 'base2'
				}
			]);
			gitMock.setup((x) => x.CloneRepo(It.isAny(), It.isAny(), It.isAny()))
				.returns(async () => '/temp');
			gitMock.setup((x) => x.CloneRepo(It.isAny(), It.isAny(), It.isAny()))
				.returns(async () => {
					throw new Error('The error message');
				});
			gitMock.setup((x) => x.HasChanges(It.isAny(), It.isAny())).returns(async () => true);
			fsMock.setup((x) => x.readdirSync(It.isAny())).returns(() => []);
			colors.disable();

			// Act
			await program.Execute();

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === 'user1/repo1\n' || message === 'user2/repo2\n')
			), Times.never());
		});
	});
});
