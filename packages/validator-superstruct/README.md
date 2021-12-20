# @felte/validator-superstruct

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-superstruct)](https://bundlephobia.com/result?p=@felte/validator-superstruct)
[![NPM Version](https://img.shields.io/npm/v/@felte/validator-superstruct)](https://www.npmjs.com/package/@felte/validator-superstruct)

A package to help you handle validation with Superstruct in Felte.

## Installation

```sh
npm install --save @felte/validator-superstruct superstruct

# Or, if you use yarn

yarn add @felte/validator-superstruct superstruct
```

## Usage

This package exports a `createValidator` function that returns a `validator`. Add it to the `extend` option of `createForm` and add your struct to the `validateStruct` property of `createForm`'s config.

```javascript
import { createValidator } from '@felte/validator-superstruct';
import { object, string, size } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = createForm({
  // ...
  extend: createValidator(), // or `extend: [createValidator()],`
  validateStruct: struct,
  // ...
});
```

OR use the `validateStruct` function directly in the `validate` option of `createForm`. (No need to extend Felte).

```javascript
import { validateStruct } from '@felte/validator-superstruct';
import { object, string, size } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = createForm({
  // ...
  validate: validateStruct(struct),
  // ...
});
```

## Custom error messages

`Superstruct` does not provide a way to add a custom error message to its built-in types, for this reason the first argument of `createValidator` (and second argument of `validateStruct`) is a function that will receive each [`failure`](https://docs.superstructjs.org/api-reference/errors) from Superstruct, you can check the failure there and return an appropriate error message.

```javascript
import { createValidator } from '@felte/validator-superstruct';

const validator = createValidator((value) =>
  value.type === 'string' ? 'Must not be empty' : 'Not valid'
);
```

## Warnings

Optionally, you can also add a struct that will validate for warnings in your data. Warnings are any validation messages that should not prevent your form for submitting. You can add the struct that will be using for setting this values to the `warnStruct` property on the configuration:

```javascript
import { createValidator } from '@felte/validator-superstruct';
import { object, string, size, optional } from 'superstruct';

const validateStruct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

// We only show the warning if the user has started to type a value
const Secure = refine(string(), 'secure', (value) =>
  value ? value.length > 8 : true
);

const warnStruct =  object({
  password: Secure,
});

const { form } = createForm({
  // ...
  extend: createValidator(), // or `extend: [createValidator()],`
  validateStruct,
  warnStruct,
  // ...
});
```

## Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `createForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-superstruct';
import type { Infer } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = createForm<Infer<typeof struct>, ValidatorConfig>(/* ... */);
```
