---
section: Validators
subsections:
  - Using Yup
  - Using Zod
  - Using Superstruct
  - Using Vest
---

## Validators

If you use third party libraries for validation you might have found yourself needing to transform the output from said validation library to the form library you're using (unless the form library supports it natively or provides its own built-in alternative). In order to not reinvent the wheel, and to make life easier for you, we provide some official `validators` which are, basically, adapters for popular validation libraries.

If a validation library you use is not supported, feel free to [open an issue](https://github.com/pablo-abc/felte/issues), we would like to support the most used ones! You may also [build your own validation package](/docs/react/extending-felte).

### Using Yup

[Yup](https://github.com/jquense/yup) is a really popular validation library. For this reason we've created [`@felte/validator-yup`](https://github.com/pablo-abc/felte/tree/main/packages/validator-yup). An official package to handle validation with Yup. To use it you'll need both `@felte/validator-yup` and `yup`.

```sh
npm install --save @felte/validator-yup yup

# Or, if you use yarn

yarn add @felte/validator-yup yup
```

Its usage would look something like:

```javascript
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = useForm({
  // ...
  extend: validator, // OR `extend: [validator],`
  validateSchema: schema,
  // ...
});
```

#### Warnings

Optionally, you can also add a schema that will validate for warnings in your data. Warnings are any validation messages that should not prevent your form for submitting. You can add the schema that will be using for setting this values to the `warnSchema` property on the configuration:

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

const { form } = useForm({
  // ...
  extend: validator, // or `extend: [validator],`
  validateSchema,
  warnSchema,
  // ...
});
```

#### Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `useForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-yup';

import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = useForm<yup.InferType<typeof schema>, ValidatorConfig>(/* ... */);
```

### Using Zod

[Zod](https://github.com/colinhacks/zod) is a "TypeScript-first schema declaration and validation library", alternative to Yup with a similar API. We've also created [`@felte/validator-zod`](https://github.com/pablo-abc/felte/tree/main/packages/validator-zod) as an official package to handle validation with Zod. To use it you'll need both `@felte/validator-zod` and `zod` installed.

```sh
npm install --save @felte/validator-zod zod

# Or, if you use yarn

yarn add @felte/validator-zod zod
```

Its usage would look something like:

```javascript
import { validator } from '@felte/validator-zod';
import * as zod from 'zod';

const schema = zod.object({
  email: zod.string().email().nonempty(),
  password: zod.string().nonempty(),
});

const { form } = useForm({
  // ...
  extend: validator, // OR `extend: [validator],`
  validateSchema: schema,
  // ...
});
```

#### Warnings

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

const { form } = useForm({
  // ...
  extend: validator, // or `extend: [validator],`
  validateSchema: schema,
  warnSchema,
  // ...
});
```

#### Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `useForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty(),
});

const { form } = useForm<z.infer<typeof schema>, ValidatorConfig>(/* ... */);
```

### Using Superstruct

[Superstruct](https://docs.superstructjs.org) is another popular validation library that follows a more _functional_ style. We've created [`@felte/validator-superstruct`](https://github.com/pablo-abc/felte/tree/main/packages/validator-superstruct) as an official package to handle validation with Superstruct. To use it you'll need both `@felte/validator-superstruct` and `superstruct` installed.

```sh
npm install --save @felte/validator-superstruct superstruct

# Or, if you use yarn

yarn add @felte/validator-superstruct superstruct
```

Its usage would look something like:

```javascript
import { createValidator } from '@felte/validator-superstruct';
import { object, string, size } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = useForm({
  // ...
  extend: createValidator(), // or `extend: [createValidator()],`
  validateStruct: struct,
  // ...
});
```

The first argument of `createValidator` is a function that will receive each [`failure`](https://docs.superstructjs.org/api-reference/errors) from Superstruct, you can check the failure there and return an appropriate custom error message.

```javascript
import { createValidator } from '@felte/validator-superstruct';

const validator = createValidator((value) =>
  value.type === 'string' ? 'Must not be empty' : 'Not valid'
);
```

#### Warnings

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

const warnStruct = object({
  password: Secure,
});

const { form } = useForm({
  // ...
  extend: createValidator(), // or `extend: [createValidator()],`
  validateStruct,
  warnStruct,
  // ...
});
```

#### Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `useForm` generic.

```typescript
import type { ValidatorConfig } from '@felte/validator-superstruct';
import type { Infer } from 'superstruct';

const struct = object({
  email: size(string(), 1, Infinity),
  password: size(string(), 1, Infinity),
});

const { form } = useForm<Infer<typeof struct>, ValidatorConfig>(/* ... */);
```

### Using Vest

[Vest](https://github.com/ealush/vest) is a validations library for JS apps that derives its syntax from modern JS unit testing frameworks such as Mocha or Jest. We've also created [`@felte/validator-vest`](https://github.com/pablo-abc/felte/tree/main/packages/validator-vest) as an official package to handle validation with Vest. To use it you'll need both `@felte/validator-vest` and `vest` installed.

```sh
npm install --save @felte/validator-vest vest

# Or, if you use yarn

yarn add @felte/validator-vest vest
```

Its usage would look something like:

```javascript
import { validator } from '@felte/validator-vest';
import { create, enforce, test } from 'vest';

const suite = create('form', (data) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotEmpty();
  });
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
});

const { form } = useForm({
  // ...
  extend: validator, // OR `extend: [validator],`
  validateSuite: suite,
  // ...
});
```

#### Warnings

This validator will update the `warnings` store with the messages returned from any test marked with `warn()`:

```javascript
import { validateSuite } from '@felte/validator-vest';
import { create, enforce, test, warn } from 'vest';

const suite = create('form', (data) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotEmpty();
  });
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });

  test('password', 'Password not secure', () => {
    warn();
    // We only warn if the user has already started typing a value
    if (!data.password) return;
    enforce(data.password).longerThanOrEquals(8);
  });
});

const { form } = useForm({
  // ...
  validate: validateSuite(suite),
  // ...
});
```

#### Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `useForm` generic.

```typescript
import { validator, ValidatorConfig } from '@felte/validator-vest';
import { create, enforce, test } from 'vest';

const initialValues = {
  email: '',
  password: '',
};

const suite = create('form', (data: typeof initialValues) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotEmpty();
  });
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
});

const { form } = useForm<typeof initialValues, ValidatorConfig>({
  // ...
  initialValues,
  extend: validator, // or `extend: [validator],`
  validateSuite: suite,
  // ...
});
```
