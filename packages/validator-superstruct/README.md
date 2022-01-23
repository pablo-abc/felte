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

This package exports a `validator` function that returns an `extender`. Call it with your struct in the `struct` property of its configuration and assign it to the `extend` property of `createForm`:

```javascript
import { validator } from '@felte/validator-superstruct';
import { object, string, size } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = createForm({
  // ...
  extend: validator({ struct }), // or `extend: [validator({ struct })],`
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

`Superstruct` does not provide a way to add a custom error message to its built-in types, for this reason `validator` also accepts a `transform` function that will receive each [`failure`](https://docs.superstructjs.org/api-reference/errors) from Superstruct, you can check the failure there and return an appropriate error message.

> This function can be also passed to `validateStruct` as its second argument

```javascript
import { validator } from '@felte/validator-superstruct';

const struct = object({ /* ... */ });

const extender = validator({
  struct,
  transform: (value) => value.type === 'string' ? 'Must not be empty' : 'Not valid'
});
```

## Warnings

Optionally, you can tell this package to assign the results of your validations to your `warnings` store by setting the `level` property of the validator function to `warning`. It's `error` by default:

```javascript
import { validator } from '@felte/validator-superstruct';
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
  extend: [
    validator({ struct: validateStruct }),
    validator({
      struct: warnStruct,
      level: 'warning',
    }),
  ],
  // ...
});
```

## Typescript

Superstruct allows you to infer the type of your schema using `Infer`. This can be used so you don't need to create a type for your form's data:

```typescript
import type { Infer } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = createForm<Infer<typeof struct>>(/* ... */);
```
