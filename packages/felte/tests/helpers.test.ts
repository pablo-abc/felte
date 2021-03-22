import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createForm } from '../src';
import { createInputElement, createDOM } from './common';
import { get } from 'svelte/store';

describe('Helpers', () => {
  test('setField should update and touch field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, touched, setField } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);
    setField('account.email', 'jacek@soplica.com');
    expect(get(data)).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(touched)).toEqual({
      account: {
        email: true,
      },
    });
  });

  test('setField should update without touching field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, touched, setField } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);
    setField('account.email', 'jacek@soplica.com', false);
    expect(get(data)).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(touched)).toEqual({
      account: {
        email: false,
      },
    });
  });

  test('setTouched should touch field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { touched, setTouched } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(touched).account.email).toBe(false);
    setTouched('account.email');
    expect(get(touched)).toEqual({
      account: {
        email: true,
      },
    });
  });

  test('setError should set a field error when touched', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { errors, touched, setError, setTouched } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(errors)?.account?.email).toBeFalsy();
    setError('account.email', 'Not an email');
    expect(get(errors)).toEqual({
      account: {
        email: null,
      },
    });
    setTouched('account.email');
    expect(get(touched).account.email).toBe(true);
    expect(get(errors)).toEqual({
      account: {
        email: 'Not an email',
      },
    });
  });

  test('validate should force validation', async () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const mockErrors = { account: { email: 'Not email' } };
    const mockValidate = jest.fn(() => mockErrors);
    const { errors, touched, validate } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      validate: mockValidate,
      onSubmit: jest.fn(),
    });

    expect(mockValidate).not.toHaveBeenCalled();
    validate();
    expect(mockValidate).toHaveBeenCalled();
    await waitFor(() => {
      expect(get(errors)).toEqual(mockErrors);
      expect(get(touched)).toEqual({
        account: {
          email: true,
        },
      });
    });

    mockValidate.mockImplementation(() => ({} as any));
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(4);
    await waitFor(() => {
      expect(get(errors)).toEqual({ account: { email: null } });
      expect(get(touched)).toEqual({
        account: {
          email: true,
        },
      });
    });
  });

  test('setting directly to data should touch value', () => {
    type Data = {
      account: {
        email: string;
        password: string;
      };
    };
    const { data, touched } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
          password: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(data).account.password).toBe('');

    data.set({
      account: { email: 'jacek@soplica.com', password: '' },
    });

    expect(get(data).account.email).toBe('jacek@soplica.com');
    expect(get(data).account.password).toBe('');

    expect(get(touched)).toEqual({
      account: {
        email: true,
        password: false,
      },
    });
  });

  test('reset should reset form to default values', () => {
    createDOM();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const accountFieldset = document.createElement('fieldset');
    accountFieldset.name = 'account';
    const emailInput = createInputElement({
      name: 'email',
      type: 'text',
      value: '',
    });
    accountFieldset.appendChild(emailInput);
    formElement.appendChild(accountFieldset);
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, touched, reset, form } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');

    data.set({
      account: { email: 'jacek@soplica.com' },
    });

    expect(get(data).account.email).toBe('jacek@soplica.com');

    reset();

    expect(get(data)).toEqual({
      account: {
        email: '',
      },
    });

    expect(get(touched)).toEqual({
      account: {
        email: false,
      },
    });

    form(formElement);

    expect(get(data)).toEqual({
      account: {
        email: '',
      },
    });

    userEvent.type(emailInput, 'jacek@soplica.com');
    expect(get(data).account.email).toBe('jacek@soplica.com');

    reset();

    expect(get(data)).toEqual({
      account: {
        email: '',
      },
    });

    expect(get(touched)).toEqual({
      account: {
        email: false,
      },
    });
  });
});
