# @felte/extender-persist

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/extender-persist)](https://bundlephobia.com/result?p=@felte/extender-persist)
[![NPM Version](https://img.shields.io/npm/v/@felte/extender-persist)](https://www.npmjs.com/package/@felte/extender-persist)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

A package to persist your form's state in localStorage.

## Installation

```sh
npm install --save @felte/extender-persist

# Or, if you use yarn

yarn add @felte/extender-persist
```

## Usage

Extend Felte with the `extender` export, the extenders accepts an object with options. A unique ID is required to use it as the ID for the localStorage.

```javascript
import { extender } from '@felte/extender-persist';

const { form } = createForm({
  // ...
  extend: extender({ id: 'uniqueId' }), // or `extend: [extender({ id: 'uniqueId' })],`
  // ...
});
```

## Ignoring fields

You might not want to save certain fields such as passwords to local storage, for this you may add an extra property to the configuration of the extender with an array of paths to the data you want to ignore:

```javascript
{
  extend: extender({ id: 'uniqueId', ignore: ['account.password'] }),
}
```

Or you may add the attribute `data-felte-extender-persist-ignore` to the input you don't want to persist.
