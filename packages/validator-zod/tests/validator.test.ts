import '@testing-library/jest-dom/extend-expect';
import { createForm } from 'felte';
import type { ValidationFunction } from '@felte/common';
import { validateSchema, validator } from '../src';
import type { ValidatorConfig } from '../src';
import * as zod from 'zod';
import { get } from 'svelte/store';

describe('Validator zod', () => {
  test('correctly validates', async () => {
    const schema = zod.object({
      email: zod.string().email().nonempty(),
      password: zod.string().nonempty(),
    });
    const mockData = {
      email: '',
      password: '',
    };
    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: jest.fn(),
      validate: validateSchema(schema),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email: ['Invalid email', 'Should be at least 1 characters'],
      password: ['Should be at least 1 characters'],
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
    const schema = zod.object({
      account: zod.object({
        email: zod.string().email().nonempty(),
        password: zod.string().nonempty(),
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
      validate: validateSchema(schema),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email: ['Invalid email', 'Should be at least 1 characters'],
        password: ['Should be at least 1 characters'],
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
    const schema = zod.object({
      email: zod.string().email().nonempty(),
      password: zod.string().nonempty(),
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
      extend: validator,
      validateSchema: schema,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email: ['Invalid email', 'Should be at least 1 characters'],
      password: ['Should be at least 1 characters'],
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
    const schema = zod.object({
      account: zod.object({
        email: zod.string().email().nonempty(),
        password: zod.string().nonempty(),
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
      extend: validator,
      validateSchema: schema,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email: ['Invalid email', 'Should be at least 1 characters'],
        password: ['Should be at least 1 characters'],
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

  test('correctly validates deep form with other validate', async () => {
    const schema = zod.object({
      account: zod.object({
        email: zod.string().email().nonempty(),
        password: zod.string().nonempty(),
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
      extend: validator,
      validateSchema: schema,
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
          'Invalid email',
          'Should be at least 1 characters',
        ],
        password: ['Should be at least 1 characters'],
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
