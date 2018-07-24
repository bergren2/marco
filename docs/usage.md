## Usage
### Contents
- [Basic Usage](#basic-usage)
- [Commands](#commands)
  - [Init](#init)
  - [List](#list)
  - [Add](#add)
  - [Update](#update)
  - [Remove](#remove)
  - [Import](#import)
  - [Export](#export)
  - [Polo](#polo)

### Basic Usage
```bash
marco add user/repo
marco polo
```

### Commands
#### List
Lists all repos in the configuration.

```bash
marco list
```

#### Add
Adds a repo to the user's configuration.

Syntax for the parameters is `<user>/<repo> [base]`, where `user` is the GitHub user name, `repo` is the GitHub repo name, and `base` is an optional parameter specifying the base branch. The base branch is used for determining if there are any new changes since the last semver tag.

```bash
marco add user/repo
marco add user/repo develop
```

#### Update
Updates a configured repo's base branch.

Syntax for the parameters is `<user>/<repo> <base>`. The command will give a warning if the given repo cannot be found in the configuration.

```bash
marco update user/repo master
```

#### Remove
Remove a repo from the user's configuration.

Syntax for the parameter is `<user>/<repo>`. The command will give a warning if the given repo cannot be found in the configuration.

```bash
marco remove user/repo
```

#### Import
Imports configuration.

Parameter is a JSON string containing the new configuration. Note that double-quotes must be properly escaped when passed as a literal argument. The JSON string may also be piped into Marco (reads from stdin). **Warning**: Import _replaces_ the existing configuration.

```bash
marco import "[{\"user\": \"user\", \"repo\": \"repo\", \"base\": \"base\"}]"
```

#### Export
Exports configuration.

Accepts an option, `-p, --pretty`, that enables pretty-printing for the JSON configuration.

```bash
marco export
marco export --pretty
```

#### Polo
Execute repo checking.

The Polo command performs the following actions:
- Clones each configured repo to a temporary directory
- Checks each repo for changes
  - Repo is considered to have changes if the head of the base branch and the latest semver tag point to different refs
- Cleans up temp files
- Prints all repos that have changes

```bash
marco polo
```
