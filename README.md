[![Build Status](https://api.travis-ci.org/ceruleanlabs/marco.svg?branch=master)](https://travis-ci.org/ceruleanlabs/marco)
[![Coverage Status](https://coveralls.io/repos/github/ceruleanlabs/marco/badge.svg?branch=master)](https://coveralls.io/github/ceruleanlabs/marco?branch=master)

# Marco
Simple CLI tool for fetching list of projects which are ready for a release.

After configuring all managed repositories, this tool will list the projects which have unreleased changes (based on version tags).

## Assumptions
- Target repo is hosted on [GitHub](https://github.com)
- User has [configured an SSH key with GitHub](https://help.github.com/articles/connecting-to-github-with-ssh/)
- Target repo uses tags for versioning
- Target repo uses SemVer

## Installation & Usage
```bash
npm install --global marco-cli
marco
```

## Additional Info
[Read the docs](docs/index.md)

## License
[MIT](LICENSE)
