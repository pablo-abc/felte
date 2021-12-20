# @felte/validator-vest

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/validator-vest)](https://bundlephobia.com/result?p=@felte/validator-vest)
[![NPM Version](https://img.shields.io/npm/v/@felte/validator-vest)](https://www.npmjs.com/package/@felte/validator-vest)

A package to help you handle validation with Vest in Felte.

## Installation

```sh
npm install --save @felte/validator-vest vest@next

# Or, if you use yarn

yarn add @felte/validator-vest vest@next
```

## Usage

Extend Felte with the `validator` extender and add your schema to the `validateSuite` property of `createForm`'s config.

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

const { form } = createForm({
  // ...
  extend: validator, // or `extend: [validator],`
  validateSuite: suite,
  // ...
});
```

OR use the `validateSuite` function directly in the `validate` option of `createForm`. (No need to extend Felte).

```javascript
import { validateSuite } from '@felte/validator-vest';
import { create, enforce, test } from 'vest';

const suite = create('form', (data) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotEmpty();
  });
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
});

const { form } = createForm({
  // ...
  validate: validateSuite(suite),
  // ...
});
```

## Warnings

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

const { form } = createForm({
  // ...
  validate: validateSuite(suite),
  // ...
});
```

## Typescript

For typechecking add the exported type `ValidatorConfig` as a second argument to `createForm` generic.

```typescript
import { validator, ValidatorConfig } from '@felte/validator-vest';
import { create, enforce, test } from 'vest';

const initialValues = {
  email: '',
  password: ''
}

const suite = create('form', (data: typeof initialValues) => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotEmpty();
  });
  test('password', 'Password is required', () => {
    enforce(data.password).isNotEmpty();
  });
});

const { form } = createForm<typeof initialValues, ValidatorConfig>({
  // ...
  initialValues,
  extend: validator, // or `extend: [validator],`
  validateSuite: suite,
  // ...
});
```
