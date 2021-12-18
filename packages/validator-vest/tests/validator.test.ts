import '@testing-library/jest-dom/extend-expect';
import { createForm } from 'felte';
import { validateSuite, validator } from '../src';
import type { ValidatorConfig } from '../src';
import { get } from 'svelte/store';
import type { ValidationFunction } from '@felte/common';
import { create, enforce, test as assert } from 'vest';

jest.mock('svelte', () => ({ onDestroy: jest.fn() }));

describe('Validator vest', () => {
  test('correctly validates', async () => {
    const mockData = {
      email: '',
      password: '',
    };
    const suite = create('form', (data: typeof mockData) => {
      assert('email', 'Email is required', () => {
        enforce(data.email).isNotEmpty();
      });
      assert('password', 'Password is required', () => {
        enforce(data.password).isNotEmpty();
      });
    });
    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: jest.fn(),
      validate: validateSuite(suite),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email: ['Email is required'],
      password: ['Password is required'],
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
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const suite = create('form', (data: typeof mockData) => {
      assert('account.email', 'Email is required', () => {
        enforce(data.account.email).isNotEmpty();
      });
      assert('account.password', 'Password is required', () => {
        enforce(data.account.password).isNotEmpty();
      });
    });

    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: jest.fn(),
      validate: validateSuite(suite),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email: ['Email is required'],
        password: ['Password is required'],
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
    const mockData = {
      email: '',
      password: '',
    };
    const suite = create('form', (data: typeof mockData) => {
      assert('email', 'Email is required', () => {
        enforce(data.email).isNotEmpty();
      });
      assert('password', 'Password is required', () => {
        enforce(data.password).isNotEmpty();
      });
    });
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: validator,
      validateSuite: suite,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email: ['Email is required'],
      password: ['Password is required'],
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
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const suite = create('form', (data: typeof mockData) => {
      assert('account.email', 'Email is required', () => {
        enforce(data.account.email).isNotEmpty();
      });
      assert('account.password', 'Password is required', () => {
        enforce(data.account.password).isNotEmpty();
      });
    });
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: validator,
      validateSuite: suite,
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      account: {
        email: ['Email is required'],
        password: ['Password is required'],
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
    const mockData = {
      account: {
        email: '',
        password: '',
      },
    };
    const suite = create('form', (data: typeof mockData) => {
      assert('account.email', 'Email is required', () => {
        enforce(data.account.email).isNotEmpty();
      });
      assert('account.password', 'Password is required', () => {
        enforce(data.account.password).isNotEmpty();
      });
    });
    const { validate, errors, data } = createForm<
      typeof mockData,
      ValidatorConfig
    >({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: validator,
      validateSuite: suite,
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
        email: ['not an email', 'Email is required'],
        password: ['Password is required'],
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
