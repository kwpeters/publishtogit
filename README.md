# publishtogit

## tl;dr

Publishtogit is a tool that publishes NPM packages to a branch within a
project's Git repository.  By doing so, this tool helps address some
difficulties encountered when developing and distributing NPM packages,
especially for projects using a language that transpiles to JavaScript.

## Why?

Reusable libraries are a good thing.  Unfortunately, developing, packaging and
distributing them can be problematic for the following reasons:

- Node.js has a great ecosystem that allows any developer to publish their
  package to [the NPM registry](https://www.npmjs.com/).  Unfortunately, the NPM
  registry is a public repository and sometimes we only want to share our packages
  within a smaller circle (such as within a company).  Of course, you could
  setup a [private NPM registry](http://lmgtfy.com/?q=private+npm+registry),
  but who really needs yet another server to setup and maintain?
- Fortunately, npm provides an alternative to registries; npm allows libraries
  to be brought into a project simply by referencing the [library's
  URL](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#urls-as-dependencies).  A URL
  can point at either a Git "commit-ish" or a tarball.  Using a URL that
  references a commit-ish works well for pure JavaScript projects where the source
  files are the same files that are consumed by clients.  However, in cases
  where transpilation is needed (like when using
  [TypeScript](https://www.typescriptlang.org/)), the set of files kept under
  source code control is not the same as the set of files to be delivered to
  consumers.  You could commit the transpiled files to version control, but
  committing machine generated files alongside the source files used to generate
  them is problematic.  Reviewing merge requests is more difficult
  because the compiled files are included in the difference listings, and manual
  merge conflicts are more plentiful when merging two branches that have each
  committed compiled output.  Alternatively, you could use a URL to a tarball file,
  but this requires you to host that tarball file in a sharable location, once
  again requiring another server.
- When using a transpiled language, you could use a NPM [postinstall
  script](https://docs.npmjs.com/misc/scripts) to compile the sources into their
  usable form.  This is not optimal, however, because it requires the library
  consumer to install the needed compiler and any other build tools.  This
  bloats the user's node_modules folder for a bunch of tools that will only be
  used once.  This is wasteful.  It would be far better to download the library
  in a "ready to use" state.

Publishtogit solves many of these problems by:

- Preparing the library for publishing just as if it were about to be published
  to the public NPM registry.  The `npm pack` command is used to do this, so you
  are free to customize the set of published files using a .npmignore file.
- Then, instead of publishing to the public NPM registry, a Git branch is
  created and the published files are committed.  This commit includes only the
  published files.  Publishtogit also allows the user to specify one or more
  tags to be applied to this commit.

Distributing a NPM package using publishtogit has the following advantages:

- The package does not have to be made publicly available on the public NPM
  registry.  Instead, access is determined by who has access to the repository.
- There is no need to setup and maintain a private NPM registry.
- Developing a library is simplified, because the original source files
  are kept on one branch and their compiled output is kept on another branch.
  This breaks the requirement that the files under version control must be the
  same set of files that are published and provided to consumers.  This is
  crucial when working in transpiled languages.
- Consuming the library is simple, because all you have to do is use a Git URL
  that refers to a publish commit.  The library is downloaded in its "ready to
  use" form.  There is no need for every client to install and run any build
  tools.
- Tracing a particular build to the sources used to create it is easy.  Each
  publish commit branches directly from the source commit that was used to build
  it.  Also, all tags are annotated with the commit hash and branch name of the
  source commit.

## What publishtogit does

1. The current working directory is checked to make sure you are in a NPM
   project under Git version control.  This project is the _development repo_.  The
   project is checked to make sure you don't have any modified files or untracked
   files before proceeding.  The current commit hash is also remembered.
2. The project's repository is cloned in a temporary folder to create a _publish
   repository_.  The current development commit that was noted in step 1 is checked out.
   Then, a temporary branch is created and all files under version control are deleted.
   This provides a clean slate into which the published files will be copied
   later in this process.
3. Similar to publishing a Node.js package to the NPM registry, `npm pack` is
   invoked within the _development repo_ to create the distributable version of
   your package.  Because, `npm pack` is used, the set of distributable files
   will be determined by any .gitignore or .npmignore files present.  If you are
   using a transpiled language, you would use .npmignore to ignore the original
   source files.  By doing so, only the built files will be published.
4. The files to be published are copied into the the _publish repository_
   created in step 2.
5. The published files are committed in the _publish repository_.
6. Tags are applied to the commit.
7. The tags are pushed to the _publish repository's_ `origin` remote.
8. In the development repo, the origin remote is fetched in order to bring the
    newly created tags into it.
9. A completion message is printed, providing the Git URL that refers to the
   publish commit just created.  Consumers of the package can add this URL as a
   dependency in their projects.

## Setting up your project to publish using publishtogit

1. Install publishtogit as a devDependency:

   ```bash
   npm install --save-dev https://github.com/kwpeters/publishtogit.git#latest
   ```

    Once this is done, publishtogit can be run locally using `node_modules/.bin/publishtogit`.

2. Make sure your project's `package.json` properly defines the following
   properties (see the
   [package.json](https://docs.npmjs.com/files/package.json) documentation for
   more information):
   - **version** - When `--tag-version` is used, this is the version number that is used.
   - **repository** - This is the URL of the project's repo.  This URL will be
     used when cloning the project and when publishing the results.  This must
     be specified in the form:

     ```text
     "repository": {
         "type": "git",
         "url": "https://blah/userororg/myproject.git"
     }
     ```

   - **main** - This field is not used by publishtogit, but you should check its
     value to make sure it is correct.  Since you are likely adding a build
     procedure to your project, you may have to update it to something like
     "dist/index.js".  This field is only needed if your Node.js module will
     be required/imported by other code or you will be using `npm start`.
3. Define the set of files that should be published by doing one of the following:
   - Set the "files" property in package.json
   - Create a .npmignore file in the root of your project


## Setting up a project to use a package that was published using publishtogit

To create a dependency on a package that has been published using publishtogit,
simply add its URL to your `dependencies` or `devDependencies`:

```json
{
  // yada, yada, yada
  "dependencies": {
    "some-package": "git+https://git.server.com/myOrg/packageName.git#<commitHash>"
  }
}
```

## Developing and releasing publishtogit

### Creating a release

1. Update the version in package.json according to semver rules.
2. Update CHANGELOG.md to describe changes.
3. Update README.md if necessary.
4. Commit all work and push to origin.
5. Build the project.

   ```bash
   gulp build
   ```

6. Publish.

   ```bash
   ./node_modules/.bin/ts-node src/publishtogit.ts --tag-version --tag latest --force-tags
   ```
