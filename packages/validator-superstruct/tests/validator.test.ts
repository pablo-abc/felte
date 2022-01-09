import '@testing-library/jest-dom/extend-expect';
import { createForm } from 'felte';
import { validateStruct, createValidator } from '../src';
import type { ValidatorConfig } from '../src';
import { object, string, size, coerce, date, any, refine } from 'superstruct';
import { get } from 'svelte/store';
import type { ValidationFunction } from '@felte/common';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

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
    const secure = refine(string(), 'secure', (value) =>
      value ? value.length > 8 : true
    );
    const warnStruct = object({
      email: any(),
      password: secure,
    });
    const mockData = {
      email: '',
      password: '',
    };
    const { validate, errors, warnings, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: createValidator((failure) => {
        if (failure.refinement === 'secure') return 'Not secure';
        return failure.message;
      }),
      validateStruct: struct,
      warnStruct,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      password:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    });
    expect(get(warnings)).toEqual({
      email: null,
      password: null,
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
    expect(get(warnings)).toEqual({
      email: null,
      password: 'Not secure',
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

  test('correctly validates form with coercion', async () => {
    const struct = object({
      name: size(string(), 1, Infinity),
      date: coerce(date(), string(), (value) => new Date(value)),
    });

    const { validate, errors, data } = createForm<any, ValidatorConfig>({
      onSubmit: jest.fn(),
      extend: createValidator(),
      validateStruct: struct,
      castValues: true,
    });

    data.set({
      name: '',
      date: 'Not A Date',
    });

    expect(get(data).name).toEqual('');
    expect(get(data).date).toBeInstanceOf(Date);
    expect(get(data).date.getTime()).toBeNaN();

    await validate();

    expect(get(errors)).toEqual({
      name:
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      date: 'Expected a valid `Date` object, but received: Invalid Date',
    });

    data.set({
      name: 'test@email.com',
      date: '2021-06-09',
    });

    expect(get(data)).toEqual({
      name: 'test@email.com',
      date: new Date('2021-06-09'),
    });

    await validate();

    expect(get(errors)).toEqual({
      name: null,
      date: null,
    });
  });
});
