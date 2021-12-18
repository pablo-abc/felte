import { waitFor, screen } from '@testing-library/dom';
import { createRoot } from 'solid-js';
import userEvent from '@testing-library/user-event';
import { createForm } from '../src';
import { createInputElement, createDOM, cleanupDOM } from './common';

describe('Helpers', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('setField should update and touch field', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'account';
    const inputElement = createInputElement({
      name: 'email',
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
    const { form, data, touched, setField } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(data.account.email).toBe('');
    expect(touched.account.email).toBe(false);
    setField('account.email', 'jacek@soplica.com');
    await waitFor(() => {
      expect(data).toEqual({
        account: {
          email: 'jacek@soplica.com',
        },
      });
      expect(touched).toEqual({
        account: {
          email: true,
        },
      });
    });

    form(formElement);

    await waitFor(() => {
      expect(data.account.email).toBe('');
      expect(inputElement.value).toBe('');
    });

    setField('account.email', 'jacek@soplica.com');
    await waitFor(() => {
      expect(data).toEqual({
        account: {
          email: 'jacek@soplica.com',
        },
      });
      expect(inputElement.value).toBe('jacek@soplica.com');
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

    expect(data.account.email).toBe('');
    expect(touched.account.email).toBe(false);
    setField('account.email', 'jacek@soplica.com', false);
    expect(data).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(touched).toEqual({
      account: {
        email: false,
      },
    });
  });

  test('setFields should set all fields', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'account';
    const inputElement = createInputElement({
      name: 'email',
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

    expect(data.account.email).toBe('');
    expect(touched.account.email).toBe(false);
    setFields({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(data).toEqual({
      account: {
        email: 'jacek@soplica.com',
      },
    });

    form(formElement);

    expect(data.account.email).toBe('');
    expect(inputElement.value).toBe('');

    setFields({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(data).toEqual({
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

    expect(touched.account.email).toBe(false);
    setTouched('account.email');
    expect(touched).toEqual({
      account: {
        email: true,
      },
    });
  });

  test('setError should set a field error when touched', async () => {
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

    expect(errors?.account?.email).toBeFalsy();
    setError('account.email', 'Not an email');
    expect(errors).toEqual({
      account: {
        email: null,
      },
    });
    setTouched('account.email');
    await waitFor(() => {
      expect(touched.account.email).toBe(true);
      expect(errors).toEqual({
        account: {
          email: 'Not an email',
        },
      });
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

    expect(mockValidate).toHaveBeenCalledTimes(2);
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(3);
    await waitFor(() => {
      expect(errors).toEqual(mockErrors);
      expect(touched).toEqual({
        account: {
          email: true,
        },
      });
    });

    mockValidate.mockImplementation(() => ({} as any));
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(4);
    await waitFor(() => {
      expect(errors).toEqual({ account: { email: null } });
      expect(touched).toEqual({
        account: {
          email: true,
        },
      });
    });
  });

  test('reset should reset form to default values', () => {
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
    const { data, touched, reset, form, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(data.account.email).toBe('');

    setFields({
      account: { email: 'jacek@soplica.com' },
    });

    expect(data.account.email).toBe('jacek@soplica.com');

    reset();

    expect(data).toEqual({
      account: {
        email: '',
      },
    });

    expect(touched).toEqual({
      account: {
        email: false,
      },
    });

    form(formElement);

    expect(data).toEqual({
      account: {
        email: '',
      },
    });

    userEvent.type(emailInput, 'jacek@soplica.com');
    expect(data.account.email).toBe('jacek@soplica.com');

    reset();

    expect(data).toEqual({
      account: {
        email: '',
      },
    });

    expect(touched).toEqual({
      account: {
        email: false,
      },
    });
  });

  test('getField should get the value of a field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, getField } = createForm<Data>({
      initialValues: {
        account: {
          email: 'jacek@soplica.com',
        },
      },
      onSubmit: jest.fn(),
    });
    expect(data.account.email).toBe(getField('account.email'));
  });

  test('setInitialValues sets new initial values', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, setInitialValues, reset, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(data.account.email).toBe('');

    setInitialValues({ account: { email: 'zaphod@beeblebrox.com' } });

    expect(data.account.email).toBe('');
    setFields({ account: { email: 'jacek@soplica.com' } });

    expect(data.account.email).toBe('jacek@soplica.com');

    reset();

    expect(data.account.email).toBe('zaphod@beeblebrox.com');
  });
});
