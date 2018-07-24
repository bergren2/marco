import { expect } from 'chai';
import { Mock, It, Times } from 'typemoq';
import { RepoService } from '../../src/services/repo-service';
import { IConfigProvider } from '../../src/interfaces/config-provider.interface';
import { Config } from '../../src/models/config';

describe('RepoService', () => {
	describe('GetRepos', () => {
		it('should return the repo config as an object', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();
			const repos = [{ user: 'user', repo: 'repo', base: 'base' }];
			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			const loadedRepos = await repoService.GetRepos();

			// Assert
			expect(loadedRepos).to.deep.equal(repos);
		});
	});

	describe('AddRepo', () => {
		it('should add the new repo to the config', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();
			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = [];
				return config;
			});
			configProviderMock.setup((x) => x.Set(It.isAny())).returns(() => Promise.resolve());
			const repoService = new RepoService(configProviderMock.object);

			// Act
			const result = await repoService.AddRepo(repo);

			// Assert
			configProviderMock.verify((x) => x.Set(
				It.is((content) => {
					return content.repos !== undefined &&
						content.repos.length === 1 &&
						content.repos[0].user === 'user' &&
						content.repos[0].repo === 'repo' &&
						content.repos[0].base === 'base';
				})
			), Times.once());
			expect(result).to.be.true;
		});

		it('should add the repo if the repo already exists', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const repos: RepoSetting[] = [repo];

			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			const result = await repoService.AddRepo(repo);

			// Assert
			configProviderMock.verify((x) => x.Set(It.isAny()), Times.never());
			expect(result).to.be.false;
		});

		it('should sort the repos by user and repo name', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();

			const repos: RepoSetting[] = [
				{
					user: 'user2',
					repo: 'repo2',
					base: 'base'
				}
			];
			const repo: RepoSetting = { user: 'user1', repo: 'repo1', base: 'base' };

			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			await repoService.AddRepo(repo);

			// Assert
			configProviderMock.verify((x) => x.Set(
				It.is((config) => {
					return config.repos !== undefined &&
						config.repos.length === 2 &&
						JSON.stringify(config.repos) === JSON.stringify([repo, ...repos]);
				})
			), Times.once());
		});
	});

	describe('UpdateRepo', () => {
		it('should update the repo if the repo already exists', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const updatedRepo: RepoSetting = { user: 'user', repo: 'repo', base: 'new-base' };
			const repos: RepoSetting[] = [repo, extraRepo];

			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			const result = await repoService.UpdateRepo(updatedRepo);

			// Assert
			configProviderMock.verify((x) => x.Set(
				It.is((config) => {
					return config.repos !== undefined &&
						config.repos.length === 2 &&
						JSON.stringify(config.repos) === JSON.stringify([updatedRepo, extraRepo]);
				})
			), Times.once());
			expect(result).to.be.true;
		});

		it('should not update the repo if the repo does not exist', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();

			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const updatedRepo: RepoSetting = { user: 'user', repo: 'repo', base: 'new-base' };
			const repos: RepoSetting[] = [extraRepo];

			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			const result = await repoService.UpdateRepo(updatedRepo);

			// Assert
			configProviderMock.verify((x) => x.Set(It.isAny()), Times.never());
			expect(result).to.be.false;
		});
	});

	describe('RemoveRepo', () => {
		it('should remove the repo if the repo already exists', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const repos: RepoSetting[] = [repo, extraRepo];

			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			const result = await repoService.RemoveRepo(repo);

			// Assert
			configProviderMock.verify((x) => x.Set(
				It.is((config) => {
					return config.repos !== undefined &&
						config.repos.length === 1 &&
						JSON.stringify(config.repos) === JSON.stringify([extraRepo]);
				})
			), Times.once());
			expect(result).to.be.true;
		});

		it('should not remove the repo if the repo does not exist', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();

			const repo: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };
			const extraRepo: RepoSetting = { user: 'user2', repo: 'repo2', base: 'base' };
			const repos: RepoSetting[] = [extraRepo];

			configProviderMock.setup((x) => x.Get()).returns(async () => {
				const config = new Config();
				config.repos = repos;
				return config;
			});

			const repoService = new RepoService(configProviderMock.object);

			// Act
			const result = await repoService.RemoveRepo(repo);

			// Assert
			configProviderMock.verify((x) => x.Set(It.isAny()), Times.never());
			expect(result).to.be.false;
		});
	});

	describe('SetRepos', () => {
		it('should set repos with passed array', async () => {
			// Arrange
			const configProviderMock = Mock.ofType<IConfigProvider>();
			const repoService = new RepoService(configProviderMock.object);

			const repo: RepoSetting = {
				user: 'user',
				repo: 'repo',
				base: 'base'
			};

			// Act
			await repoService.SetRepos([repo]);

			// Assert
			configProviderMock.verify((x) => x.Set(
				It.is((config) => {
					return config.repos !== undefined &&
						Array.isArray(config.repos) &&
						config.repos.length === 1 &&
						config.repos[0].user === 'user' &&
						config.repos[0].repo === 'repo' &&
						config.repos[0].base === 'base';
				})
			), Times.once());
		});
	});
});
