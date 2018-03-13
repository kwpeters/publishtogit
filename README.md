# publishtogit
A command line tool for publishing a NPM package to a Git repository.  This tool
can significantly simplify the development and distribution of Node.js libraries
that are authored in a language that transpiles to JavaScript.

## Why
Reusable libraries are a good thing.  They help us get closer to the holy grail
of code reuse.  Unfortunately, developing, packaging, distributing, and versioning
them can be problematic for the following reasons:
- Node.js has a great ecosystem that allows any developer to publish their
  package to [the NPM registry](https://www.npmjs.com/).  Unfortunately, the NPM
  registry is a public repository and sometimes we only want to share our packages
  within a smaller circle (such as within a company).  Of course, you could
  setup a [private NPM registry](http://lmgtfy.com/?q=private+npm+registry),
  but who really needs yet another server to setup and maintain?
- NPM allows us to specify dependencies [using
  URLs](https://docs.npmjs.com/files/package.json#urls-as-dependencies).  A URL
  can either point at a Git "commit-ish" or a tarball.  Using a URL that
  references a commit-ish works well for pure JavaScript projects where the source
  files are the same as those consumed by the library's users.  However, in cases
  where transpilation is needed (like TypeScript), the set of files kept under
  source code control is not the same as the set of files to be delivered to
  consumers.  You could commit the transpiled files to version control, but
  that creates headaches when multiple developers commit builds on separate
  branches and then merge those branches.  Besides, commiting machine generated
  files to version control seems wrong.  You could use a URL to a tarball file,
  but this requires you to host that tarball file in a sharable location, once
  again requiring another server.
- When using a transpiled language, you could use a NPM postinstall script to
  compile the sources into their usable form.  This is not optimal, however,
  because it requires the library consumer to install the needed compiler and any
  other build tools.  This bloats the user's node_modules folder for a bunch of
  tools that will only be used once.  This is wasteful.  It would be far better to
  download the library in a "ready to use" state.

publishtogit solves many of these problems by publishing a Node.js package to
the **Git repository** itself instead of the public NPM registry.  Because the
published files are committed on a separate branch, published releases can be
kept in the same repository as the original sources.  Doing this has the
following
advantages:
- There is no need to setup and maintain a private NPM registry server.  You
  already have a Git server, so use it.
- Authoring a library in a transpiled language such as TypeScript is much
  easier.  Previously, if you didn't want to publish publicly you had to use a Git
  URL.  But that brought with it the requirement that the set of files you
  published had to equal the set of files kept under version control.  That
  requirement is untenable for a library written in a transpiled language.  With
  publishtogit, the published files (and only the published files) are committed
  on a separate branch.  This allows the set of files under version control to be
  unreleated to the set of published files.
- Users of the library receive the library in a "ready to use" form.  They do
  not have to transpile the library, nor do they have to install any of the
  library's build tools.

## What publishtogit Does
1.  The current working directory is checked to make sure you are in a NPM
    project under Git version control.  This project is the _development repo_.  The
    project is checked to make sure you don't have any modified files or untracked
    files before proceding.
2.  The development repo is cloned in a temporary location to create a _publish
    repository_.  The current commit in the development repo is checked out.
3.  Similar to publishing a Node.js package to the NPM registry, `npm pack` is
    invoked within the development repo to create the distributable version of your package.  Because, `npm
    pack` is used, the set of distributable files will be determined by any
    .gitignore or .npmignore file present.  If you are using a transpiled language,
    you would use `.npmignore` to ignore the original (pre-transpilation) source
    files.  By doing so, only the built files will be published.
4.  The files to be published are copied into the the _publish repository_
    created in step 2.
5.  The published files are committed in the _publish repository_.
6.  Tags are applied to the commit.
6.  The tags are pushed to the _publish repository's_ `origin` remote.
7.  Library users may now consume the published library by specifying the
    published Git commit URL.

## How to use publishtogit
1.  Install publishtogit.  If you want to install it globally:
    ```
    npm install -g https://github.com/kwpeters/publishtogit.git#latest
    ```
    You can also install it locally within your project:
    ```
    npm install https://github.com/kwpeters/publishtogit.git#latest
    ```
2.  Run `publishtogit --help` for usage information.

# Development

## Creating a release

1.  Update the version in package.json according to semver rules.
2.  Update CHANGELOG.md to describe changes.
3.  Update README.md if necessary.
4.  Commit all work.
5.  Build the project.
    ```
    gulp build
    ```
6.  Publish.
    ```
    ts-node src/publishtogit.ts --tag latest .
    ```
