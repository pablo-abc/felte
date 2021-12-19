import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createForm as coreCreateForm } from '../src';
import { createInputElement, createDOM, cleanupDOM } from './common';
import { writable } from 'svelte/store';
import { get } from '../src/get';
import type { FormConfig, Form, Obj } from '@felte/common';

function createForm<Data extends Obj>(config: FormConfig<Data>): Form<Data> {
  const { cleanup, ...rest } = coreCreateForm(config, {
    storeFactory: writable,
  });
  return rest;
}

describe('Helpers', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('setField should update and touch field', () => {
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

    form(formElement);

    expect(get(data).account.email).toBe('');
    expect(inputElement.value).toBe('');

    setField('account.email', 'jacek@soplica.com');
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

  test('setWarning should set a field warning', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { warnings, setWarning } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(warnings)?.account?.email).toBeFalsy();
    setWarning('account.email', 'Not an email');
    expect(get(warnings)).toEqual({
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

    expect(mockValidate).toHaveBeenCalledTimes(1);
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(2);
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
    const { data, touched, reset, form, isDirty } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(data).account.email).toBe('');

    expect(get(isDirty)).toBe(false);

    data.set({
      account: { email: 'jacek@soplica.com' },
    });

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
    expect(get(data).account.email).toBe(getField('account.email'));
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
      isDirty,
      reset,
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
    expect(get(isDirty)).toBe(false);

    setInitialValues({ account: { email: 'zaphod@beeblebrox.com' } });

    expect(get(data).account.email).toBe('');
    expect(get(touched).account.email).toBe(false);
    expect(get(isDirty)).toBe(false);

    data.set({ account: { email: 'jacek@soplica.com' } });

    expect(get(data).account.email).toBe('jacek@soplica.com');
    expect(get(touched).account.email).toBe(true);
    expect(get(isDirty)).toBe(true);

    reset();

    expect(get(data).account.email).toBe('zaphod@beeblebrox.com');
    expect(get(touched).account.email).toBe(false);
    expect(get(isDirty)).toBe(false);
  });

  test('get gets current value of store', () => {
    const store = writable(true);

    expect(get(store)).toBe(true);

    const originalSubscribe = store.subscribe;
    const rxStore = {
      subscribe(subscriber: any) {
        const unsubscribe = originalSubscribe(subscriber);
        return { unsubscribe };
      },
    };
    expect(get(rxStore)).toBe(true);
  });
});
