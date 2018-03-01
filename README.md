# publish-to-git
A command line tool for publishing a npm package to a Git repository.  This tool
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
library users.  You could commit the transpiled files to version control, but
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

publish-to-git solves many of these problems by publishing a Node.js package to
a _Git repository_ instead of the public NPM registry.  Because the published
files are committed on a separate branch, this _publish repository_ may be the
same repository that contains the original (pre-transpilation) source code, or
may be a separate distribution-only repository.  Doing this has the following
advantages:
- There is no need to setup and maintain a private NPM registry server.  You
already have a Git server, so use it.
- Authoring a library in a transpiled language such as TypeScript is much
easier.  Previously, if you didn't want to publish publicly you had to use a Git
URL.  But that brought with it the requirement that the set of files you
published had to equal the set of files kept under version control.  That
requirement is untenable for a library written in a transpiled language.  With
publish-to-git, the published files (and only the published files) are committed
on a separate branch and (optionally) in an entirely different repository.  This
allows the set of files under version control to be unreleated to the set of
published files.
- Users of the library receive the library in a "ready to use" form.  They do
not have to transpile the library, nor do they have to install any of the
library build tools.

## What publish-to-git Does
1.  First, the URL of the publish repository is read from the project's
`publishtogit.json` file.  In a temporary directory, this _publish repository_
is cloned and a branch named after the package's major and minor version numbers
is checked out.
2.  Similar to publishing a Node.js package to the NPM registry, `npm pack` is
invoked to create the distributable version of your package.  Because, `npm
pack` is used, the set of distributable files will be determined by any
.gitignore or .npmignore file present.  If you are using a transpiled language,
.you would use `.npmignore` to ignore the original (pre-transpilation) source
.files.  By doing so, only the built files will be published.
3.  The files to be published are copied into the the _publish repository_
created in step 1.  Also, the published `package.json` file is updated to make
sure it uses the name and Git URL of the _publish repository_.
4.  The published files are committed in the _publish repository_.
5.  A tag is applied with the project's verison string (from `package.json`).
6.  The branch and tag are pushed to the _publish repository's_ origin remote.
7.  Library users may now consume the published library by specifying the
published Git commit URL.

## How to use publish-to-git
1.  Install publish-to-git.  If you want to install it globally:
    ```
    npm install -g https://github.com/kwpeters/publish-to-git.git#latest
    ```
    You can also install it locally within your project:
    ```
    npm install https://github.com/kwpeters/publish-to-git.git#latest
    ```
2.  Create a publishtogit.json file in the root folder of the package you want
    to publish.  The contents should look like:
    ```
    {
        "publishRepository": "https://server.com/username/publish_repo_name.git"
    }
    ```
    Note: The `publishRepository` may be the same repository used for the package's
    original source files.  As mentioned above, publish-to-git will publish files on
    branches named after the major and minor version numbers.  The additional
    branches created for published releases will have no ill effect on the branches
    used to develop the original source code files.  On the other hand, you may
    want to publish to a separate repository.  For example, you may want to have
    different access permissions for the sources repo and the  publish repo.

# Development

## Doing a release

1.  Build the project.
    ```
    gulp build
    ```

2.  Publish.
    ```
    ts-node src/publish-to-git.ts --tag latest .
    ```
