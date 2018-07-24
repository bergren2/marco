import { expect } from 'chai';
import { IMock, Mock, Times, It } from 'typemoq';
import chalk from 'chalk';
import { ProgramService } from '../../src/services/program-service';
import { ReadlineModule } from '../../types/readline';
import { FsModule } from '../../types/fs';
import { PathModule } from '../../types/path';
import { RimrafModule } from '../../types/rimraf';
import { IConfigDirectoryProvider } from '../../src/interfaces/config-directory-provider.interface';
import { IRepoService } from '../../src/interfaces/repo-service.interface';
import { IGitService } from '../../src/interfaces/git-service.interface';

describe('ProgramService', () => {
	let packageMock: IMock<any>;
	let consoleMock: IMock<NodeJS.WriteStream>;
	let readlineMock: IMock<ReadlineModule>;
	let fsMock: IMock<FsModule>;
	let pathMock: IMock<PathModule>;
	let rimrafMock: IMock<RimrafModule>;
	let configDirectoryProviderMock: IMock<IConfigDirectoryProvider>;
	let repoServiceMock: IMock<IRepoService>;
	let gitMock: IMock<IGitService>;
	let program: ProgramService;

	beforeEach(() => {
		packageMock = Mock.ofType<any>();
		consoleMock = Mock.ofType<NodeJS.WriteStream>();
		readlineMock = Mock.ofType<ReadlineModule>();
		fsMock = Mock.ofType<FsModule>();
		pathMock = Mock.ofType<PathModule>();
		rimrafMock = Mock.ofType<RimrafModule>();
		configDirectoryProviderMock = Mock.ofType<IConfigDirectoryProvider>();
		repoServiceMock = Mock.ofType<IRepoService>();
		gitMock = Mock.ofType<IGitService>();

		program = new ProgramService(
			packageMock.object,
			consoleMock.object,
			readlineMock.object,
			fsMock.object,
			pathMock.object,
			rimrafMock.object,
			configDirectoryProviderMock.object,
			repoServiceMock.object,
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
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => repos);

			// Act
			await program.List();

			// Assert
			consoleMock.verify((x) => x.write(It.isAnyString()), Times.exactly(repos.length));
		});

		it('should not write to console if there are no repositories', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => []);

			// Act
			await program.List();

			// Assert
			consoleMock.verify((x) => x.write(It.isAnyString()), Times.never());
		});
	});

	describe('Add', () => {
		it('should add the repo', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.AddRepo(It.isAny())).returns(async () => true);
			const newRepo: RepoSetting = {
				user: 'newUser',
				repo: 'newRepo',
				base: 'newBase'
			};

			// Act
			await program.Add(`${newRepo.user}/${newRepo.repo}`, newRepo.base);

			// Assert
			repoServiceMock.verify((x) => {
				return x.AddRepo(It.is((repo: RepoSetting) => {
					return repo.user === newRepo.user &&
						repo.repo === newRepo.repo &&
						repo.base === newRepo.base;
				}));
			}, Times.once());
		});

		it('should write success message if repo was successfully added', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.AddRepo(It.isAny())).returns(async () => true);

			// Act
			await program.Add('user/repo', 'base');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Added repo'))
			), Times.once());
		});

		it('should write failure message if repo was not successfully added', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.AddRepo(It.isAny())).returns(async () => false);

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
	});

	describe('Update', () => {
		it('should update the repo', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.UpdateRepo(It.isAny())).returns(async () => true);
			const newRepo: RepoSetting = {
				user: 'newUser',
				repo: 'newRepo',
				base: 'newBase'
			};

			// Act
			await program.Update(`${newRepo.user}/${newRepo.repo}`, newRepo.base);

			// Assert
			repoServiceMock.verify((x) => {
				return x.UpdateRepo(It.is((repo: RepoSetting) => {
					return repo.user === newRepo.user &&
						repo.repo === newRepo.repo &&
						repo.base === newRepo.base;
				}));
			}, Times.once());
		});

		it('should write success message if repo was successfully updated', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.UpdateRepo(It.isAny())).returns(async () => true);

			// Act
			await program.Update('user/repo', 'base');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Updated repo'))
			), Times.once());
		});

		it('should write failure message if repo was not successfully updated', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.UpdateRepo(It.isAny())).returns(async () => false);

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
	});

	describe('Remove', () => {
		it('should remove the repo', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.RemoveRepo(It.isAny())).returns(async () => true);
			const newRepo: RepoSetting = {
				user: 'newUser',
				repo: 'newRepo',
				base: 'newBase'
			};

			// Act
			await program.Remove(`${newRepo.user}/${newRepo.repo}`);

			// Assert
			repoServiceMock.verify((x) => {
				return x.RemoveRepo(It.is((repo: RepoSetting) => {
					return repo.user === newRepo.user &&
						repo.repo === newRepo.repo;
				}));
			}, Times.once());
		});

		it('should write success message if repo was successfully removed', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.RemoveRepo(It.isAny())).returns(async () => true);

			// Act
			await program.Remove('user/repo');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.includes('Removed repo'))
			), Times.once());
		});

		it('should write failure message if repo was not successfully removed', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.RemoveRepo(It.isAny())).returns(async () => false);

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
	});

	describe('Import', () => {
		it('should import using the passed config string', async () => {
			// Act
			await program.Import('[]');

			// Assert
			repoServiceMock.verify((x) => x.SetRepos(
				It.is((config: RepoSetting[]) => Array.isArray(config) && config.length === 0)
			), Times.once());
		});

		it('should write any errors that occur to the console', async () => {
			// Arrange
			chalk.enabled = false;

			// Act
			await program.Import('');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message.startsWith('Error:'))
			), Times.once());
		});
	});

	describe('Export', () => {
		it('should format the output if the "--pretty" flag is passed in', async () => {
			// Arrange
			const repo: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => [repo]);

			// Act
			await program.Export(true);

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === `${JSON.stringify([repo], undefined, 4)}\n`)
			), Times.once());
		});

		it('should not format the output if the "--pretty" flag is not passed in', async () => {
			// Arrange
			const repo: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => [repo]);

			// Act
			await program.Export();

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === `${JSON.stringify([repo])}\n`)
			), Times.once());
		});
	});

	describe('Execute', () => {
		it('should list repos with changes', async () => {
			// Arrange
			fsMock.setup((x) => x.mkdtempSync(It.isAny())).returns(() => '/temp');
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => [
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
			chalk.enabled = false;

			// Act
			await program.Execute();

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === 'user1/repo1\n' || message === 'user2/repo2\n')
			), Times.exactly(2));
		});

		it('should clean up temp folder when complete', async () => {
			// Arrange
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => []);
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
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => []);
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
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => [
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
			repoServiceMock.setup((x) => x.GetRepos()).returns(async () => [
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
			chalk.enabled = false;

			// Act
			await program.Execute();

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message: string) => message === 'user1/repo1\n' || message === 'user2/repo2\n')
			), Times.never());
		});
	});

	describe('ParseRepoSettingsJson', () => {
		it('should throw an error if parsed JSON is not an array', async () => {
			// Arrange
			chalk.enabled = false;

			// Act
			await program.Import('{}');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message) => message === 'Error: Parsed JSON is not an array\n')
			), Times.once());
		});

		it('should throw an error if parsed JSON contains an invalid RepoSetting', async () => {
			// Arrange
			chalk.enabled = false;

			// Act
			await program.Import('[{"user": "user", "repo": "repo"}]');

			// Assert
			consoleMock.verify((x) => x.write(
				It.is((message) => message === 'Error: Invalid RepoSetting object\n')
			), Times.once());
		});
	});
});
