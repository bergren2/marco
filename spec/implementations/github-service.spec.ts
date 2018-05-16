import { expect } from 'chai';
import { GithubService } from '../../src/implementations/github-service';

describe('GithubService', () => {
	describe('GetRepoUrl', () => {
		it('should return url starting with \'git@github.com:\'', () => {
			// Arrange
			const githubService = new GithubService();
			const repoSetting: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };

			// Act
			const url = githubService.GetRepoUrl(repoSetting);

			// Assert
			expect(url.startsWith('git@github.com:')).to.be.true;
		});

		it('should return url in the format \'git@github.com:<user>/<repo>.git\'', () => {
			// Arrange
			const githubService = new GithubService();
			const repoSetting: RepoSetting = { user: 'user', repo: 'repo', base: 'base' };

			// Act
			const url = githubService.GetRepoUrl(repoSetting);

			// Assert
			expect(url).to.equal('git@github.com:user/repo.git');
		});
	});
});
