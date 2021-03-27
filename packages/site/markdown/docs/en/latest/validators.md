---
section: Validators
subsections:
  - Using Yup
  - Using Zod
  - Using Superstruct
---

## Validators

If you use third party libraries for validation you might have found yourself needing to transform the output from said validation library to the form library you're using (unless the form library supports it natively or provides its own built-in alternative). In order to not reinvent the wheel, and to make life easier for you, we provide some official `validators` which are, basically, adapters for popular validation libraries.

If a validation library you use is not supported, feel free to [open an issue](https://github.com/pablo-abc/felte/issues), we would like to support the most used ones! You may also [build your own validation package](docs#extending-felte).

### Using Yup

[Yup](https://github.com/jquense/yup) is a really popular validation library. For this reason we've created [`@felte/validator-yup`](https://github.com/pablo-abc/felte/tree/main/packages/validator-yup). An official package to handle validation with Yup. To use it you'll need both `@felte/validator-yup` and `yup`.

```sh
npm install --save @felte/validator-yup yup

# Or, if you use yarn

yarn add @felte/validator-yup yup
```

It's usage would look something like:

```javascript
import { validator } from '@felte/validator-yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm({
  // ...
  extend: validator, // OR `extend: [validator],`
  validateSchema: schema,
  // ...
});
```

### Using Zod

[Zod](https://github.com/colinhacks/zod) is a "TypeScript-first schema declaration and validation library", alternative to Yup with a similar API. We've also created [`@felte/validator-zod`](https://github.com/pablo-abc/felte/tree/main/packages/validator-zod) as an official package to handle validation with Zod. To use it you'll need both `@felte/validator-zod` and `zod` installed.

```sh
npm install --save @felte/validator-zod zod

# Or, if you use yarn

yarn add @felte/validator-zod zod
```

It's usage would look something like:

```javascript
import { validator } from '@felte/validator-zod';
import * as zod from 'zod';

const schema = zod.object({
  email: zod.string().email().nonempty(),
  password: zod.string().nonempty(),
});

const { form } = createForm({
  // ...
  extend: validator, // OR `extend: [validator],`
  validateSchema: schema,
  // ...
});
```

### Using Superstruct

[Superstruct](https://docs.superstructjs.org) is another popular validation library that follows a more _functional_ style. We've created [`@felte/validator-superstruct`](https://github.com/pablo-abc/felte/tree/main/packages/validator-superstruct) as an official package to handle validation with Superstruct. To use it you'll need both `@felte/validator-superstruct` and `superstruct` installed.

```sh
npm install --save @felte/validator-superstruct superstruct

# Or, if you use yarn

yarn add @felte/validator-superstruct superstruct
```

It's usage would look something like:

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

The first argument of `createValidator` is a function that will receive each [`failure`](https://docs.superstructjs.org/api-reference/errors) from Superstruct, you can check the failure there and return an appropriate custom error message.

```javascript
import { createValidator } from '@felte/validator-superstruct';

const validator = createValidator((value) =>
  value.type === 'string' ? 'Must not be empty' : 'Not valid'
);
```
