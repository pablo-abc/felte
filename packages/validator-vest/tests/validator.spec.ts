import '@testing-library/jest-dom/vitest';
import { expect, describe, test, vi } from 'vitest';
import type { ValidationFunction } from '@felte/common';
import { createForm } from './common';
import { validateSuite, validator } from '../src';
import { get } from 'svelte/store';
import { create, enforce, test as assert, warn } from 'vest';

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
      onSubmit: vi.fn(),
      validate: validateSuite(suite),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      email: ['Email is required'],
      password: ['Password is required'],
    });

    data.set({
      email: 'test@email.com',
      password: 'test',
    });

    await validate();

    expect(get(errors)).to.deep.equal({
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
      onSubmit: vi.fn(),
      validate: validateSuite(suite),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
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

    expect(get(errors)).to.deep.equal({
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

      assert('password', 'Password is not secure', () => {
        warn();
        if (!data.password) return;
        enforce(data.password).longerThanOrEquals(8);
      });
    });
    const { validate, errors, warnings, data } = createForm<typeof mockData>({
      initialValues: mockData,
      onSubmit: vi.fn(),
      extend: validator({ suite }),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      email: ['Email is required'],
      password: ['Password is required'],
    });
    expect(get(warnings)).to.deep.equal({
      email: null,
      password: null,
    });

    data.set({
      email: 'test@email.com',
      password: 'test',
    });

    await validate();

    expect(get(errors)).to.deep.equal({
      email: null,
      password: null,
    });
    expect(get(warnings)).to.deep.equal({
      email: null,
      password: ['Password is not secure'],
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
    const { validate, errors, data } = createForm<typeof mockData>({
      initialValues: mockData,
      onSubmit: vi.fn(),
      extend: validator({ suite }),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
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

    expect(get(errors)).to.deep.equal({
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
    const { validate, errors, data } = createForm<typeof mockData>({
      initialValues: mockData,
      onSubmit: vi.fn(),
      extend: validator({ suite }),
      validate: vi.fn(() => ({
        account: {
          email: ['not an email'],
        },
      })) as ValidationFunction<any>,
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
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

    expect(get(errors)).to.deep.equal({
      account: {
        email: ['not an email'],
        password: null,
      },
    });
  });

  test('does not call addValidator when stage is not `SETUP`', () => {
    const suite = create('empty', () => undefined);
    const addValidator = vi.fn();
    const validate = validator({ suite });
    validate({ stage: 'SETUP', addValidator } as any);
    expect(addValidator).toHaveBeenCalled();

    addValidator.mockClear();
    validate({ stage: 'MOUNT', addValidator } as any);
    expect(addValidator).not.toHaveBeenCalled();
  });

  test('handles asynchronous tests', async () => {
    const mockData = {
      email: '',
      password: '',
    };
    const suite = create('form', (data: typeof mockData) => {
      assert('email', 'Email is required', async () => {
        enforce(data.email).isNotEmpty();
      });
      assert('password', 'Password is required', async () => {
        enforce(data.password).isNotEmpty();
      });
    });
    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: vi.fn(),
      validate: validateSuite(suite),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      email: ['Email is required'],
      password: ['Password is required'],
    });

    data.set({
      email: 'test@email.com',
      password: 'test',
    });

    await validate();

    expect(get(errors)).to.deep.equal({
      email: null,
      password: null,
    });
  });
});
