# @felte/validator-cvapi

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-cvapi)](https://bundlephobia.com/result?p=@felte/validator-cvapi)
[![NPM Version](https://img.shields.io/npm/v/@felte/validator-cvapi)](https://www.npmjs.com/package/@felte/validator-cvapi)

A package to help you handle validation with the native validation-api in Felte.

## Installation

```sh
npm install --save @felte/validator-cvapi

# Or, if you use yarn

yarn add @felte/validator-cvapi
```

## Usage

Extend Felte with the `validator` extender.

```javascript
import { validator } from '@felte/validator-cvapi';

const { form } = createForm({
  // ...
  extend: validator(), // or `extend: [validator()],`
  // ...
});
```

## Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `createForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-cvapi';

const { form } = createForm<z.infer<typeof schema>, ValidatorConfig>(/* ... */);
```
