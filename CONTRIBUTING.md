# Contributing
Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

Please only bump the version in the develop branch, and do all work in other branches
which branch off of develop.

### Set up your environment
##### Prerequisites:
- NodeJS
- NPM (typically bundled with NodeJS)

##### Install Dependencies:
Please run the following commands in the root directory of the project:
```bash
$ npm i
```

##### Building/Releasing:
Before releasing any new versions, please build the project executables using:
```bash
$ ./build.sh
```
`pkg`, which is installed in `build.sh`, are required to build the project executables,
may not work with some versions of NodeJS, if this is the case for your current
version of NodeJS, please upgrade/downgrade your NodeJS version using a version
manager such as [n](https://www.npmjs.com/package/n) or [nvm](https://github.com/nvm-sh/nvm)

##### Releasing:
Releases are performed by `.github/workflows/release.yml`, not by hand. Merge the
version bump to `master` and the workflow tags the commit, publishes to npm, and
creates the GitHub release. It is safe to re-run from the Actions tab: every step
checks whether it has already happened, so a run that failed halfway finishes the
rest instead of failing on "already published".

The publish uses npm **trusted publishing** (OIDC), so no npm token is stored in this
repository. This has to be configured once, on npmjs.com:

1. Sign in to npmjs.com as a maintainer of `git-alias-manager`.
2. Go to the package -> Settings -> Trusted publishing -> add a GitHub Actions publisher.
3. Organization/owner `Megapixel99`, repository `GAM`, workflow filename `release.yml`,
   and leave the environment field empty — the publish job declares no environment,
   and a publisher pinned to one will not match.

Until that publisher exists, the `npm` job fails with a 404 or `ENEEDAUTH` on the
`PUT`, and nothing else is wrong. The job prints the OIDC claims it is presenting
(repository, workflow, ref, environment) right before publishing, so a mismatch can be
compared against what is registered rather than guessed at.

##### To Do:
- Modify build script for Windows
- Fix issue in the use of `sudo` in the build script with zshell.
- Modify commands so they work in different volumes/drives when installed with python
- Modify python script to work in Windows
