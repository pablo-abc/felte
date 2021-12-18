import '@testing-library/jest-dom/extend-expect';
import { createForm } from 'felte';
import { waitFor } from '@testing-library/dom';
import type { ValidationFunction } from '@felte/common';
import { validateSchema, validator } from '../src';
import type { ValidatorConfig } from '../src';
import * as yup from 'yup';
import { get } from 'svelte/store';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

describe('Validator yup', () => {
  test('correctly validates', async () => {
    const schema = yup.object({
      email: yup.string().email().required(),
      password: yup.string().required(),
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
      email: 'email is a required field',
      password: 'password is a required field',
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
    const schema = yup.object({
      account: yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
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
        email: 'account.email is a required field',
        password: 'account.password is a required field',
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
    const schema = yup.object({
      email: yup.string().email().required(),
      password: yup.string().required(),
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
      email: 'email is a required field',
      password: 'password is a required field',
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
    const schema = yup.object({
      account: yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
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
        email: 'account.email is a required field',
        password: 'account.password is a required field',
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
    const schema = yup.object({
      account: yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
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
        email: ['not an email', 'account.email is a required field'],
        password: 'account.password is a required field',
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

  test('casts values', async () => {
    const schema = yup.object({
      shouldBeNumber: yup
        .mixed()
        .test('number', 'not a number', (value) => !isNaN(value))
        .transform((value) => parseInt(value, 10)),
    });
    const { data, errors, validate } = createForm<any, ValidatorConfig>({
      validateSchema: schema,
      extend: validator,
      onSubmit: jest.fn(),
      castValues: true,
    });

    data.set({
      shouldBeNumber: '',
    });

    await validate();

    expect(get(data)).toEqual({
      shouldBeNumber: NaN,
    });

    expect(get(errors)).toEqual({
      shouldBeNumber: 'not a number',
    });

    data.set({
      shouldBeNumber: '42',
    });

    expect(get(data)).toEqual({
      shouldBeNumber: 42,
    });

    await waitFor(() => {
      expect(get(errors)).toEqual({
        shouldBeNumber: null,
      });
    });
  });
});
