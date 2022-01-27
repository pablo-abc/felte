import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createForm } from '../src';
import { createInputElement, createDOM, cleanupDOM } from './common';
import { get } from 'svelte/store';

jest.mock('svelte', () => ({ onDestroy: jest.fn }));

describe('Helpers', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('setField should update and touch field', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    const inputElement = createInputElement({
      name: 'account.email',
      value: '',
      type: 'text',
    });
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    type Data = {
      account: {
        email: string;
      };
    };
    const { form, data, touched, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);
    setFields('account.email', 'jacek@soplica.com', true);
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

    form(formElement);

    expect(get(data).account.email).toBe('');
    expect(inputElement.value).toBe('');

    setFields('account.email', 'jacek@soplica.com', true);
    expect(get(data)).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(inputElement.value).toBe('jacek@soplica.com');
  });

  test('setField should update without touching field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, touched, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);
    setFields('account.email', 'jacek@soplica.com', false);
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

  test('setFields should set all fields', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    const inputElement = createInputElement({
      name: 'account.email',
      value: '',
      type: 'text',
    });
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    type Data = {
      account: {
        email: string;
      };
    };
    const { form, data, touched, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);
    setFields({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(data)).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });

    form(formElement);

    expect(get(data).account.email).toBe('');
    expect(inputElement.value).toBe('');

    setFields({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(data)).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(inputElement.value).toBe('jacek@soplica.com');
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
    setTouched('account.email', true);
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
    const { errors, touched, setErrors, setTouched } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(errors)?.account?.email).toBeFalsy();
    setErrors('account.email', 'Not an email');
    expect(get(errors)).toEqual({
      account: {
        email: null,
      },
    });
    setTouched('account.email', true);
    expect(get(touched).account.email).toBe(true);
    expect(get(errors)).toEqual({
      account: {
        email: ['Not an email'],
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

    expect(mockValidate).toHaveBeenCalledTimes(1);
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(get(errors)).toEqual({
        account: {
          email: ['Not email'],
        },
      });
      expect(get(touched)).toEqual({
        account: {
          email: true,
        },
      });
    });

    mockValidate.mockImplementation(() => ({} as any));
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(3);
    await waitFor(() => {
      expect(get(errors)).toEqual({ account: { email: null } });
      expect(get(touched)).toEqual({
        account: {
          email: true,
        },
      });
    });
  });

  test('reset should reset form to default values', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const accountFieldset = document.createElement('fieldset');
    const emailInput = createInputElement({
      name: 'account.email',
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
    const { data, touched, reset, form, setFields, isDirty } = createForm<Data>(
      {
        initialValues: {
          account: {
            email: '',
          },
        },
        onSubmit: jest.fn(),
      }
    );

    expect(get(data).account.email).toBe('');

    setFields('account.email', 'jacek@soplica.com', true);

    expect(get(data).account.email).toBe('jacek@soplica.com');

    expect(get(touched).account.email).toBe(true);

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

    expect(get(isDirty)).toBe(false);

    form(formElement);

    expect(get(data)).toEqual({
      account: {
        email: '',
      },
    });

    expect(get(isDirty)).toBe(false);

    userEvent.click(emailInput);
    userEvent.click(formElement);

    expect(get(isDirty)).toBe(false);

    userEvent.type(emailInput, 'jacek@soplica.com');
    expect(get(data).account.email).toBe('jacek@soplica.com');

    expect(get(isDirty)).toBe(true);

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

    expect(get(isDirty)).toBe(false);
  });

  test('setInitialValues sets new initial values', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const {
      data,
      setInitialValues,
      touched,
      reset,
      setFields,
    } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);

    setInitialValues({ account: { email: 'zaphod@beeblebrox.com' } });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);

    setFields('account.email', 'jacek@soplica.com', true);

    expect(get(data).account.email).toBe('jacek@soplica.com');
    expect(get(touched).account.email).toBe(true);

    reset();

    expect(get(data).account.email).toBe('zaphod@beeblebrox.com');
    expect(get(touched).account.email).toBe(false);
  });
});
