# @felte/validator-zod

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-zod)](https://bundlephobia.com/result?p=@felte/validator-zod)
[![NPM Version](https://img.shields.io/npm/v/@felte/validator-zod)](https://www.npmjs.com/package/@felte/validator-zod)

A package to help you handle validation with Zod in Felte.

## Installation

```sh
npm install --save @felte/validator-zod zod

# Or, if you use yarn

yarn add @felte/validator-zod zod
```

## Usage

Extend Felte with the `validator` extender and add your schema to the `validateSchema` property of `createForm`'s config.

```javascript
import { validator } from '@felte/validator-zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
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
import { validateSchema } from '@felte/validator-zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

const { form } = createForm({
  // ...
  validate: validateSchema(schema),
  // ...
});
```

## Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `createForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-zod';

const { form } = createForm<YourDataType, ValidatorConfig>(/* ... */);
```
