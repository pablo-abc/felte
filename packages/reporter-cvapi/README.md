# @felte/reporter-cvapi

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-cvapi)](https://bundlephobia.com/result?p=@felte/reporter-cvapi)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-cvapi)](https://www.npmjs.com/package/@felte/reporter-cvapi)

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
