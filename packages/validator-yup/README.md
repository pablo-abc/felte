# @felte/validator-yup

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-yup)](https://bundlephobia.com/result?p=@felte/validator-yup)
[![NPM Version](https://img.shields.io/npm/v/@felte/validator-yup)](https://www.npmjs.com/package/@felte/validator-yup)

A package to help you handle validation with Yup in Felte.

## Installation

```sh
npm install --save @felte/validator-yup yup

# Or, if you use yarn

yarn add @felte/validator-yup yup
```

## Usage

Extend Felte with the `validator` extender and add your schema to the `validateSchema` property of `createForm`'s config.

```javascript
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm({
  // ...
  extend: validator, // or `extend: [validator],`
  validateSchema: schema,
  // ...
});
```

OR use the `validateSchema` function directly in the `validate` option of `createForm`. (No need to extend Felte).

```javascript
import { validateSchema } from '@felte/validator-yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm({
  // ...
  validate: validateSchema(schema),
  // ...
});
```

## Casting values

Unlike `yup`, by default this validator does **not** cast values. If you wish to have this behaviour you may set the `castValues` property to `true` on `createForm`'s configuration object.

```javascript
const { form } = createForm({
  //...
  validateSchema: schema,
  castValues: true,
  //...
});
```

**NOTE**: `yup` throws if your schema fails to cast, **we do not catch this errors** so make sure your schema handles this appropriately to prevent your app from crashing. For example, lets assume we have a `text` input that should be cast to an integer. `yup`'s `number` rule would throw an error if a string is set so, in order to prevent your app from crashing, a custom rule would be needed:

```javascript
const schema = yup.object({
  shouldBeNumber: yup
    .mixed()
    .test('number', 'Must be a number', value => !isNaN(value))
    .transform(value => parseInt(value, 10)),
});
```

## Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `createForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-yup';

import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm<yup.InferType<typeof schema>, ValidatorConfig>(/* ... */);
```
