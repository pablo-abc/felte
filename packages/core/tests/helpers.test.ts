import '@testing-library/jest-dom';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
  createInputElement,
  createMultipleInputElements,
  createDOM,
  cleanupDOM,
  createForm,
} from './common';
import { writable } from 'svelte/store';
import { get } from '../src/get';

describe('Helpers', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('setFields should update and touch field', () => {
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

  test('setWarning should set a field warning', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { warnings, setWarnings } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    expect(get(warnings)?.account?.email).toBeFalsy();
    setWarnings('account.email', 'Not an email');
    expect(get(warnings)).toEqual({
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
      expect(get(errors)).toEqual({ account: { email: ['Not email'] } });
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

  test('unsetField removes a field from all stores', async () => {
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
    const {
      form,
      data,
      touched,
      errors,
      warnings,
      unsetField,
    } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: jest.fn(),
    });

    form(formElement);

    userEvent.type(inputElement, 'zaphod@beeblebrox.com');

    await waitFor(() => {
      expect(get(data).account.email).toBe('zaphod@beeblebrox.com');
    });

    unsetField('account.email');

    await waitFor(() => {
      expect(get(data)).toEqual({ account: {} });
      expect(get(touched)).toEqual({ account: {} });
      expect(get(errors)).toEqual({ account: {} });
      expect(get(warnings)).toEqual({ account: {} });
      expect(inputElement).toHaveValue('');
    });
  });

  test('resetField resets a field to its initial value', async () => {
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
    const { form, data, touched, errors, resetField } = createForm<Data>({
      initialValues: {
        account: {
          email: 'zaphod@beeblebrox.com',
        },
      },
      onSubmit: jest.fn(),
    });

    form(formElement);

    userEvent.clear(inputElement);
    userEvent.type(inputElement, 'jacek@soplica.com');
    userEvent.click(formElement);

    errors.set({ account: { email: 'Error' } });

    await waitFor(() => {
      expect(get(data).account.email).toBe('jacek@soplica.com');
      expect(get(touched).account.email).toBe(true);
      expect(get(errors).account?.email).toEqual(['Error']);
    });

    resetField('account.email');

    await waitFor(() => {
      expect(get(data).account.email).toBe('zaphod@beeblebrox.com');
      expect(get(touched).account.email).toBe(false);
      expect(get(errors).account?.email).toBe(null);
      expect(inputElement).toHaveValue('zaphod@beeblebrox.com');
    });
  });

  test('addField and unsetField add and remove fields accordingly', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const multipleInputs = createMultipleInputElements(
      {
        name: 'todos',
      },
      3
    );
    formElement.append(...multipleInputs);
    type Data = {
      todos: {
        value: string;
      }[];
    };
    const {
      form,
      data,
      touched,
      errors,
      addField,
      unsetField,
    } = createForm<Data>({
      initialValues: {
        todos: new Array(3).fill({ value: '' }),
      },
      onSubmit: jest.fn(),
    });

    form(formElement);

    userEvent.type(multipleInputs[0], 'First todo');
    userEvent.type(multipleInputs[1], 'Third todo');
    userEvent.type(multipleInputs[2], 'Fourth todo');

    errors.set({
      todos: [
        {
          value: '',
        },
        {
          value: 'Invalid',
        },
        {
          value: '',
        },
      ],
    });

    await waitFor(() => {
      expect(get(data).todos[1].value).toBe('Third todo');
      expect(get(touched).todos[1].value).toBe(true);
      expect(get(errors).todos?.[1].value).toEqual(['Invalid']);
    });

    addField('todos', { value: 'Second todo' }, 1);

    await waitFor(() => {
      expect(get(data).todos[1].value).toBe('Second todo');
      expect(get(touched).todos[1].value).toBe(false);
      expect(get(errors).todos?.[1].value).toBe(null);
      expect(multipleInputs[1]).toHaveValue('Second todo');
      expect(get(data).todos[2].value).toBe('Third todo');
      expect(get(touched).todos[2].value).toBe(true);
      expect(get(errors).todos?.[2].value).toEqual(['Invalid']);
      expect(multipleInputs[2]).toHaveValue('Third todo');
    });

    unsetField('todos.2.');

    await waitFor(() => {
      expect(get(data).todos[1].value).toBe('Second todo');
      expect(get(touched).todos[1].value).toBe(false);
      expect(get(errors).todos?.[1].value).toBe(null);
      expect(multipleInputs[1]).toHaveValue('Second todo');
      expect(get(data).todos[2].value).toBe('Fourth todo');
      expect(get(touched).todos[2].value).toBe(false);
      expect(get(errors).todos?.[2].value).toBe(null);
      expect(multipleInputs[2]).toHaveValue('Fourth todo');
    });

    addField('todos', { value: 'Fifth todo' });

    await waitFor(() => {
      expect(get(data).todos[2].value).toBe('Fourth todo');
      expect(get(touched).todos[2].value).toBe(false);
      expect(get(errors).todos[2].value).toBe(null);
      expect(multipleInputs[2]).toHaveValue('Fourth todo');
      expect(get(data).todos[3].value).toBe('Fifth todo');
      expect(get(touched).todos[3].value).toBe(false);
      expect(get(errors).todos[3].value).toBe(null);
    });
  });
});
