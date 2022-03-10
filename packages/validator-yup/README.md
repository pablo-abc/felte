# @felte/validator-yup

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-yup)](https://bundlephobia.com/result?p=@felte/validator-yup)
[![NPM Version](https://img.shields.io/npm/v/@felte/validator-yup)](https://www.npmjs.com/package/@felte/validator-yup)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

A package to help you handle validation with Yup in Felte.

## Installation

```sh
npm install --save @felte/validator-yup yup

# Or, if you use yarn

yarn add @felte/validator-yup yup
```

## Usage

Call `validator` with an object containing your Yup schema in the `schema` property. The result of the call can be passed as an extender to Felte:

```javascript
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm({
  // ...
  extend: validator({ schema }), // or `extend: [validator({ schema })],`
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

Unlike `yup`, by default this validator does **not** cast values. If you wish to have this behaviour you may set the `castValues` property to `true` on the validator's configuration:

```javascript
const { form } = createForm({
  //...
  extend: validator({ schema, castValues: true }),
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

## Warnings

Optionally, you can tell this package to assign the results of your validations to your `warnings` store by setting the `level` property of the validator function to `warning`. It's `error` by default:

```javascript
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';

const validateSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

// We only warn if the user has already started typing a value
const warnSchema = yup.object({
  password: yup
    .string()
    .test('is-secure', 'password is not secure', (value) =>
      value ? value.length > 8 : true
    ),
});

const { form } = createForm({
  // ...
  extend: [
    validator({ schema }),
    validator({ schema: warnSchema, level: 'warning' }),
  ],
  // ...
});
```

## Typescript

Yup allows you to infer the type of your schema using `yup.InferType`. This can be used so you don't need to create a type for your form's data:

```typescript
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm<yup.InferType<typeof schema>>(/* ... */);
```
