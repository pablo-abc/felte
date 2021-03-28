import '@testing-library/jest-dom/extend-expect';
import { createForm } from 'felte';
import { validateStruct, createValidator } from '../src';
import type { ValidatorConfig } from '../src';
import { object, string, size } from 'superstruct';
import { get } from 'svelte/store';
import type { ValidationFunction } from '@felte/common';

describe('Validator superstruct', () => {
  test('correctly validates', async () => {
    const struct = object({
      email: size(string(), 1, Infinity),
      password: size(string(), 1, Infinity),
    });
    const mockData = {
      email: '',
      password: '',
    };
    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: jest.fn(),
      validate: validateStruct(struct),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      password:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    });

    data.set({
      email: 'test@email.com',
      password: 'test',
    });

    await validate();

    expect(get(errors)).toEqual({
      email: null,
      password: null,
    });
  });

  test('correctly validates deep form', async () => {
    const struct = object({
      account: object({
        email: size(string(), 1, Infinity),
        password: size(string(), 1, Infinity),
      }),
    });
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: jest.fn(),
      validate: validateStruct(struct),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email:
          'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
        password:
          'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      },
    });

    data.set({
      account: {
        email: 'test@email.com',
        password: 'test',
      },
    });

    await validate();

    expect(get(errors)).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
  });

  test('correctly validates with extend', async () => {
    const struct = object({
      email: size(string(), 1, Infinity),
      password: size(string(), 1, Infinity),
    });
    const mockData = {
      email: '',
      password: '',
    };
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: createValidator(),
      validateStruct: struct,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      password:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    });

    data.set({
      email: 'test@email.com',
      password: 'test',
    });

    await validate();

    expect(get(errors)).toEqual({
      email: null,
      password: null,
    });
  });

  test('correctly validates deep form with extend', async () => {
    const struct = object({
      account: object({
        email: size(string(), 1, Infinity),
        password: size(string(), 1, Infinity),
      }),
    });
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: createValidator(),
      validateStruct: struct,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email:
          'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
        password:
          'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      },
    });

    data.set({
      account: {
        email: 'test@email.com',
        password: 'test',
      },
    });

    await validate();

    expect(get(errors)).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
  });

  test('correctly validates deep form with extend and transform', async () => {
    const struct = object({
      account: object({
        email: size(string(), 1, Infinity),
        password: size(string(), 1, Infinity),
      }),
    });
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: createValidator((value) =>
        value.type === 'string' ? 'Must not be empty' : 'Not valid'
      ),
      validateStruct: struct,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email: 'Must not be empty',
        password: 'Must not be empty',
      },
    });

    data.set({
      account: {
        email: 'test@email.com',
        password: 'test',
      },
    });

    await validate();

    expect(get(errors)).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
  });

  test('correctly validates deep form with extend', async () => {
    const struct = object({
      account: object({
        email: size(string(), 1, Infinity),
        password: size(string(), 1, Infinity),
      }),
    });
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: createValidator(),
      validateStruct: struct,
      validate: jest.fn(() => ({
        account: {
          email: 'not an email',
        },
      })) as ValidationFunction<any>,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email: [
          'not an email',
          'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
        ],
        password:
          'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      },
    });

    data.set({
      account: {
        email: 'test@email.com',
        password: 'test',
      },
    });

    await validate();

    expect(get(errors)).toEqual({
      account: {
        email: 'not an email',
        password: null,
      },
    });
  });
});
