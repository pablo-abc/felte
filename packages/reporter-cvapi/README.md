# @felte/reporter-cvapi

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-cvapi)](https://bundlephobia.com/result?p=@felte/reporter-cvapi)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-cvapi)](https://www.npmjs.com/package/@felte/reporter-cvapi)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

A Felte reporter that uses the browser's [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) to display your error messages.

## Installation

```sh
npm install --save @felte/reporter-cvapi

# Or, if you use yarn

yarn add @felte/reporter-cvapi
```

## Usage

Add it to the `extend` property of Felte's `createForm` configuration object.

```javascript
import reporter from '@felte/reporter-cvapi';

const { form } = createForm({
  // ...
  extend: reporter,
  // ...
});
```
