# Contributing to Felte

Thank you so much for even considering contributing to this project! If you wish to help out with Felte I hope the following information will make it as easy as possible for you.

## About the project

This project is a monorepo containing all the packages related to Felte, as well as its documentation site. These are all contained within the `packages/` directory. We are currently using [Bolt](https://github.com/boltpkg/bolt) and yarn to manage this repo's dependencies and [Changesets](https://github.com/atlassian/changesets) to maintain versioning and changelogs.

Most of the packages use TypeScript for type safety, and all of them use [Rollup](https://rollupjs.org) for bundling.


## Local package development

In order to run this locally, fork this repo and clone it to your machine. You then will install dependencies using `Bolt`. This an all other commands we show in this guide will be run in the root folder of the monorepo.

```sh
bolt
```

### All packages

In order build all packages you can use `yarn`.

```sh
yarn build
```

This will build all packages except for the docs site.

If you want to watch your changes so Rollup makes a new build everytime you change a file, use:

```sh
yarn dev
```

This will watch ALL packages.

> Note that if you change any TypeScript types you will need to run `yarn build` for them to be re-bundled. For now, dev mode does not generate new types. This should only be a issue if you're modyfing `@felte/common`, though.

### Per package

If you want to scope your commands to a single package you can use Bolt. The following would build only the `@felte/common` package. The `w` (or `workspace`) scopes the command to a single package. The workspace name is the name inside each of the packages' `package.json` (a.k.a. the name they're published as).

```sh
bolt w @felte/common run build
```

Something similar would be done if you want to watch your changes:

```sh
bolt w @felte/common run dev
```

### Testing

We care about test coverage and test quality, if you add new code/new features, it would be really nice if you add tests to it. All packages except for Felte's documentation site have tests that aim to >90% code coverage. You can run tests for all packages using:

```sh
# runs all tests
yarn test

# runs all tests with coverage
yarn test:ci
```

If you want to run tests for a single package, we can use `Bolt` again to scope the command:

```sh
# runs tests
bolt w @felte/common run test

# runs tests with coverage
bolt w @felte/common run test:ci
```

## Local documentation site development

We are using [SvelteKit](https://github.com/sveltejs/kit) for the documentation site. You can run a development build of it with:

```sh
yarn site:dev
```

Or you can run a production build using:

```sh
yarn site:build # makes a production build

yarn site:start # runs the production build
```

All documentation files for the site are made using Markdown, and they're contained in the `packages/site/markdown/docs/` directory. Its structure right now was made for future i18n and multiple versioning, but right now there's only documentation in the `packages/site/markdown/docs/en/latest` directory.

If you're making changes to any package that require documentation, it would be nice if you could update this as well.

Adding a new section to the docs page would require adding a new markdown file next to the other docs files with the same format as the rest. Then adding the file name (without the extension) to the `sections` array in line 28 of `packages/site/src/routes/docs/_docs.js`. Add the file name where you want the section to be related to the others.

## Commit messages

We are using [Commitlint](https://commitlint.js.org/) to make sure our commits adhere to a standard. We are following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standards. If your commit does not follow this standard it will fail. When making a pull request, also make sure to make your PR title follow this standard.

When commiting or making a PR for a specific package, please scope your commit/PR title. The scopes we use right now are the same as the directory names inside of the `packages/` directory. An example would be:

```
feat(validator-yup): some change description
```

If your changes touch multiple packages, it's ok to not scope it.

## "I'm not quite sure how to document/test my changes"

That's OK! Any help is better than no help, if you're not sure what the best approach would be to add tests/documentation to your changes, I can get around to it. Adding these would just help me a lot with the work.

The only documentation requirement I really ask for is to add the `changeset` as described in the next section.

## Making a pull request

When making a pull request, we want any changes you make to be documented. This is where `Changesets` comes in. `Changesets` will help you document which changes you're making. For this you can run:

```sh
yarn changeset
```

And go to the prompts it'll give you.

- First it will ask you to select which packages are the ones changing
- Then it will ask you to select which packages require major/minor/patch bumps.
- Finally it will ask you to provide a summary of your changes. This will be added to the CHANGELOG.md of the package you're modifying so make sure it's clear and understandable.

For now, since we are pre 1.0.0, breaking changes may be included in minor versions. Just make sure to add `BREAKING:` to the summary so it is documented.

Running this command will generate a markdown file in the `.changeset/` directory. Commit this file alongside your changes!

> Whatever your PR is about, either an enhancement or a bug fix, it would be nice if you could open an Issue alongside it for good tracking.

## Issues you can help with

There are a few minor things I haven't gotten around to solve yet. If you have an idea on how to solve them, you may give it a try:

- `@felte/common` is not tree-shakeable yet. This makes some extender packages slightly bigger than I'd like them to be but I haven't quite figured out how to do this yet.
- The current API for extending Felte is not so great. While it's "easy" to use, it's not "simple". It's quite easy to break Felte accidentally. I still haven't figured out how a simple and safe API would look like for this.
- For some features we rely on `lodash`, I'm currently trying to replace each dependency for a locally developed one in `@felte/common`. I still have not replaced `mergeWith`, `cloneDeep`, and `defaultsDeep`.
