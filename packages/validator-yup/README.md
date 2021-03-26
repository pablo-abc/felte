# @felte/validator-yup

![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-yup)
![NPM Version](https://img.shields.io/npm/v/@felte/validator-yup)

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
