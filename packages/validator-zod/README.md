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

Call `validator` with an object containing your Zod schema in the `schema` property. The result of the call can be passed as an extender to Felte:

```javascript
import { validator } from '@felte/validator-zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

const { form } = createForm({
  // ...
  extend: validator({ schema }), // or `extend: [validator({ schema })],`
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

Optionally, you can tell this package to assign the results of your validations to your `warnings` store by setting the `level` property of the validator function to `warning`. It's `error` by default:

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
  extend: [
    validator({ schema }),
    validator({ schema: warnSchema, level: 'warning' }),
  ],
  // ...
});
```

## Typescript

Zod allows you to infer the type of your schema using `z.infer`. This can be used so you don't need to create a type for your form's data:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

const { form } = createForm<z.infer<typeof schema>>(/* ... */);
```
