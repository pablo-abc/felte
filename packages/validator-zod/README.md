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

## Warnings

Optionally, you can also add a schema that will validate for warnings in your data. Warnings are any validation messages that should not prevent your form for submitting. You can add the schema that will be using for setting this values to the `warnSchema` property on the configuration:

```javascript
import { validator } from '@felte/validator-zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

// We only warn if the user has started typing a value
const warnSchema = zod.object({
  password: zod
    .string()
    .refine((value) => (value ? value.length > 8 : true), {
      message: 'Password is not secure',
    }),
});

const { form } = createForm({
  // ...
  extend: validator, // or `extend: [validator],`
  validateSchema: schema,
  warnSchema,
  // ...
});
```

## Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `createForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

const { form } = createForm<z.infer<typeof schema>, ValidatorConfig>(/* ... */);
```
